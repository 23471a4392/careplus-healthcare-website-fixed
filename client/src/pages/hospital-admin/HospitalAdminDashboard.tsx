import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useSocket } from '../../context/SocketContext.tsx';
import { BarChart3, Bed, ShieldAlert, Users } from 'lucide-react';

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
        body: JSON.stringify({ title: 'TRAUMA CODE RED - MASS CASUALTY INTAKE', severity: 'CRITICAL' })
      });
      const data = await res.json();
      if (data.success) {
        showToast('🚨 Critical Emergency Alert Dispatched', 'All on-duty clinicians and triage teams notified.', 'alert');
      }
    } catch (err: any) {
      showToast('Error', err.message, 'alert');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-slide-up">
      <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hospital Operations</span>
          <h1 className="text-3xl font-extrabold mt-1">{user?.name}</h1>
          <p className="text-slate-400 text-xs mt-1">CarePlus Multi-Specialty Hospital · Executive Management</p>
        </div>
        <button
          onClick={handleBroadcastEmergency}
          className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Broadcast Emergency Alert</span>
        </button>
      </div>

      {/* Hospital Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
          <span className="text-xs font-bold text-slate-400">Total Inpatients</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{stats?.patients || 1}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
          <span className="text-xs font-bold text-slate-400">On-Duty Doctors</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{stats?.doctors || 6}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
          <span className="text-xs font-bold text-slate-400">Bed Occupancy</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{stats?.occupiedBeds || 1} / {stats?.totalBeds || 4}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
          <span className="text-xs font-bold text-slate-400">Total Appointments</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{stats?.appointments || 4}</div>
        </div>
      </div>

      {/* Bed Grid */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-white mb-4">
          Live Inpatient Bed Availability
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {beds.map((b) => (
            <div
              key={b.id}
              className={`p-4 rounded-xl border ${
                b.status === 'AVAILABLE'
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
              }`}
            >
              <span className="text-xs font-bold">Room {b.room.roomNumber} · Bed {b.bedNumber}</span>
              <div className="text-sm font-extrabold mt-1">{b.status}</div>
              <div className="text-[10px] mt-1 opacity-75">{b.room.department.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
