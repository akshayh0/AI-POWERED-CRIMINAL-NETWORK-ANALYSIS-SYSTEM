import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import type { UserProfile, UserRole, AccountStatus } from '../types/auth';
import { normalizeRole } from '../types/auth';
import { 
  loginUser, 
  registerUser, 
  logoutUser, 
  ADMIN_EMAIL 
} from '../services/authService';
import type { RegisterParams } from '../services/authService';
import { subscribeToUserProfile, getUserProfile } from '../services/userService';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  currentUser: User | null;
  profile: UserProfile | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isApproved: boolean;
  isAdmin: boolean;
  status: AccountStatus | null;
  role: UserRole | string | null;
  login: (email: string, pass: string) => Promise<{ user: User; profile: UserProfile }>;
  register: (params: RegisterParams) => Promise<{ user: User; profile: UserProfile }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
      setCurrentUser(authUser);

      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (authUser) {
        // Subscribe to real-time profile changes
        unsubscribeProfile = subscribeToUserProfile(
          authUser.uid,
          async (liveProfile) => {
            if (!liveProfile) {
              const cleanEmail = authUser.email?.toLowerCase();
              if (cleanEmail === ADMIN_EMAIL) {
                const adminProfile: Omit<UserProfile, 'uid'> = {
                  fullName: authUser.displayName || 'Chief Intelligence Administrator',
                  name: authUser.displayName || 'Chief Intelligence Administrator',
                  email: cleanEmail,
                  phone: '',
                  officerId: 'KSP-HQ-001',
                  employeeId: 'KSP-HQ-001',
                  departmentId: 'KSP-HQ-001',
                  department: 'State Police Headquarters',
                  station: 'Karnataka State Police HQ',
                  district: 'Karnataka State Police HQ',
                  designation: 'Chief Administrator',
                  requestedRole: 'admin',
                  role: 'admin',
                  status: 'approved',
                  createdAt: serverTimestamp(),
                  approvedAt: serverTimestamp(),
                  approvedBy: 'system_bootstrap',
                };
                await setDoc(doc(db, 'users', authUser.uid), adminProfile, { merge: true });
                setUserProfile({ uid: authUser.uid, ...adminProfile });
              } else {
                setUserProfile(null);
              }
            } else {
              // Ensure akom@gmail.com has admin role and approved status
              if (authUser.email?.toLowerCase() === ADMIN_EMAIL && (liveProfile.role !== 'admin' || liveProfile.status !== 'approved')) {
                liveProfile.role = 'admin';
                liveProfile.status = 'approved';
              }
              setUserProfile(liveProfile);
            }
            setLoading(false);
          },
          (err) => {
            console.error('Profile subscription error:', err);
            setLoading(false);
          }
        );
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);

  const handleLogin = async (email: string, pass: string) => {
    const res = await loginUser(email, pass);
    setUserProfile(res.profile);
    return res;
  };

  const handleRegister = async (params: RegisterParams) => {
    const res = await registerUser(params);
    setUserProfile(res.profile);
    return res;
  };

  const handleLogout = async () => {
    await logoutUser(userProfile);
    setCurrentUser(null);
    setUserProfile(null);
  };

  const refreshProfile = async () => {
    if (currentUser) {
      const p = await getUserProfile(currentUser.uid);
      setUserProfile(p);
    }
  };

  const role = userProfile?.role || null;
  const status = userProfile?.status || null;
  const isAuthenticated = Boolean(currentUser);
  const isAdmin = normalizeRole(role) === 'admin';
  const isApproved = status === 'approved';

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        currentUser,
        profile: userProfile,
        userProfile,
        loading,
        isAuthenticated,
        isApproved,
        isAdmin,
        status,
        role,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
