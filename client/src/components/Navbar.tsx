import React, { useState } from 'react';
import { Bell, PhoneCall, Moon, Sun, ShieldAlert, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useSocket } from '../context/SocketContext.tsx';
import { NotificationModal } from './NotificationModal.tsx';

interface NavbarProps {
  onOpenEmergencyModal?: () => void;
  onNavigateProfile?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenEmergencyModal, onNavigateProfile }) => {
  const { user } = useAuth();
  const { unreadCount } = useSocket();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
  };

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'CP';

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between sticky top-9 z-40">
      {/* Brand & Date */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#0c756e] text-white flex items-center justify-center font-extrabold text-base shadow-sm">
            +
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-slate-800 dark:text-white">CarePlus</span>
            <span className="text-xs ml-2 font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
              {user?.role ? user.role.replace('_', ' ') : 'Portal'}
            </span>
          </div>
        </div>

        <div className="hidden sm:block text-xs font-medium text-slate-400 pl-4 border-l border-slate-200 dark:border-slate-800">
          📅 {todayStr}
        </div>
      </div>

      {/* Action Icons */}
      <div className="flex items-center gap-3">
        {/* Emergency Speed Dial */}
        <button
          onClick={onOpenEmergencyModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300 font-bold text-xs transition"
          title="Emergency Hotline"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Emergency 108</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          title="Toggle Light/Dark Theme"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition relative"
            title="Real-time Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 shadow">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <NotificationModal onClose={() => setIsNotifOpen(false)} />
          )}
        </div>

        {/* User Profile Avatar */}
        <button
          onClick={onNavigateProfile}
          className="flex items-center gap-2 pl-2 hover:opacity-90 transition cursor-pointer"
          title="View Profile"
        >
          <div className="w-9 h-9 rounded-full bg-[#0c756e]/10 border-2 border-[#0c756e] text-[#0c756e] flex items-center justify-center font-bold text-xs overflow-hidden">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">{user?.name}</div>
            <div className="text-[10px] text-slate-400 leading-tight">{user?.email}</div>
          </div>
        </button>
      </div>
    </header>
  );
};
