import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useSocket } from '../../context/SocketContext.tsx';
import { Modal } from '../../components/Modal.tsx';
import { Check, AlertTriangle, Stethoscope, Users, Calendar, FileText } from 'lucide-react';

interface SeniorDoctorDashboardProps {
  activeTab?: string;
  onNavigateTab?: (tab: string) => void;
}

export const SeniorDoctorDashboard: React.FC<SeniorDoctorDashboardProps> = ({ activeTab = 'overview', onNavigateTab }) => {
  const { user, token } = useAuth();
  const { showToast, realtimeVersion } = useSocket();
  const [plans, setPlans] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);

  const fetchSeniorData = async () => {
    if (!token) return;
    try {
      const [resPlans, resApt] = await Promise.all([
        fetch('/api/clinical/treatment-plans', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch('/api/appointments', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
      ]);
      if (resPlans.success) setPlans(resPlans.plans);
      if (resApt.success) {
        setAppointments(resApt.appointments);
        const pats: any[] = [];
        const seen = new Set();
        resApt.appointments.forEach((a: any) => {
          if (!seen.has(a.patientId)) {
            seen.add(a.patientId);
            pats.push({ id: a.patientId, name: a.patient, date: a.date, mode: a.type });
          }
        });
        setPatients(pats);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSeniorData();
  }, [token, realtimeVersion]);

  const handleReview = async (planId: string, decision: 'APPROVED' | 'CHANGES_REQUESTED', title: string) => {
    try {
      const res = await fetch(`/api/clinical/treatment-plans/${planId}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          decision,
          notes: decision === 'APPROVED' ? 'Senior clinical approval granted.' : 'Please adjust medication schedule.'
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          decision === 'APPROVED' ? 'Approved' : 'Changes Requested',
          `Review decision logged for "${title}". Attending physician notified.`,
          decision === 'APPROVED' ? 'success' : 'info'
        );
        fetchSeniorData();
      }
    } catch (err: any) {
      showToast('Error', err.message, 'alert');
    }
  };

  const currentTab = (activeTab === 'dashboard' || !activeTab) ? 'overview' : activeTab;
  const pendingPlans = plans.filter(p => p.status === 'PENDING_APPROVAL');

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-[#d6ebe7] dark:border-slate-800 flex justify-between items-center">
        <div>
          <span className="text-xs text-[#0c756e] font-semibold uppercase tracking-wider">Senior Clinical Leadership</span>
          <h1 className="text-xl font-bold text-[#132e2b] dark:text-white mt-0.5">{user?.name}</h1>
          <p className="text-xs text-[#4d7872]">Chief of Medicine & Critical Care Protocols</p>
        </div>
      </div>

      {/* SCHEDULE / OVERVIEW */}
      {(currentTab === 'overview' || currentTab === 'treatment_plans') && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-[#d6ebe7] dark:border-slate-800">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h3 className="font-semibold text-sm text-[#132e2b] dark:text-white">Treatment Plans Pending Senior Review</h3>
              <p className="text-xs text-[#4d7872]">Complex clinical pathways requiring executive physician sign-off.</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#e6f5f2] text-[#0c756e] border border-[#cbe7e2]">
              {pendingPlans.length} Pending
            </span>
          </div>

          {plans.length === 0 ? (
            <p className="text-xs text-[#6b9690] py-6 text-center">No treatment plans submitted for review.</p>
          ) : (
            <div className="divide-y divide-[#eef6f5]">
              {plans.map((p) => (
                <div key={p.id} className="py-3.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        p.status === 'APPROVED'
                          ? 'bg-[#e6f5f2] text-[#0c756e] border-[#cbe7e2]'
                          : p.status === 'CHANGES_REQUESTED'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-blue-50 text-blue-800 border-blue-200'
                      }`}>
                        {p.status}
                      </span>
                      <h4 className="font-bold text-sm text-[#132e2b]">{p.title}</h4>
                    </div>
                    <p className="text-xs text-[#4d7872] mt-0.5">Submitted by <strong>{p.doctorName}</strong> for Patient <strong>{p.patientName}</strong></p>
                    <p className="text-xs text-[#36615b] mt-1 max-w-xl leading-relaxed">{p.description}</p>
                    {p.reviewNotes && (
                      <p className="text-xs text-[#0c756e] mt-1 font-semibold italic">Review Notes: {p.reviewNotes}</p>
                    )}
                  </div>

                  {p.status === 'PENDING_APPROVAL' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReview(p.id, 'APPROVED', p.title)}
                        className="px-3.5 py-1.5 bg-[#0c756e] hover:bg-[#095e58] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleReview(p.id, 'CHANGES_REQUESTED', p.title)}
                        className="px-3.5 py-1.5 border border-[#d6ebe7] hover:bg-[#f8fbfb] text-[#36615b] rounded-lg text-xs font-semibold flex items-center gap-1.5"
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
      )}

      {/* REQUESTS */}
      {currentTab === 'requests' && (
        <div className="bg-white p-5 rounded-xl border border-[#d6ebe7]">
          <h3 className="font-semibold text-sm text-[#132e2b] mb-3">Consultation Schedule Requests</h3>
          <div className="divide-y divide-[#eef6f5]">
            {appointments.map((a) => (
              <div key={a.id} className="py-3 flex justify-between items-center">
                <div>
                  <div className="font-bold text-sm text-[#132e2b]">{a.patient}</div>
                  <div className="text-xs text-[#4d7872]">{a.date} at {a.time} ({a.type})</div>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#e6f5f2] text-[#0c756e]">{a.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PATIENTS */}
      {currentTab === 'patients' && (
        <div className="bg-white p-5 rounded-xl border border-[#d6ebe7]">
          <h3 className="font-semibold text-sm text-[#132e2b] mb-3">Senior Clinical Patients Directory</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {patients.map((p) => (
              <div key={p.id} className="p-3 bg-[#f8fbfb] rounded-lg border border-[#eef6f5]">
                <h4 className="font-bold text-sm text-[#132e2b]">{p.name}</h4>
                <p className="text-xs text-[#4d7872] mt-0.5">Last consultation: {p.date} ({p.mode})</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PROFILE */}
      {currentTab === 'profile' && (
        <div className="bg-white p-5 rounded-xl border border-[#d6ebe7] max-w-xl">
          <h3 className="font-bold text-base text-[#132e2b]">{user?.name}</h3>
          <p className="text-xs text-[#0c756e] font-semibold">Chief of Medicine & Senior Clinical Supervisor</p>
          <p className="text-xs text-[#4d7872] mt-2 leading-relaxed">
            Leading multi-disciplinary clinical reviews, critical care guidelines, and clinical quality assurance.
          </p>
        </div>
      )}
    </div>
  );
};
