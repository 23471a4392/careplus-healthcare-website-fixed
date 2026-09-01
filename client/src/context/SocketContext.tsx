import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext.tsx';
import { NotificationItem } from '../types/index.ts';

interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'alert';
}

interface SocketContextType {
  socket: Socket | null;
  notifications: NotificationItem[];
  unreadCount: number;
  realtimeVersion: number;
  toasts: ToastMessage[];
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  showToast: (title: string, message: string, type?: 'info' | 'success' | 'alert') => void;
  removeToast: (id: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [realtimeVersion, setRealtimeVersion] = useState(0);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (title: string, message: string, type: 'info' | 'success' | 'alert' = 'info') => {
    const id = 'toast-' + Date.now() + Math.random();
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const refreshNotifications = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const markAsRead = async (id: string) => {
    if (!token) return;
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    if (!token) return;
    try {
      await fetch('/api/notifications/mark-all-read', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!user) return;
    refreshNotifications();

    const s = io('/', {
      query: { userId: user.id, role: user.role }
    });

    s.on('notification', (newNotif: NotificationItem) => {
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(prev => prev + 1);
      setRealtimeVersion(v => v + 1);
      showToast(newNotif.title, newNotif.message, 'success');
    });

    s.on('appointment_created', (data: any) => {
      setRealtimeVersion(v => v + 1);
      showToast('New Appointment Request', `${data.patientName} requested ${data.date} at ${data.timeSlot}`, 'info');
    });

    s.on('appointment_status_changed', (data: any) => {
      setRealtimeVersion(v => v + 1);
      showToast(`Appointment ${data.status}`, `Status updated to ${data.status} for ${data.date} at ${data.timeSlot}`, 'success');
    });

    s.on('new_lab_request', (data: any) => {
      setRealtimeVersion(v => v + 1);
      showToast('New Lab Order Received', `${data.testName} ordered for ${data.patientName}`, 'info');
    });

    s.on('lab_status_updated', (data: any) => {
      setRealtimeVersion(v => v + 1);
      showToast('Diagnostic Report Ready', `Results uploaded for ${data.testName}`, 'success');
    });

    s.on('prescription_order_received', (data: any) => {
      setRealtimeVersion(v => v + 1);
      showToast('New Prescription Received', `Rx from ${data.doctorName} for ${data.patientName}`, 'info');
    });

    s.on('prescription_dispensed', (_data: any) => {
      setRealtimeVersion(v => v + 1);
      showToast('Medications Dispensed', 'Your prescription is ready for pickup/delivery.', 'success');
    });

    s.on('senior_review_requested', (data: any) => {
      setRealtimeVersion(v => v + 1);
      showToast('Treatment Plan For Review', `"${data.title}" submitted by ${data.doctorName}`, 'info');
    });

    s.on('treatment_plan_reviewed', (data: any) => {
      setRealtimeVersion(v => v + 1);
      showToast('Senior Review Completed', `Plan "${data.title}" status: ${data.status}`, 'info');
    });

    s.on('patient_vitals_updated', (data: any) => {
      setRealtimeVersion(v => v + 1);
      showToast('Patient Vitals Logged', `New vitals logged for ${data.patientName}`, 'info');
    });

    s.on('emergency_alert', (data: any) => {
      showToast(`🚨 ${data.title}`, data.details, 'alert');
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{
      socket,
      notifications,
      unreadCount,
      realtimeVersion,
      toasts,
      markAsRead,
      markAllAsRead,
      refreshNotifications,
      showToast,
      removeToast
    }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        {toasts.map(t => (
          <div
            key={t.id}
            onClick={() => removeToast(t.id)}
            className={`pointer-events-auto shadow-xl rounded-xl p-4 text-sm border flex items-start gap-3 transition-all cursor-pointer ${
              t.type === 'alert'
                ? 'bg-red-50 text-red-900 border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-800'
                : t.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800'
                : 'bg-white text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700'
            }`}
          >
            <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-teal-600" />
            <div>
              <div className="font-semibold text-xs tracking-wider uppercase opacity-80">{t.title}</div>
              <div className="mt-0.5 font-medium">{t.message}</div>
            </div>
          </div>
        ))}
      </div>
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within a SocketProvider');
  return context;
};
