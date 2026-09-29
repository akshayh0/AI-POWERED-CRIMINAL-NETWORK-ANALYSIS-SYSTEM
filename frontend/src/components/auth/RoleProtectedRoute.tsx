import React from 'react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types/auth';
import { normalizeRole, getRoleDisplayName } from '../../types/auth';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RoleProtectedRouteProps {
  allowedRoles: (UserRole | string)[];
  children: React.ReactNode;
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const userRole = normalizeRole(userProfile?.role);
  const isAllowed = userRole === 'admin' || allowedRoles.map(r => normalizeRole(r)).includes(userRole);

  if (!isAllowed) {
    return (
      <div className="max-w-2xl mx-auto mt-12 p-8 bg-white border border-slate-200 rounded-2xl shadow-sm text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-9 h-9" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Access Restricted</h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
          You do not have permission to access this intelligence module.
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-md mx-auto mb-6 text-left text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500">Your Clearance Level:</span>
            <span className="font-semibold text-slate-800">{getRoleDisplayName(userProfile?.role)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Required Clearance:</span>
            <span className="font-mono text-orange-600 font-semibold">{allowedRoles.map(getRoleDisplayName).join(', ')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">District:</span>
            <span className="text-slate-700">{userProfile?.district || 'General'}</span>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Executive Dashboard</span>
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
