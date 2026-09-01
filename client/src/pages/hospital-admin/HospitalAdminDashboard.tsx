import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useSocket } from '../../context/SocketContext.tsx';

export const HospitalAdminDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const { showToast } = useSocket();
  const [stats, setStats] = useState<any | null>(null);
  const [beds, setBeds] = useState<any[]>([]);

  const fetchAdminData = async () => {
    try {
      const [resStats, resBeds] = await Promise.all([
        fetch('/api/hospital/overview', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch('/api/hospital/beds', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
      ]);
      if (resStats.success) setStats(resStats.stats);
      if (resBeds.success) setBeds(resBeds.beds);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) fetchAdminData();
  }, [token]);

  const handleBroadcastEmergency = async () => {
    try {
      const res = await fetch('/api/hospital/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: 'Trauma Team Alert', severity: 'CRITICAL' })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Alert Dispatched', 'Clinical trauma teams notified.', 'alert');
      }
    } catch (err: any) {
      showToast('Error', err.message, 'alert');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">{user?.name}</h1>
          <p className="text-xs text-slate-500">Hospital Administration & Operations</p>
        </div>
        <button
          onClick={handleBroadcastEmergency}
          className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium"
        >
          Broadcast Emergency
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-400">Inpatients</span>
          <div className="text-xl font-semibold text-slate-900 dark:text-white mt-1">{stats?.patients || 1}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-400">On-Duty Doctors</span>
          <div className="text-xl font-semibold text-slate-900 dark:text-white mt-1">{stats?.doctors || 6}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-400">Bed Occupancy</span>
          <div className="text-xl font-semibold text-slate-900 dark:text-white mt-1">{stats?.occupiedBeds || 1} / {stats?.totalBeds || 4}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-400">Total Visits</span>
          <div className="text-xl font-semibold text-slate-900 dark:text-white mt-1">{stats?.appointments || 4}</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
          Bed Availability
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {beds.map((b) => (
            <div key={b.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400">Room {b.room.roomNumber} · Bed {b.bedNumber}</span>
              <div className="font-medium text-xs text-slate-900 dark:text-white mt-0.5">{b.status}</div>
              <div className="text-[10px] text-slate-400 mt-1">{b.room.department.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
