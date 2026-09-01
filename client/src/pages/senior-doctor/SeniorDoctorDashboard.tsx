import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useSocket } from '../../context/SocketContext.tsx';
import { Modal } from '../../components/Modal.tsx';
import { Check, AlertTriangle, ShieldCheck, Users, Activity, FileText, Stethoscope } from 'lucide-react';

interface SeniorDoctorDashboardProps {
  activeTab?: string;
  onNavigateTab?: (tab: string) => void;
}

export const SeniorDoctorDashboard: React.FC<SeniorDoctorDashboardProps> = ({ activeTab = 'overview', onNavigateTab }) => {
  const { user, token } = useAuth();
  const { showToast, realtimeVersion } = useSocket();

  const [plans, setPlans] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctorsList, setDoctorsList] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);

  const fetchSeniorData = async () => {
    if (!token) return;
    try {
      const [resPlans, resApt, resDocs] = await Promise.all([
        fetch('/api/clinical/treatment-plans', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch('/api/appointments', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch('/api/doctors').then(r => r.json())
      ]);

      if (resPlans.success) setPlans(resPlans.plans);
      if (resDocs.success) setDoctorsList(resDocs.doctors);
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
      console.error('Error fetching senior doctor data:', err);
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
          notes: decision === 'APPROVED' ? 'Senior clinical sign-off granted by Chief of Medicine.' : 'Please adjust medication titration schedule.'
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          decision === 'APPROVED' ? 'Approved' : 'Changes Requested',
          `Review decision logged for "${title}". Attending physician notified in real-time.`,
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
      <div className="bg-white p-5 rounded-2xl border border-[#d6ebe7] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-[#0c756e] font-semibold uppercase tracking-wider">Clinical Governance & Supervision</span>
          <h1 className="text-xl font-bold text-[#132e2b] mt-0.5">{user?.name}</h1>
          <p className="text-xs text-[#4d7872]">Chief of Medicine · Medical Board Review Desk</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#e6f5f2] text-[#0c756e] border border-[#cbe7e2]">
            {pendingPlans.length} Cases Requiring Senior Decision
          </span>
        </div>
      </div>

      {/* 1. OVERVIEW & TREATMENT PLAN REVIEWS */}
      {currentTab === 'overview' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-[#d6ebe7] shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="font-bold text-sm text-[#132e2b]">Clinical Cases & Protocols Awaiting Senior Review</h3>
                <p className="text-xs text-[#4d7872]">Attending physicians have submitted these complex pathways for executive sign-off.</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                {pendingPlans.length} Pending
              </span>
            </div>

            {plans.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No cases currently awaiting clinical review.</p>
            ) : (
              <div className="divide-y divide-[#eef6f5]">
                {plans.map((p) => (
                  <div key={p.id} className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
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
                      <p className="text-xs text-[#4d7872]">
                        Patient: <strong>{p.patientName}</strong> · Submitting Attending Physician: <strong>{p.doctorName}</strong>
                      </p>
                      <p className="text-xs text-[#36615b] mt-1 max-w-2xl leading-relaxed">{p.description}</p>
                      {p.reviewNotes && (
                        <p className="text-xs text-[#0c756e] font-semibold italic mt-1">Reviewer Sign-off: {p.reviewNotes}</p>
                      )}
                    </div>

                    {p.status === 'PENDING_APPROVAL' && (
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleReview(p.id, 'APPROVED', p.title)}
                          className="px-3.5 py-1.5 bg-[#0c756e] hover:bg-[#095e58] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve Protocol</span>
                        </button>
                        <button
                          onClick={() => handleReview(p.id, 'CHANGES_REQUESTED', p.title)}
                          className="px-3.5 py-1.5 border border-[#d6ebe7] hover:bg-amber-50 text-amber-800 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
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
      )}

      {/* 2. CRITICAL CASES */}
      {currentTab === 'critical_cases' && (
        <div className="bg-white p-5 rounded-2xl border border-[#d6ebe7] shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-sm text-[#132e2b]">Critical Inpatient ICU & High-Risk Case Roster</h3>
            <p className="text-xs text-[#4d7872]">Executive clinical oversight for intensive care unit admissions.</p>
          </div>

          <div className="divide-y divide-[#eef6f5]">
            {patients.map((p) => (
              <div key={p.id} className="py-3 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-sm text-[#132e2b]">{p.name}</h4>
                  <p className="text-xs text-[#4d7872]">Admission Date: {p.date} · Care Protocol: Multi-Disciplinary Telemetry</p>
                </div>
                <span className="text-xs font-bold text-[#0c756e] bg-[#e6f5f2] px-2.5 py-1 rounded-lg border border-[#cbe7e2]">
                  Under Senior Supervision
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. ATTENDING DOCTORS DIRECTORY */}
      {currentTab === 'doctors_directory' && (
        <div className="bg-white p-5 rounded-2xl border border-[#d6ebe7] shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-sm text-[#132e2b]">Hospital Attending Physicians & Department Roster</h3>
            <p className="text-xs text-[#4d7872]">Active medical staff under clinical supervision of the Chief of Medicine.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {doctorsList.map((doc) => (
              <div key={doc.id} className="p-4 bg-[#f8fbfb] rounded-xl border border-[#eef6f5] flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-sm text-[#132e2b]">{doc.name}</h4>
                  <p className="text-xs text-[#0c756e] font-semibold">{doc.specialty}</p>
                  <p className="text-[11px] text-slate-400">{doc.experienceYears} Years Exp · Fee: ₹{doc.consultationFee}</p>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${doc.isAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {doc.isAvailable ? '● On Duty' : '○ Off Duty'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. PATIENT CHARTS */}
      {currentTab === 'patients' && (
        <div className="bg-white p-5 rounded-2xl border border-[#d6ebe7] shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-sm text-[#132e2b]">Supervisory Patient Medical Records</h3>
            <p className="text-xs text-[#4d7872]">Access longitudinal patient records for clinical quality assurance.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {patients.map((p) => (
              <div key={p.id} className="p-4 bg-[#f8fbfb] rounded-xl border border-[#eef6f5]">
                <h4 className="font-bold text-sm text-[#132e2b]">{p.name}</h4>
                <p className="text-xs text-[#4d7872] mt-0.5">Last consultation visit: {p.date}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. PROFILE */}
      {currentTab === 'profile' && (
        <div className="bg-white p-6 rounded-2xl border border-[#d6ebe7] shadow-sm max-w-xl space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-[#eef6f5]">
            <div className="w-14 h-14 rounded-2xl bg-[#e6f5f2] border border-[#0c756e] text-[#0c756e] flex items-center justify-center font-black text-lg">
              KV
            </div>
            <div>
              <h3 className="font-bold text-base text-[#132e2b]">{user?.name}</h3>
              <p className="text-xs font-semibold text-[#0c756e]">Chief of Medicine & Senior Clinical Supervisor</p>
              <p className="text-[11px] text-slate-400">CarePlus Multi-Specialty Hospital</p>
            </div>
          </div>
          <div className="text-xs text-[#4d7872] leading-relaxed">
            Leading tertiary medical governance, critical care guidelines, intensive care supervision, and multi-disciplinary clinical decision reviews across all hospital departments.
          </div>
        </div>
      )}
    </div>
  );
};
