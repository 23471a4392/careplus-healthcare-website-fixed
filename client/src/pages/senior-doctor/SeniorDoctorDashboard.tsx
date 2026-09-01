import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useSocket } from '../../context/SocketContext.tsx';
import { Check, AlertTriangle, Stethoscope, Users } from 'lucide-react';

export const SeniorDoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useSocket();

  const handleApprove = (title: string) => {
    showToast('Treatment Plan Approved', `Approved "${title}" with senior clinical sign-off.`, 'success');
  };

  const handleRequestChanges = (title: string) => {
    showToast('Changes Requested', `Returned "${title}" to attending doctor for protocol adjustment.`, 'info');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-slide-up">
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-8 rounded-2xl shadow-sm">
        <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Senior Clinical Leadership</span>
        <h1 className="text-3xl font-extrabold mt-1">{user?.name}</h1>
        <p className="text-indigo-200 text-xs mt-1">Supervising Department of Internal Medicine & Critical Care</p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-white mb-4">
          Pending Clinical Treatment Plans Awaiting Senior Review
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          <div className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">PENDING SENIOR REVIEW</span>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mt-1">
                Post-Myocardial Infarction Beta-Blocker & Rehabilitation Pathway
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">Submitted by: <strong>Dr. Arjun Rao</strong> for Patient <strong>Vaseem Basha</strong></p>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Dual antiplatelet therapy combined with titrated ACE inhibitors and bi-weekly cardiac telemetry monitoring.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleApprove('Cardiac Rehab Pathway')}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Approve</span>
              </button>
              <button
                onClick={() => handleRequestChanges('Cardiac Rehab Pathway')}
                className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Request Changes</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
