import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Bell, 
  Search, 
  User, 
  ShieldCheck, 
  Activity, 
  LogOut, 
  Settings as SettingsIcon, 
  BadgeCheck, 
  MapPin, 
  X,
  Building2,
  ChevronDown
} from 'lucide-react';
import type { UserRole } from '../types/auth';

interface HeaderProps {
  currentRole: string;
  setRole: (role: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentRole, setRole }) => {
  const navigate = useNavigate();
  const { userProfile, logout, isAdmin } = useAuth();
  const [searchVal, setSearchVal] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const notifications = [
    { id: 1, text: "New FIR Registered in Koramangala PS (Theft)", type: "info", time: "5 mins ago" },
    { id: 2, text: "Repeat Offender A2 flagged at Lashkar PS", type: "warning", time: "20 mins ago" },
    { id: 3, text: "Crime spike predicted in Mysuru district next week", type: "danger", time: "1 hour ago" },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/firs?search=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  const handleSignOut = async () => {
    setShowProfileDropdown(false);
    await logout();
    navigate('/login');
  };

  const roles: UserRole[] = [
    'Administrator',
    'Police Officer',
    'Investigation Officer',
    'Crime Analyst',
    'District Superintendent'
  ];

  const displayName = userProfile?.name || 'Gov Officer';
  const displayRole = userProfile?.role || currentRole || 'Administrator';
  const displayDistrict = userProfile?.district || 'Karnataka HQ';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <>
      <header className="h-16 bg-[#0a0d14]/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-8 fixed top-0 right-0 left-0 md:left-64 z-10 lg:hidden">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-96">
          <input
            type="text"
            placeholder="Global Search (Crime No, Accused, Officer, Court...)"
            className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
        </form>

        {/* Control Actions */}
        <div className="flex items-center space-x-6">
          {/* System Activity */}
          <div className="hidden lg:flex items-center space-x-2 text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>System Status: Operational</span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => { setShowNotifications(!showNotifications); setShowProfileDropdown(false); }}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors relative cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full animate-ping"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-white/15 rounded-lg shadow-2xl p-4 z-50 animate-fadeIn">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 pb-2 border-b border-white/10">Recent Alerts</h3>
                <div className="space-y-3">
                  {notifications.map((n) => (
                    <div key={n.id} className="text-xs pb-2 border-b border-white/5 last:border-0">
                      <p className={`font-semibold ${n.type === 'danger' ? 'text-rose-400' : n.type === 'warning' ? 'text-amber-400' : 'text-slate-300'}`}>
                        {n.text}
                      </p>
                      <span className="text-[10px] text-slate-500">{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Area */}
          <div className="relative">
            <button 
              onClick={() => { setShowProfileDropdown(!showProfileDropdown); setShowNotifications(false); }}
              className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-white/5 transition-all text-left cursor-pointer border border-transparent hover:border-white/10"
            >
              {userProfile?.profilePhotoUrl ? (
                <img
                  src={userProfile.profilePhotoUrl}
                  alt={displayName}
                  className="w-9 h-9 rounded-full object-cover border border-blue-400"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-xs">
                  {initials || <User className="w-4 h-4" />}
                </div>
              )}
              <div className="hidden md:block">
                <p className="text-xs font-bold text-white leading-tight">{displayName}</p>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span className="text-[10px] text-orange-400 font-semibold truncate max-w-[110px]">{displayRole}</span>
                  <span className="text-slate-500 text-[10px]">·</span>
                  <span className="text-[10px] text-slate-400 truncate max-w-[90px]">{displayDistrict}</span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-white/15 rounded-2xl shadow-2xl p-3 z-50 animate-fadeIn text-xs">
                {/* User Header Summary */}
                <div className="p-3 bg-slate-950/70 border border-white/10 rounded-xl mb-2">
                  <div className="font-bold text-white text-sm">{displayName}</div>
                  <div className="text-[11px] text-slate-400 font-mono truncate">{userProfile?.email}</div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10 text-[10px]">
                    <span className="text-orange-400 font-semibold">{displayRole}</span>
                    <span className="text-slate-400">{displayDistrict}</span>
                  </div>
                </div>

                {/* Menu items */}
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setShowProfileModal(true);
                      setShowProfileDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors flex items-center space-x-2 cursor-pointer"
                  >
                    <User className="w-4 h-4 text-blue-400" />
                    <span>Officer Profile</span>
                  </button>

                  {isAdmin && (
                    <Link
                      to="/settings"
                      onClick={() => setShowProfileDropdown(false)}
                      className="w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors flex items-center space-x-2"
                    >
                      <SettingsIcon className="w-4 h-4 text-slate-400" />
                      <span>Settings & Security</span>
                    </Link>
                  )}

                  {/* Role Switcher ONLY for Admin UI preview / testing */}
                  {isAdmin && (
                    <div className="pt-2 border-t border-white/10 mt-2">
                      <div className="px-3 py-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
                        <span>UI Preview (Testing)</span>
                        <span className="text-[9px] text-orange-400">Admin Only</span>
                      </div>
                      <div className="grid grid-cols-1 gap-0.5 mt-1">
                        {roles.map((r) => (
                          <button
                            key={r}
                            onClick={() => {
                              setRole(r);
                              setShowProfileDropdown(false);
                            }}
                            className={`w-full text-left text-[11px] px-3 py-1.5 rounded-md transition-colors ${
                              currentRole === r 
                                ? 'bg-blue-600/20 text-blue-400 font-semibold' 
                                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sign Out Button */}
                  <div className="pt-2 border-t border-white/10 mt-2">
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center space-x-2 cursor-pointer font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* User Dossier Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-slate-900">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-3">
                {userProfile?.profilePhotoUrl ? (
                  <img
                    src={userProfile.profilePhotoUrl}
                    alt={displayName}
                    className="w-12 h-12 rounded-xl object-cover border border-blue-200"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm border border-blue-200">
                    {initials}
                  </div>
                )}
                <div>
                  <h3 className="text-base font-bold text-slate-900">{displayName}</h3>
                  <p className="text-xs text-slate-500 font-mono">{userProfile?.email}</p>
                </div>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Clearance Role</span>
                <span className="font-bold text-orange-600">{displayRole}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Account Status</span>
                <span className="font-bold capitalize text-emerald-700">{userProfile?.status || 'Approved'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Badge / Dept ID</span>
                <span className="font-mono font-bold text-blue-700">{userProfile?.departmentId || 'HQ-STAFF'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">District Jurisdiction</span>
                <span className="font-semibold text-slate-800">{displayDistrict}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 col-span-2">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Official Phone</span>
                <span className="font-mono text-slate-800">{userProfile?.phone || 'Not recorded'}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowProfileModal(false)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
