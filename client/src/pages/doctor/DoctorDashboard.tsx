import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useSocket } from '../../context/SocketContext.tsx';
import { Appointment } from '../../types/index.ts';
import { Modal } from '../../components/Modal.tsx';
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Pill,
  TestTube,
  Stethoscope,
  Plus,
  Send,
  User,
  Users,
  Eye,
  FileText
} from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const { showToast } = useSocket();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [labCatalog, setLabCatalog] = useState<any[]>([]);
  const [assignedPatients, setAssignedPatients] = useState<any[]>([]);

  // Modals & Target Entities (Patient A vs Patient B, Appointment A vs B)
  const [isRxOpen, setIsRxOpen] = useState(false);
  const [isLabOpen, setIsLabOpen] = useState(false);
  const [isPlanOpen, setIsPlanOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedPatientProfile, setSelectedPatientProfile] = useState<any | null>(null);

  // Form states
  const [medName, setMedName] = useState('Atorvastatin 20mg');
  const [medDose, setMedDose] = useState('1 tablet daily after dinner');
  const [selectedLabTestId, setSelectedLabTestId] = useState('');
  const [planTitle, setPlanTitle] = useState('Comprehensive Cardiovascular Recovery Pathway');
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
  }, [token]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Appointment ${status}`, `Appointment status updated to ${status}`, 'success');
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
    showToast('Availability Updated', next ? 'Marked as Available for Consultations' : 'Marked as Busy / In Surgery', 'info');
  };

  const handleCreatePrescription = async () => {
    if (!selectedAppointment) return;
    try {
      const res = await fetch('/api/clinical/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          patientId: selectedAppointment.patientId,
          instructions: 'Take medications with water after meals.',
          medications: [{ name: medName, dosage: medDose, schedule: 'Daily' }]
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Prescription Dispatched', `Prescription sent to ${selectedAppointment.patient} & Pharmacy.`, 'success');
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
        showToast('Lab Order Dispatched', `Diagnostic request sent to Clinical Pathology Lab for ${selectedAppointment.patient}.`, 'success');
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
        showToast('Treatment Plan Submitted', 'Sent to Senior Doctor (Dr. Verma) for review.', 'success');
        setIsPlanOpen(false);
      }
    } catch (err: any) {
      showToast('Error', err.message, 'alert');
    }
  };

  const pendingRequests = appointments.filter(a => a.status === 'PENDING');
  const activeVisits = appointments.filter(a => a.status === 'CONFIRMED');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">Physician Clinical Portal</span>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{user?.name}</h1>
          <p className="text-xs text-slate-400">Department: {user?.department || 'Cardiology'} · License Verified</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500">Status:</span>
          <button
            onClick={handleToggleAvailability}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
              isAvailable
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-red-50 text-red-700 border border-red-300 dark:bg-red-950 dark:text-red-300'
            }`}
          >
            {isAvailable ? '● Available for Consultations' : '○ Unavailable / In Surgery'}
          </button>
        </div>
      </div>

      {/* Pending Appointment Requests (Patient A vs Patient B) */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
            <span>Incoming Appointment Requests</span>
            {pendingRequests.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                {pendingRequests.length} Pending
              </span>
            )}
          </h3>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No pending appointment requests. Real-time patient bookings will appear here instantly.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {pendingRequests.map((apt) => (
              <div key={apt.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{apt.patient}</h4>
                    <button
                      onClick={() => setSelectedPatientProfile({ id: apt.patientId, name: apt.patient, status: apt.status })}
                      className="text-[10px] font-bold text-teal-600 hover:underline"
                    >
                      (View Patient Profile)
                    </button>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span>📅 {apt.date}</span>
                    <span>⏰ {apt.time}</span>
                    <span>Format: {apt.type}</span>
                  </div>
                  {apt.reason && <p className="text-xs text-slate-400 mt-1 italic">"{apt.reason}"</p>}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateStatus(apt.id, 'CONFIRMED')}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Accept</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(apt.id, 'REJECTED')}
                    className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmed Patient Consultations & Clinical Orders */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-white mb-4">
          Confirmed Patient Visits & Clinical Actions
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {activeVisits.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No confirmed appointments on the roster.</div>
          ) : (
            activeVisits.map((apt) => (
              <div key={apt.id} className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{apt.patient}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">CONFIRMED</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Date: {apt.date} · Time: {apt.time} · Mode: {apt.type}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedAppointment(apt);
                      setIsRxOpen(true);
                    }}
                    className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
                  >
                    <Pill className="w-3.5 h-3.5" />
                    <span>Prescription</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedAppointment(apt);
                      setIsLabOpen(true);
                    }}
                    className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
                  >
                    <TestTube className="w-3.5 h-3.5" />
                    <span>Order Lab</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedAppointment(apt);
                      setIsPlanOpen(true);
                    }}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>Senior Review</span>
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(apt.id, 'COMPLETED')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                  >
                    ✓ Complete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Patient Profile Modal (Patient A vs Patient B) */}
      <Modal
        isOpen={!!selectedPatientProfile}
        onClose={() => setSelectedPatientProfile(null)}
        title={`Patient Profile - ${selectedPatientProfile?.name}`}
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">{selectedPatientProfile?.name}</h4>
            <p className="text-slate-400 mt-0.5">Demographics: Male · Blood Group O+ · Contact Verified</p>
          </div>
          <div>
            <h5 className="font-bold text-slate-700 dark:text-slate-300">Clinical History</h5>
            <p className="text-slate-500 mt-1 leading-relaxed">
              Essential Hypertension (controlled on statin/ACE inhibitor therapy). Normal ECG rhythm. No active hospital admissions.
            </p>
          </div>
          <div className="flex justify-end pt-3">
            <button onClick={() => setSelectedPatientProfile(null)} className="px-4 py-2 font-bold bg-[#0c756e] text-white rounded-xl">
              Done
            </button>
          </div>
        </div>
      </Modal>

      {/* Prescription Modal */}
      <Modal isOpen={isRxOpen} onClose={() => setIsRxOpen(false)} title={`Issue Prescription - ${selectedAppointment?.patient}`}>
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-600">Medicine & Strength</label>
            <input
              value={medName}
              onChange={(e) => setMedName(e.target.value)}
              className="w-full p-2.5 rounded-xl border mt-1 font-semibold"
            />
          </div>
          <div>
            <label className="font-bold text-slate-600">Dosage Instructions</label>
            <input
              value={medDose}
              onChange={(e) => setMedDose(e.target.value)}
              className="w-full p-2.5 rounded-xl border mt-1 font-semibold"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button onClick={() => setIsRxOpen(false)} className="px-4 py-2 text-slate-400 font-bold">Cancel</button>
            <button onClick={handleCreatePrescription} className="px-4 py-2 bg-[#0c756e] text-white rounded-xl font-bold">
              Dispatch to Pharmacy
            </button>
          </div>
        </div>
      </Modal>

      {/* Order Lab Modal */}
      <Modal isOpen={isLabOpen} onClose={() => setIsLabOpen(false)} title={`Order Diagnostic Test - ${selectedAppointment?.patient}`}>
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-600">Select Diagnostic Test</label>
            <select
              value={selectedLabTestId}
              onChange={(e) => setSelectedLabTestId(e.target.value)}
              className="w-full p-2.5 rounded-xl border mt-1 font-semibold"
            >
              {labCatalog.map((t) => (
                <option key={t.id} value={t.id}>{t.name} (₹{t.price})</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button onClick={() => setIsLabOpen(false)} className="px-4 py-2 text-slate-400 font-bold">Cancel</button>
            <button onClick={handleOrderLabTest} className="px-4 py-2 bg-[#0c756e] text-white rounded-xl font-bold">
              Dispatch to Lab
            </button>
          </div>
        </div>
      </Modal>

      {/* Treatment Plan Modal */}
      <Modal isOpen={isPlanOpen} onClose={() => setIsPlanOpen(false)} title={`Treatment Plan - ${selectedAppointment?.patient}`}>
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-600">Plan Title</label>
            <input
              value={planTitle}
              onChange={(e) => setPlanTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl border mt-1 font-semibold"
            />
          </div>
          <div>
            <label className="font-bold text-slate-600">Protocol Details</label>
            <textarea
              rows={3}
              value={planDetails}
              onChange={(e) => setPlanDetails(e.target.value)}
              className="w-full p-2.5 rounded-xl border mt-1 font-semibold"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button onClick={() => setIsPlanOpen(false)} className="px-4 py-2 text-slate-400 font-bold">Cancel</button>
            <button onClick={handleSubmitTreatmentPlan} className="px-4 py-2 bg-indigo-700 text-white rounded-xl font-bold">
              Send to Senior Doctor
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
