import React, { useState } from 'react';
import { Bell, Moon, Sun, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useSocket } from '../context/SocketContext.tsx';
import { NotificationModal } from './NotificationModal.tsx';

interface NavbarProps {
  onOpenEmergencyModal?: () => void;
  onNavigateProfile?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigateProfile }) => {
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
    <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between sticky top-9 z-40">
      {/* Clean Brand & Date - NO [+] symbol! */}
      <div className="flex items-center gap-3">
        <span className="font-semibold text-base tracking-tight text-slate-900 dark:text-white">
          CarePlus
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-medium">
          {user?.role ? user.role.replace('_', ' ') : 'Portal'}
        </span>
        <span className="hidden sm:inline text-xs text-slate-400 pl-3 border-l border-slate-200 dark:border-slate-800 font-normal">
          {todayStr}
        </span>
      </div>

      {/* Clean Right Actions - NO Emergency 108 in navbar! */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-8 h-8 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition"
          title="Toggle theme"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="w-8 h-8 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition relative"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute 1 top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-600" />
            )}
          </button>

          {isNotifOpen && (
            <NotificationModal onClose={() => setIsNotifOpen(false)} />
          )}
        </div>

        {/* User Profile Avatar */}
        <button
          onClick={onNavigateProfile}
          className="flex items-center gap-2.5 pl-2 py-1 pr-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          title="View profile"
        >
          <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-medium text-xs overflow-hidden">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-medium text-slate-900 dark:text-slate-100 leading-none">{user?.name}</div>
          </div>
        </button>
      </div>
    </header>
  );
};
