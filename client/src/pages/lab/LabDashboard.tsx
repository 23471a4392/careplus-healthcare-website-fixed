import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useSocket } from '../../context/SocketContext.tsx';
import { TestTube, CheckCircle } from 'lucide-react';

export const LabDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useSocket();

  const handleCompleteTest = (test: string) => {
    showToast('Lab Report Ready', `Completed analysis for ${test}. Notifications sent to Doctor and Patient.`, 'success');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-slide-up">
      <div className="bg-amber-900 text-white p-8 rounded-2xl shadow-sm">
        <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Clinical Pathology Lab</span>
        <h1 className="text-3xl font-extrabold mt-1">{user?.name}</h1>
        <p className="text-amber-200 text-xs mt-1">Diagnostic Specimen Processing Unit</p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-white mb-4">
          Active Diagnostic Orders Queue
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          <div className="py-4 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">SAMPLE COLLECTED</span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">Comprehensive Lipid Profile</h4>
              <p className="text-xs text-slate-500">Patient: <strong>Vaseem Basha</strong> · Ordered by: <strong>Dr. Arjun Rao</strong></p>
            </div>
            <button
              onClick={() => handleCompleteTest('Lipid Profile')}
              className="px-4 py-2 bg-[#0c756e] text-white font-bold text-xs rounded-xl shadow-sm"
            >
              Upload Results & Notify
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
