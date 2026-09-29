import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LifeBuoy, Bell, LogOut, ShieldCheck, User, PhoneCall } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getRoleDisplayName } from '../../types/auth';
import { KarnatakaGovEmblem, IndianTricolorStripe } from './Emblems';
import { HelpModal } from './HelpModal';

interface DesktopGovernmentHeaderProps {
  currentRole: string;
  onOpenNotifications?: () => void;
  unreadCount?: number;
  onOpenProfile?: () => void;
}

export const DesktopGovernmentHeader: React.FC<DesktopGovernmentHeaderProps> = ({
  currentRole,
  onOpenNotifications,
  unreadCount = 3,
  onOpenProfile
}) => {
  const navigate = useNavigate();
  const { userProfile, logout } = useAuth();
  const [showHelp, setShowHelp] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const displayName = userProfile?.name || 'Chief Intelligence Administrator';
  const roleName = getRoleDisplayName(userProfile?.role || currentRole);

  return (
    <>
      {/* Top Tricolor Indian Government Stripe */}
      <IndianTricolorStripe />

      {/* Main Government Bar */}
      <div className="gov-topbar bg-[#091a33] text-slate-200 border-b border-slate-800/80 px-6 py-1.5 flex items-center justify-between text-xs">
        {/* Left: Emblem + State Government Title */}
        <div className="flex items-center space-x-3">
          <KarnatakaGovEmblem className="w-5 h-5 shrink-0" />
          <div className="flex items-baseline space-x-2">
            <span className="font-extrabold tracking-wider text-white text-[12px] uppercase">
              KARNATAKA STATE POLICE
            </span>
            <span className="text-[11px] text-slate-300 font-normal hidden md:inline">
              | Government of Karnataka
            </span>
            <span className="text-[10px] font-mono text-amber-300 border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.2 rounded font-semibold hidden xl:inline">
              INTERNAL INTELLIGENCE PORTAL
            </span>
          </div>
        </div>

        {/* Right: Control Room, Help, Alerts, Clearance, Chief Admin, Logout */}
        <div className="flex items-center space-x-4">
          {/* Control Room Helpline */}
          <div className="hidden lg:flex items-center space-x-1.5 text-[11px] text-slate-300">
            <PhoneCall className="w-3 h-3 text-amber-400" />
            <span className="text-slate-400">Control Room:</span>
            <span className="font-bold text-amber-400 font-mono">112</span>
          </div>

          <span className="text-slate-700 hidden lg:inline">|</span>

          {/* Help SOPs Button */}
          <button
            type="button"
            onClick={() => setShowHelp(true)}
            className="flex items-center space-x-1 text-slate-300 hover:text-white transition-colors cursor-pointer text-[11px]"
            title="Standard Operating Procedures & Help"
          >
            <LifeBuoy className="w-3.5 h-3.5 text-sky-400" />
            <span>Help</span>
          </button>

          {/* Alerts Button */}
          <button
            type="button"
            onClick={onOpenNotifications}
            className="flex items-center space-x-1 text-slate-300 hover:text-white transition-colors relative cursor-pointer text-[11px]"
            title="System Alerts & Warnings"
          >
            <Bell className="w-3.5 h-3.5 text-slate-300" />
            <span>Alerts</span>
            {unreadCount > 0 && (
              <span className="w-4 h-4 bg-orange-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center leading-none ml-0.5">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Clearance Level Indicator */}
          <button
            type="button"
            onClick={onOpenProfile}
            className="hidden md:flex items-center space-x-1.5 bg-slate-900/90 border border-slate-700 px-2 py-0.5 rounded text-[10px] cursor-pointer hover:border-blue-400 transition-colors"
            title="View Verified Clearance Credentials"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400 font-semibold uppercase">CLEARANCE:</span>
            <span className="text-amber-400 font-mono font-bold truncate max-w-[130px]">{roleName}</span>
          </button>

          {/* Chief Intelligence Administrator profile button */}
          <button
            type="button"
            onClick={onOpenProfile}
            className="flex items-center space-x-1 text-slate-200 hover:text-white transition-colors cursor-pointer text-[11px] font-semibold"
            title="Open Officer Profile"
          >
            <User className="w-3.5 h-3.5 text-blue-400" />
            <span className="truncate max-w-[160px]">{displayName}</span>
          </button>

          {/* Direct Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center space-x-1 text-rose-300 hover:text-rose-100 transition-colors cursor-pointer text-[11px] font-semibold hover:underline"
            title="Sign out of confidential session"
          >
            <LogOut className="w-3 h-3" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Help Modal */}
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </>
  );
};
