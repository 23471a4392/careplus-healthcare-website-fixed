import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useSocket } from '../../context/SocketContext.tsx';
import { Appointment } from '../../types/index.ts';
import { Modal } from '../../components/Modal.tsx';
import { Check, X, Pill, TestTube, Stethoscope, Users, Calendar, Clock, FileText } from 'lucide-react';

interface DoctorDashboardProps {
  activeTab?: string;
  onNavigateTab?: (tab: string) => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ activeTab = 'overview', onNavigateTab }) => {
  const { user, token } = useAuth();
  const { showToast, realtimeVersion } = useSocket();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [assignedPatients, setAssignedPatients] = useState<any[]>([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [labCatalog, setLabCatalog] = useState<any[]>([]);

  // Modals & Entities (Specific per click)
  const [isRxOpen, setIsRxOpen] = useState(false);
  const [isLabOpen, setIsLabOpen] = useState(false);
  const [isPlanOpen, setIsPlanOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedPatientProfile, setSelectedPatientProfile] = useState<any | null>(null);
  const [loadingPatientProfile, setLoadingPatientProfile] = useState(false);

  // Form states
  const [medName, setMedName] = useState('Atorvastatin 20mg');
  const [medDose, setMedDose] = useState('1 tablet daily after dinner');
  const [selectedLabTestId, setSelectedLabTestId] = useState('');
  const [planTitle, setPlanTitle] = useState('Cardiovascular Recovery Protocol');
  const [planDetails, setPlanDetails] = useState('Beta-blocker titration with bi-weekly ambulatory BP monitoring.');

  const fetchDoctorData = async () => {
    try {
      const [resApt, resLabs] = await Promise.all([
        fetch('/api/appointments', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch('/api/labs/catalog').then(r => r.json())
      ]);

      if (resApt.success) {
        setAppointments(resApt.appointments);
        // Extract distinct patients for Doctor
        const pats: any[] = [];
        const seen = new Set();
        resApt.appointments.forEach((a: any) => {
          if (!seen.has(a.patientId)) {
            seen.add(a.patientId);
            pats.push({
              id: a.patientId,
              name: a.patient,
              email: a.patientEmail,
              phone: a.patientPhone,
              lastVisit: a.date,
              mode: a.type,
              status: a.status
            });
          }
        });
        setAssignedPatients(pats);
      }

      if (resLabs.success && resLabs.tests.length > 0) {
        setLabCatalog(resLabs.tests);
        setSelectedLabTestId(resLabs.tests[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) fetchDoctorData();
  }, [token, realtimeVersion]);

  // View specific patient profile (Patient A vs Patient B)
  const handleOpenPatientProfile = async (patientId: string, fallbackName: string) => {
    setLoadingPatientProfile(true);
    setSelectedPatientProfile({ id: patientId, name: fallbackName, loading: true });
    try {
      const res = await fetch(`/api/clinical/patients/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSelectedPatientProfile(data.patient);
      } else {
        setSelectedPatientProfile({ id: patientId, name: fallbackName, bloodGroup: 'O+', gender: 'Male' });
      }
    } catch (err) {
      setSelectedPatientProfile({ id: patientId, name: fallbackName, bloodGroup: 'O+', gender: 'Male' });
    } finally {
      setLoadingPatientProfile(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Appointment ${status}`, `Updated to ${status}`, 'success');
        fetchDoctorData();
      }
    } catch (err: any) {
      showToast('Error', err.message, 'alert');
    }
  };

  const handleToggleAvailability = async () => {
    const next = !isAvailable;
    setIsAvailable(next);
    if (user?.doctorId) {
      await fetch(`/api/doctors/${user.doctorId}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isAvailable: next })
      });
    }
    showToast('Availability', next ? 'Available for consults' : 'Busy / In surgery', 'info');
  };

  const handleCreatePrescription = async () => {
    if (!selectedAppointment) return;
    try {
      const res = await fetch('/api/clinical/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          patientId: selectedAppointment.patientId,
          instructions: 'Take medications as directed.',
          medications: [{ name: medName, dosage: medDose, schedule: 'Daily' }]
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Prescription Sent', `Sent to ${selectedAppointment.patient} & Pharmacy.`, 'success');
        setIsRxOpen(false);
      }
    } catch (err: any) {
      showToast('Error', err.message, 'alert');
    }
  };

  const handleOrderLabTest = async () => {
    if (!selectedAppointment || !selectedLabTestId) return;
    try {
      const res = await fetch('/api/labs/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          testId: selectedLabTestId,
          patientId: selectedAppointment.patientId,
          sampleMode: 'Home Collection'
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Lab Ordered', `Diagnostic order sent to Lab for ${selectedAppointment.patient}.`, 'success');
        setIsLabOpen(false);
      }
    } catch (err: any) {
      showToast('Error', err.message, 'alert');
    }
  };

  const handleSubmitTreatmentPlan = async () => {
    if (!selectedAppointment) return;
    try {
      const res = await fetch('/api/clinical/treatment-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          patientId: selectedAppointment.patientId,
          title: planTitle,
          description: planDetails,
          requestSeniorReview: true
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Submitted', 'Sent to Senior Doctor for review.', 'success');
        setIsPlanOpen(false);
      }
    } catch (err: any) {
      showToast('Error', err.message, 'alert');
    }
  };

  const pendingRequests = appointments.filter(a => a.status === 'PENDING');
  const activeVisits = appointments.filter(a => a.status === 'CONFIRMED');

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Calm Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#d6ebe7] dark:border-slate-800">
        <div>
          <h1 className="text-xl font-semibold text-[#132e2b] dark:text-white">{user?.name}</h1>
          <p className="text-xs text-[#4d7872]">Department of {user?.department || 'Cardiology'} · Physician Schedule</p>
        </div>
        <button
          onClick={handleToggleAvailability}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
            isAvailable
              ? 'bg-white dark:bg-[#0c756e] border-[#d6ebe7] dark:border-slate-700 text-teal-800 dark:text-teal-300'
              : 'bg-white dark:bg-[#0c756e] border-[#d6ebe7] dark:border-slate-700 text-[#6b9690]'
          }`}
        >
          {isAvailable ? '● Available for Consultations' : '○ Unavailable'}
        </button>
      </div>

      {/* 1. APPOINTMENT REQUESTS (Shown on 'overview' or 'requests') */}
      {(activeTab === 'overview' || activeTab === 'requests') && (
        <div className="bg-white dark:bg-[#0c756e] p-5 rounded-xl border border-[#d6ebe7] dark:border-slate-800">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#234c47] dark:text-slate-300 mb-3">
            Appointment Requests ({pendingRequests.length})
          </h3>

          {pendingRequests.length === 0 ? (
            <p className="text-xs text-[#6b9690] py-3">No pending appointment requests.</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {pendingRequests.map((apt) => (
                <div key={apt.id} className="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-[#132e2b] dark:text-white">{apt.patient}</span>
                      <button
                        onClick={() => handleOpenPatientProfile(apt.patientId, apt.patient)}
                        className="text-[11px] text-[#0c756e] dark:text-teal-400 hover:underline font-medium"
                      >
                        (View Patient Profile)
                      </button>
                    </div>
                    <div className="text-xs text-[#4d7872] mt-0.5">{apt.date} at {apt.time} ({apt.type})</div>
                    {apt.reason && <p className="text-xs text-[#6b9690] mt-0.5 italic">"{apt.reason}"</p>}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateStatus(apt.id, 'CONFIRMED')}
                      className="px-3 py-1.5 bg-[#0c756e] hover:bg-[#095e58] text-white rounded-lg text-xs font-medium"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(apt.id, 'REJECTED')}
                      className="px-3 py-1.5 border border-[#d6ebe7] dark:border-slate-700 hover:bg-[#f8fbfb] text-[#36615b] rounded-lg text-xs font-medium"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. CONFIRMED VISITS (Shown on 'overview') */}
      {activeTab === 'overview' && (
        <div className="bg-white dark:bg-[#0c756e] p-5 rounded-xl border border-[#d6ebe7] dark:border-slate-800">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#234c47] dark:text-slate-300 mb-3">
            Confirmed Patient Visits ({activeVisits.length})
          </h3>

          {activeVisits.length === 0 ? (
            <p className="text-xs text-[#6b9690] py-3">No confirmed visits on the schedule.</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {activeVisits.map((apt) => (
                <div key={apt.id} className="py-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-[#132e2b] dark:text-white">{apt.patient}</span>
                      <button
                        onClick={() => handleOpenPatientProfile(apt.patientId, apt.patient)}
                        className="text-[11px] text-[#0c756e] dark:text-teal-400 hover:underline font-medium"
                      >
                        (Profile)
                      </button>
                    </div>
                    <div className="text-xs text-[#4d7872] mt-0.5">{apt.date} at {apt.time} ({apt.type})</div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <button
                      onClick={() => {
                        setSelectedAppointment(apt);
                        setIsRxOpen(true);
                      }}
                      className="px-2.5 py-1 bg-[#e6f5f2] hover:bg-[#d8efe9] dark:bg-slate-800 text-[#234c47] dark:text-slate-200 rounded-md font-medium"
                    >
                      Prescription
                    </button>

                    <button
                      onClick={() => {
                        setSelectedAppointment(apt);
                        setIsLabOpen(true);
                      }}
                      className="px-2.5 py-1 bg-[#e6f5f2] hover:bg-[#d8efe9] dark:bg-slate-800 text-[#234c47] dark:text-slate-200 rounded-md font-medium"
                    >
                      Order Lab
                    </button>

                    <button
                      onClick={() => {
                        setSelectedAppointment(apt);
                        setIsPlanOpen(true);
                      }}
                      className="px-2.5 py-1 bg-[#e6f5f2] hover:bg-[#d8efe9] dark:bg-slate-800 text-[#234c47] dark:text-slate-200 rounded-md font-medium"
                    >
                      Senior Review
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(apt.id, 'COMPLETED')}
                      className="px-2.5 py-1 text-[#4d7872] hover:text-[#1a3d39] font-medium"
                    >
                      Complete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. ASSIGNED PATIENTS TAB */}
      {activeTab === 'patients' && (
        <div className="bg-white dark:bg-[#0c756e] p-5 rounded-xl border border-[#d6ebe7] dark:border-slate-800">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#234c47] dark:text-slate-300 mb-3">
            Assigned Patients Directory ({assignedPatients.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {assignedPatients.map((p) => (
              <div key={p.id} className="p-4 rounded-xl border border-[#d6ebe7] dark:border-slate-800 bg-[#f8fbfb] dark:bg-slate-800/40 flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-sm text-[#132e2b] dark:text-white">{p.name}</h4>
                  <p className="text-xs text-[#4d7872]">{p.phone || p.email || 'Verified Patient'}</p>
                  <p className="text-[11px] text-[#6b9690] mt-1">Last consultation: {p.lastVisit}</p>
                </div>
                <button
                  onClick={() => handleOpenPatientProfile(p.id, p.name)}
                  className="px-3 py-1.5 bg-[#0c756e] hover:bg-[#095e58] text-white rounded-lg text-xs font-medium"
                >
                  View Profile
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Patient Profile Modal (Dynamic Patient A vs Patient B) */}
      <Modal
        isOpen={!!selectedPatientProfile}
        onClose={() => setSelectedPatientProfile(null)}
        title={`Patient Profile - ${selectedPatientProfile?.name}`}
      >
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-[#f8fbfb] dark:bg-slate-800 rounded-lg">
            <div className="font-medium text-[#132e2b] dark:text-white">{selectedPatientProfile?.name}</div>
            <div className="text-[#4d7872] mt-0.5">
              Demographics: {selectedPatientProfile?.gender || 'Male'} · Blood Group: {selectedPatientProfile?.bloodGroup || 'O+'}
            </div>
            {selectedPatientProfile?.phone && (
              <div className="text-[#6b9690] text-[11px] mt-0.5">Contact: {selectedPatientProfile?.phone}</div>
            )}
          </div>

          <div>
            <div className="text-[#4d7872] font-medium text-[11px]">Medical History & Records</div>
            {selectedPatientProfile?.medicalRecords && selectedPatientProfile.medicalRecords.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-1">
                {selectedPatientProfile.medicalRecords.map((r: any) => (
                  <div key={r.id} className="py-2">
                    <div className="font-medium text-[#1a3d39] dark:text-slate-200">{r.title} ({r.category})</div>
                    <p className="text-[#4d7872] mt-0.5 text-[11px]">{r.summary}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#36615b] dark:text-[#6b9690] mt-1 leading-relaxed">
                Essential Cardiovascular Monitoring. Normal resting ECG rhythm. No active contraindications.
              </p>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button onClick={() => setSelectedPatientProfile(null)} className="px-4 py-1.5 bg-[#0c756e] text-white rounded-lg font-medium">
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Prescription Modal */}
      <Modal isOpen={isRxOpen} onClose={() => setIsRxOpen(false)} title={`Prescription - ${selectedAppointment?.patient}`}>
        <div className="space-y-3 text-xs">
          <div>
            <label className="text-[#4d7872] font-medium">Medicine & Strength</label>
            <input value={medName} onChange={(e) => setMedName(e.target.value)} className="w-full p-2 rounded-lg border mt-1 font-medium" />
          </div>
          <div>
            <label className="text-[#4d7872] font-medium">Dosage & Instructions</label>
            <input value={medDose} onChange={(e) => setMedDose(e.target.value)} className="w-full p-2 rounded-lg border mt-1 font-medium" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setIsRxOpen(false)} className="px-3 py-1.5 text-[#4d7872]">Cancel</button>
            <button onClick={handleCreatePrescription} className="px-4 py-1.5 bg-[#0c756e] text-white rounded-lg font-medium">
              Send to Pharmacy
            </button>
          </div>
        </div>
      </Modal>

      {/* Lab Order Modal */}
      <Modal isOpen={isLabOpen} onClose={() => setIsLabOpen(false)} title={`Order Lab Test - ${selectedAppointment?.patient}`}>
        <div className="space-y-3 text-xs">
          <div>
            <label className="text-[#4d7872] font-medium">Select Diagnostic Test</label>
            <select
              value={selectedLabTestId}
              onChange={(e) => setSelectedLabTestId(e.target.value)}
              className="w-full p-2 rounded-lg border mt-1 font-medium"
            >
              {labCatalog.map((t) => (
                <option key={t.id} value={t.id}>{t.name} (₹{t.price})</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setIsLabOpen(false)} className="px-3 py-1.5 text-[#4d7872]">Cancel</button>
            <button onClick={handleOrderLabTest} className="px-4 py-1.5 bg-[#0c756e] text-white rounded-lg font-medium">
              Dispatch to Lab
            </button>
          </div>
        </div>
      </Modal>

      {/* Treatment Plan Modal */}
      <Modal isOpen={isPlanOpen} onClose={() => setIsPlanOpen(false)} title={`Treatment Plan - ${selectedAppointment?.patient}`}>
        <div className="space-y-3 text-xs">
          <div>
            <label className="text-[#4d7872] font-medium">Protocol Title</label>
            <input value={planTitle} onChange={(e) => setPlanTitle(e.target.value)} className="w-full p-2 rounded-lg border mt-1 font-medium" />
          </div>
          <div>
            <label className="text-[#4d7872] font-medium">Protocol Details</label>
            <textarea rows={3} value={planDetails} onChange={(e) => setPlanDetails(e.target.value)} className="w-full p-2 rounded-lg border mt-1 font-medium" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setIsPlanOpen(false)} className="px-3 py-1.5 text-[#4d7872]">Cancel</button>
            <button onClick={handleSubmitTreatmentPlan} className="px-4 py-1.5 bg-[#0c756e] text-white rounded-lg font-medium">
              Submit for Senior Review
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
