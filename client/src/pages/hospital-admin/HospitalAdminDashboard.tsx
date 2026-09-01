import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useSocket } from '../../context/SocketContext.tsx';
import { BarChart3, Bed, ShieldAlert } from 'lucide-react';

export const HospitalAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useSocket();

  const handleBroadcastEmergency = () => {
    fetch('/api/hospital/emergency', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'TRAUMA CODE RED', severity: 'CRITICAL' })
    });
    showToast('🚨 Emergency Code Dispatched', 'All on-duty clinicians and triage teams alerted.', 'alert');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-slide-up">
      <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-sm flex justify-between items-center">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hospital Administration</span>
          <h1 className="text-3xl font-extrabold mt-1">{user?.name}</h1>
          <p className="text-slate-400 text-xs mt-1">CarePlus Multi-Specialty Hospital · Executive Operations</p>
        </div>
        <button
          onClick={handleBroadcastEmergency}
          className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Broadcast Emergency Alert</span>
        </button>
      </div>

      {/* Bed Grid */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-white mb-4">
          Live Inpatient Bed Status
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Room 101 · Bed A</span>
            <div className="text-sm font-extrabold text-emerald-900 dark:text-emerald-100 mt-1">AVAILABLE</div>
            <div className="text-[10px] text-emerald-600 mt-1">Clean & Prepped</div>
          </div>

          <div className="p-4 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-800">
            <span className="text-xs font-bold text-red-800 dark:text-red-300">Room 101 · Bed B</span>
            <div className="text-sm font-extrabold text-red-900 dark:text-red-100 mt-1">OCCUPIED</div>
            <div className="text-[10px] text-red-600 mt-1">Vaseem Basha</div>
          </div>
        </div>
      </div>
    </div>
  );
};
