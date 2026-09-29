import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage, isFirebaseConfigured, formatAuthError } from './firebase';
import type { UserProfile, UserRole } from '../types/auth';
import { normalizeRole } from '../types/auth';
import { logAuditEvent } from './auditService';

export const ADMIN_EMAIL = 'akom@gmail.com';

/**
 * Deterministically maps a Police / Employee ID to an internal Firebase Auth email identifier.
 * Ensures consistent login and unique account mapping without exposing the generated email.
 */
export const employeeIdToAuthEmail = (employeeId: string): string => {
  const sanitized = employeeId.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '_');
  return `${sanitized}@ksp.gov.in`;
};

export interface RegisterParams {
  fullName: string;
  employeeId: string;
  password: string;
  requestedRole: UserRole | string;
  // Optional / backward compatibility fields
  email?: string;
  phone?: string;
  officerId?: string;
  department?: string;
  station?: string;
  district?: string;
  designation?: string;
  profilePhotoFile?: File | null;
}

/**
 * Uploads profile photo to Firebase Storage if available, with graceful fallback.
 * If Storage is not yet configured, does not break registration.
 */
export const uploadProfilePhoto = async (uid: string, file: File): Promise<string | null> => {
  try {
    const ext = file.name.split('.').pop() || 'jpg';
    const storageRef = ref(storage, `profile_photos/${uid}_${Date.now()}.${ext}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (err) {
    console.warn(
      '[Firebase Storage Notice] Profile photo could not be uploaded to Firebase Storage (Bucket configuration or storage rules pending). Fallback in-memory thumbnail used to preserve registration:',
      err
    );
    // Graceful fallback: convert to base64 data URL so registration succeeds without interruption
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }
};

export const registerUser = async (params: RegisterParams): Promise<{ user: User; profile: UserProfile }> => {
  if (!isFirebaseConfigured) {
    throw new Error('Authentication service configuration is invalid. Please configure Firebase in frontend/.env.');
  }

  const { 
    fullName, 
    employeeId,
    password, 
    requestedRole,
    email,
    phone, 
    officerId,
    department, 
    station,
    district, 
    designation, 
    profilePhotoFile 
  } = params;

  const resolvedEmployeeId = (employeeId || officerId || '').trim();
  const cleanEmail = email && email.includes('@')
    ? email.trim().toLowerCase()
    : employeeIdToAuthEmail(resolvedEmployeeId);

  // 1. Prevent duplicate registration by checking existing employeeId in Firestore
  try {
    const q = query(collection(db, 'users'), where('employeeId', '==', resolvedEmployeeId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      throw new Error('An account with this Police / Employee ID already exists. Please login or contact the administrator.');
    }
  } catch (err: any) {
    if (err.message && err.message.includes('already exists')) {
      throw err;
    }
    // Continue if Firestore query is temporarily unavailable (Firebase Auth uniqueness check below will catch it)
  }

  const isAdmin = cleanEmail === ADMIN_EMAIL;
  // A newly registered user should NOT automatically receive Administrator privileges.
  // Their requested role is stored as requestedRole, but account status is pending.
  const canonicalRole = isAdmin ? 'admin' : normalizeRole(requestedRole);
  const resolvedStation = station || district || 'Karnataka State Police HQ';

  // 2. Create Firebase Auth user with unique identifier and password
  let user: User;
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    user = userCredential.user;
  } catch (err: any) {
    const code = err?.code || '';
    if (code === 'auth/email-already-in-use') {
      throw new Error('An account with this Police / Employee ID already exists. Please login or contact the administrator.');
    }
    throw new Error(formatAuthError(err));
  }

  // 3. Set Firebase Auth display name
  try {
    await updateProfile(user, { displayName: fullName.trim() });
  } catch (err) {
    console.warn('Failed to update auth display name:', err);
  }

  // 4. Upload profile photo if provided
  let photoUrl: string | null = null;
  if (profilePhotoFile) {
    photoUrl = await uploadProfilePhoto(user.uid, profilePhotoFile);
  }

  // 5. Create Firestore user document in users/{uid}
  // Contains required fields: fullName, employeeId, requestedRole, accountStatus, createdAt
  // plus backward compatibility aliases
  const profileData: Omit<UserProfile, 'uid'> = {
    fullName: fullName.trim(),
    name: fullName.trim(),
    employeeId: resolvedEmployeeId,
    officerId: resolvedEmployeeId,
    departmentId: resolvedEmployeeId,
    requestedRole: canonicalRole,
    role: canonicalRole,
    accountStatus: isAdmin ? 'approved' : 'pending',
    status: isAdmin ? 'approved' : 'pending',
    email: cleanEmail,
    department: department || 'Karnataka State Police',
    station: resolvedStation,
    district: resolvedStation,
    designation: designation || (canonicalRole === 'admin' ? 'Administrator' : canonicalRole === 'crime_analyst' ? 'Crime Analyst' : 'Police Officer'),
    phone: phone || '',
    photoURL: photoUrl,
    profilePhotoUrl: photoUrl,
    createdAt: serverTimestamp(),
    approvedAt: isAdmin ? serverTimestamp() : null,
    approvedBy: isAdmin ? 'system_bootstrap' : null,
  };

  try {
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      ...profileData,
    });
  } catch (err) {
    console.error('Firestore user creation error:', err);
  }

  // 6. Log Audit event
  await logAuditEvent(
    'USER_CREATED',
    user.uid,
    { uid: user.uid, employeeId: resolvedEmployeeId, name: fullName.trim() },
    isAdmin ? 'Administrator initial credential bootstrap' : `Registration submitted with requested role: ${canonicalRole}`,
    { name: fullName.trim(), employeeId: resolvedEmployeeId }
  );

  return {
    user,
    profile: { uid: user.uid, ...profileData }
  };
};

export const loginUser = async (identifier: string, password: string): Promise<{ user: User; profile: UserProfile }> => {
  if (!isFirebaseConfigured) {
    throw new Error('Authentication service configuration is invalid. Please configure Firebase in frontend/.env.');
  }

  const clean = identifier.trim().toLowerCase();
  const cleanEmail = clean.includes('@') ? clean : employeeIdToAuthEmail(clean);
  let user: User;
  try {
    const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
    user = userCredential.user;
  } catch (err: any) {
    throw new Error(formatAuthError(err));
  }

  // Fetch Firestore profile
  const userDocRef = doc(db, 'users', user.uid);
  let userDocSnap;
  try {
    userDocSnap = await getDoc(userDocRef);
  } catch (err) {
    console.warn('Error reading user document:', err);
  }

  let profile: UserProfile;
  const isAdmin = cleanEmail === ADMIN_EMAIL;

  if (!userDocSnap || !userDocSnap.exists()) {
    // If user document is missing or it's the admin logging in for the first time
    const initialProfile: Omit<UserProfile, 'uid'> = {
      fullName: user.displayName || (isAdmin ? 'Chief Intelligence Administrator' : 'Police Officer'),
      name: user.displayName || (isAdmin ? 'Chief Intelligence Administrator' : 'Police Officer'),
      email: cleanEmail,
      phone: '',
      officerId: isAdmin ? 'KSP-HQ-001' : 'KSP-STAFF',
      employeeId: isAdmin ? 'KSP-HQ-001' : 'KSP-STAFF',
      departmentId: isAdmin ? 'KSP-HQ-001' : 'KSP-STAFF',
      department: 'State Police Headquarters',
      station: 'State Police HQ',
      district: 'State Police HQ',
      designation: isAdmin ? 'Chief Administrator' : 'Officer',
      requestedRole: isAdmin ? 'admin' : 'police_officer',
      role: isAdmin ? 'admin' : 'police_officer',
      photoURL: null,
      profilePhotoUrl: null,
      status: isAdmin ? 'approved' : 'pending',
      createdAt: serverTimestamp(),
      approvedAt: isAdmin ? serverTimestamp() : null,
      approvedBy: isAdmin ? 'system_bootstrap' : null,
    };
    try {
      await setDoc(userDocRef, {
        uid: user.uid,
        ...initialProfile,
      }, { merge: true });
    } catch (err) {
      console.warn('Could not bootstrap user doc in Firestore:', err);
    }
    profile = { uid: user.uid, ...initialProfile };
  } else {
    const data = userDocSnap.data();
    profile = {
      uid: user.uid,
      fullName: data.fullName || data.name || user.displayName || 'Police Officer',
      name: data.fullName || data.name || user.displayName || 'Police Officer',
      email: data.email || cleanEmail,
      officerId: data.officerId || data.employeeId || 'KSP-STAFF',
      employeeId: data.officerId || data.employeeId || 'KSP-STAFF',
      departmentId: data.officerId || data.employeeId || 'KSP-STAFF',
      department: data.department || 'Karnataka Police Department',
      station: data.station || data.district || 'State Police HQ',
      district: data.station || data.district || 'State Police HQ',
      designation: data.designation || 'Officer',
      phone: data.phone || '',
      requestedRole: data.requestedRole || data.role || 'police_officer',
      role: data.role || 'police_officer',
      photoURL: data.photoURL || data.profilePhotoUrl || null,
      profilePhotoUrl: data.photoURL || data.profilePhotoUrl || null,
      status: data.status || 'pending',
      createdAt: data.createdAt,
      approvedAt: data.approvedAt,
      approvedBy: data.approvedBy,
      statusReason: data.statusReason,
    };
    
    // Safety check: ensure akom@gmail.com is ALWAYS role: 'admin' and status: 'approved'
    if (isAdmin && (profile.role !== 'admin' || profile.status !== 'approved')) {
      try {
        await setDoc(userDocRef, { role: 'admin', status: 'approved' }, { merge: true });
      } catch (e) {
        console.warn('Failed to update admin role in Firestore:', e);
      }
      profile.role = 'admin';
      profile.status = 'approved';
    }
  }

  // Audit log login
  await logAuditEvent(
    'USER_LOGGED_IN',
    user.uid,
    { uid: user.uid, email: cleanEmail, name: profile.fullName || profile.name },
    `User logged in with role: ${profile.role}, status: ${profile.status}`,
    { name: profile.fullName || profile.name, email: cleanEmail }
  );

  return { user, profile };
};

export const logoutUser = async (currentProfile?: UserProfile | null): Promise<void> => {
  if (currentProfile) {
    try {
      await logAuditEvent(
        'USER_LOGGED_OUT',
        currentProfile.uid,
        { uid: currentProfile.uid, email: currentProfile.email, name: currentProfile.fullName || currentProfile.name },
        'User terminated session',
        { name: currentProfile.fullName || currentProfile.name, email: currentProfile.email }
      );
    } catch (err) {
      console.warn('Could not record logout audit:', err);
    }
  }
  await signOut(auth);
};

export const resetUserPassword = async (email: string): Promise<void> => {
  if (!isFirebaseConfigured) {
    throw new Error('Authentication service configuration is invalid. Please configure Firebase in frontend/.env.');
  }
  try {
    await sendPasswordResetEmail(auth, email.trim().toLowerCase());
  } catch (err: any) {
    throw new Error(formatAuthError(err));
  }
};
