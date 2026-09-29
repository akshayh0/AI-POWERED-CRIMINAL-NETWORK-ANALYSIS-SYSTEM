import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser, userProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-600">
              <Shield className="w-9 h-9 text-orange-500" />
            </div>
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin absolute -bottom-2 -right-2" />
          </div>
          <div className="text-center">
            <h3 className="text-base font-bold text-slate-800 tracking-wide">KSP AI-PORTAL</h3>
            <p className="text-xs text-slate-500 mt-0.5">Verifying Security Clearance & Session...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user profile is still loading or not created yet
  if (!userProfile) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
          <p className="text-xs text-slate-600 font-medium">Synchronizing Officer Clearance...</p>
        </div>
      </div>
    );
  }

  // Status checks
  if (userProfile.status !== 'approved') {
    return <Navigate to="/pending-approval" replace />;
  }

  return <>{children}</>;
};
