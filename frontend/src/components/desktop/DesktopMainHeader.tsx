import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Bell,
  User,
  ShieldCheck,
  ChevronDown,
  Activity,
  LogOut,
  Settings as SettingsIcon,
  X,
  Lock,
  Building2,
  FileCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getRoleDisplayName } from '../../types/auth';
import type { UserRole } from '../../types/auth';
import { KspShieldEmblem } from './Emblems';

interface DesktopMainHeaderProps {
  currentRole: string;
  setRole: (role: string) => void;
  showProfileModal: boolean;
  setShowProfileModal: (open: boolean) => void;
  showNotifications: boolean;
  setShowNotifications: (open: boolean) => void;
}

export const DesktopMainHeader: React.FC<DesktopMainHeaderProps> = ({
  currentRole,
  setRole,
  showProfileModal,
  setShowProfileModal,
  showNotifications,
  setShowNotifications
}) => {
  const navigate = useNavigate();
  const { userProfile, logout, isAdmin } = useAuth();
  const [searchVal, setSearchVal] = useState('');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowNotifications]);

  const notifications = [
    { id: 1, text: "New FIR Registered in Koramangala PS (Theft / Burglary)", type: "info", time: "5 mins ago" },
    { id: 2, text: "Repeat Offender A2 detected near Lashkar PS perimeter", type: "warning", time: "20 mins ago" },
    { id: 3, text: "High probability crime spike forecasted in Mysuru District", type: "danger", time: "1 hour ago" },
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

  const displayName = userProfile?.name || 'Chief Intelligence Administrator';
  const displayRole = getRoleDisplayName(userProfile?.role || currentRole || 'Administrator');
  const displayDistrict = userProfile?.district || 'Karnataka State HQ';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'AD';

  return (
    <>
      <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between text-slate-800 relative z-40 shadow-2xs">
        {/* Left: Brand Identity & Version */}
        <Link to="/" className="flex items-center space-x-3.5 group cursor-pointer shrink-0">
          <KspShieldEmblem className="w-10 h-10 group-hover:scale-105 transition-transform" />
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="font-heading text-xl font-extrabold tracking-tight text-slate-900 leading-none">
                KSP AI-PORTAL
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-bold font-mono tracking-wider bg-blue-50 text-blue-700 rounded border border-blue-200">
                v2.4 SECURE
              </span>
            </div>
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest mt-0.5">
              INTELLIGENCE CENTER
            </span>
          </div>
        </Link>

        {/* Center / Right: Global Search Box */}
        <div className="flex-1 max-w-xl mx-8">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search portal (FIR Number, Accused Name, Officer, Station, Crime Head)..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-md py-2 pl-9 pr-16 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-1 focus:ring-blue-600 transition-all shadow-2xs"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 px-2.5 py-1 text-[10px] font-semibold text-slate-600 bg-slate-200 hover:bg-slate-300 rounded cursor-pointer transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Right: Operational Status, Alerts, Admin Profile */}
        <div className="flex items-center space-x-4 shrink-0">
          {/* System Status Pill */}
          <div className="hidden 2xl:flex items-center space-x-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            <Activity className="w-3.5 h-3.5 animate-pulse text-emerald-600" />
            <span>State Network Operational</span>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notificationsRef}>
            <button
              type="button"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileDropdown(false);
              }}
              className="p-2 text-slate-600 hover:text-blue-700 rounded-md hover:bg-slate-100 transition-colors relative cursor-pointer border border-slate-200"
              title="System Alerts & Intelligence Warnings"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-600 rounded-full animate-ping"></span>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-600 rounded-full"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-84 bg-white border border-slate-200 rounded-md shadow-2xl p-4 z-50 text-slate-800 animate-fadeIn">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Recent Alerts & Warnings
                  </h3>
                  <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">3 unread</span>
                </div>
                <div className="space-y-2.5">
                  {notifications.map((n) => (
                    <div key={n.id} className="text-xs pb-2 border-b border-slate-100 last:border-0">
                      <p className={`font-semibold ${
                        n.type === 'danger' ? 'text-rose-700' : n.type === 'warning' ? 'text-amber-700' : 'text-slate-800'
                      }`}>
                        {n.text}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Chief Intelligence Admin Profile Trigger & Dropdown */}
          <div className="relative" ref={profileDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setShowProfileDropdown(!showProfileDropdown);
                setShowNotifications(false);
              }}
              className="flex items-center space-x-3 p-1.5 rounded-md hover:bg-slate-50 transition-colors text-left cursor-pointer border border-slate-200"
              aria-haspopup="true"
              aria-expanded={showProfileDropdown}
              title="Chief Intelligence Administrator Menu"
            >
              {userProfile?.profilePhotoUrl ? (
                <img
                  src={userProfile.profilePhotoUrl}
                  alt={displayName}
                  className="w-9 h-9 rounded object-cover border border-blue-300"
                />
              ) : (
                <div className="w-9 h-9 rounded bg-blue-100 border border-blue-300 flex items-center justify-center text-blue-800 font-bold text-xs">
                  {initials || <User className="w-4 h-4" />}
                </div>
              )}
              <div className="hidden md:block leading-tight">
                <p className="text-xs font-bold text-slate-900 truncate max-w-[150px]">{displayName}</p>
                <div className="flex items-center space-x-1 mt-0.5">
                  <span className="text-[10px] text-amber-700 font-bold truncate max-w-[110px]">
                    {displayRole}
                  </span>
                  <span className="text-slate-400 text-[10px]">·</span>
                  <span className="text-[10px] text-slate-500 truncate max-w-[85px]">
                    {displayDistrict}
                  </span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-76 bg-white border border-slate-200 rounded-md shadow-2xl p-3 z-50 animate-fadeIn text-xs">
                {/* User Header Summary */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md mb-2">
                  <div className="font-bold text-slate-900 text-sm">{displayName}</div>
                  <div className="text-[11px] text-slate-500 font-mono truncate">{userProfile?.email || 'officer@ksp.gov.in'}</div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 text-[10px]">
                    <span className="text-amber-700 font-bold uppercase">{displayRole}</span>
                    <span className="text-slate-600 font-medium">{displayDistrict}</span>
                  </div>
                </div>

                {/* Dropdown Options */}
                <div className="space-y-1">
                  {/* 1. Officer Profile */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileModal(true);
                      setShowProfileDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded text-slate-700 hover:text-blue-700 hover:bg-slate-50 transition-colors flex items-center space-x-2.5 cursor-pointer font-medium"
                  >
                    <User className="w-4 h-4 text-blue-600" />
                    <span>Officer Profile</span>
                  </button>

                  {/* 2. Account Settings */}
                  {isAdmin && (
                    <Link
                      to="/settings"
                      onClick={() => setShowProfileDropdown(false)}
                      className="w-full text-left px-3 py-2 rounded text-slate-700 hover:text-blue-700 hover:bg-slate-50 transition-colors flex items-center space-x-2.5 font-medium"
                    >
                      <SettingsIcon className="w-4 h-4 text-slate-500" />
                      <span>Account Settings</span>
                    </Link>
                  )}

                  {/* 3. Security & Audit */}
                  {isAdmin && (
                    <Link
                      to="/settings"
                      onClick={() => setShowProfileDropdown(false)}
                      className="w-full text-left px-3 py-2 rounded text-slate-700 hover:text-blue-700 hover:bg-slate-50 transition-colors flex items-center space-x-2.5 font-medium"
                    >
                      <Lock className="w-4 h-4 text-emerald-600" />
                      <span>Security & Audit Logs</span>
                    </Link>
                  )}

                  {/* 4. UI Preview Role Switcher (Admin Only) */}
                  {isAdmin && (
                    <div className="pt-2 border-t border-slate-200 mt-2">
                      <div className="px-3 py-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center justify-between">
                        <span>UI Preview (Testing)</span>
                        <span className="text-[9px] text-amber-700 font-semibold">Admin</span>
                      </div>
                      <div className="grid grid-cols-1 gap-0.5 mt-1">
                        {roles.map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => {
                              setRole(r);
                              setShowProfileDropdown(false);
                            }}
                            className={`w-full text-left text-[11px] px-3 py-1.5 rounded transition-colors cursor-pointer ${
                              currentRole === r
                                ? 'bg-blue-100 text-blue-800 font-bold'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 5. Sign Out Button */}
                  <div className="pt-2 border-t border-slate-200 mt-2">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full text-left px-3 py-2 rounded text-rose-700 hover:bg-rose-50 transition-colors flex items-center space-x-2.5 cursor-pointer font-bold"
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
      </div>

      {/* Verified Officer Dossier Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-slate-900">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-3">
                {userProfile?.profilePhotoUrl ? (
                  <img
                    src={userProfile.profilePhotoUrl}
                    alt={displayName}
                    className="w-12 h-12 rounded-lg object-cover border border-blue-300"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-sm border border-blue-200">
                    {initials}
                  </div>
                )}
                <div>
                  <h3 className="text-base font-bold text-slate-900">{displayName}</h3>
                  <p className="text-xs text-slate-500 font-mono">{userProfile?.email || 'officer@ksp.gov.in'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded cursor-pointer"
                aria-label="Close Profile"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Clearance Role</span>
                <span className="font-bold text-amber-700">{displayRole}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Account Status</span>
                <span className="font-bold capitalize text-emerald-700">{userProfile?.status || 'Approved & Verified'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Badge / Dept ID</span>
                <span className="font-mono font-bold text-blue-800">{userProfile?.departmentId || 'KSP-HQ-OFFICER'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">District Jurisdiction</span>
                <span className="font-semibold text-slate-800">{displayDistrict}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 col-span-2">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Official Contact</span>
                <span className="font-mono text-slate-800">{userProfile?.phone || '+91 80 2294 2111 (Ext. HQ)'}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold transition-all shadow-xs cursor-pointer"
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
