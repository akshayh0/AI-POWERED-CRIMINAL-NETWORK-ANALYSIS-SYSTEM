import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isFirebaseConfigured, formatAuthError } from '../services/firebase';
import type { UserRole } from '../types/auth';
import { getRoleDisplayName } from '../types/auth';
import { 
  Shield, 
  User, 
  Lock, 
  BadgeCheck, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Building2,
  Eye,
  EyeOff,
  UserCog
} from 'lucide-react';
import { KspShieldEmblem, KarnatakaGovEmblem, IndianTricolorStripe } from '../components/desktop/Emblems';

const ROLE_OPTIONS = [
  { id: 'police_officer', label: 'Police Officer' },
  { id: 'investigation_officer', label: 'Investigation Officer' },
  { id: 'crime_analyst', label: 'Crime Analyst' },
  { id: 'district_superintendent', label: 'District Superintendent' }
];

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  // ONLY the 5 required fields:
  const [fullName, setFullName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [requestedRole, setRequestedRole] = useState<string>('police_officer');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Touched state for clear inline validation
  const [touched, setTouched] = useState({
    fullName: false,
    employeeId: false,
    password: false,
    confirmPassword: false
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Field validation rules
  const fullNameError = touched.fullName && !fullName.trim() 
    ? 'Full Name is required.' 
    : '';

  const employeeIdError = touched.employeeId && !employeeId.trim() 
    ? 'Police / Employee ID is required.' 
    : '';

  const passwordError = touched.password && !password 
    ? 'Security password is required.' 
    : touched.password && password.length < 6 
    ? 'Password must be at least 6 characters.' 
    : '';

  const confirmPasswordError = touched.confirmPassword && !confirmPassword 
    ? 'Please confirm your password.' 
    : touched.confirmPassword && confirmPassword !== password 
    ? 'Passwords do not match.' 
    : '';

  const isFormValid = 
    fullName.trim().length > 0 &&
    employeeId.trim().length > 0 &&
    requestedRole.length > 0 &&
    password.length >= 6 &&
    confirmPassword === password;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Mark all as touched
    setTouched({
      fullName: true,
      employeeId: true,
      password: true,
      confirmPassword: true
    });

    if (!isFirebaseConfigured) {
      setErrorMsg('Authentication service configuration is invalid. Please contact the system administrator.');
      return;
    }

    if (!fullName.trim() || !employeeId.trim() || !password) {
      setErrorMsg('Please complete all mandatory required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Password confirmation does not match. Please re-enter.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Security password must contain at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      await register({
        fullName: fullName.trim(),
        employeeId: employeeId.trim(),
        password,
        requestedRole: requestedRole as UserRole
      });

      setIsSubmitted(true);
    } catch (err: any) {
      console.error('Registration error:', err);
      const rawMsg = err?.message || '';
      if (rawMsg.includes('already exists') || rawMsg.includes('email-already-in-use')) {
        setErrorMsg('An account with this Police / Employee ID already exists. Please sign in or contact the administrator.');
      } else {
        setErrorMsg(formatAuthError(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] flex flex-col justify-between font-sans">
      {/* Top Government Emblem Bar */}
      <div>
        <IndianTricolorStripe />
        <div className="gov-topbar bg-[#091a33] text-slate-200 border-b border-slate-800 px-6 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-3">
            <KarnatakaGovEmblem className="w-5 h-5 shrink-0" />
            <div className="flex items-baseline space-x-2">
              <span className="font-extrabold tracking-wider text-white text-[12px] uppercase">
                KARNATAKA STATE POLICE
              </span>
              <span className="text-[11px] text-slate-400 font-normal hidden sm:inline">
                | Government of Karnataka
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3 text-slate-300 text-[11px]">
            <span className="font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded hidden sm:inline">
              INTERNAL INTELLIGENCE PORTAL
            </span>
            <span className="text-slate-400">Control Room:</span>
            <span className="font-bold text-amber-400 font-mono">112</span>
          </div>
        </div>
      </div>

      {/* Main Registration Form Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-fadeIn">
          
          {/* Card Header */}
          <div className="bg-slate-50 border-b border-slate-200 p-6 sm:p-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <KspShieldEmblem className="w-12 h-12 shrink-0" />
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-black font-heading text-slate-900 tracking-tight">
                    KSP AI-PORTAL
                  </h1>
                  <span className="px-2 py-0.5 text-[9px] font-bold font-mono tracking-wider bg-blue-100 text-blue-800 rounded border border-blue-200">
                    ACCESS REQUEST
                  </span>
                </div>
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-widest mt-0.5">
                  Intelligence Center Credential Provisioning
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-500 hidden sm:block text-right">
              <span className="block font-medium text-slate-700">Official Access Form</span>
              <span className="text-[11px] text-slate-500 font-mono">Personnel Registry</span>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-8">
            {isSubmitted ? (
              /* Success / Pending Approval Screen */
              <div className="text-center py-6 max-w-md mx-auto space-y-5 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                    Request Submitted
                  </span>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    Account Created Successfully
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Your account has been provisioned and is currently pending administrator verification.
                  </p>
                </div>

                {/* Summary Box */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Officer Name:</span>
                    <span className="font-bold text-slate-900">{fullName}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Police / Employee ID:</span>
                    <span className="font-mono font-bold text-blue-700">{employeeId}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Requested Clearance:</span>
                    <span className="font-bold text-amber-700">{getRoleDisplayName(requestedRole)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Approval Status:</span>
                    <span className="font-bold text-amber-600 flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                      <span>Pending Administrator Review</span>
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Proceed to Officer Sign In
                  </button>
                </div>
              </div>
            ) : (
              /* Two-Column Desktop Form */
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Error Banner */}
                {errorMsg && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2.5 text-xs text-rose-700 animate-fadeIn">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span className="leading-snug font-medium">{errorMsg}</span>
                  </div>
                )}

                {/* Form Instructions */}
                <div className="border-b border-slate-100 pb-3">
                  <p className="text-xs text-slate-600 font-medium">
                    Please provide your verified Karnataka State Police identification credentials. All fields marked with an asterisk (<span className="text-rose-500 font-bold">*</span>) are mandatory.
                  </p>
                </div>

                {/* Desktop Two-Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  
                  {/* Left Column: Full Name, Police / Employee ID, Security Password */}
                  <div className="space-y-5">
                    
                    {/* 1. Full Name * */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                        Full Name <span className="text-rose-600 font-black">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          placeholder="Enter full name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          onBlur={() => setTouched(prev => ({ ...prev, fullName: true }))}
                          className={`w-full bg-slate-50 border rounded-lg py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 transition-all ${
                            fullNameError
                              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                              : 'border-slate-300 focus:border-blue-600 focus:ring-blue-600'
                          }`}
                        />
                        <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      </div>
                      {fullNameError && (
                        <p className="text-[11px] text-rose-600 mt-1 font-medium">{fullNameError}</p>
                      )}
                    </div>

                    {/* 2. Police / Employee ID * */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                        Police / Employee ID <span className="text-rose-600 font-black">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          placeholder="e.g. KSP-BGL-4089"
                          value={employeeId}
                          onChange={(e) => setEmployeeId(e.target.value)}
                          onBlur={() => setTouched(prev => ({ ...prev, employeeId: true }))}
                          className={`w-full bg-slate-50 border rounded-lg py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 transition-all ${
                            employeeIdError
                              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                              : 'border-slate-300 focus:border-blue-600 focus:ring-blue-600'
                          }`}
                        />
                        <BadgeCheck className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      </div>
                      {employeeIdError && (
                        <p className="text-[11px] text-rose-600 mt-1 font-medium">{employeeIdError}</p>
                      )}
                    </div>

                    {/* 4. Security Password * */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                        Security Password <span className="text-rose-600 font-black">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="Minimum 6 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                          className={`w-full bg-slate-50 border rounded-lg py-2.5 pl-10 pr-10 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 transition-all ${
                            passwordError
                              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                              : 'border-slate-300 focus:border-blue-600 focus:ring-blue-600'
                          }`}
                        />
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                          tabIndex={-1}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {passwordError && (
                        <p className="text-[11px] text-rose-600 mt-1 font-medium">{passwordError}</p>
                      )}
                    </div>

                  </div>

                  {/* Right Column: Requested Role, Notice Box, Confirm Password */}
                  <div className="space-y-5">
                    
                    {/* 3. Requested Role * */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                        Requested Role <span className="text-rose-600 font-black">*</span>
                      </label>
                      <div className="relative">
                        <select
                          required
                          value={requestedRole}
                          onChange={(e) => setRequestedRole(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2.5 pl-10 pr-8 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-1 focus:ring-blue-600 transition-all cursor-pointer font-semibold"
                        >
                          {ROLE_OPTIONS.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.label}
                            </option>
                          ))}
                        </select>
                        <UserCog className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Role will be reviewed and approved by the Department Administrator.
                      </p>
                    </div>

                    {/* Department Verification Informational Box (aligns with row 2) */}
                    <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-lg text-xs text-blue-900 flex items-start space-x-2.5">
                      <Shield className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-bold block text-[11px] uppercase tracking-wide text-blue-800">
                          Clearance Policy
                        </span>
                        <p className="text-[11px] text-blue-700 leading-snug mt-0.5">
                          Accounts require departmental verification before clearance is granted by supervisory authority.
                        </p>
                      </div>
                    </div>

                    {/* 5. Confirm Password * */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                        Confirm Password <span className="text-rose-600 font-black">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          placeholder="Re-enter password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          onBlur={() => setTouched(prev => ({ ...prev, confirmPassword: true }))}
                          className={`w-full bg-slate-50 border rounded-lg py-2.5 pl-10 pr-10 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 transition-all ${
                            confirmPasswordError
                              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                              : 'border-slate-300 focus:border-blue-600 focus:ring-blue-600'
                          }`}
                        />
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                          tabIndex={-1}
                          aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {confirmPasswordError && (
                        <p className="text-[11px] text-rose-600 mt-1 font-medium">{confirmPasswordError}</p>
                      )}
                    </div>

                  </div>

                </div>

                {/* Submit Action */}
                <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-500">
                    Already have an authorized account?{' '}
                    <Link to="/login" className="text-blue-600 hover:underline font-bold">
                      Sign In
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={!isFormValid || loading}
                    className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting Access Request...</span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" />
                        <span>Submit Access Request</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="bg-white border-t border-slate-200 px-6 py-3 text-center text-xs text-slate-500">
        Karnataka State Police · State Intelligence Directorate · Confidential Law Enforcement System
      </div>
    </div>
  );
};
