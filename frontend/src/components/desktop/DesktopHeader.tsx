import React, { useState } from 'react';
import { DesktopGovernmentHeader } from './DesktopGovernmentHeader';
import { DesktopMainHeader } from './DesktopMainHeader';
import { DesktopNavigation } from './DesktopNavigation';

interface DesktopHeaderProps {
  currentRole: string;
  setRole: (role: string) => void;
}

export const DesktopHeader: React.FC<DesktopHeaderProps> = ({ currentRole, setRole }) => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="w-full bg-white sticky top-0 z-40 shadow-xs border-b border-slate-200">
      {/* 1. Top Indian Government Bar */}
      <DesktopGovernmentHeader
        currentRole={currentRole}
        onOpenNotifications={() => setShowNotifications(prev => !prev)}
        onOpenProfile={() => setShowProfileModal(true)}
      />

      {/* 2. Main Brand / Portal Header with Global Search & Chief Admin Profile */}
      <DesktopMainHeader
        currentRole={currentRole}
        setRole={setRole}
        showProfileModal={showProfileModal}
        setShowProfileModal={setShowProfileModal}
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
      />

      {/* 3. Horizontal Primary Navigation with Categorized Dropdowns */}
      <DesktopNavigation role={currentRole} />
    </header>
  );
};
