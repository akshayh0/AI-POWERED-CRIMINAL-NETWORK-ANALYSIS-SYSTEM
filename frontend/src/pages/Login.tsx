import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { resetUserPassword } from '../services/authService';
import { isFirebaseConfigured, formatAuthError } from '../services/firebase';
import { 
  Shield, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Building2,
  KeyRound,
  FileCheck2,
  Eye,
  EyeOff
} from 'lucide-react';
import { AuthHeader } from '../components/auth/AuthHeader';
import { AuthFooter } from '../components/auth/AuthFooter';
import { AuthHeroPanel } from '../components/auth/AuthHeroPanel';
import { AuthInfoModal, type AuthInfoModalType } from '../components/auth/AuthInfoModal';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Forgot Password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  // Info modal state (About, Security, Help)
  const [infoModal, setInfoModal] = useState<AuthInfoModalType>(null);

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isFirebaseConfigured) {
      setErrorMsg('Authentication service configuration is invalid. Please contact the system administrator.');
      return;
    }

    if (!email.trim() || !password) {
      setErrorMsg('Please enter your Police / Employee ID or Email and security password.');
      return;
    }

    setLoading(true);

    try {
      const { profile } = await login(email.trim(), password);

      // Verify approval status
      if (profile.status === 'pending') {
        setErrorMsg('Your account is awaiting administrator approval.');
        setLoading(false);
        return;
      }

      if (profile.status === 'rejected') {
        setErrorMsg('Your account has been rejected by the administrator.');
        setLoading(false);
        return;
      }

      if (profile.status === 'suspended') {
        setErrorMsg('Your account has been suspended. Please contact the administrator.');
        setLoading(false);
        return;
      }

      // Approved officer - allow access!
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMsg(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(false);

    if (!isFirebaseConfigured) {
      setForgotError('Authentication service configuration is invalid. Please contact the system administrator.');
      return;
    }

    if (!forgotEmail.trim()) {
      setForgotError('Please enter your registered departmental email address.');
      return;
    }

    setForgotLoading(true);
    try {
      await resetUserPassword(forgotEmail.trim());
      setForgotSuccess(true);
    } catch (err: any) {
      console.error('Forgot password error:', err);
      setForgotError(formatAuthError(err));
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between relative font-sans">
      {/* 1. Official Government Header */}
      <AuthHeader 
        onOpenAbout={() => setInfoModal('about')}
        onOpenSecurity={() => setInfoModal('security')}
        onOpenHelp={() => setInfoModal('help')}
      />

      {/* Main Content Area - Existing Authentication Card */}
      <div className="flex-1 flex items-center justify-center px-4 py-4 sm:px-6 sm:py-6">
        <div className="w-full max-w-5xl bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
          
          {/* Left Hero Panel */}
          <AuthHeroPanel />

          {/* Right Auth Form Panel */}
          <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between bg-white">
            <div>
              {/* Tabs */}
              <div className="flex border-b border-slate-200 mb-7">
                <button
                  type="button"
                  className="pb-3 border-b-2 border-blue-600 text-blue-600 text-sm font-bold tracking-wide flex items-center space-x-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>LOGIN</span>
                </button>
                <Link
                  to="/register"
                  className="pb-3 px-6 border-b-2 border-transparent text-slate-400 hover:text-slate-800 text-sm font-semibold tracking-wide transition-colors flex items-center space-x-2"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>CREATE ACCOUNT</span>
                </Link>
              </div>

              <div className="mb-5">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Officer Sign In</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Enter your official email and departmental security password.
                </p>
              </div>

              {/* Notice if Firebase is not yet configured in local .env */}
              {!isFirebaseConfigured && (
                <div className="mb-5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-2.5 text-xs text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Firebase Setup Notice</span>
                    <span>
                      Please add your <strong>AICrimeAnalytics</strong> Firebase Web App credentials (API Key, Project ID, etc.) into <code>frontend/.env</code>. See <code>.env.example</code> for details.
                    </span>
                  </div>
                </div>
              )}

              {/* Error Alert */}
              {errorMsg && (
                <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2.5 text-xs text-rose-700 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="leading-snug font-medium">{errorMsg}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Police ID or Departmental Email
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. KSP-BGL-4089 or officer@ksp.gov.in"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Security Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotModal(true);
                        setForgotEmail(email);
                        setForgotError(null);
                        setForgotSuccess(false);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-10 pr-10 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold tracking-wider uppercase transition-all shadow-md hover:shadow-lg disabled:opacity-60 flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Bottom Register Prompt */}
            <div className="pt-6 mt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
              <span>New officer awaiting clearance?</span>
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-800 font-bold hover:underline"
              >
                Create Account →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Official Intelligence Center Footer */}
      <AuthFooter 
        onOpenAbout={() => setInfoModal('about')}
        onOpenSecurity={() => setInfoModal('security')}
        onOpenHelp={() => setInfoModal('help')}
      />

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Reset Password</h4>
                <p className="text-xs text-slate-500">Receive a secure reset link on your registered email.</p>
              </div>
            </div>

            {forgotSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
                <div className="flex items-center space-x-2 text-xs text-emerald-800 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Password reset email sent. Please check your inbox.</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  We have sent instructions to <strong>{forgotEmail}</strong>. Follow the link to establish a new password.
                </p>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="w-full py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                {forgotError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
                    {forgotError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Enter Departmental Email</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="officer@ksp.gov.in"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50 flex items-center space-x-1.5 cursor-pointer"
                  >
                    {forgotLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <span>Send Reset Link</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Information Dialog Modals (About, Security, Help) */}
      {infoModal && (
        <AuthInfoModal type={infoModal} onClose={() => setInfoModal(null)} />
      )}
    </div>
  );
};
