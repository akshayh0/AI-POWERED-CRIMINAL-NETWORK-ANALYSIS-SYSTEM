import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { currentUser, userProfile, isAdmin, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (userProfile?.status !== 'approved') {
    return <Navigate to="/pending-approval" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto mt-12 p-8 bg-white border border-slate-200 rounded-2xl shadow-sm text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-9 h-9" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Administrator Clearance Required</h2>
        <p className="text-xs text-slate-600 mb-6">
          This control center is restricted to Karnataka State Police Intelligence Administrators.
        </p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
