import React from 'react';
import { useSocket } from '../context/SocketContext.tsx';
import { X } from 'lucide-react';

interface NotificationModalProps {
  onClose: () => void;
  onSelectNotification?: (n: any) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ onClose, onSelectNotification }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useSocket();

  const handleNotificationClick = async (n: any) => {
    await markAsRead(n.id);
    if (onSelectNotification) {
      onSelectNotification(n);
    }
    onClose();
  };

  return (
    <div className="absolute right-0 top-10 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 z-50 overflow-hidden">
      <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-xs text-slate-900 dark:text-white">Notifications</h3>
          <p className="text-[11px] text-slate-400">{unreadCount} unread</p>
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-[11px] font-medium text-teal-700 dark:text-teal-400 hover:underline px-2 py-0.5"
            >
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            No notifications.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className={`p-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer flex items-start gap-2.5 ${
                !n.isRead ? 'bg-slate-50/60 dark:bg-slate-800/20' : ''
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${!n.isRead ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline gap-1">
                  <h4 className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">{n.title}</h4>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{n.message}</p>
                {n.entityType && (
                  <span className="inline-block mt-1 text-[10px] font-medium text-teal-700 dark:text-teal-400">
                    Click to view {n.entityType.replace('_', ' ')} →
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
