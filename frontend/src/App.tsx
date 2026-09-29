import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DesktopHeader } from './components/desktop/DesktopHeader';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RoleProtectedRoute } from './components/auth/RoleProtectedRoute';
import { AdminRoute } from './components/auth/AdminRoute';

// Auth Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { PendingApproval } from './pages/PendingApproval';
import { UserApproval } from './pages/UserApproval';
import { AdminUsers } from './pages/AdminUsers';

// Dashboard Pages
import { Dashboard } from './pages/Dashboard';
import { CrimeAnalytics } from './pages/CrimeAnalytics';
import { CrimeMap } from './pages/CrimeMap';
import { FIRManagement } from './pages/FIRManagement';
import { CaseDetails } from './pages/CaseDetails';
import { VictimAnalytics } from './pages/VictimAnalytics';
import { AccusedAnalytics } from './pages/AccusedAnalytics';
import { ComplainantAnalytics } from './pages/ComplainantAnalytics';
import { OfficerDashboard } from './pages/OfficerDashboard';
import { CriminalNetwork } from './pages/CriminalNetwork';
import { AIModules } from './pages/AIModules';
import { AIInvestigationAssistant } from './pages/AIInvestigationAssistant';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-800 max-w-xl mx-auto mt-10">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Module Notice</h2>
          <p className="text-sm text-slate-600 mb-4">{this.state.error?.message || "An unexpected error occurred while loading this view."}</p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Reload Module
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Layout component wrapping authenticated pages
const AuthenticatedAppLayout: React.FC = () => {
  const { userProfile, isAdmin } = useAuth();
  const [previewRole, setPreviewRole] = useState<string | null>(null);

  // Authenticated role from Firestore profile (or preview role for admin testing)
  const effectiveRole = isAdmin && previewRole ? previewRole : (userProfile?.role || 'police_officer');

  return (
    <div className="min-h-screen bg-police-bg flex flex-col">
      {/* 1. Desktop 3-tier Government & Intelligence Header (desktop >= 1024px) */}
      <div className="hidden lg:block sticky top-0 z-40">
        <DesktopHeader 
          currentRole={effectiveRole}
          setRole={(r) => {
            if (isAdmin) setPreviewRole(r);
          }}
        />
      </div>

      {/* 2. Mobile/Tablet Legacy Sidebar & Header (screens < 1024px) */}
      <div className="lg:hidden">
        <Sidebar role={effectiveRole} />
        <Header 
          currentRole={effectiveRole} 
          setRole={(r) => {
            if (isAdmin) setPreviewRole(r);
          }} 
        />
      </div>

      {/* 3. Main Route Console: Full width on desktop, no sidebar space, starts right below header */}
      <main className="w-full flex-1 px-4 sm:px-6 lg:px-8 py-6 pt-20 lg:pt-6 max-w-[1720px] mx-auto text-slate-800">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Authentication Pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pending-approval" element={<PendingApproval />} />

          {/* Protected Intelligence Dashboard */}
          <Route
            element={
              <ProtectedRoute>
                <AuthenticatedAppLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard Home */}
            <Route index element={<Dashboard />} />

            {/* Admin-only User Approval */}
            <Route
              path="approval"
              element={
                <AdminRoute>
                  <UserApproval />
                </AdminRoute>
              }
            />

            {/* Admin-only User Management */}
            <Route
              path="users"
              element={
                <AdminRoute>
                  <AdminUsers />
                </AdminRoute>
              }
            />

            {/* Crime Analytics */}
            <Route
              path="analytics"
              element={
                <RoleProtectedRoute allowedRoles={['admin', 'police_officer', 'crime_analyst', 'district_superintendent']}>
                  <CrimeAnalytics />
                </RoleProtectedRoute>
              }
            />

            {/* Interactive Map */}
            <Route
              path="map"
              element={
                <RoleProtectedRoute allowedRoles={['admin', 'police_officer', 'crime_analyst', 'district_superintendent']}>
                  <CrimeMap />
                </RoleProtectedRoute>
              }
            />

            {/* FIR Management */}
            <Route
              path="firs"
              element={
                <RoleProtectedRoute allowedRoles={['admin', 'police_officer', 'investigation_officer']}>
                  <FIRManagement />
                </RoleProtectedRoute>
              }
            />

            {/* Case Details */}
            <Route
              path="cases/:id"
              element={
                <RoleProtectedRoute allowedRoles={['admin', 'police_officer', 'investigation_officer', 'crime_analyst', 'district_superintendent']}>
                  <CaseDetails />
                </RoleProtectedRoute>
              }
            />

            {/* Victim Analytics */}
            <Route
              path="victims"
              element={
                <RoleProtectedRoute allowedRoles={['admin', 'investigation_officer', 'crime_analyst']}>
                  <VictimAnalytics />
                </RoleProtectedRoute>
              }
            />

            {/* Accused Analytics */}
            <Route
              path="accused"
              element={
                <RoleProtectedRoute allowedRoles={['admin', 'investigation_officer', 'crime_analyst']}>
                  <AccusedAnalytics />
                </RoleProtectedRoute>
              }
            />

            {/* Complainant Analytics */}
            <Route
              path="complainants"
              element={
                <RoleProtectedRoute allowedRoles={['admin', 'investigation_officer', 'crime_analyst']}>
                  <ComplainantAnalytics />
                </RoleProtectedRoute>
              }
            />

            {/* Officer Performance */}
            <Route
              path="officers"
              element={
                <RoleProtectedRoute allowedRoles={['admin', 'district_superintendent']}>
                  <OfficerDashboard />
                </RoleProtectedRoute>
              }
            />

            {/* Criminal Network */}
            <Route
              path="network"
              element={
                <RoleProtectedRoute allowedRoles={['admin', 'investigation_officer', 'crime_analyst']}>
                  <CriminalNetwork />
                </RoleProtectedRoute>
              }
            />

            {/* AI Predictions */}
            <Route
              path="ai-predictions"
              element={
                <RoleProtectedRoute allowedRoles={['admin', 'police_officer', 'investigation_officer', 'crime_analyst', 'district_superintendent']}>
                  <AIModules />
                </RoleProtectedRoute>
              }
            />

            {/* AI Assistant */}
            <Route
              path="ai-chat"
              element={
                <RoleProtectedRoute allowedRoles={['admin', 'police_officer', 'investigation_officer', 'crime_analyst', 'district_superintendent']}>
                  <AIInvestigationAssistant />
                </RoleProtectedRoute>
              }
            />

            {/* Reports Center */}
            <Route
              path="reports"
              element={
                <RoleProtectedRoute allowedRoles={['admin', 'district_superintendent', 'crime_analyst']}>
                  <Reports />
                </RoleProtectedRoute>
              }
            />

            {/* Settings & Audit */}
            <Route
              path="settings"
              element={
                <AdminRoute>
                  <Settings />
                </AdminRoute>
              }
            />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
