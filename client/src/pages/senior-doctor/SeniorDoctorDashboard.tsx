import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useSocket } from '../../context/SocketContext.tsx';

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
        body: JSON.stringify({ decision, notes: decision === 'APPROVED' ? 'Senior clinical approval granted.' : 'Please adjust medication schedule.' })
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          decision === 'APPROVED' ? 'Approved' : 'Changes Requested',
          `Review decision logged for "${title}".`,
          decision === 'APPROVED' ? 'success' : 'info'
        );
        fetchPlans();
      }
    } catch (err: any) {
      showToast('Error', err.message, 'alert');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">{user?.name}</h1>
        <p className="text-xs text-slate-500">Chief of Medicine · Senior Clinical Supervision</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
          Treatment Plans Pending Senior Review ({plans.filter(p => p.status === 'PENDING_APPROVAL').length})
        </h3>

        {plans.length === 0 ? (
          <p className="text-xs text-slate-400 py-3">No plans currently pending review.</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {plans.map((p) => (
              <div key={p.id} className="py-3.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-slate-900 dark:text-white">{p.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                      {p.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Submitted by {p.doctorName} for {p.patientName}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl">{p.description}</p>
                </div>

                {p.status === 'PENDING_APPROVAL' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReview(p.id, 'APPROVED', p.title)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReview(p.id, 'CHANGES_REQUESTED', p.title)}
                      className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-medium"
                    >
                      Request Changes
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
