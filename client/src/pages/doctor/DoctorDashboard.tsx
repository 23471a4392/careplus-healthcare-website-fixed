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
  User
} from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const { showToast } = useSocket();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isAvailable, setIsAvailable] = useState(true);

  // Modals
  const [isRxOpen, setIsRxOpen] = useState(false);
  const [isLabOpen, setIsLabOpen] = useState(false);
  const [isPlanOpen, setIsPlanOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Form states
  const [medName, setMedName] = useState('Atorvastatin 20mg');
  const [medDose, setMedDose] = useState('1 tablet daily after dinner');
  const [labTestId, setLabTestId] = useState('CBC-01');
  const [planTitle, setPlanTitle] = useState('Hypertension Lifestyle & Statin Regimen');
  const [planDetails, setPlanDetails] = useState('Cardiovascular lipid reduction program with 60-day review.');

  const fetchDoctorAppointments = async () => {
    try {
      const res = await fetch('/api/appointments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAppointments(data.appointments);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) fetchDoctorAppointments();
  }, [token]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Appointment ${status}`, `Appointment status updated to ${status}`, 'success');
        fetchDoctorAppointments();
      }
    } catch (err: any) {
      showToast('Error', err.message, 'alert');
    }
  };

  const handleCreatePrescription = async () => {
    if (!selectedAppointment) return;
    try {
      const res = await fetch('/api/clinical/prescriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          patientId: selectedAppointment.patientId,
          instructions: 'Take medications with plenty of water after meals.',
          medications: [{ name: medName, dosage: medDose, schedule: 'Daily' }]
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Prescription Issued', 'Prescription sent to Patient and Pharmacy.', 'success');
        setIsRxOpen(false);
      }
    } catch (err: any) {
      showToast('Error', err.message, 'alert');
    }
  };

  const handleOrderLabTest = async () => {
    if (!selectedAppointment) return;
    try {
      // Find test ID from catalog or default
      const res = await fetch('/api/labs/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          testId: 'clx01cbc00000000000000000', // fallback or lookup
          patientId: selectedAppointment.patientId,
          sampleMode: 'Home Collection'
        })
      });
      showToast('Lab Test Ordered', 'Diagnostic request dispatched to Lab Technicians.', 'success');
      setIsLabOpen(false);
    } catch (err: any) {
      showToast('Error', err.message, 'alert');
    }
  };

  const handleSubmitTreatmentPlan = async () => {
    if (!selectedAppointment) return;
    try {
      const res = await fetch('/api/clinical/treatment-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          patientId: selectedAppointment.patientId,
          title: planTitle,
          description: planDetails,
          requestSeniorReview: true
        })
      });
      showToast('Treatment Plan Submitted', 'Sent to Senior Doctor for clinical review.', 'success');
      setIsPlanOpen(false);
    } catch (err: any) {
      showToast('Error', err.message, 'alert');
    }
  };

  const pendingRequests = appointments.filter(a => a.status === 'PENDING');
  const todayVisits = appointments.filter(a => a.status === 'CONFIRMED');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-slide-up">
      {/* Header & Availability */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">Doctor Clinical Portal</span>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{user?.name}</h1>
          <p className="text-xs text-slate-400">Department: {user?.department || 'Cardiology'} · License: Verified</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500">Status:</span>
          <button
            onClick={() => setIsAvailable(!isAvailable)}
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

      {/* Pending Appointment Requests (Real-Time Synchronized) */}
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
            No pending appointment requests at this moment. New requests appear here in real-time.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {pendingRequests.map((apt) => (
              <div key={apt.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{apt.patient}</h4>
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

      {/* Confirmed Visits & Clinical Actions */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-white mb-4">
          Confirmed Patient Visits & Clinical Orders
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {todayVisits.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No confirmed appointments today.</div>
          ) : (
            todayVisits.map((apt) => (
              <div key={apt.id} className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{apt.patient}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">CONFIRMED</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Time: {apt.time} · Mode: {apt.type}</p>
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

      {/* Prescription Modal */}
      <Modal isOpen={isRxOpen} onClose={() => setIsRxOpen(false)} title="Issue Prescription">
        <div className="space-y-4 text-xs">
          <p className="text-slate-500">Patient: <strong>{selectedAppointment?.patient}</strong></p>
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

      {/* Lab Order Modal */}
      <Modal isOpen={isLabOpen} onClose={() => setIsLabOpen(false)} title="Order Diagnostic Lab Test">
        <div className="space-y-4 text-xs">
          <p className="text-slate-500">Patient: <strong>{selectedAppointment?.patient}</strong></p>
          <div>
            <label className="font-bold text-slate-600">Select Test Package</label>
            <select
              value={labTestId}
              onChange={(e) => setLabTestId(e.target.value)}
              className="w-full p-2.5 rounded-xl border mt-1 font-semibold"
            >
              <option value="CBC-01">Complete Blood Count (CBC)</option>
              <option value="LIPID-01">Lipid Profile & Cardiovascular Risk</option>
              <option value="THY-01">Comprehensive Thyroid Profile</option>
              <option value="HBA1C-01">HbA1c Glycated Hemoglobin</option>
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

      {/* Senior Review Modal */}
      <Modal isOpen={isPlanOpen} onClose={() => setIsPlanOpen(false)} title="Submit Treatment Plan for Senior Review">
        <div className="space-y-4 text-xs">
          <p className="text-slate-500">Patient: <strong>{selectedAppointment?.patient}</strong></p>
          <div>
            <label className="font-bold text-slate-600">Plan Title</label>
            <input
              value={planTitle}
              onChange={(e) => setPlanTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl border mt-1 font-semibold"
            />
          </div>
          <div>
            <label className="font-bold text-slate-600">Clinical Protocol Details</label>
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
