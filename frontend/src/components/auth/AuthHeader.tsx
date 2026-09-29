import React from 'react';
import { KarnatakaGovEmblem } from '../desktop/Emblems';

interface AuthHeaderProps {
  onOpenAbout?: () => void;
  onOpenSecurity?: () => void;
  onOpenHelp?: () => void;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  onOpenAbout,
  onOpenSecurity,
  onOpenHelp
}) => {
  return (
    <header className="w-full bg-white border-b border-slate-200 shadow-xs h-15 flex items-center justify-between px-6 lg:px-10 shrink-0 z-30">
      {/* Left side: Karnataka State Police & Government of Karnataka + Links */}
      <div className="flex items-center space-x-4 sm:space-x-6">
        <div className="flex items-center space-x-3">
          <KarnatakaGovEmblem className="w-8 h-8 sm:w-9 sm:h-9 shrink-0" />
          <div className="flex flex-col">
            <span className="font-heading text-xs sm:text-sm font-extrabold tracking-wide text-slate-900 leading-tight">
              KARNATAKA STATE POLICE
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium leading-tight">
              Government of Karnataka
            </span>
          </div>
        </div>

        {/* Divider & Header Quick Links */}
        <div className="hidden md:flex items-center space-x-4 pl-4 border-l border-slate-200 h-6">
          <button
            type="button"
            onClick={onOpenAbout}
            className="text-xs font-semibold text-slate-600 hover:text-blue-700 transition-colors cursor-pointer"
          >
            About Platform
          </button>
          <button
            type="button"
            onClick={onOpenSecurity}
            className="text-xs font-semibold text-slate-600 hover:text-blue-700 transition-colors cursor-pointer"
          >
            Security
          </button>
          <button
            type="button"
            onClick={onOpenHelp}
            className="text-xs font-semibold text-slate-600 hover:text-blue-700 transition-colors cursor-pointer"
          >
            Help
          </button>
        </div>
      </div>

      {/* Right side: Official Intelligence System & Secure Connection status badge */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <span className="text-xs font-medium text-slate-600 hidden sm:inline">
          Official Intelligence System
        </span>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Secure Connection</span>
        </div>
      </div>
    </header>
  );
};
