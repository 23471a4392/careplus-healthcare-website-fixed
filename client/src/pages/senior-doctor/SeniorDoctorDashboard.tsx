import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useSocket } from '../../context/SocketContext.tsx';
import { Check, AlertTriangle, Stethoscope } from 'lucide-react';

export const SeniorDoctorDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const { showToast } = useSocket();
  const [plans, setPlans] = useState<any[]>([]);

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/clinical/treatment-plans', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setPlans(data.plans);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) fetchPlans();
  }, [token]);

  const handleReview = async (planId: string, decision: 'APPROVED' | 'CHANGES_REQUESTED', title: string) => {
    try {
      const res = await fetch(`/api/clinical/treatment-plans/${planId}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ decision, notes: decision === 'APPROVED' ? 'Senior clinical approval granted.' : 'Please adjust medication titration schedule.' })
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          decision === 'APPROVED' ? 'Treatment Approved' : 'Changes Requested',
          `Senior review decision logged for "${title}". Attending physician notified in real-time.`,
          decision === 'APPROVED' ? 'success' : 'info'
        );
        fetchPlans();
      }
    } catch (err: any) {
      showToast('Error', err.message, 'alert');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-slide-up">
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-8 rounded-2xl shadow-sm">
        <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Senior Clinical Leadership</span>
        <h1 className="text-3xl font-extrabold mt-1">{user?.name}</h1>
        <p className="text-indigo-200 text-xs mt-1">Supervising Chief of Medicine & Critical Care Protocols</p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-white mb-4">
          Clinical Treatment Plans Requiring Senior Review
        </h3>

        {plans.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No treatment plans pending review at this moment.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {plans.map((p) => (
              <div key={p.id} className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    p.status === 'APPROVED'
                      ? 'bg-emerald-50 text-emerald-700'
                      : p.status === 'CHANGES_REQUESTED'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-indigo-50 text-indigo-700'
                  }`}>
                    {p.status}
                  </span>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mt-1">{p.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Submitted by: <strong>{p.doctorName}</strong> for Patient <strong>{p.patientName}</strong></p>
                  <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">{p.description}</p>
                  {p.reviewNotes && <p className="text-xs text-indigo-600 mt-1 font-semibold italic">Review Notes: {p.reviewNotes}</p>}
                </div>

                {p.status === 'PENDING_APPROVAL' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReview(p.id, 'APPROVED', p.title)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleReview(p.id, 'CHANGES_REQUESTED', p.title)}
                      className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Request Changes</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
