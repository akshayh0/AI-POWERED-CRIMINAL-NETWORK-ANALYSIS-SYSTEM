import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import type { NavCategoryConfig } from '../../config/navigationConfig';
import { isCategoryActive, isItemActive } from '../../config/navigationConfig';

interface NavigationDropdownProps {
  category: NavCategoryConfig;
  currentPath: string;
}

export const NavigationDropdown: React.FC<NavigationDropdownProps> = ({
  category,
  currentPath
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const hasMultipleItems = category.items.length > 1;
  const isDirect = category.isDirectLink || !hasMultipleItems;
  const singleItem = category.items[0];
  const isActive = isCategoryActive(category, currentPath);

  // Handle smooth mouse enter / leave with small grace period
  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (!isDirect) {
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 180);
  };

  // Close dropdown on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Direct link (e.g. COMMAND or MAP)
  if (isDirect && singleItem) {
    const directPath = category.directPath || singleItem.path;
    const directActive = isItemActive(directPath, currentPath);

    return (
      <NavLink
        to={directPath}
        className={`flex items-center space-x-1.5 px-4 py-2.5 text-xs font-bold tracking-wider transition-all duration-150 border-b-2 cursor-pointer ${
          directActive
            ? 'text-blue-700 bg-blue-50/90 border-blue-600'
            : 'text-slate-700 hover:text-blue-700 hover:bg-slate-100/80 active:bg-blue-100/50 border-transparent'
        }`}
      >
        <category.icon className={`w-3.5 h-3.5 ${directActive ? 'text-blue-600' : 'text-slate-500'}`} />
        <span>{category.title}</span>
      </NavLink>
    );
  }

  // Dropdown menu (e.g. USERS, CRIME RECORDS, AI INTELLIGENCE, OPERATIONS)
  return (
    <div 
      className="relative" 
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className={`flex items-center space-x-1.5 px-4 py-2.5 text-xs font-bold tracking-wider transition-all duration-150 border-b-2 cursor-pointer ${
          isActive || isOpen
            ? 'text-blue-700 bg-blue-50/90 border-blue-600'
            : 'text-slate-700 hover:text-blue-700 hover:bg-slate-100/80 active:bg-blue-100/50 border-transparent'
        }`}
      >
        <category.icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
        <span>{category.title}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-blue-600' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div 
          className="absolute left-0 top-full mt-0 w-80 bg-white border border-slate-200 rounded-b-md shadow-2xl py-1.5 z-50 text-slate-800 animate-fadeIn"
          role="menu"
          style={{ minWidth: '280px' }}
        >
          {/* Category subtitle */}
          <div className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 mb-1 flex items-center justify-between">
            <span>{category.title} MODULES</span>
            <span className="text-[9px] font-mono text-blue-600 font-semibold bg-blue-50 px-1 rounded">SECURE</span>
          </div>

          <div className="py-0.5">
            {category.items.map((item) => {
              const itemActive = isItemActive(item.path, currentPath);
              const ItemIcon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  role="menuitem"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-start space-x-3 px-4 py-2.5 transition-colors border-l-2 cursor-pointer ${
                    itemActive
                      ? 'bg-blue-50/90 text-blue-800 border-blue-600 font-semibold'
                      : 'text-slate-700 hover:bg-blue-50/60 hover:text-blue-700 border-transparent'
                  }`}
                >
                  <ItemIcon className={`w-4 h-4 mt-0.5 shrink-0 ${itemActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold leading-tight flex items-center justify-between">
                      <span className="truncate">{item.name}</span>
                      {item.shortName && (
                        <span className="text-[10px] text-slate-400 font-mono font-normal ml-2 shrink-0">
                          {item.shortName}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5 leading-normal">
                        {item.description}
                      </p>
                    )}
                  </div>
                </NavLink>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
