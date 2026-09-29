import { 
  collection, 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp, 
  onSnapshot,
  query,
  orderBy 
} from 'firebase/firestore';
import { db } from './firebase';
import type { UserProfile, UserRole, AccountStatus } from '../types/auth';
import { logAuditEvent } from './auditService';

const USERS_COLLECTION = 'users';

const mapUserDoc = (uid: string, d: any): UserProfile => ({
  uid,
  fullName: d.fullName || d.name || 'Officer',
  name: d.fullName || d.name || 'Officer',
  email: d.email || '',
  officerId: d.officerId || d.employeeId || '—',
  employeeId: d.officerId || d.employeeId || '—',
  departmentId: d.officerId || d.employeeId || '—',
  department: d.department || 'Police Department',
  station: d.station || d.district || 'HQ',
  district: d.station || d.district || 'HQ',
  designation: d.designation || 'Officer',
  phone: d.phone || '',
  role: d.role || 'police_officer',
  requestedRole: d.requestedRole || d.role || 'police_officer',
  photoURL: d.photoURL || d.profilePhotoUrl || null,
  profilePhotoUrl: d.photoURL || d.profilePhotoUrl || null,
  status: (d.status as AccountStatus) || 'pending',
  createdAt: d.createdAt,
  approvedAt: d.approvedAt,
  approvedBy: d.approvedBy,
  statusReason: d.statusReason,
});

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, uid));
    if (userDoc.exists()) {
      return mapUserDoc(uid, userDoc.data());
    }
    return null;
  } catch (err) {
    console.error('Error fetching user profile:', err);
    throw err;
  }
};

export const subscribeToUserProfile = (
  uid: string, 
  onUpdate: (profile: UserProfile | null) => void,
  onError?: (err: Error) => void
) => {
  return onSnapshot(
    doc(db, USERS_COLLECTION, uid),
    (snap) => {
      if (snap.exists()) {
        onUpdate(mapUserDoc(uid, snap.data()));
      } else {
        onUpdate(null);
      }
    },
    (err) => {
      console.error('Error listening to user profile:', err);
      if (onError) onError(err);
    }
  );
};

export const subscribeToAllUsers = (
  onUpdate: (users: UserProfile[]) => void,
  onError?: (err: Error) => void
) => {
  const q = query(collection(db, USERS_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const users: UserProfile[] = snapshot.docs.map((docSnap) => 
        mapUserDoc(docSnap.id, docSnap.data())
      );
      onUpdate(users);
    },
    (err) => {
      console.error('Error listening to users collection:', err);
      if (onError) onError(err);
    }
  );
};

export const approveUser = async (
  uid: string,
  admin: { uid: string; email: string; name?: string },
  assignedRole?: string,
  targetUserMeta?: { name?: string; email?: string }
): Promise<void> => {
  const userRef = doc(db, USERS_COLLECTION, uid);
  const updateData: Record<string, any> = {
    status: 'approved' as AccountStatus,
    approvedAt: serverTimestamp(),
    approvedBy: admin.uid,
  };
  if (assignedRole) {
    updateData.role = assignedRole;
  }
  await updateDoc(userRef, updateData);

  await logAuditEvent(
    'USER_APPROVED',
    uid,
    admin,
    `Account approved by administrator ${admin.email}${assignedRole ? ` (role: ${assignedRole})` : ''}`,
    targetUserMeta
  );
};

export const rejectUser = async (
  uid: string,
  admin: { uid: string; email: string; name?: string },
  reason?: string,
  targetUserMeta?: { name?: string; email?: string }
): Promise<void> => {
  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, {
    status: 'rejected' as AccountStatus,
    statusReason: reason || 'Application rejected by administrator',
  });

  await logAuditEvent(
    'USER_REJECTED',
    uid,
    admin,
    `Account rejected: ${reason || 'No specific reason provided'}`,
    targetUserMeta
  );
};

export const suspendUser = async (
  uid: string,
  admin: { uid: string; email: string; name?: string },
  reason?: string,
  targetUserMeta?: { name?: string; email?: string }
): Promise<void> => {
  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, {
    status: 'suspended' as AccountStatus,
    statusReason: reason || 'Account suspended by administrator',
  });

  await logAuditEvent(
    'USER_SUSPENDED',
    uid,
    admin,
    `Account suspended: ${reason || 'Administrative action'}`,
    targetUserMeta
  );
};

export const reactivateUser = async (
  uid: string,
  admin: { uid: string; email: string; name?: string },
  targetUserMeta?: { name?: string; email?: string }
): Promise<void> => {
  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, {
    status: 'approved' as AccountStatus,
    statusReason: null,
    approvedAt: serverTimestamp(),
    approvedBy: admin.uid,
  });

  await logAuditEvent(
    'USER_REACTIVATED',
    uid,
    admin,
    `Account reactivated by administrator ${admin.email}`,
    targetUserMeta
  );
};

export const changeUserRole = async (
  uid: string,
  newRole: UserRole,
  admin: { uid: string; email: string; name?: string },
  targetUserMeta?: { name?: string; email?: string }
): Promise<void> => {
  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, {
    role: newRole,
  });

  await logAuditEvent(
    'ROLE_CHANGED',
    uid,
    admin,
    `Role changed to ${newRole}`,
    targetUserMeta
  );
};
