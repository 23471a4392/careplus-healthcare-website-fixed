import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useSocket } from '../../context/SocketContext.tsx';
import { Activity, Bed, CheckCircle } from 'lucide-react';

export const NurseDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useSocket();
  const [vitalsModal, setVitalsModal] = useState(false);
  const [selectedInpatient, setSelectedInpatient] = useState('Vaseem Basha');
  const [pulse, setPulse] = useState('74');
  const [bp, setBp] = useState('120/80');
  const [spo2, setSpo2] = useState('98');

  const handleRecordVitals = () => {
    showToast('Vitals Recorded', `Logged Pulse: ${pulse} BPM, BP: ${bp} mmHg, SpO2: ${spo2}%`, 'success');
    setVitalsModal(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-slide-up">
      <div className="bg-emerald-900 text-white p-8 rounded-2xl shadow-sm">
        <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Inpatient Nursing Station</span>
        <h1 className="text-3xl font-extrabold mt-1">{user?.name}</h1>
        <p className="text-emerald-200 text-xs mt-1">Shift: Morning Duty · Ward 101-104</p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-white mb-4">
          Assigned Inpatients & Bed Roster
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Bed 101-B</span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">Vaseem Basha (Male · O+)</h4>
              <p className="text-xs text-slate-500">Diagnosis: Post-Procedural Cardiac Monitoring</p>
            </div>
            <button
              onClick={() => setVitalsModal(true)}
              className="px-3 py-2 bg-[#0c756e] text-white font-bold text-xs rounded-xl"
            >
              Record Vitals
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
