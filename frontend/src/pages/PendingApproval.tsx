import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, 
  Clock, 
  XCircle, 
  AlertOctagon, 
  CheckCircle2, 
  RefreshCw, 
  LogOut, 
  Building2,
  Mail,
  UserCheck
} from 'lucide-react';

export const PendingApproval: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, currentUser, logout, refreshProfile, loading } = useAuth();
  const [checking, setChecking] = useState(false);

  const status = userProfile?.status || 'pending';

  const handleRefresh = async () => {
    setChecking(true);
    try {
      await refreshProfile();
      if (userProfile?.status === 'approved') {
        navigate('/');
      }
    } finally {
      setTimeout(() => setChecking(false), 600);
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  if (status === 'approved') {
    return (
      <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-300 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Clearance Approved</h2>
          <p className="text-xs text-slate-600">Your account has been authorized. You can proceed to the intelligence dashboard.</p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            Access KSP AI-PORTAL
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FB] flex flex-col justify-between font-sans">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-2 flex items-center justify-between text-[11px] text-slate-600">
        <div className="flex items-center space-x-2">
          <Building2 className="w-3.5 h-3.5 text-blue-700" />
          <span className="font-semibold text-slate-800">
            Government of Karnataka · Karnataka State Police Department
          </span>
        </div>
        <button
          onClick={handleSignOut}
          className="text-slate-500 hover:text-slate-800 flex items-center space-x-1 cursor-pointer font-medium"
        >
          <LogOut className="w-3 h-3" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Main Status Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="max-w-xl w-full bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-xl text-center space-y-6">
          
          {/* Status Icon */}
          {status === 'pending' && (
            <div className="w-20 h-20 rounded-full bg-amber-50 border-2 border-amber-400 text-amber-600 flex items-center justify-center mx-auto animate-pulse">
              <Clock className="w-10 h-10" />
            </div>
          )}

          {status === 'rejected' && (
            <div className="w-20 h-20 rounded-full bg-rose-50 border-2 border-rose-400 text-rose-600 flex items-center justify-center mx-auto">
              <XCircle className="w-10 h-10" />
            </div>
          )}

          {status === 'suspended' && (
            <div className="w-20 h-20 rounded-full bg-rose-50 border-2 border-rose-500 text-rose-600 flex items-center justify-center mx-auto">
              <AlertOctagon className="w-10 h-10" />
            </div>
          )}

          {/* Heading and Description */}
          <div className="space-y-2">
            {status === 'pending' && (
              <>
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  Verification In Progress
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-2">
                  Account Pending Approval
                </h2>
                <p className="text-sm text-slate-700 font-semibold leading-relaxed max-w-md mx-auto">
                  Your account is awaiting administrator approval.
                </p>
              </>
            )}

            {status === 'rejected' && (
              <>
                <span className="text-[11px] font-bold text-rose-700 uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                  Access Denied
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-2">
                  Account Registration Rejected
                </h2>
                <p className="text-sm text-rose-700 font-semibold leading-relaxed max-w-md mx-auto">
                  Your account has been rejected by the administrator.
                </p>
              </>
            )}

            {status === 'suspended' && (
              <>
                <span className="text-[11px] font-bold text-rose-700 uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                  Account Inactive
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-2">
                  Account Suspended
                </h2>
                <p className="text-sm text-rose-700 font-semibold leading-relaxed max-w-md mx-auto">
                  Your account has been suspended. Please contact the administrator.
                </p>
              </>
            )}
          </div>

          {/* Registered Profile Metadata */}
          {userProfile && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left text-xs space-y-2.5">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Applicant:</span>
                <span className="font-bold text-slate-800">{userProfile.fullName || userProfile.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Official Email:</span>
                <span className="font-mono text-slate-800">{userProfile.email}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Police / Employee ID:</span>
                <span className="font-mono text-blue-600 font-bold">{userProfile.employeeId || userProfile.departmentId || 'Pending'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Department & Designation:</span>
                <span className="text-slate-800">{userProfile.department || 'Police Department'} · {userProfile.designation || 'Officer'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">District:</span>
                <span className="text-slate-800">{userProfile.district || 'Karnataka State'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Requested Role:</span>
                <span className="font-bold text-orange-600">{userProfile.requestedRole}</span>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={checking}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
              <span>{checking ? 'Checking...' : 'Check Status Now'}</span>
            </button>

            <button
              onClick={handleSignOut}
              className="w-full sm:w-auto px-6 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400">
            For urgent authorization inquiries, contact the KSP State Intelligence Administrator at <span className="font-mono text-slate-600">akom@gmail.com</span>.
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-4 text-center text-[11px] text-slate-400 border-t border-slate-200 bg-white">
        © 2026 Karnataka State Police Department · Crime Intelligence Information Assurance
      </div>
    </div>
  );
};
