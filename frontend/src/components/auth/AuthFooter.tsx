import React from 'react';
import { KspShieldEmblem } from '../desktop/Emblems';
import { Lock } from 'lucide-react';

interface AuthFooterProps {
  onOpenAbout?: () => void;
  onOpenSecurity?: () => void;
  onOpenHelp?: () => void;
}

export const AuthFooter: React.FC<AuthFooterProps> = ({
  onOpenAbout,
  onOpenSecurity,
  onOpenHelp
}) => {
  return (
    <footer className="w-full bg-white border-t border-slate-200 shrink-0 z-10">
      {/* 3-column compact summary section */}
      <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: KSP Emblem & Brand */}
        <div className="flex items-center space-x-3">
          <KspShieldEmblem className="w-8 h-8 shrink-0" />
          <div className="flex flex-col">
            <span className="font-heading text-xs font-extrabold tracking-wide text-slate-900 leading-tight">
              KSP AI-PORTAL
            </span>
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest leading-tight">
              INTELLIGENCE CENTER
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              Karnataka State Police
            </span>
          </div>
        </div>

        {/* Center: Quick Links */}
        <div className="flex flex-col items-center">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
            Quick Links
          </span>
          <div className="flex items-center space-x-3 text-xs text-slate-600">
            <button
              type="button"
              onClick={onOpenAbout}
              className="hover:text-blue-700 transition-colors cursor-pointer font-medium"
            >
              About Platform
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={onOpenSecurity}
              className="hover:text-blue-700 transition-colors cursor-pointer font-medium"
            >
              Security
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={onOpenHelp}
              className="hover:text-blue-700 transition-colors cursor-pointer font-medium"
            >
              Help
            </button>
          </div>
        </div>

        {/* Right: System Status */}
        <div className="flex flex-col items-center md:items-end">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
            System Status
          </span>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Operational</span>
          </div>
        </div>
      </div>

      {/* Bottom Sub-footer line */}
      <div className="border-t border-slate-100 bg-slate-50/70 py-2.5 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <span>© 2026 Karnataka State Police · KSP AI-PORTAL. All rights reserved.</span>
          <div className="flex items-center space-x-1.5 text-slate-600 font-medium">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>Authorized Access Only</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
