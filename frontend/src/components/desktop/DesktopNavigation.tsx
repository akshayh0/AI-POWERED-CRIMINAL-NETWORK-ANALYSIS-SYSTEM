import React from 'react';
import { useLocation } from 'react-router-dom';
import { getFilteredCategories } from '../../config/navigationConfig';
import { NavigationDropdown } from './NavigationDropdown';

interface DesktopNavigationProps {
  role: string;
}

export const DesktopNavigation: React.FC<DesktopNavigationProps> = ({ role }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const categories = getFilteredCategories(role);

  return (
    <nav 
      aria-label="Desktop Primary Navigation" 
      className="bg-slate-50 border-b border-slate-200 px-6 py-0 flex items-center justify-between text-xs relative z-30"
    >
      {/* Category Dropdowns and Tabs - Ensure overflow-visible so dropdowns are NEVER clipped */}
      <div className="flex items-center space-x-1 py-0 relative overflow-visible">
        {categories.map((category) => (
          <NavigationDropdown
            key={category.id}
            category={category}
            currentPath={currentPath}
          />
        ))}
      </div>

      {/* Right side live status & security clearance */}
      <div className="hidden xl:flex items-center space-x-3 text-[11px] text-slate-500 py-1">
        <span className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-mono text-[10px] font-semibold text-slate-700 tracking-wider">STATE POLICE AI NET: CONNECTED</span>
        </span>
        <span className="text-slate-300">|</span>
        <span className="font-mono text-[10px] text-slate-500">256-BIT ENCRYPTION</span>
      </div>
    </nav>
  );
};
