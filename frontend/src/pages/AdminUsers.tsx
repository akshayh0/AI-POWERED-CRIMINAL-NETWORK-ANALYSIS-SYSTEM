import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import type { UserProfile, UserRole, AccountStatus, AuditLog } from '../types/auth';
import { 
  subscribeToAllUsers, 
  approveUser, 
  rejectUser, 
  suspendUser, 
  reactivateUser, 
  changeUserRole 
} from '../services/userService';
import { fetchAuditLogs } from '../services/auditService';
import { 
  Users, 
  UserCheck, 
  UserX, 
  AlertOctagon, 
  Check, 
  X, 
  Shield, 
  Search, 
  Filter, 
  RotateCw, 
  Clock, 
  Building2, 
  Eye, 
  History, 
  BadgeCheck,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

const ROLES: UserRole[] = [
  'Police Officer',
  'Investigation Officer',
  'Crime Analyst',
  'District Superintendent',
  'Administrator'
];

export const AdminUsers: React.FC = () => {
  const { userProfile: adminProfile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'audit'>('users');
  const [statusFilter, setStatusFilter] = useState<'all' | AccountStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Action States
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [rejectingUser, setRejectingUser] = useState<UserProfile | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Realtime subscription to users collection
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

  // Fetch audit logs when audit tab selected
  const loadAuditLogs = async () => {
    const logs = await fetchAuditLogs(50);
    setAuditLogs(logs);
  };

  useEffect(() => {
    if (activeTab === 'audit') {
      loadAuditLogs();
    }
  }, [activeTab]);

  // Admin Actor metadata
  const adminActor = {
    uid: adminProfile?.uid || 'admin',
    email: adminProfile?.email || 'akom@gmail.com',
    name: adminProfile?.name || 'Administrator',
  };

  // Actions
  const handleApprove = async (user: UserProfile) => {
    try {
      setActionLoading(true);
      await approveUser(user.uid, adminActor, { name: user.name, email: user.email });
      showToast(`User ${user.name} approved successfully.`);
      if (selectedUser?.uid === user.uid) {
        setSelectedUser({ ...selectedUser, status: 'approved' });
      }
    } catch (err: any) {
      console.error('Approval failed:', err);
      showToast('Failed to approve user: ' + (err?.message || 'Permission denied'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingUser) return;
    try {
      setActionLoading(true);
      await rejectUser(rejectingUser.uid, adminActor, rejectReason, {
        name: rejectingUser.name,
        email: rejectingUser.email,
      });
      showToast(`User ${rejectingUser.name} rejected.`);
      setRejectingUser(null);
      setRejectReason('');
      if (selectedUser?.uid === rejectingUser.uid) {
        setSelectedUser({ ...selectedUser, status: 'rejected' });
      }
    } catch (err: any) {
      console.error('Rejection failed:', err);
      showToast('Failed to reject user: ' + (err?.message || 'Error'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspend = async (user: UserProfile) => {
    if (!window.confirm(`Are you sure you want to suspend account for ${user.name}? This will revoke access immediately.`)) {
      return;
    }
    try {
      setActionLoading(true);
      await suspendUser(user.uid, adminActor, 'Administrative suspension', {
        name: user.name,
        email: user.email,
      });
      showToast(`Account for ${user.name} suspended.`);
      if (selectedUser?.uid === user.uid) {
        setSelectedUser({ ...selectedUser, status: 'suspended' });
      }
    } catch (err: any) {
      console.error('Suspension failed:', err);
      showToast('Failed to suspend user: ' + (err?.message || 'Error'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async (user: UserProfile) => {
    try {
      setActionLoading(true);
      await reactivateUser(user.uid, adminActor, { name: user.name, email: user.email });
      showToast(`Account for ${user.name} reactivated successfully.`);
      if (selectedUser?.uid === user.uid) {
        setSelectedUser({ ...selectedUser, status: 'approved' });
      }
    } catch (err: any) {
      console.error('Reactivation failed:', err);
      showToast('Failed to reactivate user: ' + (err?.message || 'Error'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRoleChange = async (user: UserProfile, newRole: UserRole) => {
    try {
      setActionLoading(true);
      await changeUserRole(user.uid, newRole, adminActor, { name: user.name, email: user.email });
      showToast(`Role updated to "${newRole}" for ${user.name}`);
      if (selectedUser?.uid === user.uid) {
        setSelectedUser({ ...selectedUser, role: newRole });
      }
    } catch (err: any) {
      console.error('Role update failed:', err);
      showToast('Failed to update role: ' + (err?.message || 'Error'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.departmentId && u.departmentId.toLowerCase().includes(q)) ||
      (u.district && u.district.toLowerCase().includes(q)) ||
      u.role.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const pendingCount = users.filter((u) => u.status === 'pending').length;
  const approvedCount = users.filter((u) => u.status === 'approved').length;
  const suspendedCount = users.filter((u) => u.status === 'suspended').length;
  const rejectedCount = users.filter((u) => u.status === 'rejected').length;

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
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">User Approval Center</h1>
              <p className="text-xs text-slate-500">
                Official Credential Verification & Law Enforcement Role Access Control
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Users Directory
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'audit'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Audit Trail</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'users' && (
        <>
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div
              onClick={() => setStatusFilter('pending')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                statusFilter === 'pending'
                  ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/40'
                  : 'bg-white border-slate-200 hover:border-amber-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Pending Approval</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-extrabold text-amber-600">{pendingCount}</div>
              <span className="text-[10px] text-amber-700/80">Requires administrator review</span>
            </div>

            <div
              onClick={() => setStatusFilter('approved')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                statusFilter === 'approved'
                  ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-400/40'
                  : 'bg-white border-slate-200 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Active & Approved</span>
                <UserCheck className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-600">{approvedCount}</div>
              <span className="text-[10px] text-emerald-700/80">Full authorized portal access</span>
            </div>

            <div
              onClick={() => setStatusFilter('suspended')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                statusFilter === 'suspended'
                  ? 'bg-rose-50/80 border-rose-300 ring-2 ring-rose-400/40'
                  : 'bg-white border-slate-200 hover:border-rose-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Suspended</span>
                <AlertOctagon className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-extrabold text-rose-600">{suspendedCount}</div>
              <span className="text-[10px] text-rose-700/80">Temporary clearance revocation</span>
            </div>

            <div
              onClick={() => setStatusFilter('rejected')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                statusFilter === 'rejected'
                  ? 'bg-slate-100 border-slate-400 ring-2 ring-slate-400/40'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Rejected</span>
                <UserX className="w-4 h-4 text-slate-500" />
              </div>
              <div className="text-2xl font-extrabold text-slate-700">{rejectedCount}</div>
              <span className="text-[10px] text-slate-500">Denied registration requests</span>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search by name, email, badge ID, district..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {(['all', 'pending', 'approved', 'suspended', 'rejected'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all cursor-pointer ${
                    statusFilter === st
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'all' ? 'All Records' : st}
                </button>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Name / Official Email</th>
                    <th className="py-3 px-4">Role / Clearance</th>
                    <th className="py-3 px-4">District</th>
                    <th className="py-3 px-4">Department ID</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Registered</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        <RotateCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                        <span>Synchronizing user credential database...</span>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        No officer records found matching current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const isSelf = user.uid === adminProfile?.uid;
                      const displayName = user.fullName || user.name || 'Officer';
                      const initials = displayName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase();

                      return (
                        <tr key={user.uid} className="hover:bg-slate-50/60 transition-colors">
                          {/* User Avatar */}
                          <td className="py-3 px-4">
                            {user.profilePhotoUrl ? (
                              <img
                                src={user.profilePhotoUrl}
                                alt={displayName}
                                className="w-8 h-8 rounded-full object-cover border border-slate-300"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[11px] border border-blue-200">
                                {initials}
                              </div>
                            )}
                          </td>

                          {/* Name & Email */}
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{displayName}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{user.email}</div>
                          </td>

                          {/* Role Dropdown */}
                          <td className="py-3 px-4">
                            <select
                              disabled={actionLoading || isSelf}
                              value={user.role}
                              onChange={(e) => handleRoleChange(user, e.target.value as UserRole)}
                              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 hover:border-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer disabled:opacity-60"
                            >
                              {ROLES.map((r) => (
                                <option key={r} value={r}>
                                  {r}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* District */}
                          <td className="py-3 px-4 text-slate-700 font-medium">
                            {user.district || 'Karnataka HQ'}
                          </td>

                          {/* Department ID */}
                          <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                            {user.departmentId || '—'}
                          </td>

                          {/* Status Badge */}
                          <td className="py-3 px-4">
                            {user.status === 'approved' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                                Approved
                              </span>
                            )}
                            {user.status === 'pending' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-300 animate-pulse">
                                Pending
                              </span>
                            )}
                            {user.status === 'suspended' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-300">
                                Suspended
                              </span>
                            )}
                            {user.status === 'rejected' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-300">
                                Rejected
                              </span>
                            )}
                          </td>

                          {/* Created */}
                          <td className="py-3 px-4 text-[11px] text-slate-500 whitespace-nowrap">
                            {user.createdAt?.toDate
                              ? user.createdAt.toDate().toLocaleDateString()
                              : 'Recently'}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center space-x-1.5">
                              {/* View Details */}
                              <button
                                onClick={() => setSelectedUser(user)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                                title="View Officer Dossier"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Pending Flow */}
                              {user.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleApprove(user)}
                                    disabled={actionLoading}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-all shadow-xs flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                                    title="Authorize User"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Approve</span>
                                  </button>
                                  <button
                                    onClick={() => setRejectingUser(user)}
                                    disabled={actionLoading}
                                    className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-[11px] font-bold transition-all flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                                    title="Reject Application"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    <span>Reject</span>
                                  </button>
                                </>
                              )}

                              {/* Approved Flow */}
                              {user.status === 'approved' && !isSelf && (
                                <button
                                  onClick={() => handleSuspend(user)}
                                  disabled={actionLoading}
                                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-50"
                                  title="Temporarily Revoke Access"
                                >
                                  Suspend
                                </button>
                              )}

                              {/* Suspended Flow */}
                              {user.status === 'suspended' && (
                                <button
                                  onClick={() => handleReactivate(user)}
                                  disabled={actionLoading}
                                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                                  title="Reactivate Account"
                                >
                                  Reactivate
                                </button>
                              )}

                              {/* Rejected Flow */}
                              {user.status === 'rejected' && (
                                <button
                                  onClick={() => handleApprove(user)}
                                  disabled={actionLoading}
                                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-[11px] font-medium transition-all cursor-pointer disabled:opacity-50"
                                  title="Re-evaluate & Approve"
                                >
                                  Re-evaluate
                                </button>
                              )}
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
        </>
      )}

      {/* ============================================================ */}
      {/* AUDIT LOG TAB */}
      {/* ============================================================ */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Security & Administrative Audit Logs
              </h3>
              <p className="text-xs text-slate-500">
                Immutable records of account creation, approvals, suspensions, and clearance role modifications.
              </p>
            </div>
            <button
              onClick={loadAuditLogs}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Refresh Log</span>
            </button>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Timestamp</th>
                  <th className="py-2.5 px-4">Action</th>
                  <th className="py-2.5 px-4">Target User</th>
                  <th className="py-2.5 px-4">Performed By</th>
                  <th className="py-2.5 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-sans">
                      No audit events recorded yet.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-2 px-4 text-slate-500 whitespace-nowrap">
                        {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString() : 'Recent'}
                      </td>
                      <td className="py-2 px-4">
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            log.action === 'USER_APPROVED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : log.action === 'USER_SUSPENDED'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : log.action === 'USER_REJECTED'
                              ? 'bg-slate-100 text-slate-700 border border-slate-300'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-2 px-4 font-sans">
                        <div className="font-semibold text-slate-800">{log.targetUserName || '—'}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{log.targetUserEmail || ''}</div>
                      </td>
                      <td className="py-2 px-4 text-slate-700 font-sans">
                        {log.performedByEmail || 'system'}
                      </td>
                      <td className="py-2 px-4 text-slate-600 font-sans">
                        {log.details || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* REJECT CONFIRMATION MODAL */}
      {/* ============================================================ */}
      {rejectingUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Reject Officer Application</h3>
                <p className="text-xs text-slate-500">Confirm clearance denial</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to reject the account request for{' '}
              <strong>{rejectingUser.name}</strong> ({rejectingUser.email})?
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

      {/* ============================================================ */}
      {/* USER DETAIL DOSSIER MODAL */}
      {/* ============================================================ */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm border border-blue-200">
                  {selectedUser.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedUser.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Clearance Level</span>
                <span className="font-bold text-orange-600 text-sm">{selectedUser.role}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Account Status</span>
                <span className="font-bold capitalize text-slate-800 text-sm">{selectedUser.status}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Police / Badge ID</span>
                <span className="font-mono font-bold text-blue-700">{selectedUser.departmentId || 'Unassigned'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">District Jurisdiction</span>
                <span className="font-semibold text-slate-800">{selectedUser.district || 'Karnataka State'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Contact Phone</span>
                <span className="font-mono text-slate-800">{selectedUser.phone || 'Not recorded'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Registration Date</span>
                <span className="text-slate-800">
                  {selectedUser.createdAt?.toDate ? selectedUser.createdAt.toDate().toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>

            {selectedUser.status === 'pending' && (
              <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-100">
                <button
                  onClick={() => {
                    setRejectingUser(selectedUser);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-xs font-bold transition-all"
                >
                  Reject Request
                </button>
                <button
                  onClick={() => handleApprove(selectedUser)}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                >
                  Approve Clearance
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
