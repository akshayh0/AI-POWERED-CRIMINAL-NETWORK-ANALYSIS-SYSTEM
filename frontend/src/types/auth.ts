export type UserRole =
  | 'admin'
  | 'police_officer'
  | 'investigation_officer'
  | 'crime_analyst'
  | 'district_superintendent'
  | 'Administrator'
  | 'Police Officer'
  | 'Investigation Officer'
  | 'Crime Analyst'
  | 'District Superintendent';

export type AccountStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface UserProfile {
  uid: string;
  fullName: string;
  name?: string; // alias for compatibility
  email: string;
  officerId?: string;
  employeeId?: string; // alias for compatibility
  departmentId?: string; // alias for compatibility
  department?: string;
  station?: string;
  district?: string; // alias for compatibility
  designation?: string;
  phone?: string;
  requestedRole: UserRole | string;
  role: UserRole | string;
  photoURL?: string | null;
  profilePhotoUrl?: string | null; // alias for compatibility
  status: AccountStatus;
  accountStatus?: AccountStatus; // alias as requested
  createdAt?: any;
  approvedAt?: any | null;
  approvedBy?: string | null;
  statusReason?: string | null;
}

export type AuditAction =
  | 'USER_CREATED'
  | 'USER_APPROVED'
  | 'USER_REJECTED'
  | 'USER_SUSPENDED'
  | 'USER_REACTIVATED'
  | 'ROLE_CHANGED'
  | 'USER_LOGGED_IN'
  | 'USER_LOGGED_OUT';

export interface AuditLog {
  id?: string;
  action: AuditAction;
  targetUserId?: string;
  targetUserName?: string;
  targetUserEmail?: string;
  performedByUid: string;
  performedByName?: string;
  performedByEmail: string;
  details?: string;
  timestamp: any;
}

export const ROLE_OPTIONS = [
  { id: 'police_officer', label: 'Police Officer' },
  { id: 'investigation_officer', label: 'Investigation Officer' },
  { id: 'crime_analyst', label: 'Crime Analyst' },
  { id: 'district_superintendent', label: 'District Superintendent' },
] as const;

export const normalizeRole = (role?: string | null): string => {
  if (!role) return 'police_officer';
  const clean = role.trim().toLowerCase().replace(/\s+/g, '_');
  if (clean === 'administrator' || clean === 'admin') return 'admin';
  return clean;
};

export const getRoleDisplayName = (role?: string | null): string => {
  const norm = normalizeRole(role);
  switch (norm) {
    case 'admin':
      return 'Administrator';
    case 'police_officer':
      return 'Police Officer';
    case 'investigation_officer':
      return 'Investigation Officer';
    case 'crime_analyst':
      return 'Crime Analyst';
    case 'district_superintendent':
      return 'District Superintendent';
    default:
      return role || 'Officer';
  }
};
