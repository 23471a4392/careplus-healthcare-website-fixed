import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useSocket } from '../../context/SocketContext.tsx';
import { Appointment } from '../../types/index.ts';
import { Modal } from '../../components/Modal.tsx';
import {
  Calendar,
  Clock,
  Check,
  X,
  Pill,
  TestTube,
  Stethoscope,
  Users,
  Search,
  Plus,
  FileText,
  User,
  ShieldCheck,
  CheckCircle,
  Activity,
  DollarSign
} from 'lucide-react';

interface DoctorDashboardProps {
  activeTab?: string;
  onNavigateTab?: (tab: string) => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ activeTab = 'overview', onNavigateTab }) => {
  const { user, token } = useAuth();
  const { showToast, realtimeVersion } = useSocket();

  // Data State
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [assignedPatients, setAssignedPatients] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [labOrders, setLabOrders] = useState<any[]>([]);
  const [treatmentPlans, setTreatmentPlans] = useState<any[]>([]);
  const [labCatalog, setLabCatalog] = useState<any[]>([]);
  const [isAvailable, setIsAvailable] = useState(true);

  // Search & Filter
  const [patientSearch, setPatientSearch] = useState('');
  const [requestFilter, setRequestFilter] = useState('ALL');

  // Modals & Entities
  const [isRxOpen, setIsRxOpen] = useState(false);
  const [isLabOpen, setIsLabOpen] = useState(false);
  const [isPlanOpen, setIsPlanOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedPatientProfile, setSelectedPatientProfile] = useState<any | null>(null);
  const [selectedPlanDetails, setSelectedPlanDetails] = useState<any | null>(null);

  // Form states
  const [rxPatientId, setRxPatientId] = useState('');
  const [rxPatientName, setRxPatientName] = useState('');
  const [medName, setMedName] = useState('Atorvastatin');
  const [medDose, setMedDose] = useState('20mg');
  const [medSchedule, setMedSchedule] = useState('1 tablet daily after dinner');

  const [labPatientId, setLabPatientId] = useState('');
  const [labPatientName, setLabPatientName] = useState('');
  const [selectedLabTestId, setSelectedLabTestId] = useState('');

  const [planPatientId, setPlanPatientId] = useState('');
  const [planPatientName, setPlanPatientName] = useState('');
  const [planTitle, setPlanTitle] = useState('Cardiovascular Recovery Protocol');
  const [planDetails, setPlanDetails] = useState('Beta-blocker titration with bi-weekly ambulatory BP monitoring.');

  // Fetch all doctor clinical data
  const fetchDoctorData = async () => {
    if (!token) return;
    try {
      const [resApt, resLabs, resRx, resPlans, resCat] = await Promise.all([
        fetch('/api/appointments', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch('/api/labs/orders', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch('/api/clinical/prescriptions', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch('/api/clinical/treatment-plans', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch('/api/labs/catalog').then(r => r.json())
      ]);

      if (resApt.success) {
        setAppointments(resApt.appointments);
        // Extract distinct assigned patients
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
        if (pats.length > 0) {
          setRxPatientId(pats[0].id);
          setRxPatientName(pats[0].name);
          setLabPatientId(pats[0].id);
          setLabPatientName(pats[0].name);
          setPlanPatientId(pats[0].id);
          setPlanPatientName(pats[0].name);
        }
      }

      if (resLabs.success) setLabOrders(resLabs.orders);
      if (resRx.success) setPrescriptions(resRx.prescriptions);
      if (resPlans.success) setTreatmentPlans(resPlans.plans);
      if (resCat.success && resCat.tests.length > 0) {
        setLabCatalog(resCat.tests);
        setSelectedLabTestId(resCat.tests[0].id);
      }
    } catch (err) {
      console.error('Error fetching doctor data:', err);
    }
  };

  useEffect(() => {
    fetchDoctorData();
  }, [token, realtimeVersion]);

  // Open dynamic patient profile
  const handleOpenPatientProfile = async (patientId: string, fallbackName: string) => {
    setSelectedPatientProfile({ id: patientId, name: fallbackName, loading: true });
    try {
      const res = await fetch(`/api/clinical/patients/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.json());
      if (res.success) {
        setSelectedPatientProfile(res.patient);
      } else {
        setSelectedPatientProfile({ id: patientId, name: fallbackName, gender: 'Male', bloodGroup: 'O+' });
      }
    } catch (err) {
      setSelectedPatientProfile({ id: patientId, name: fallbackName, gender: 'Male', bloodGroup: 'O+' });
    }
  };

  // Appointment Status Actions (Accept / Decline / Complete)
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

  // Availability Toggle
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
    showToast('Availability', next ? 'Marked Available for Consultations' : 'Marked Unavailable / In Surgery', 'info');
  };

  // Create Prescription
  const handleCreatePrescription = async () => {
    const targetPatientId = selectedAppointment ? selectedAppointment.patientId : rxPatientId;
    const targetPatientName = selectedAppointment ? selectedAppointment.patient : rxPatientName;
    if (!targetPatientId || !medName.trim()) return;

    try {
      const res = await fetch('/api/clinical/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          patientId: targetPatientId,
          instructions: medSchedule || 'Take with water as indicated.',
          medications: [{ name: `${medName} ${medDose}`.trim(), dosage: medDose, schedule: 'Daily' }]
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Prescription Dispatched', `Issued to ${targetPatientName} and sent to Pharmacy.`, 'success');
        setIsRxOpen(false);
        fetchDoctorData();
      }
    } catch (err: any) {
      showToast('Error', err.message, 'alert');
    }
  };

  // Order Diagnostic Lab
  const handleOrderLabTest = async () => {
    const targetPatientId = selectedAppointment ? selectedAppointment.patientId : labPatientId;
    const targetPatientName = selectedAppointment ? selectedAppointment.patient : labPatientName;
    if (!targetPatientId || !selectedLabTestId) return;

    try {
      const res = await fetch('/api/labs/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          testId: selectedLabTestId,
          patientId: targetPatientId,
          sampleMode: 'Home Collection'
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Lab Ordered', `Diagnostic order placed for ${targetPatientName}.`, 'success');
        setIsLabOpen(false);
        fetchDoctorData();
      }
    } catch (err: any) {
      showToast('Error', err.message, 'alert');
    }
  };

  // Submit Treatment Plan
  const handleSubmitTreatmentPlan = async () => {
    const targetPatientId = selectedAppointment ? selectedAppointment.patientId : planPatientId;
    if (!targetPatientId || !planTitle.trim()) return;

    try {
      const res = await fetch('/api/clinical/treatment-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          patientId: targetPatientId,
          title: planTitle,
          description: planDetails,
          requestSeniorReview: true
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Plan Submitted', 'Sent to Senior Doctor for clinical review.', 'success');
        setIsPlanOpen(false);
        fetchDoctorData();
      }
    } catch (err: any) {
      showToast('Error', err.message, 'alert');
    }
  };

  const pendingRequests = appointments.filter(a => a.status === 'PENDING');
  const activeVisits = appointments.filter(a => a.status === 'CONFIRMED');

  // Normalize current tab (default to 'overview' if unrecognized)
  const currentTab = (activeTab === 'dashboard' || !activeTab) ? 'overview' : activeTab;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">

      {/* Header with Physician Info & Availability */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-[#d6ebe7] dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-[#0c756e] font-semibold uppercase tracking-wider">Physician Portal</span>
          <h1 className="text-xl font-bold text-[#132e2b] dark:text-white mt-0.5">{user?.name}</h1>
          <p className="text-xs text-[#4d7872]">{user?.department || 'Cardiology'} · License Verified · CarePlus Multi-Specialty</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleAvailability}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              isAvailable
                ? 'bg-[#e6f5f2] border-[#cbe7e2] text-[#0c756e] dark:bg-slate-800'
                : 'bg-white border-[#d6ebe7] text-[#6b9690] dark:bg-slate-800'
            }`}
          >
            {isAvailable ? '● Available for Consultations' : '○ Unavailable / In Surgery'}
          </button>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 1. SCHEDULE TAB ('overview') */}
      {/* ================================================================= */}
      {currentTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-[#d6ebe7] dark:border-slate-800">
              <div className="text-xs text-[#4d7872] font-medium">Today's Visits</div>
              <div className="text-xl font-bold text-[#0c756e] mt-1">{activeVisits.length}</div>
              <div className="text-[11px] text-[#6b9690] mt-0.5">Confirmed on schedule</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-[#d6ebe7] dark:border-slate-800">
              <div className="text-xs text-[#4d7872] font-medium">Pending Requests</div>
              <div className="text-xl font-bold text-[#0c756e] mt-1">{pendingRequests.length}</div>
              <div className="text-[11px] text-[#6b9690] mt-0.5">Awaiting physician action</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-[#d6ebe7] dark:border-slate-800">
              <div className="text-xs text-[#4d7872] font-medium">Assigned Patients</div>
              <div className="text-xl font-bold text-[#0c756e] mt-1">{assignedPatients.length}</div>
              <div className="text-[11px] text-[#6b9690] mt-0.5">Active under care</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-[#d6ebe7] dark:border-slate-800">
              <div className="text-xs text-[#4d7872] font-medium">Active Prescriptions</div>
              <div className="text-xl font-bold text-[#0c756e] mt-1">{prescriptions.length}</div>
              <div className="text-[11px] text-[#6b9690] mt-0.5">Dispatched to pharmacy</div>
            </div>
          </div>

          {/* Confirmed Schedule Table */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-[#d6ebe7] dark:border-slate-800">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="font-semibold text-sm text-[#132e2b] dark:text-white">Confirmed Patient Visits</h3>
                <p className="text-xs text-[#4d7872]">Patient consultations on your active roster.</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#e6f5f2] text-[#0c756e] border border-[#cbe7e2]">
                {activeVisits.length} Confirmed
              </span>
            </div>

            {activeVisits.length === 0 ? (
              <p className="text-xs text-[#6b9690] py-4 text-center">No confirmed consultations scheduled for today.</p>
            ) : (
              <div className="divide-y divide-[#eef6f5] dark:divide-slate-800">
                {activeVisits.map((apt) => (
                  <div key={apt.id} className="py-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[#132e2b] dark:text-white">{apt.patient}</span>
                        <button
                          onClick={() => handleOpenPatientProfile(apt.patientId, apt.patient)}
                          className="text-[11px] font-semibold text-[#0c756e] hover:underline"
                        >
                          (Patient Profile)
                        </button>
                      </div>
                      <div className="text-xs text-[#4d7872] mt-0.5">
                        📅 {apt.date} · ⏰ {apt.time} · Mode: {apt.type}
                      </div>
                      {apt.reason && <p className="text-xs text-[#6b9690] italic mt-0.5">"{apt.reason}"</p>}
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                      <button
                        onClick={() => {
                          setSelectedAppointment(apt);
                          setIsRxOpen(true);
                        }}
                        className="px-2.5 py-1 bg-[#e6f5f2] hover:bg-[#d8efe9] text-[#0c756e] border border-[#cbe7e2] rounded-md font-semibold flex items-center gap-1"
                      >
                        <Pill className="w-3 h-3" />
                        <span>Prescribe</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedAppointment(apt);
                          setIsLabOpen(true);
                        }}
                        className="px-2.5 py-1 bg-[#e6f5f2] hover:bg-[#d8efe9] text-[#0c756e] border border-[#cbe7e2] rounded-md font-semibold flex items-center gap-1"
                      >
                        <TestTube className="w-3 h-3" />
                        <span>Order Lab</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedAppointment(apt);
                          setIsPlanOpen(true);
                        }}
                        className="px-2.5 py-1 bg-[#e6f5f2] hover:bg-[#d8efe9] text-[#0c756e] border border-[#cbe7e2] rounded-md font-semibold flex items-center gap-1"
                      >
                        <Stethoscope className="w-3 h-3" />
                        <span>Senior Review</span>
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(apt.id, 'COMPLETED')}
                        className="px-2.5 py-1 bg-white hover:bg-[#f8fbfb] text-[#234c47] border border-[#d6ebe7] rounded-md font-medium"
                      >
                        ✓ Complete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 2. APPOINTMENT REQUESTS TAB ('requests') */}
      {/* ================================================================= */}
      {currentTab === 'requests' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-[#d6ebe7] dark:border-slate-800">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="font-semibold text-sm text-[#132e2b] dark:text-white">Incoming Appointment Requests</h3>
                <p className="text-xs text-[#4d7872]">Patient requests awaiting your clinical acceptance or decline.</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#e6f5f2] text-[#0c756e] border border-[#cbe7e2]">
                {pendingRequests.length} Pending
              </span>
            </div>

            {pendingRequests.length === 0 ? (
              <p className="text-xs text-[#6b9690] py-6 text-center">No pending appointment requests at this moment.</p>
            ) : (
              <div className="divide-y divide-[#eef6f5] dark:divide-slate-800">
                {pendingRequests.map((apt) => (
                  <div key={apt.id} className="py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[#132e2b] dark:text-white">{apt.patient}</span>
                        <button
                          onClick={() => handleOpenPatientProfile(apt.patientId, apt.patient)}
                          className="text-[11px] font-semibold text-[#0c756e] hover:underline"
                        >
                          (View Details)
                        </button>
                      </div>
                      <div className="text-xs text-[#4d7872] mt-0.5">
                        📅 {apt.date} · ⏰ {apt.time} · Mode: {apt.type}
                      </div>
                      {apt.reason && <p className="text-xs text-[#6b9690] italic mt-0.5">"{apt.reason}"</p>}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateStatus(apt.id, 'CONFIRMED')}
                        className="px-3.5 py-1.5 bg-[#0c756e] hover:bg-[#095e58] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(apt.id, 'REJECTED')}
                        className="px-3.5 py-1.5 border border-[#d6ebe7] hover:bg-[#f8fbfb] text-[#36615b] rounded-lg text-xs font-semibold flex items-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 3. PATIENTS DIRECTORY TAB ('patients') */}
      {/* ================================================================= */}
      {currentTab === 'patients' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-lg font-bold text-[#132e2b] dark:text-white">Assigned Patients Directory</h1>
              <p className="text-xs text-[#4d7872]">Patients under your direct clinical care and observation.</p>
            </div>
            <input
              type="text"
              placeholder="Search patients..."
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-[#d6ebe7] bg-white w-48 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {assignedPatients
              .filter(p => !patientSearch || p.name.toLowerCase().includes(patientSearch.toLowerCase()))
              .map((p) => (
                <div key={p.id} className="p-4 rounded-xl border border-[#d6ebe7] bg-white dark:bg-slate-900 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-sm text-[#132e2b] dark:text-white">{p.name}</h4>
                    <p className="text-xs text-[#4d7872]">{p.phone || p.email || 'Registered Patient'}</p>
                    <p className="text-[11px] text-[#6b9690] mt-1">Last consultation: {p.lastVisit}</p>
                  </div>
                  <button
                    onClick={() => handleOpenPatientProfile(p.id, p.name)}
                    className="px-3 py-1.5 bg-[#0c756e] hover:bg-[#095e58] text-white rounded-lg text-xs font-semibold"
                  >
                    View Profile
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 4. PRESCRIPTIONS TAB ('prescriptions') */}
      {/* ================================================================= */}
      {currentTab === 'prescriptions' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-lg font-bold text-[#132e2b] dark:text-white">Prescription Management</h1>
              <p className="text-xs text-[#4d7872]">Medications issued by your desk to the hospital pharmacy.</p>
            </div>
            <button
              onClick={() => {
                setSelectedAppointment(null);
                setIsRxOpen(true);
              }}
              className="px-3.5 py-1.5 bg-[#0c756e] hover:bg-[#095e58] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Issue Prescription</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#d6ebe7] dark:border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#eef6f5] text-[#234c47] font-semibold border-b border-[#d6ebe7]">
                <tr>
                  <th className="p-3.5">Patient</th>
                  <th className="p-3.5">Medications</th>
                  <th className="p-3.5">Instructions</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef6f5]">
                {prescriptions.map((rx) => (
                  <tr key={rx.id} className="hover:bg-[#f8fbfb]">
                    <td className="p-3.5 font-bold text-[#132e2b] dark:text-white">{rx.patientName}</td>
                    <td className="p-3.5 font-semibold text-[#0c756e]">
                      {rx.medications.map((m: any) => `${m.name} (${m.dosage})`).join(', ')}
                    </td>
                    <td className="p-3.5 text-[#4d7872]">{rx.instructions}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        rx.status === 'DISPENSED'
                          ? 'bg-[#e6f5f2] text-[#0c756e] border-[#cbe7e2]'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {rx.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleOpenPatientProfile(rx.patientId, rx.patientName)}
                        className="text-[#0c756e] font-semibold hover:underline"
                      >
                        Patient Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 5. LAB ORDERS TAB ('labs') */}
      {/* ================================================================= */}
      {currentTab === 'labs' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-lg font-bold text-[#132e2b] dark:text-white">Diagnostic Lab Orders</h1>
              <p className="text-xs text-[#4d7872]">Pathology specimens ordered and clinical reports.</p>
            </div>
            <button
              onClick={() => {
                setSelectedAppointment(null);
                setIsLabOpen(true);
              }}
              className="px-3.5 py-1.5 bg-[#0c756e] hover:bg-[#095e58] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Order Lab Test</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {labOrders.map((o) => (
              <div key={o.id} className="p-4 bg-white rounded-xl border border-[#d6ebe7] flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold uppercase text-[#0c756e] bg-[#e6f5f2] border border-[#cbe7e2] px-2 py-0.5 rounded">
                      {o.status}
                    </span>
                    <span className="text-xs font-bold text-[#132e2b]">₹{o.price}</span>
                  </div>
                  <h4 className="font-bold text-sm text-[#132e2b] mt-1.5">{o.testName}</h4>
                  <p className="text-xs text-[#4d7872] mt-0.5">Patient: <strong>{o.patientName}</strong></p>
                  {o.resultSummary && (
                    <div className="mt-2 p-2 bg-[#f8fbfb] rounded border border-[#eef6f5] text-xs text-[#234c47]">
                      <strong>Findings:</strong> {o.resultSummary}
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-[#eef6f5] flex justify-end">
                  <button
                    onClick={() => handleOpenPatientProfile(o.patientId, o.patientName)}
                    className="text-xs font-semibold text-[#0c756e] hover:underline"
                  >
                    View Patient Chart →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 6. TREATMENT PLANS TAB ('treatment_plans') */}
      {/* ================================================================= */}
      {currentTab === 'treatment_plans' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-lg font-bold text-[#132e2b] dark:text-white">Clinical Treatment Protocols</h1>
              <p className="text-xs text-[#4d7872]">Specialized care pathways submitted for senior review.</p>
            </div>
            <button
              onClick={() => {
                setSelectedAppointment(null);
                setIsPlanOpen(true);
              }}
              className="px-3.5 py-1.5 bg-[#0c756e] hover:bg-[#095e58] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Protocol</span>
            </button>
          </div>

          <div className="space-y-3">
            {treatmentPlans.map((p) => (
              <div key={p.id} className="p-4 bg-white rounded-xl border border-[#d6ebe7] flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
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
                  <p className="text-xs text-[#4d7872] mt-1">Patient: <strong>{p.patientName}</strong> · Protocol by: <strong>{p.doctorName}</strong></p>
                  <p className="text-xs text-[#36615b] mt-1 leading-relaxed max-w-2xl">{p.description}</p>
                  {p.reviewNotes && (
                    <div className="mt-2 text-xs font-semibold text-[#0c756e] bg-[#e6f5f2] p-2 rounded border border-[#cbe7e2]">
                      Senior Reviewer Notes: {p.reviewNotes}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setSelectedPlanDetails(p)}
                  className="px-3 py-1.5 border border-[#d6ebe7] hover:bg-[#f8fbfb] text-[#0c756e] font-semibold text-xs rounded-lg whitespace-nowrap"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 7. PROFILE TAB ('profile') */}
      {/* ================================================================= */}
      {currentTab === 'profile' && (
        <div className="space-y-4 max-w-xl">
          <div>
            <h1 className="text-lg font-bold text-[#132e2b] dark:text-white">Physician Credentials & Profile</h1>
            <p className="text-xs text-[#4d7872]">Specialty designation, hospital departments, and fee settings.</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#d6ebe7] space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-[#eef6f5]">
              <div className="w-14 h-14 rounded-full border border-[#0c756e] bg-[#e6f5f2] text-[#0c756e] flex items-center justify-center font-bold text-base overflow-hidden">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Doctor" className="w-full h-full object-cover" />
                ) : (
                  <span>{user?.name ? user.name.split(' ').map((n: string)=>n[0]).join('').toUpperCase() : 'DR'}</span>
                )}
              </div>
              <div>
                <h3 className="font-bold text-base text-[#132e2b]">{user?.name}</h3>
                <p className="text-xs text-[#0c756e] font-semibold">{user?.department || 'Cardiology'} Specialist</p>
                <p className="text-[11px] text-[#6b9690]">CarePlus Multi-Specialty Hospital</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#f8fbfb] rounded-lg border border-[#eef6f5]">
                  <span className="text-[10px] text-[#6b9690] uppercase font-semibold">Consultation Fee</span>
                  <div className="text-base font-bold text-[#0c756e] mt-0.5">₹800</div>
                </div>
                <div className="p-3 bg-[#f8fbfb] rounded-lg border border-[#eef6f5]">
                  <span className="text-[10px] text-[#6b9690] uppercase font-semibold">Experience</span>
                  <div className="text-base font-bold text-[#132e2b] mt-0.5">12 Years</div>
                </div>
              </div>

              <div className="p-3 bg-[#f8fbfb] rounded-lg border border-[#eef6f5]">
                <span className="text-[10px] text-[#6b9690] uppercase font-semibold">Clinical Availability Status</span>
                <div className="mt-1 flex items-center justify-between">
                  <span className="font-semibold text-xs text-[#132e2b]">
                    {isAvailable ? 'Active for In-Person & Teleconsults' : 'Busy / In Surgery'}
                  </span>
                  <button
                    onClick={handleToggleAvailability}
                    className="px-3 py-1 bg-[#0c756e] text-white font-semibold rounded text-xs"
                  >
                    Toggle
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODALS */}
      {/* ================================================================= */}

      {/* Patient Profile Modal (Dynamic Patient A vs Patient B) */}
      <Modal
        isOpen={!!selectedPatientProfile}
        onClose={() => setSelectedPatientProfile(null)}
        title={`Patient Profile - ${selectedPatientProfile?.name}`}
      >
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-[#f8fbfb] rounded-lg border border-[#eef6f5]">
            <div className="font-bold text-sm text-[#132e2b]">{selectedPatientProfile?.name}</div>
            <div className="text-[#4d7872] mt-0.5">
              Demographics: {selectedPatientProfile?.gender || 'Male'} · Blood Group: {selectedPatientProfile?.bloodGroup || 'O+'}
            </div>
            {selectedPatientProfile?.phone && (
              <div className="text-[#6b9690] text-[11px] mt-0.5">Phone: {selectedPatientProfile?.phone}</div>
            )}
          </div>

          <div>
            <div className="text-[#234c47] font-semibold text-xs">Medical Records & History</div>
            {selectedPatientProfile?.medicalRecords && selectedPatientProfile.medicalRecords.length > 0 ? (
              <div className="divide-y divide-[#eef6f5] mt-1">
                {selectedPatientProfile.medicalRecords.map((r: any) => (
                  <div key={r.id} className="py-2">
                    <div className="font-semibold text-[#132e2b]">{r.title} ({r.category})</div>
                    <p className="text-[#4d7872] mt-0.5 text-[11px]">{r.summary}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#36615b] mt-1 leading-relaxed">
                Cardiovascular checkup routine. Blood pressure managed on statin therapy. Normal resting rhythm.
              </p>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button onClick={() => setSelectedPatientProfile(null)} className="px-4 py-1.5 bg-[#0c756e] text-white rounded-lg font-semibold">
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Prescription Modal */}
      <Modal
        isOpen={isRxOpen}
        onClose={() => setIsRxOpen(false)}
        title={`Issue Prescription - ${selectedAppointment ? selectedAppointment.patient : rxPatientName}`}
      >
        <div className="space-y-3 text-xs">
          {!selectedAppointment && (
            <div>
              <label className="text-[#4d7872] font-medium">Select Patient</label>
              <select
                value={rxPatientId}
                onChange={(e) => {
                  setRxPatientId(e.target.value);
                  const p = assignedPatients.find(x => x.id === e.target.value);
                  if (p) setRxPatientName(p.name);
                }}
                className="w-full p-2 rounded-lg border border-[#d6ebe7] mt-1 font-semibold"
              >
                {assignedPatients.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[#4d7872] font-medium">Medicine Name</label>
              <input value={medName} onChange={(e) => setMedName(e.target.value)} className="w-full p-2 rounded-lg border border-[#d6ebe7] mt-1 font-semibold" />
            </div>
            <div>
              <label className="text-[#4d7872] font-medium">Dosage</label>
              <input value={medDose} onChange={(e) => setMedDose(e.target.value)} className="w-full p-2 rounded-lg border border-[#d6ebe7] mt-1 font-semibold" />
            </div>
          </div>

          <div>
            <label className="text-[#4d7872] font-medium">Dosage & Instructions</label>
            <input value={medSchedule} onChange={(e) => setMedSchedule(e.target.value)} className="w-full p-2 rounded-lg border border-[#d6ebe7] mt-1 font-semibold" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setIsRxOpen(false)} className="px-3 py-1.5 text-[#4d7872]">Cancel</button>
            <button onClick={handleCreatePrescription} className="px-4 py-1.5 bg-[#0c756e] text-white rounded-lg font-semibold">
              Dispatch to Pharmacy
            </button>
          </div>
        </div>
      </Modal>

      {/* Lab Order Modal */}
      <Modal
        isOpen={isLabOpen}
        onClose={() => setIsLabOpen(false)}
        title={`Order Diagnostic Test - ${selectedAppointment ? selectedAppointment.patient : labPatientName}`}
      >
        <div className="space-y-3 text-xs">
          {!selectedAppointment && (
            <div>
              <label className="text-[#4d7872] font-medium">Select Patient</label>
              <select
                value={labPatientId}
                onChange={(e) => {
                  setLabPatientId(e.target.value);
                  const p = assignedPatients.find(x => x.id === e.target.value);
                  if (p) setLabPatientName(p.name);
                }}
                className="w-full p-2 rounded-lg border border-[#d6ebe7] mt-1 font-semibold"
              >
                {assignedPatients.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-[#4d7872] font-medium">Select Diagnostic Test</label>
            <select
              value={selectedLabTestId}
              onChange={(e) => setSelectedLabTestId(e.target.value)}
              className="w-full p-2 rounded-lg border border-[#d6ebe7] mt-1 font-semibold"
            >
              {labCatalog.map((t) => (
                <option key={t.id} value={t.id}>{t.name} (₹{t.price})</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setIsLabOpen(false)} className="px-3 py-1.5 text-[#4d7872]">Cancel</button>
            <button onClick={handleOrderLabTest} className="px-4 py-1.5 bg-[#0c756e] text-white rounded-lg font-semibold">
              Dispatch to Lab
            </button>
          </div>
        </div>
      </Modal>

      {/* Treatment Plan Modal */}
      <Modal
        isOpen={isPlanOpen}
        onClose={() => setIsPlanOpen(false)}
        title={`Clinical Protocol - ${selectedAppointment ? selectedAppointment.patient : planPatientName}`}
      >
        <div className="space-y-3 text-xs">
          {!selectedAppointment && (
            <div>
              <label className="text-[#4d7872] font-medium">Select Patient</label>
              <select
                value={planPatientId}
                onChange={(e) => {
                  setPlanPatientId(e.target.value);
                  const p = assignedPatients.find(x => x.id === e.target.value);
                  if (p) setPlanPatientName(p.name);
                }}
                className="w-full p-2 rounded-lg border border-[#d6ebe7] mt-1 font-semibold"
              >
                {assignedPatients.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-[#4d7872] font-medium">Protocol Title</label>
            <input value={planTitle} onChange={(e) => setPlanTitle(e.target.value)} className="w-full p-2 rounded-lg border border-[#d6ebe7] mt-1 font-semibold" />
          </div>

          <div>
            <label className="text-[#4d7872] font-medium">Protocol Details</label>
            <textarea rows={3} value={planDetails} onChange={(e) => setPlanDetails(e.target.value)} className="w-full p-2 rounded-lg border border-[#d6ebe7] mt-1 font-semibold" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setIsPlanOpen(false)} className="px-3 py-1.5 text-[#4d7872]">Cancel</button>
            <button onClick={handleSubmitTreatmentPlan} className="px-4 py-1.5 bg-[#0c756e] text-white rounded-lg font-semibold">
              Submit for Senior Review
            </button>
          </div>
        </div>
      </Modal>

      {/* Plan Details Modal */}
      <Modal
        isOpen={!!selectedPlanDetails}
        onClose={() => setSelectedPlanDetails(null)}
        title={selectedPlanDetails?.title || 'Treatment Protocol'}
      >
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-[#f8fbfb] rounded-lg border border-[#eef6f5]">
            <div className="text-[10px] text-[#6b9690] uppercase font-semibold">Status: {selectedPlanDetails?.status}</div>
            <div className="font-bold text-sm text-[#132e2b] mt-0.5">{selectedPlanDetails?.title}</div>
            <p className="text-xs text-[#4d7872] mt-0.5">Patient: <strong>{selectedPlanDetails?.patientName}</strong></p>
          </div>

          <div>
            <span className="text-[10px] text-[#6b9690] uppercase font-semibold">Protocol Strategy</span>
            <p className="text-xs text-[#36615b] mt-1 leading-relaxed">{selectedPlanDetails?.description}</p>
          </div>

          {selectedPlanDetails?.reviewNotes && (
            <div className="p-2.5 bg-[#e6f5f2] rounded border border-[#cbe7e2] text-[#0c756e]">
              <strong>Senior Review Notes:</strong> {selectedPlanDetails.reviewNotes}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button onClick={() => setSelectedPlanDetails(null)} className="px-4 py-1.5 bg-[#0c756e] text-white rounded-lg font-semibold">
              Close
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
