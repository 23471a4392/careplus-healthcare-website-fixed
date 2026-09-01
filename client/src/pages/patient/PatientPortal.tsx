import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useSocket } from '../../context/SocketContext.tsx';
import { Doctor, Appointment, MedicalRecordItem, LabOrder } from '../../types/index.ts';
import { Modal } from '../../components/Modal.tsx';
import {
  Calendar,
  Clock,
  Search,
  Download,
  Plus,
  FileText,
  Activity,
  PhoneCall,
  User,
  Settings,
  Pill,
  BookOpen,
  Trash2,
  Edit3,
  Bookmark
} from 'lucide-react';

interface PatientPortalProps {
  activeTab: string;
  onNavigateTab: (tab: string) => void;
}

export const PatientPortal: React.FC<PatientPortalProps> = ({ activeTab, onNavigateTab }) => {
  const { user, token, updateUserAvatar } = useAuth();
  const { showToast, realtimeVersion } = useSocket();

  // Data State
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<MedicalRecordItem[]>([]);
  const [labCatalog, setLabCatalog] = useState<any[]>([]);

  // Search & Filter
  const [searchDoc, setSearchDoc] = useState('');
  const [selectedSpec, setSelectedSpec] = useState('');
  const [appointmentFilter, setAppointmentFilter] = useState('ALL');
  const [recordCategoryFilter, setRecordCategoryFilter] = useState('ALL');

  // Modals & Entities (Specific per click)
  const [selectedDoctorProfile, setSelectedDoctorProfile] = useState<Doctor | null>(null);
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
  const [selectedAppointmentDetails, setSelectedAppointmentDetails] = useState<Appointment | null>(null);
  const [reschedulingAppointment, setReschedulingAppointment] = useState<Appointment | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecordItem | null>(null);
  const [isUploadRecordOpen, setIsUploadRecordOpen] = useState(false);
  const [selectedLabTestDetails, setSelectedLabTestDetails] = useState<any | null>(null);
  const [bookingLabTest, setBookingLabTest] = useState<any | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);

  // Booking Form State
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingSlots, setBookingSlots] = useState<{ time: string; isBooked: boolean }[]>([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [consultType, setConsultType] = useState('In-person');
  const [bookingReason, setBookingReason] = useState('');

  // Reschedule Form State
  const [reschedDate, setReschedDate] = useState(new Date().toISOString().split('T')[0]);
  const [reschedSlots, setReschedSlots] = useState<{ time: string; isBooked: boolean }[]>([]);
  const [selectedReschedSlot, setSelectedReschedSlot] = useState('');

  // Record Form State
  const [newRecordTitle, setNewRecordTitle] = useState('');
  const [newRecordCategory, setNewRecordCategory] = useState('Lab Report');
  const [newRecordFacility, setNewRecordFacility] = useState('CarePlus Diagnostics');
  const [newRecordSummary, setNewRecordSummary] = useState('');

  // Medicines (CRUD)
  const [medicines, setMedicines] = useState([
    { id: 'med-1', name: 'Atorvastatin', dosage: '20mg', timing: 'After dinner', frequency: 'Once daily', status: 'Active', takenToday: true },
    { id: 'med-2', name: 'Vitamin D3', dosage: '60,000 IU', timing: 'After breakfast', frequency: 'Weekly (Sundays)', status: 'Active', takenToday: true },
    { id: 'med-3', name: 'Omega 3 Fish Oil', dosage: '1000mg', timing: 'With lunch', frequency: 'Once daily', status: 'Active', takenToday: false },
    { id: 'med-4', name: 'Telmisartan', dosage: '40mg', timing: 'Morning 8:00 AM', frequency: 'Once daily', status: 'Active', takenToday: false }
  ]);
  const [isAddMedOpen, setIsAddMedOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<any | null>(null);
  const [medName, setMedName] = useState('');
  const [medDose, setMedDose] = useState('');
  const [medTiming, setMedTiming] = useState('');
  const [medFreq, setMedFreq] = useState('Once daily');

  // Vitals (CRUD)
  const [vitalsList, setVitalsList] = useState([
    { id: 'v-1', date: '2026-08-30 08:30 AM', metric: 'Blood Pressure', value: '118/76', unit: 'mmHg', status: 'Normal', notes: 'Resting check' },
    { id: 'v-2', date: '2026-08-29 07:15 AM', metric: 'Fasting Glucose', value: '92', unit: 'mg/dL', status: 'Optimal', notes: 'Fasting 10h' },
    { id: 'v-3', date: '2026-08-28 06:45 PM', metric: 'Heart Rate', value: '72', unit: 'BPM', status: 'Optimal', notes: 'Resting' },
    { id: 'v-4', date: '2026-08-27 08:00 AM', metric: 'Body Weight', value: '68.4', unit: 'kg', status: 'Target', notes: 'Morning check' }
  ]);
  const [isAddVitalOpen, setIsAddVitalOpen] = useState(false);
  const [vitalMetric, setVitalMetric] = useState('Blood Pressure');
  const [vitalValue, setVitalValue] = useState('');
  const [vitalNotes, setVitalNotes] = useState('');

  // Articles
  const [bookmarkedArticles, setBookmarkedArticles] = useState<Record<string, boolean>>({});
  const articles = [
    {
      id: 'art-1',
      title: 'Cardiovascular Health: Understanding Lipid Panels',
      author: 'Dr. Arjun Rao, MD',
      category: 'Cardiology',
      readTime: '4 min read',
      image: '/assets/images/articles/heart_health.jpg',
      summary: 'Clinical insights on ApoB, non-HDL cholesterol, and lifestyle strategies for long-term arterial health.',
      fullText: 'Cardiovascular wellness begins with comprehensive hemodynamic and biochemical tracking. While standard lipid panels report total LDL cholesterol, modern cardiology places significant emphasis on Apolipoprotein B (ApoB) and Non-HDL cholesterol as direct markers of atherogenic particles. Implementing dietary adjustments rich in soluble fiber (psyllium husk, oats, legumes) combined with aerobic conditioning at Zone 2 intensity (60-70% maximum heart rate) provides measurable endothelial protection.',
      takeaways: [
        'ApoB and Non-HDL cholesterol correlate more accurately with plaque burden than standard LDL alone.',
        'Target 150 minutes of weekly Zone 2 cardiovascular exercise to optimize vascular compliance.',
        'Soluble dietary fiber binds intestinal bile acids to assist in hepatic LDL clearance.'
      ]
    },
    {
      id: 'art-2',
      title: 'Circadian Biology and Sleep Quality',
      author: 'Dr. Rahul Mehta, MD',
      category: 'Neurology',
      readTime: '5 min read',
      image: '/assets/images/articles/sleep.jpg',
      summary: 'How consistent sleep timing directly affects daytime cortisol and cognitive function.',
      fullText: 'Sleep architecture comprises cyclic oscillations between Non-Rapid Eye Movement (NREM Stages 1-3) and Rapid Eye Movement (REM) sleep. Slow-Wave Sleep (Stage 3 NREM) is the critical window where cerebral glymphatic clearance removes metabolic byproducts. Disruptions in nocturnal circadian alignment induce morning cortisol spikes and insulin resistance.',
      takeaways: [
        'Maintain a consistent wake time (within 30 minutes) 7 days a week.',
        'Cease blue-spectrum optical exposure 90 minutes before bedtime.',
        'A cooler ambient bedroom temperature facilitates natural core temperature decline.'
      ]
    },
    {
      id: 'art-3',
      title: 'Nutrition Fundamentals: Glycemic Stability',
      author: 'Dr. Priya Sharma, MD',
      category: 'Nutrition',
      readTime: '4 min read',
      image: '/assets/images/articles/nutrition.jpg',
      summary: 'Managing blood glucose stability through meal sequencing and dietary fiber.',
      fullText: 'Metabolic health depends on stabilizing glycemic variability. Carbohydrates that digest rapidly into glucose generate postprandial glycemic spikes, triggering hyperinsulinemia. By pairing carbohydrate sources with healthy lipids and protein matrices, gastric emptying is prolonged, dampening the glycemic curve.',
      takeaways: [
        'Consume fiber and protein before simple carbohydrates during meals.',
        'Incorporate resistance exercise to assist muscle glucose uptake.',
        'Maintain fasting blood glucose under 99 mg/dL.'
      ]
    },
    {
      id: 'art-4',
      title: 'Musculoskeletal Health and Resistance Training',
      author: 'Dr. Rajesh Nambiar, MS',
      category: 'Orthopedics',
      readTime: '4 min read',
      image: '/assets/images/articles/fitness.jpg',
      summary: 'Preserving joint integrity and bone mineral density through calibrated resistance protocols.',
      fullText: 'Age-related loss of skeletal muscle mass and functional strength accelerates after the fourth decade. Progressive axial loading through compound movements (squats, hinges, presses) exerts mechanical strain on cortical bone, prompting osteoblastic bone deposition and preventing osteopenia.',
      takeaways: [
        'Engage in resistance exercise 2-3 times per week targeting major muscle groups.',
        'Ensure daily protein intake is distributed evenly across meals.',
        'Prioritize multi-joint functional movements.'
      ]
    }
  ];

  // Profile Form State
  const [profileName, setProfileName] = useState(user?.name || 'Vaseem Basha');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '+91 98765 43210');
  const [profileAddress, setProfileAddress] = useState('Indiranagar 100ft Rd, Bengaluru 560038');

  // Load Data
  const loadData = async () => {
    try {
      const [resDoc, resApt, resRec, resLabCat] = await Promise.all([
        fetch('/api/doctors').then(r => r.json()),
        fetch('/api/appointments', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch('/api/clinical/records', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch('/api/labs/catalog').then(r => r.json())
      ]);

      if (resDoc.success) setDoctors(resDoc.doctors);
      if (resApt.success) setAppointments(resApt.appointments);
      if (resRec.success) setRecords(resRec.records);
      if (resLabCat.success) setLabCatalog(resLabCat.tests);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };

  useEffect(() => {
    if (token) loadData();
  }, [token, realtimeVersion]);

  // Slot calculations
  useEffect(() => {
    if (bookingDoctor && bookingDate) {
      fetch(`/api/doctors/${bookingDoctor.id}/slots?date=${bookingDate}`)
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            setBookingSlots(data.slots);
            const first = data.slots.find((s: any) => !s.isBooked);
            setSelectedSlot(first ? first.time : '');
          }
        });
    }
  }, [bookingDoctor, bookingDate]);

  useEffect(() => {
    if (reschedulingAppointment && reschedDate) {
      fetch(`/api/doctors/${reschedulingAppointment.doctorId}/slots?date=${reschedDate}`)
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            setReschedSlots(data.slots);
            const first = data.slots.find((s: any) => !s.isBooked);
            setSelectedReschedSlot(first ? first.time : '');
          }
        });
    }
  }, [reschedulingAppointment, reschedDate]);

  // Action Handlers
  const handleConfirmBooking = async () => {
    if (!bookingDoctor || !selectedSlot) {
      showToast('Select Slot', 'Please select an available appointment slot.', 'alert');
      return;
    }
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          doctorId: bookingDoctor.id,
          date: bookingDate,
          timeSlot: selectedSlot,
          consultationType: consultType,
          reason: bookingReason
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Appointment Requested', `Visit scheduled with ${bookingDoctor.name} for ${bookingDate} at ${selectedSlot}.`, 'success');
        setBookingDoctor(null);
        setBookingReason('');
        loadData();
      } else {
        showToast('Booking Failed', data.message, 'alert');
      }
    } catch (err: any) {
      showToast('Error', err.message, 'alert');
    }
  };

  const handleConfirmReschedule = async () => {
    if (!reschedulingAppointment || !selectedReschedSlot) return;
    try {
      const res = await fetch(`/api/appointments/${reschedulingAppointment.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          status: 'RESCHEDULED',
          reschedDate: reschedDate,
          reschedTime: selectedReschedSlot
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Appointment Rescheduled', `Moved to ${reschedDate} at ${selectedReschedSlot}.`, 'success');
        setReschedulingAppointment(null);
        loadData();
      }
    } catch (err: any) {
      showToast('Error', err.message, 'alert');
    }
  };

  const handleCancelAppointment = async (apt: Appointment) => {
    if (!window.confirm(`Cancel appointment with ${apt.doctor} on ${apt.date}?`)) return;
    try {
      const res = await fetch(`/api/appointments/${apt.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'CANCELLED' })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Appointment Cancelled', 'The visit has been cancelled.', 'info');
        loadData();
      }
    } catch (err: any) {
      showToast('Error', err.message, 'alert');
    }
  };

  const handleSaveProfile = async () => {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: profileName,
          phone: profilePhone,
          address: profileAddress
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Saved', 'Profile information updated.', 'success');
      }
    } catch (err: any) {
      showToast('Error', err.message, 'alert');
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ avatarUrl: dataUrl })
      });
      updateUserAvatar(dataUrl);
      showToast('Photo Saved', 'Profile photo updated.', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = async () => {
    await fetch('/api/auth/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ avatarUrl: '' })
    });
    updateUserAvatar('');
    showToast('Photo Removed', 'Reverted to initials.', 'info');
  };

  const handleUploadRecord = async () => {
    if (!newRecordTitle.trim()) return;
    try {
      const res = await fetch('/api/clinical/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: newRecordTitle,
          category: newRecordCategory,
          facility: newRecordFacility,
          summary: newRecordSummary || 'Uploaded health record.'
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Record Added', `"${newRecordTitle}" saved to records.`, 'success');
        setIsUploadRecordOpen(false);
        setNewRecordTitle('');
        setNewRecordSummary('');
        loadData();
      }
    } catch (err: any) {
      showToast('Error', err.message, 'alert');
    }
  };

  const handleDeleteRecord = async (id: string, title: string) => {
    if (!window.confirm(`Delete record "${title}"?`)) return;
    try {
      const res = await fetch(`/api/clinical/records/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast('Record Deleted', `"${title}" removed.`, 'info');
        loadData();
      }
    } catch (err: any) {
      showToast('Error', err.message, 'alert');
    }
  };

  // Medicine Handlers
  const handleSaveMedicine = () => {
    if (!medName.trim()) return;
    if (editingMed) {
      setMedicines(medicines.map(m => m.id === editingMed.id ? { ...m, name: medName, dosage: medDose, timing: medTiming, frequency: medFreq } : m));
      showToast('Updated', `Saved ${medName}.`, 'success');
      setEditingMed(null);
    } else {
      setMedicines([...medicines, {
        id: 'med-' + Date.now(),
        name: medName,
        dosage: medDose || '1 unit',
        timing: medTiming || 'As indicated',
        frequency: medFreq,
        status: 'Active',
        takenToday: false
      }]);
      showToast('Added', `Added ${medName}.`, 'success');
      setIsAddMedOpen(false);
    }
    setMedName('');
    setMedDose('');
    setMedTiming('');
  };

  const handleDeleteMedicine = (id: string, name: string) => {
    if (!window.confirm(`Remove ${name}?`)) return;
    setMedicines(medicines.filter(m => m.id !== id));
    showToast('Removed', `${name} removed.`, 'info');
  };

  const toggleMedTaken = (id: string) => {
    setMedicines(medicines.map(m => m.id === id ? { ...m, takenToday: !m.takenToday } : m));
  };

  // Vitals Handlers
  const handleSaveVital = () => {
    if (!vitalValue.trim()) return;
    const item = {
      id: 'v-' + Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      metric: vitalMetric,
      value: vitalValue,
      unit: vitalMetric === 'Blood Pressure' ? 'mmHg' : vitalMetric === 'Heart Rate' ? 'BPM' : vitalMetric === 'Fasting Glucose' ? 'mg/dL' : vitalMetric === 'Body Weight' ? 'kg' : '%',
      status: 'Logged',
      notes: vitalNotes || 'Recorded'
    };
    setVitalsList([item, ...vitalsList]);
    showToast('Recorded', `Logged ${vitalMetric}: ${vitalValue}`, 'success');
    setIsAddVitalOpen(false);
    setVitalValue('');
    setVitalNotes('');
  };

  const handleDeleteVital = (id: string) => {
    setVitalsList(vitalsList.filter(v => v.id !== id));
    showToast('Removed', 'Entry deleted.', 'info');
  };

  const exportAppointmentsCsv = () => {
    const header = 'Appointment ID,Doctor,Specialty,Date,Time,Status\\n';
    const rows = appointments.map(a => `"${a.appointmentCode}","${a.doctor}","${a.specialty}","${a.date}","${a.time}","${a.status}"`).join('\\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'CarePlus_Appointments.csv';
    link.click();
    showToast('Downloaded', 'Appointments exported to CSV.', 'success');
  };

  const exportVitalsCsv = () => {
    const header = 'Timestamp,Metric,Value,Unit,Status,Notes\\n';
    const rows = vitalsList.map(v => `"${v.date}","${v.metric}","${v.value}","${v.unit}","${v.status}","${v.notes}"`).join('\\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'CarePlus_Vitals.csv';
    link.click();
    showToast('Downloaded', 'Vitals exported to CSV.', 'success');
  };

  const downloadEmergencyCard = () => {
    const text = `CAREPLUS EMERGENCY MEDICAL SUMMARY
Patient: ${user?.name || 'Vaseem Basha'}
Phone: ${profilePhone}
Address: ${profileAddress}
Blood Group: O Positive (O+)
Current Medications: Atorvastatin 20mg, Vitamin D3 60,000 IU
Emergency Hotline: 108
Trauma Desk: +91 80 2345 6789`;
    const blob = new Blob([text], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Emergency_Medical_Card.txt';
    link.click();
    showToast('Downloaded', 'Emergency card downloaded.', 'success');
  };

  const nextApt = appointments.find(a => a.status === 'CONFIRMED' || a.status === 'PENDING');

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">

      {/* 1. DASHBOARD - Clean, Human, Simple */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Calm Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#d6ebe7] dark:border-slate-800">
            <div>
              <h1 className="text-xl font-semibold text-[#132e2b] dark:text-white">Good morning, {user?.firstName}</h1>
              <p className="text-xs text-[#4d7872] dark:text-[#6b9690] mt-0.5">Overview of your upcoming visits, medication schedule, and recent metrics.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigateTab('doctors')}
                className="px-3.5 py-1.5 bg-[#0c756e] hover:bg-[#095e58] text-white rounded-lg text-xs font-medium transition"
              >
                Book Appointment
              </button>
              <button
                onClick={() => onNavigateTab('records')}
                className="px-3.5 py-1.5 bg-white hover:bg-[#f8fbfb] text-[#234c47] dark:bg-slate-800 dark:text-slate-200 border border-[#d6ebe7] dark:border-slate-700 rounded-lg text-xs font-medium transition"
              >
                View Records
              </button>
            </div>
          </div>

          {/* Simple Vitals Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#0c756e] p-4 rounded-xl border border-[#d6ebe7] dark:border-slate-800">
              <div className="text-xs text-[#4d7872] font-medium">Heart Rate</div>
              <div className="text-xl font-semibold text-[#132e2b] dark:text-white mt-1">72 <span className="text-xs font-normal text-[#6b9690]">BPM</span></div>
              <div className="text-[11px] text-[#6b9690] mt-1">Normal resting rhythm</div>
            </div>

            <div className="bg-white dark:bg-[#0c756e] p-4 rounded-xl border border-[#d6ebe7] dark:border-slate-800">
              <div className="text-xs text-[#4d7872] font-medium">Blood Pressure</div>
              <div className="text-xl font-semibold text-[#132e2b] dark:text-white mt-1">118/76 <span className="text-xs font-normal text-[#6b9690]">mmHg</span></div>
              <div className="text-[11px] text-[#6b9690] mt-1">Optimal range</div>
            </div>

            <div className="bg-white dark:bg-[#0c756e] p-4 rounded-xl border border-[#d6ebe7] dark:border-slate-800">
              <div className="text-xs text-[#4d7872] font-medium">Body Weight</div>
              <div className="text-xl font-semibold text-[#132e2b] dark:text-white mt-1">68.4 <span className="text-xs font-normal text-[#6b9690]">kg</span></div>
              <div className="text-[11px] text-[#6b9690] mt-1">Target range</div>
            </div>

            <div className="bg-white dark:bg-[#0c756e] p-4 rounded-xl border border-[#d6ebe7] dark:border-slate-800">
              <div className="text-xs text-[#4d7872] font-medium">Fasting Glucose</div>
              <div className="text-xl font-semibold text-[#132e2b] dark:text-white mt-1">92 <span className="text-xs font-normal text-[#6b9690]">mg/dL</span></div>
              <div className="text-[11px] text-[#6b9690] mt-1">Normal fasting</div>
            </div>
          </div>

          {/* Next Visit & Medications Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#0c756e] p-5 rounded-xl border border-[#d6ebe7] dark:border-slate-800">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-xs text-[#234c47] dark:text-slate-300 uppercase tracking-wider">Next Appointment</h3>
                <button onClick={() => onNavigateTab('appointments')} className="text-xs text-[#0c756e] dark:text-teal-400 hover:underline">View all</button>
              </div>

              {nextApt ? (
                <div className="p-3.5 bg-[#f8fbfb] dark:bg-slate-800/50 rounded-lg border border-[#eef6f5] dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm text-[#132e2b] dark:text-white">{nextApt.doctor}</div>
                    <div className="text-xs text-[#4d7872]">{nextApt.specialty} · {nextApt.hospital}</div>
                    <div className="text-xs text-[#36615b] dark:text-[#6b9690] mt-1">
                      {nextApt.date} at {nextApt.time} ({nextApt.type})
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedAppointmentDetails(nextApt)}
                    className="px-3 py-1 text-xs font-medium bg-white dark:bg-slate-800 border border-[#d6ebe7] dark:border-slate-700 rounded-md hover:bg-[#f8fbfb]"
                  >
                    Details
                  </button>
                </div>
              ) : (
                <p className="text-xs text-[#6b9690] py-4">No upcoming appointments scheduled.</p>
              )}
            </div>

            <div className="bg-white dark:bg-[#0c756e] p-5 rounded-xl border border-[#d6ebe7] dark:border-slate-800">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-xs text-[#234c47] dark:text-slate-300 uppercase tracking-wider">Today's Medications</h3>
                <button onClick={() => onNavigateTab('medicines')} className="text-xs text-[#0c756e] dark:text-teal-400 hover:underline">Manage</button>
              </div>

              <div className="space-y-2">
                {medicines.slice(0, 3).map((m) => (
                  <div key={m.id} className="p-2.5 bg-[#f8fbfb] dark:bg-slate-800/50 rounded-lg border border-[#eef6f5] dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium text-[#132e2b] dark:text-white">{m.name} {m.dosage}</div>
                      <div className="text-[11px] text-[#4d7872]">{m.timing}</div>
                    </div>
                    <button
                      onClick={() => toggleMedTaken(m.id)}
                      className={`text-xs font-medium px-2.5 py-1 rounded transition ${
                        m.takenToday
                          ? 'bg-[#e6f5f2] text-[#0c756e] dark:bg-teal-950 dark:text-teal-300'
                          : 'bg-white dark:bg-slate-800 border border-[#d6ebe7] dark:border-slate-700 text-[#36615b]'
                      }`}
                    >
                      {m.takenToday ? '✓ Taken' : 'Mark done'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. DOCTORS CATALOG (Doctor A vs Doctor B Profiles) */}
      {activeTab === 'doctors' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h1 className="text-lg font-semibold text-[#132e2b] dark:text-white">Medical Specialists</h1>
              <p className="text-xs text-[#4d7872]">Consult licensed physicians and clinical specialists.</p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search physician..."
                value={searchDoc}
                onChange={(e) => setSearchDoc(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-[#d6ebe7] dark:border-slate-700 bg-white dark:bg-slate-800 w-full sm:w-48"
              />
              <select
                value={selectedSpec}
                onChange={(e) => setSelectedSpec(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-[#d6ebe7] dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value="">All Specialties</option>
                <option value="Cardiologist">Cardiology</option>
                <option value="Dermatologist">Dermatology</option>
                <option value="Neurologist">Neurology</option>
                <option value="Pediatrician">Pediatrics</option>
                <option value="Orthopedic Surgeon">Orthopedics</option>
                <option value="General Physician">General Medicine</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctors
              .filter(d => (!searchDoc || (d.name + d.specialty).toLowerCase().includes(searchDoc.toLowerCase())) && (!selectedSpec || d.specialty === selectedSpec))
              .map((doc) => (
                <div key={doc.id} className="bg-white dark:bg-[#0c756e] p-4 rounded-xl border border-[#d6ebe7] dark:border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-[#d6ebe7] dark:border-slate-700 shrink-0 bg-[#e6f5f2] flex items-center justify-center font-medium text-sm text-[#234c47]">
                        {doc.photo ? (
                          <img src={doc.photo} alt={doc.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{doc.name.replace('Dr. ', '').split(' ').map(n=>n[0]).join('')}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-[#132e2b] dark:text-white">{doc.name}</h3>
                        <p className="text-xs text-[#0c756e] dark:text-teal-400 font-medium">{doc.specialty}</p>
                        <p className="text-[11px] text-[#6b9690] mt-0.5">★ {doc.rating} · {doc.experience}</p>
                      </div>
                    </div>

                    <p className="text-xs text-[#36615b] dark:text-[#6b9690] line-clamp-2 leading-relaxed mb-3">
                      {doc.bio}
                    </p>

                    <div className="flex justify-between items-center text-xs py-1.5 px-2.5 bg-[#f8fbfb] dark:bg-slate-800 rounded-lg mb-3">
                      <span className="text-[#4d7872]">Consultation Fee</span>
                      <span className="font-semibold text-[#132e2b] dark:text-white">₹{doc.fee}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedDoctorProfile(doc)}
                      className="flex-1 py-1.5 text-xs font-medium bg-[#e6f5f2] hover:bg-[#d8efe9] dark:bg-slate-800 text-[#234c47] dark:text-slate-200 rounded-lg transition"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => setBookingDoctor(doc)}
                      className="flex-1 py-1.5 bg-[#0c756e] hover:bg-[#095e58] text-white rounded-lg font-medium text-xs transition"
                    >
                      Book Visit
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 3. APPOINTMENTS SCHEDULE */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h1 className="text-lg font-semibold text-[#132e2b] dark:text-white">Appointments</h1>
              <p className="text-xs text-[#4d7872]">Scheduled, pending, and past visits.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportAppointmentsCsv}
                className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-[#0c756e] border border-[#d6ebe7] dark:border-slate-700 rounded-lg hover:bg-[#f8fbfb] flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => onNavigateTab('doctors')}
                className="px-3 py-1.5 text-xs font-medium bg-[#0c756e] hover:bg-[#095e58] text-white rounded-lg flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Appointment</span>
              </button>
            </div>
          </div>

          <div className="flex gap-1 border-b border-[#d6ebe7] dark:border-slate-800 pb-2 text-xs font-medium">
            {['ALL', 'CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED'].map((tab) => (
              <button
                key={tab}
                onClick={() => setAppointmentFilter(tab)}
                className={`px-3 py-1 rounded-md transition ${
                  appointmentFilter === tab
                    ? 'bg-[#0c756e] text-white'
                    : 'text-[#4d7872] hover:bg-[#e6f5f2] dark:hover:bg-[#095e58]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="bg-white dark:bg-[#0c756e] rounded-xl border border-[#d6ebe7] dark:border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fbfb] dark:bg-slate-800/50 text-[#4d7872] font-medium uppercase text-[11px] border-b border-[#d6ebe7] dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Doctor</th>
                  <th className="p-3.5">Specialty</th>
                  <th className="p-3.5">Date & Time</th>
                  <th className="p-3.5">Mode</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-normal">
                {appointments
                  .filter(a => appointmentFilter === 'ALL' || a.status === appointmentFilter)
                  .map((a) => (
                    <tr key={a.id} className="hover:bg-[#f8fbfb]/50 dark:hover:bg-[#095e58]/40 transition">
                      <td className="p-3.5 font-medium text-[#132e2b] dark:text-white">{a.doctor}</td>
                      <td className="p-3.5 text-[#4d7872]">{a.specialty}</td>
                      <td className="p-3.5 text-[#234c47] dark:text-slate-300">{a.date} at {a.time}</td>
                      <td className="p-3.5 text-[#4d7872]">{a.type}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#e6f5f2] dark:bg-slate-800 text-[#234c47] dark:text-slate-300">
                          {a.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => setSelectedAppointmentDetails(a)}
                          className="text-[#36615b] hover:text-[#132e2b] dark:text-slate-300 font-medium"
                        >
                          Details
                        </button>
                        {a.status !== 'CANCELLED' && a.status !== 'COMPLETED' && (
                          <>
                            <button
                              onClick={() => {
                                setReschedulingAppointment(a);
                                setReschedDate(a.date);
                              }}
                              className="text-[#0c756e] hover:text-teal-900 dark:text-teal-400 font-medium"
                            >
                              Reschedule
                            </button>
                            <button
                              onClick={() => handleCancelAppointment(a)}
                              className="text-red-600 hover:text-red-800 font-medium"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. HEALTH RECORDS */}
      {activeTab === 'records' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h1 className="text-lg font-semibold text-[#132e2b] dark:text-white">Health Records</h1>
              <p className="text-xs text-[#4d7872]">Diagnostic reports, discharge documents, and prescriptions.</p>
            </div>
            <button
              onClick={() => setIsUploadRecordOpen(true)}
              className="px-3.5 py-1.5 bg-[#0c756e] hover:bg-[#095e58] text-white rounded-lg text-xs font-medium flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Upload Document</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {records
              .filter(r => recordCategoryFilter === 'ALL' || r.category.toLowerCase().includes(recordCategoryFilter.toLowerCase()))
              .map((r) => (
                <div key={r.id} className="bg-white dark:bg-[#0c756e] p-4 rounded-xl border border-[#d6ebe7] dark:border-slate-800 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#e6f5f2] dark:bg-slate-800 text-[#36615b] dark:text-[#6b9690] font-medium">
                      {r.category}
                    </span>
                    <h3 className="font-semibold text-sm text-[#132e2b] dark:text-white mt-2">{r.title}</h3>
                    <p className="text-xs text-[#6b9690] mt-0.5">{r.date} · {r.facility}</p>
                    <p className="text-xs text-[#36615b] dark:text-[#6b9690] mt-2 line-clamp-2 leading-relaxed">{r.summary}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#eef6f5] dark:border-slate-800 flex gap-2">
                    <button
                      onClick={() => setSelectedRecord(r)}
                      className="flex-1 py-1.5 text-xs font-medium bg-[#e6f5f2] hover:bg-[#d8efe9] dark:bg-slate-800 text-[#234c47] dark:text-slate-200 rounded-lg"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => {
                        const text = `CAREPLUS CLINICAL DOCUMENT\\nTitle: ${r.title}\\nCategory: ${r.category}\\nDate: ${r.date}\\nFacility: ${r.facility}\\nPhysician: ${r.doctor}\\nPatient: ${r.patient}\\n\\nSUMMARY & FINDINGS:\\n${r.summary}`;
                        const blob = new Blob([text], { type: 'text/plain' });
                        const link = document.createElement('a');
                        link.href = URL.createObjectURL(blob);
                        link.download = `${r.title.replace(/\\s+/g, '_')}.txt`;
                        link.click();
                        showToast('Downloaded', `Saved ${r.title}.txt`, 'success');
                      }}
                      className="px-2.5 py-1.5 text-xs font-medium border border-[#d6ebe7] dark:border-slate-700 hover:bg-[#f8fbfb] dark:hover:bg-[#095e58] rounded-lg text-[#36615b]"
                      title="Download text"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteRecord(r.id, r.title)}
                      className="px-2.5 py-1.5 text-xs font-medium hover:bg-red-50 text-red-600 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 5. MEDICINES */}
      {activeTab === 'medicines' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-lg font-semibold text-[#132e2b] dark:text-white">Active Medications</h1>
              <p className="text-xs text-[#4d7872]">Prescription doses and daily adherence checklist.</p>
            </div>
            <button
              onClick={() => {
                setEditingMed(null);
                setMedName('');
                setMedDose('');
                setMedTiming('');
                setIsAddMedOpen(true);
              }}
              className="px-3.5 py-1.5 bg-[#0c756e] hover:bg-[#095e58] text-white rounded-lg text-xs font-medium flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Medicine</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {medicines.map((m) => (
              <div key={m.id} className="bg-white dark:bg-[#0c756e] p-4 rounded-xl border border-[#d6ebe7] dark:border-slate-800 flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-medium text-[#6b9690] uppercase">{m.frequency}</span>
                    <h3 className="font-semibold text-sm text-[#132e2b] dark:text-white mt-1">{m.name} {m.dosage}</h3>
                    <p className="text-xs text-[#4d7872] mt-0.5">{m.timing}</p>
                  </div>
                  <button
                    onClick={() => toggleMedTaken(m.id)}
                    className={`text-xs font-medium px-2.5 py-1 rounded transition ${
                      m.takenToday
                        ? 'bg-[#e6f5f2] text-[#0c756e] dark:bg-teal-950 dark:text-teal-300'
                        : 'bg-[#e6f5f2] text-[#36615b] hover:bg-[#d8efe9] dark:bg-slate-800'
                    }`}
                  >
                    {m.takenToday ? '✓ Taken' : 'Mark done'}
                  </button>
                </div>

                <div className="flex justify-end gap-2 mt-3 pt-2.5 border-t border-[#eef6f5] dark:border-slate-800 text-xs">
                  <button
                    onClick={() => {
                      setEditingMed(m);
                      setMedName(m.name);
                      setMedDose(m.dosage);
                      setMedTiming(m.timing);
                      setMedFreq(m.frequency);
                      setIsAddMedOpen(true);
                    }}
                    className="text-[#36615b] hover:text-[#132e2b] dark:text-slate-300 font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteMedicine(m.id, m.name)}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. LAB TESTS */}
      {activeTab === 'labs' && (
        <div className="space-y-4">
          <div>
            <h1 className="text-lg font-semibold text-[#132e2b] dark:text-white">Diagnostic Lab Tests</h1>
            <p className="text-xs text-[#4d7872]">Certified clinical pathology panels and health checks.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {labCatalog.map((t) => (
              <div key={t.id} className="bg-white dark:bg-[#0c756e] p-4 rounded-xl border border-[#d6ebe7] dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-[#6b9690] uppercase font-medium">{t.category}</span>
                  <h3 className="font-semibold text-sm text-[#132e2b] dark:text-white mt-1">{t.name}</h3>
                  <p className="text-xs text-[#4d7872] mt-1 line-clamp-2">{t.description}</p>
                  <div className="mt-3 text-xs font-semibold text-[#132e2b] dark:text-white">₹{t.price}</div>
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setSelectedLabTestDetails(t)}
                    className="flex-1 py-1.5 text-xs font-medium bg-[#e6f5f2] hover:bg-[#d8efe9] dark:bg-slate-800 rounded-lg text-[#234c47] dark:text-slate-200"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => setBookingLabTest(t)}
                    className="flex-1 py-1.5 bg-[#0c756e] hover:bg-[#095e58] text-white font-medium text-xs rounded-lg"
                  >
                    Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. VITALS TRACKING */}
      {activeTab === 'tracking' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-lg font-semibold text-[#132e2b] dark:text-white">Vitals Tracking</h1>
              <p className="text-xs text-[#4d7872]">Longitudinal biometrics, blood pressure, and glucose history.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportVitalsCsv}
                className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-[#0c756e] border border-[#d6ebe7] dark:border-slate-700 rounded-lg hover:bg-[#f8fbfb]"
              >
                Export CSV
              </button>
              <button
                onClick={() => setIsAddVitalOpen(true)}
                className="px-3 py-1.5 text-xs font-medium bg-[#0c756e] hover:bg-[#095e58] text-white rounded-lg"
              >
                + Log Reading
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0c756e] rounded-xl border border-[#d6ebe7] dark:border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fbfb] dark:bg-slate-800/50 text-[#4d7872] font-medium uppercase text-[11px] border-b border-[#d6ebe7] dark:border-slate-800">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Metric</th>
                  <th className="p-3">Value</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Notes</th>
                  <th className="p-3 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-normal">
                {vitalsList.map((v) => (
                  <tr key={v.id} className="hover:bg-[#f8fbfb]/50 dark:hover:bg-[#095e58]/40">
                    <td className="p-3 text-[#4d7872]">{v.date}</td>
                    <td className="p-3 font-medium text-[#132e2b] dark:text-white">{v.metric}</td>
                    <td className="p-3 font-semibold text-[#132e2b] dark:text-white">{v.value} {v.unit}</td>
                    <td className="p-3 text-[#4d7872]">{v.status}</td>
                    <td className="p-3 text-[#6b9690]">{v.notes}</td>
                    <td className="p-3 text-right">
                      <button onClick={() => handleDeleteVital(v.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. ARTICLES */}
      {activeTab === 'articles' && (
        <div className="space-y-4">
          <div>
            <h1 className="text-lg font-semibold text-[#132e2b] dark:text-white">Health Articles</h1>
            <p className="text-xs text-[#4d7872]">Clinical guides authored by licensed physicians.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {articles.map((art) => (
              <div key={art.id} className="bg-white dark:bg-[#0c756e] rounded-xl border border-[#d6ebe7] dark:border-slate-800 overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="h-40 overflow-hidden">
                    <img src={art.image} alt={art.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4">
                    <span className="text-[10px] text-[#6b9690]">{art.category} · {art.author}</span>
                    <h3 className="font-semibold text-sm text-[#132e2b] dark:text-white mt-1">{art.title}</h3>
                    <p className="text-xs text-[#4d7872] mt-1 line-clamp-2 leading-relaxed">{art.summary}</p>
                  </div>
                </div>

                <div className="p-4 pt-0 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedArticle(art)}
                    className="flex-1 py-1.5 bg-[#0c756e] hover:bg-[#095e58] text-white font-medium text-xs rounded-lg transition"
                  >
                    Read Article
                  </button>
                  <button
                    onClick={() => {
                      setBookmarkedArticles(prev => ({ ...prev, [art.id]: !prev[art.id] }));
                      showToast(bookmarkedArticles[art.id] ? 'Bookmark Removed' : 'Saved to Bookmarks', art.title, 'info');
                    }}
                    className={`p-1.5 rounded-lg border text-xs ${
                      bookmarkedArticles[art.id] ? 'border-teal-400 text-[#0c756e] bg-[#e6f5f2]' : 'border-[#d6ebe7] text-[#6b9690]'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. EMERGENCY - Clean, Human */}
      {activeTab === 'emergency' && (
        <div className="space-y-4 max-w-xl">
          <div>
            <h1 className="text-lg font-semibold text-[#132e2b] dark:text-white">Emergency Contacts</h1>
            <p className="text-xs text-[#4d7872]">24/7 direct hotlines and medical summary card.</p>
          </div>

          <div className="space-y-3">
            <a href="tel:108" className="p-4 bg-white dark:bg-[#0c756e] rounded-xl border border-[#d6ebe7] dark:border-slate-800 flex items-center justify-between hover:bg-[#f8fbfb] transition block">
              <div>
                <div className="text-xs text-[#4d7872]">National Emergency Response</div>
                <div className="text-lg font-semibold text-[#132e2b] dark:text-white">108 (Ambulance)</div>
              </div>
              <span className="text-xs font-medium text-[#0c756e]">Tap to call</span>
            </a>

            <a href="tel:102" className="p-4 bg-white dark:bg-[#0c756e] rounded-xl border border-[#d6ebe7] dark:border-slate-800 flex items-center justify-between hover:bg-[#f8fbfb] transition block">
              <div>
                <div className="text-xs text-[#4d7872]">Maternity & Pediatric Transport</div>
                <div className="text-lg font-semibold text-[#132e2b] dark:text-white">102 (Free Helpline)</div>
              </div>
              <span className="text-xs font-medium text-[#0c756e]">Tap to call</span>
            </a>

            <div className="p-4 bg-white dark:bg-[#0c756e] rounded-xl border border-[#d6ebe7] dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs text-[#4d7872]">CarePlus Trauma Desk</div>
                <div className="text-base font-semibold text-[#132e2b] dark:text-white">+91 80 2345 6789</div>
              </div>
              <button
                onClick={downloadEmergencyCard}
                className="px-3 py-1.5 bg-[#0c756e] text-white rounded-lg text-xs font-medium"
              >
                Download Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. PROFILE */}
      {activeTab === 'profile' && (
        <div className="space-y-4 max-w-xl">
          <div>
            <h1 className="text-lg font-semibold text-[#132e2b] dark:text-white">Patient Profile</h1>
            <p className="text-xs text-[#4d7872]">Manage contact information and avatar photo.</p>
          </div>

          <div className="bg-white dark:bg-[#0c756e] p-5 rounded-xl border border-[#d6ebe7] dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-[#eef6f5] dark:border-slate-800">
              <div className="w-14 h-14 rounded-full border border-[#d6ebe7] dark:border-slate-700 bg-[#e6f5f2] text-[#234c47] flex items-center justify-center font-semibold text-base overflow-hidden">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{user?.name ? user.name.split(' ').map(n=>n[0]).join('').toUpperCase() : 'VB'}</span>
                )}
              </div>
              <div>
                <div className="text-xs font-medium text-[#132e2b] dark:text-white">Profile Photo</div>
                <div className="flex gap-2 mt-2">
                  <label className="px-3 py-1 bg-[#0c756e] hover:bg-[#095e58] text-white text-xs font-medium rounded-md cursor-pointer transition">
                    Upload Photo
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  </label>
                  <button
                    onClick={handleRemovePhoto}
                    className="px-3 py-1 bg-[#e6f5f2] hover:bg-[#d8efe9] text-[#234c47] text-xs font-medium rounded-md transition"
                  >
                    Remove Photo
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#4d7872] font-medium">Full Name</label>
                <input value={profileName} onChange={(e) => setProfileName(e.target.value)} className="w-full p-2 rounded-lg border mt-1 font-medium" />
              </div>
              <div>
                <label className="text-[#4d7872] font-medium">Phone Number</label>
                <input value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} className="w-full p-2 rounded-lg border mt-1 font-medium" />
              </div>
              <div>
                <label className="text-[#4d7872] font-medium">Residential Address</label>
                <input value={profileAddress} onChange={(e) => setProfileAddress(e.target.value)} className="w-full p-2 rounded-lg border mt-1 font-medium" />
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              className="px-4 py-1.5 bg-[#0c756e] hover:bg-[#095e58] text-white rounded-lg text-xs font-medium transition"
            >
              Save Profile
            </button>
          </div>
        </div>
      )}

      {/* 11. SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-4 max-w-xl">
          <div>
            <h1 className="text-lg font-semibold text-[#132e2b] dark:text-white">Settings & Data</h1>
            <p className="text-xs text-[#4d7872]">Data export and local session preferences.</p>
          </div>

          <div className="bg-white dark:bg-[#0c756e] p-5 rounded-xl border border-[#d6ebe7] dark:border-slate-800 space-y-4">
            <div>
              <h4 className="text-xs font-semibold text-[#132e2b] dark:text-white">Export Health Archive</h4>
              <p className="text-xs text-[#4d7872] mt-0.5">Download complete JSON archive of all your clinical records.</p>
              <button
                onClick={() => {
                  const backup = { patient: user, appointments, records, medicines, vitals: vitalsList, exportedAt: new Date().toISOString() };
                  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
                  const link = document.createElement('a');
                  link.href = URL.createObjectURL(blob);
                  link.download = 'CarePlus_Archive.json';
                  link.click();
                  showToast('Downloaded', 'JSON archive downloaded.', 'success');
                }}
                className="mt-2.5 px-3 py-1.5 bg-[#0c756e] hover:bg-[#095e58] text-white text-xs font-medium rounded-lg"
              >
                Export JSON Archive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SIMPLE CLEAN MODALS */}
      {/* ------------------------------------------------------------- */}

      {/* Doctor Profile Modal (Doctor A vs Doctor B) */}
      <Modal
        isOpen={!!selectedDoctorProfile}
        onClose={() => setSelectedDoctorProfile(null)}
        title={selectedDoctorProfile?.name || 'Physician Profile'}
      >
        <div className="space-y-3 text-xs">
          <div className="flex items-center gap-3 p-3 bg-[#f8fbfb] dark:bg-slate-800 rounded-lg">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-[#d6ebe7] dark:border-slate-700 shrink-0 bg-[#e6f5f2] flex items-center justify-center font-medium text-sm">
              {selectedDoctorProfile?.photo ? (
                <img src={selectedDoctorProfile.photo} alt="Doctor" className="w-full h-full object-cover" />
              ) : (
                <span>{selectedDoctorProfile?.name.replace('Dr. ', '').split(' ').map(n=>n[0]).join('')}</span>
              )}
            </div>
            <div>
              <div className="text-sm font-semibold text-[#132e2b] dark:text-white">{selectedDoctorProfile?.name}</div>
              <div className="text-[#0c756e] dark:text-teal-400 font-medium">{selectedDoctorProfile?.specialty}</div>
              <div className="text-[#6b9690] text-[11px]">{selectedDoctorProfile?.department} · {selectedDoctorProfile?.hospital}</div>
            </div>
          </div>

          <div>
            <div className="text-[#4d7872] font-medium text-[11px]">Clinical Bio</div>
            <p className="text-[#36615b] dark:text-[#6b9690] mt-1 leading-relaxed">{selectedDoctorProfile?.bio}</p>
          </div>

          <div className="flex justify-between items-center py-2 border-t text-xs">
            <span className="text-[#4d7872]">Consultation Fee</span>
            <span className="font-semibold text-[#132e2b] dark:text-white">₹{selectedDoctorProfile?.fee}</span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setSelectedDoctorProfile(null)} className="px-3 py-1.5 text-[#4d7872] hover:bg-[#e6f5f2] rounded-lg">Close</button>
            <button
              onClick={() => {
                setBookingDoctor(selectedDoctorProfile);
                setSelectedDoctorProfile(null);
              }}
              className="px-4 py-1.5 bg-[#0c756e] hover:bg-[#095e58] text-white rounded-lg font-medium"
            >
              Book Appointment
            </button>
          </div>
        </div>
      </Modal>

      {/* Appointment Details Modal */}
      <Modal
        isOpen={!!selectedAppointmentDetails}
        onClose={() => setSelectedAppointmentDetails(null)}
        title={`Appointment Details - ${selectedAppointmentDetails?.appointmentCode}`}
      >
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3 p-3 bg-[#f8fbfb] dark:bg-slate-800 rounded-lg">
            <div>
              <span className="text-[10px] text-[#6b9690] uppercase">Doctor</span>
              <div className="font-medium text-[#132e2b] dark:text-white">{selectedAppointmentDetails?.doctor}</div>
              <div className="text-[#4d7872]">{selectedAppointmentDetails?.specialty}</div>
            </div>
            <div>
              <span className="text-[10px] text-[#6b9690] uppercase">Scheduled Time</span>
              <div className="font-medium text-[#132e2b] dark:text-white">{selectedAppointmentDetails?.date}</div>
              <div className="text-[#4d7872]">{selectedAppointmentDetails?.time} ({selectedAppointmentDetails?.type})</div>
            </div>
          </div>

          {selectedAppointmentDetails?.reason && (
            <div>
              <span className="text-[10px] text-[#6b9690] uppercase">Reason</span>
              <p className="text-[#36615b] dark:text-[#6b9690] mt-1">{selectedAppointmentDetails.reason}</p>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button onClick={() => setSelectedAppointmentDetails(null)} className="px-4 py-1.5 bg-[#0c756e] text-white rounded-lg font-medium">
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        isOpen={!!reschedulingAppointment}
        onClose={() => setReschedulingAppointment(null)}
        title="Reschedule Appointment"
      >
        <div className="space-y-3 text-xs">
          <p className="text-[#4d7872]">Rescheduling visit with <strong>{reschedulingAppointment?.doctor}</strong></p>
          <div>
            <label className="text-[#4d7872] font-medium">New Date</label>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={reschedDate}
              onChange={(e) => setReschedDate(e.target.value)}
              className="w-full p-2 rounded-lg border mt-1 font-medium"
            />
          </div>

          <div>
            <label className="text-[#4d7872] font-medium">Available Slot</label>
            <div className="grid grid-cols-3 gap-2 mt-1.5 max-h-32 overflow-y-auto">
              {reschedSlots.map((slot) => (
                <button
                  key={slot.time}
                  disabled={slot.isBooked}
                  onClick={() => setSelectedReschedSlot(slot.time)}
                  className={`p-1.5 rounded-lg text-center font-medium text-xs border transition ${
                    slot.isBooked
                      ? 'bg-[#e6f5f2] text-[#6b9690] border-[#d6ebe7] cursor-not-allowed'
                      : selectedReschedSlot === slot.time
                      ? 'bg-[#0c756e] text-white border-slate-900'
                      : 'bg-white text-[#234c47] hover:border-slate-400 border-[#d6ebe7]'
                  }`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setReschedulingAppointment(null)} className="px-3 py-1.5 text-[#4d7872]">Cancel</button>
            <button onClick={handleConfirmReschedule} className="px-4 py-1.5 bg-[#0c756e] text-white rounded-lg font-medium">
              Confirm
            </button>
          </div>
        </div>
      </Modal>

      {/* Record Preview Modal */}
      <Modal
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        title={selectedRecord?.title || 'Document Details'}
      >
        <div className="space-y-3 text-xs">
          <div className="flex justify-between p-3 bg-[#f8fbfb] dark:bg-slate-800 rounded-lg">
            <div>
              <span className="text-[10px] text-[#6b9690] uppercase">Facility</span>
              <div className="font-medium text-[#132e2b] dark:text-white">{selectedRecord?.facility}</div>
            </div>
            <div>
              <span className="text-[10px] text-[#6b9690] uppercase">Date</span>
              <div className="font-medium text-[#132e2b] dark:text-white">{selectedRecord?.date}</div>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-[#6b9690] uppercase">Clinical Observations</span>
            <p className="text-[#36615b] dark:text-[#6b9690] mt-1 leading-relaxed">{selectedRecord?.summary}</p>
          </div>

          <div className="flex justify-end pt-2">
            <button onClick={() => setSelectedRecord(null)} className="px-4 py-1.5 bg-[#0c756e] text-white rounded-lg font-medium">
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Upload Record Modal */}
      <Modal
        isOpen={isUploadRecordOpen}
        onClose={() => setIsUploadRecordOpen(false)}
        title="Upload Clinical Record"
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="text-[#4d7872] font-medium">Document Title</label>
            <input
              placeholder="e.g. Annual Blood Panel"
              value={newRecordTitle}
              onChange={(e) => setNewRecordTitle(e.target.value)}
              className="w-full p-2 rounded-lg border mt-1 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[#4d7872] font-medium">Category</label>
              <select
                value={newRecordCategory}
                onChange={(e) => setNewRecordCategory(e.target.value)}
                className="w-full p-2 rounded-lg border mt-1 font-medium"
              >
                <option value="Lab Report">Lab Report</option>
                <option value="Prescription">Prescription</option>
                <option value="Radiology">Radiology</option>
                <option value="Discharge Summary">Discharge Summary</option>
              </select>
            </div>
            <div>
              <label className="text-[#4d7872] font-medium">Facility</label>
              <input
                value={newRecordFacility}
                onChange={(e) => setNewRecordFacility(e.target.value)}
                className="w-full p-2 rounded-lg border mt-1 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-[#4d7872] font-medium">Summary & Findings</label>
            <textarea
              rows={3}
              value={newRecordSummary}
              onChange={(e) => setNewRecordSummary(e.target.value)}
              className="w-full p-2 rounded-lg border mt-1 font-medium"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setIsUploadRecordOpen(false)} className="px-3 py-1.5 text-[#4d7872]">Cancel</button>
            <button onClick={handleUploadRecord} className="px-4 py-1.5 bg-[#0c756e] text-white rounded-lg font-medium">
              Save Record
            </button>
          </div>
        </div>
      </Modal>

      {/* Add / Edit Medicine Modal */}
      <Modal
        isOpen={isAddMedOpen}
        onClose={() => setIsAddMedOpen(false)}
        title={editingMed ? 'Edit Medication' : 'Add Medication'}
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="text-[#4d7872] font-medium">Medicine Name</label>
            <input
              placeholder="e.g. Rosuvastatin"
              value={medName}
              onChange={(e) => setMedName(e.target.value)}
              className="w-full p-2 rounded-lg border mt-1 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[#4d7872] font-medium">Dosage</label>
              <input
                placeholder="e.g. 10mg"
                value={medDose}
                onChange={(e) => setMedDose(e.target.value)}
                className="w-full p-2 rounded-lg border mt-1 font-medium"
              />
            </div>
            <div>
              <label className="text-[#4d7872] font-medium">Timing</label>
              <input
                placeholder="e.g. After dinner"
                value={medTiming}
                onChange={(e) => setMedTiming(e.target.value)}
                className="w-full p-2 rounded-lg border mt-1 font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setIsAddMedOpen(false)} className="px-3 py-1.5 text-[#4d7872]">Cancel</button>
            <button onClick={handleSaveMedicine} className="px-4 py-1.5 bg-[#0c756e] text-white rounded-lg font-medium">
              Save
            </button>
          </div>
        </div>
      </Modal>

      {/* Log Vital Modal */}
      <Modal
        isOpen={isAddVitalOpen}
        onClose={() => setIsAddVitalOpen(false)}
        title="Log Vital Reading"
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="text-[#4d7872] font-medium">Metric Indicator</label>
            <select
              value={vitalMetric}
              onChange={(e) => setVitalMetric(e.target.value)}
              className="w-full p-2 rounded-lg border mt-1 font-medium"
            >
              <option value="Blood Pressure">Blood Pressure (mmHg)</option>
              <option value="Heart Rate">Heart Rate (BPM)</option>
              <option value="Fasting Glucose">Fasting Glucose (mg/dL)</option>
              <option value="Body Weight">Body Weight (kg)</option>
            </select>
          </div>

          <div>
            <label className="text-[#4d7872] font-medium">Value</label>
            <input
              placeholder="e.g. 120/80 or 72"
              value={vitalValue}
              onChange={(e) => setVitalValue(e.target.value)}
              className="w-full p-2 rounded-lg border mt-1 font-medium"
            />
          </div>

          <div>
            <label className="text-[#4d7872] font-medium">Notes</label>
            <input
              placeholder="e.g. Resting check"
              value={vitalNotes}
              onChange={(e) => setVitalNotes(e.target.value)}
              className="w-full p-2 rounded-lg border mt-1 font-medium"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setIsAddVitalOpen(false)} className="px-3 py-1.5 text-[#4d7872]">Cancel</button>
            <button onClick={handleSaveVital} className="px-4 py-1.5 bg-[#0c756e] text-white rounded-lg font-medium">
              Save
            </button>
          </div>
        </div>
      </Modal>

      {/* Article Reader Modal */}
      <Modal
        isOpen={!!selectedArticle}
        onClose={() => setSelectedArticle(null)}
        title={selectedArticle?.title || 'Health Article'}
      >
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between text-[#6b9690] pb-2 border-b">
            <span>By {selectedArticle?.author}</span>
            <span>{selectedArticle?.readTime}</span>
          </div>

          <p className="text-[#234c47] dark:text-slate-300 leading-relaxed text-sm">
            {selectedArticle?.fullText}
          </p>

          <div className="p-3 bg-[#f8fbfb] dark:bg-slate-800 rounded-lg border border-[#d6ebe7] dark:border-slate-700">
            <h5 className="font-semibold text-[#132e2b] dark:text-white text-xs mb-1.5">Key Clinical Takeaways:</h5>
            <ul className="space-y-1 list-disc list-inside text-[#36615b] dark:text-slate-300">
              {selectedArticle?.takeaways?.map((t: string, idx: number) => (
                <li key={idx}>{t}</li>
              ))}
            </ul>
          </div>

          <div className="flex justify-end pt-2">
            <button onClick={() => setSelectedArticle(null)} className="px-4 py-1.5 bg-[#0c756e] text-white rounded-lg font-medium">
              Done
            </button>
          </div>
        </div>
      </Modal>

      {/* Booking Doctor Modal */}
      <Modal
        isOpen={!!bookingDoctor}
        onClose={() => setBookingDoctor(null)}
        title={`Book Consultation - ${bookingDoctor?.name}`}
      >
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-[#f8fbfb] dark:bg-slate-800 rounded-lg font-medium text-[#1a3d39] dark:text-white">
            {bookingDoctor?.name} ({bookingDoctor?.specialty}) · ₹{bookingDoctor?.fee}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[#4d7872] font-medium">Date</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full p-2 rounded-lg border mt-1 font-medium"
              />
            </div>
            <div>
              <label className="text-[#4d7872] font-medium">Format</label>
              <select
                value={consultType}
                onChange={(e) => setConsultType(e.target.value)}
                className="w-full p-2 rounded-lg border mt-1 font-medium"
              >
                <option value="In-person">In-person Visit</option>
                <option value="Video">Video Teleconsult</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[#4d7872] font-medium">Available Slot</label>
            <div className="grid grid-cols-3 gap-2 mt-1.5 max-h-32 overflow-y-auto">
              {bookingSlots.map((slot) => (
                <button
                  key={slot.time}
                  disabled={slot.isBooked}
                  onClick={() => setSelectedSlot(slot.time)}
                  className={`p-1.5 rounded-lg text-center font-medium text-xs border transition ${
                    slot.isBooked
                      ? 'bg-[#e6f5f2] text-[#6b9690] border-[#d6ebe7] cursor-not-allowed'
                      : selectedSlot === slot.time
                      ? 'bg-[#0c756e] text-white border-slate-900'
                      : 'bg-white text-[#234c47] hover:border-slate-400 border-[#d6ebe7]'
                  }`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[#4d7872] font-medium">Symptoms / Reason</label>
            <input
              value={bookingReason}
              onChange={(e) => setBookingReason(e.target.value)}
              placeholder="Brief checkup reason..."
              className="w-full p-2 rounded-lg border mt-1 font-medium"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setBookingDoctor(null)} className="px-3 py-1.5 text-[#4d7872]">Cancel</button>
            <button onClick={handleConfirmBooking} className="px-4 py-1.5 bg-[#0c756e] hover:bg-[#095e58] text-white rounded-lg font-medium">
              Confirm Booking
            </button>
          </div>
        </div>
      </Modal>

      {/* Lab Details Modal */}
      <Modal
        isOpen={!!selectedLabTestDetails}
        onClose={() => setSelectedLabTestDetails(null)}
        title={selectedLabTestDetails?.name || 'Test Details'}
      >
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-[#f8fbfb] dark:bg-slate-800 rounded-lg">
            <div className="text-[10px] text-[#6b9690] uppercase">Category</div>
            <div className="font-semibold text-[#132e2b] dark:text-white">{selectedLabTestDetails?.category}</div>
          </div>
          <p className="text-[#36615b] dark:text-[#6b9690] leading-relaxed">{selectedLabTestDetails?.description}</p>
          <div className="text-xs font-semibold text-[#132e2b] dark:text-white">Fee: ₹{selectedLabTestDetails?.price}</div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setSelectedLabTestDetails(null)} className="px-3 py-1.5 text-[#4d7872]">Close</button>
            <button
              onClick={() => {
                setBookingLabTest(selectedLabTestDetails);
                setSelectedLabTestDetails(null);
              }}
              className="px-4 py-1.5 bg-[#0c756e] text-white rounded-lg font-medium"
            >
              Book Test
            </button>
          </div>
        </div>
      </Modal>

      {/* Book Lab Test Modal */}
      <Modal
        isOpen={!!bookingLabTest}
        onClose={() => setBookingLabTest(null)}
        title={`Book Test - ${bookingLabTest?.name}`}
      >
        <div className="space-y-3 text-xs">
          <p className="text-[#4d7872]">Test: <strong>{bookingLabTest?.name}</strong> · Fee: ₹{bookingLabTest?.price}</p>
          <div>
            <label className="text-[#4d7872] font-medium">Collection Mode</label>
            <select className="w-full p-2 rounded-lg border mt-1 font-medium">
              <option value="Home Collection">Home Sample Collection</option>
              <option value="Hospital Walk-in">Hospital Laboratory Visit</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setBookingLabTest(null)} className="px-3 py-1.5 text-[#4d7872]">Cancel</button>
            <button
              onClick={async () => {
                try {
                  const res = await fetch('/api/labs/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ testId: bookingLabTest.id, sampleMode: 'Home Collection' })
                  });
                  const data = await res.json();
                  if (data.success) {
                    showToast('Booked', `Order placed for ${bookingLabTest.name}.`, 'success');
                    setBookingLabTest(null);
                    loadData();
                  }
                } catch (err: any) {
                  showToast('Error', err.message, 'alert');
                }
              }}
              className="px-4 py-1.5 bg-[#0c756e] text-white rounded-lg font-medium"
            >
              Confirm Order
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
