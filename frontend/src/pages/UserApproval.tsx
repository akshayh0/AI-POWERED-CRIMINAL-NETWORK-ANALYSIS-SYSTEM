import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import type { UserProfile, UserRole } from '../types/auth';
import { ROLE_OPTIONS, getRoleDisplayName, normalizeRole } from '../types/auth';
import { 
  subscribeToAllUsers, 
  approveUser, 
  rejectUser 
} from '../services/userService';
import { 
  ShieldCheck, 
  Check, 
  X, 
  Clock, 
  RotateCw, 
  AlertTriangle, 
  Camera,
  MapPin,
  Building2,
  Briefcase
} from 'lucide-react';

export const UserApproval: React.FC = () => {
  const { userProfile: adminProfile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Selected role overrides per user id
  const [roleOverrides, setRoleOverrides] = useState<Record<string, string>>({});

  // Confirm Modals
  const [approvingUser, setApprovingUser] = useState<UserProfile | null>(null);
  const [rejectingUser, setRejectingUser] = useState<UserProfile | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToAllUsers(
      (userList) => {
        setUsers(userList);
        setLoading(false);
      },
      (err) => {
        console.error('Failed to subscribe to users:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const adminActor = {
    uid: adminProfile?.uid || 'admin',
    email: adminProfile?.email || 'akom@gmail.com',
    name: adminProfile?.fullName || adminProfile?.name || 'Chief Administrator',
  };

  const pendingUsers = users.filter((u) => u.status === 'pending');

  const handleConfirmApprove = async () => {
    if (!approvingUser) return;
    try {
      setActionLoading(true);
      const chosenRole = roleOverrides[approvingUser.uid] || approvingUser.requestedRole || 'police_officer';
      await approveUser(approvingUser.uid, adminActor, chosenRole, {
        name: approvingUser.fullName || approvingUser.name,
        email: approvingUser.email,
      });
      showToast(`User ${approvingUser.fullName || approvingUser.name} approved successfully as ${getRoleDisplayName(chosenRole)}.`);
      setApprovingUser(null);
    } catch (err: any) {
      console.error('Approval failed:', err);
      showToast('Approval failed: ' + (err?.message || 'Permission denied'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingUser) return;
    try {
      setActionLoading(true);
      await rejectUser(rejectingUser.uid, adminActor, rejectReason, {
        name: rejectingUser.fullName || rejectingUser.name,
        email: rejectingUser.email,
      });
      showToast(`Registration request for ${rejectingUser.fullName || rejectingUser.name} was rejected.`);
      setRejectingUser(null);
      setRejectReason('');
    } catch (err: any) {
      console.error('Rejection failed:', err);
      showToast('Rejection failed: ' + (err?.message || 'Error'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-8 z-50 p-4 rounded-xl shadow-xl border text-xs font-semibold flex items-center space-x-2 animate-fadeIn ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : 'bg-rose-50 text-rose-800 border-rose-300'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">User Approval</h1>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
                PENDING USER REQUESTS
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-600 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-xl font-medium">
          <Clock className="w-4 h-4 text-amber-600" />
          <span>Pending Decisions: <strong className="text-amber-800">{pendingUsers.length}</strong></span>
        </div>
      </div>

      {/* Pending User Requests Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Pending Officer Registration Requests
          </h2>
          <span className="text-[11px] text-slate-500 font-medium">
            Requires Administrator Approval before Portal Access
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Profile Photo</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Employee ID</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">Requested Role</th>
                <th className="py-3 px-4">Registration Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500">
                    <RotateCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    <span>Loading pending registration requests...</span>
                  </td>
                </tr>
              ) : pendingUsers.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500">
                    <Check className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="font-semibold text-slate-800 text-sm">No Pending User Requests</p>
                    <p className="text-xs text-slate-500 mt-0.5">All officer registration requests have been processed.</p>
                  </td>
                </tr>
              ) : (
                pendingUsers.map((user) => {
                  const displayName = user.fullName || user.name || 'Officer';
                  const initials = displayName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
                  const selectedRole = roleOverrides[user.uid] || user.requestedRole || 'police_officer';

                  return (
                    <tr key={user.uid} className="hover:bg-slate-50/70 transition-colors">
                      {/* Profile Photo */}
                      <td className="py-3 px-4">
                        {user.profilePhotoUrl ? (
                          <img
                            src={user.profilePhotoUrl}
                            alt={displayName}
                            className="w-9 h-9 rounded-full object-cover border border-slate-300"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs border border-blue-200">
                            {initials}
                          </div>
                        )}
                      </td>

                      {/* Full Name */}
                      <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {displayName}
                      </td>

                      {/* Email */}
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        {user.email}
                      </td>

                      {/* Employee ID */}
                      <td className="py-3 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                        {user.employeeId || user.departmentId || '—'}
                      </td>

                      {/* Department */}
                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                        {user.department || 'General'}
                      </td>

                      {/* Designation */}
                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                        {user.designation || 'Officer'}
                      </td>

                      {/* District */}
                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                        {user.district || 'Karnataka State'}
                      </td>

                      {/* Requested Role (with dropdown to modify if desired) */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <select
                          value={selectedRole}
                          onChange={(e) => setRoleOverrides({ ...roleOverrides, [user.uid]: e.target.value })}
                          className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-600 cursor-pointer"
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Registration Date */}
                      <td className="py-3 px-4 text-[11px] text-slate-500 whitespace-nowrap">
                        {user.createdAt?.toDate ? user.createdAt.toDate().toLocaleDateString() : 'Recently'}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-300 animate-pulse">
                          Pending
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center space-x-2">
                          <button
                            onClick={() => setApprovingUser(user)}
                            disabled={actionLoading}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>APPROVE</span>
                          </button>
                          <button
                            onClick={() => setRejectingUser(user)}
                            disabled={actionLoading}
                            className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>REJECT</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* APPROVE CONFIRMATION MODAL */}
      {approvingUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center space-x-3 text-emerald-600">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Confirm Officer Approval</h3>
                <p className="text-xs text-slate-500">Authorize intelligence portal access</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to approve <strong>{approvingUser.fullName || approvingUser.name}</strong> ({approvingUser.email})?
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Assigned Clearance Role:</span>
                <span className="font-bold text-orange-600">
                  {getRoleDisplayName(roleOverrides[approvingUser.uid] || approvingUser.requestedRole)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Employee ID:</span>
                <span className="font-mono text-slate-800">{approvingUser.employeeId || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">District Jurisdiction:</span>
                <span className="text-slate-800">{approvingUser.district}</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setApprovingUser(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleConfirmApprove}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? 'Approving...' : 'Confirm & Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT CONFIRMATION MODAL */}
      {rejectingUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Reject Officer Application</h3>
                <p className="text-xs text-slate-500">Deny portal access request</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to reject the registration request for{' '}
              <strong>{rejectingUser.fullName || rejectingUser.name}</strong> ({rejectingUser.email})?
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reason for Denial (Optional)
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Unverified police badge ID or jurisdiction mismatch"
                rows={2}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectingUser(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleConfirmReject}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? 'Rejecting...' : 'Reject Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
