import React, { useState } from 'react';
import { Bell, Moon, Sun, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useSocket } from '../context/SocketContext.tsx';
import { NotificationModal } from './NotificationModal.tsx';

interface NavbarProps {
  portalName?: string;
  onOpenEmergencyModal?: () => void;
  onNavigateProfile?: () => void;
  onNavigateTab?: (tab: string, entityId?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ portalName, onNavigateProfile, onNavigateTab }) => {
  const { user } = useAuth();
  const { unreadCount } = useSocket();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
  };

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'VB';

  const handleSelectNotification = (n: any) => {
    if (!onNavigateTab) return;
    if (n.entityType === 'appointment') {
      onNavigateTab(user?.role === 'PATIENT' ? 'appointments' : 'requests', n.entityId);
    } else if (n.entityType === 'lab_result' || n.entityType === 'lab_order') {
      onNavigateTab(user?.role === 'LAB_TECHNICIAN' ? 'lab_queue' : 'labs', n.entityId);
    } else if (n.entityType === 'prescription') {
      onNavigateTab(user?.role === 'PHARMACIST' ? 'pharmacy_queue' : 'medicines', n.entityId);
    } else if (n.entityType === 'treatment_plan') {
      onNavigateTab('treatment_plans', n.entityId);
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Brand - [+] CarePlus (Exact Screenshot Match) */}
      <div className="flex items-center gap-3">
        <a href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0c756e] flex items-center justify-center text-white shadow-sm">
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-[#0c756e] dark:text-teal-400">
            CarePlus
          </span>
        </a>
        {portalName && (
          <span className="text-xs text-[#0c756e] dark:text-teal-300 bg-[#e6f5f2] dark:bg-slate-800 border border-[#cbe7e2] dark:border-slate-700 px-2.5 py-0.5 rounded-full font-semibold ml-1">
            {portalName}
          </span>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 flex items-center justify-center transition hover:bg-slate-50 dark:hover:bg-slate-800"
          title="Toggle light/dark theme"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* Notification Bell with Badge */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 flex items-center justify-center transition hover:bg-slate-50 dark:hover:bg-slate-800 relative"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <NotificationModal
              onClose={() => setIsNotifOpen(false)}
              onSelectNotification={handleSelectNotification}
            />
          )}
        </div>

        {/* User Profile Avatar with Monogram & Border */}
        <button
          onClick={onNavigateProfile}
          className="flex items-center gap-2 pl-1 transition cursor-pointer"
          title="View profile"
        >
          <div className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 border-2 border-[#0c756e] text-[#0c756e] dark:text-teal-300 flex items-center justify-center font-bold text-xs shadow-sm overflow-hidden">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span>{initials}</span>
            )}
          </div>
        </button>
      </div>
    </header>
  );
};
