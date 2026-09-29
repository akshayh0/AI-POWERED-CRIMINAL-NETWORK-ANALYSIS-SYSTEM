import React from 'react';
import { NavLink } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { normalizeRole, getRoleDisplayName } from '../types/auth';
import { ALL_MENU_ITEMS } from '../config/navigationConfig';

interface SidebarProps {
  role: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const normRole = normalizeRole(role);

  const filteredItems = ALL_MENU_ITEMS.filter(item => 
    normRole === 'admin' || item.roles.includes(normRole)
  );

  return (
    <div className="w-64 h-screen bg-[#0a0d14] border-r border-white/10 flex flex-col fixed left-0 top-0 z-20 lg:hidden">
      {/* Title Header */}
      <div className="p-6 border-b border-white/10 flex items-center space-x-3">
        <Shield className="w-8 h-8 text-orange-500 animate-pulse" />
        <div>
          <h1 className="font-heading text-lg font-bold tracking-wider text-white">KSP AI-PORTAL</h1>
          <p className="text-[10px] text-sky-500 uppercase tracking-widest font-semibold">Intelligence Center</p>
        </div>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </div>

      {/* Footer / Clearance Badge */}
      <div className="p-4 border-t border-white/10 bg-slate-900/30">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-400 uppercase">Clearance Level</span>
            <span className="text-[11px] text-orange-500 font-bold tracking-wide">
              {getRoleDisplayName(role)}
            </span>
          </div>
          <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></span>
        </div>
      </div>
    </div>
  );
};
