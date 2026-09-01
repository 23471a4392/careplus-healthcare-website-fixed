import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useSocket } from '../../context/SocketContext.tsx';
import { Doctor, Appointment, MedicalRecordItem, LabOrder } from '../../types/index.ts';
import { Modal } from '../../components/Modal.tsx';
import {
  Calendar,
  Clock,
  MapPin,
  Search,
  Filter,
  Download,
  Plus,
  CheckCircle,
  FileText,
  Activity,
  PhoneCall,
  User,
  Settings,
  Pill,
  BookOpen,
  ArrowRight,
  Eye,
  Trash2,
  Edit3,
  Bookmark,
  Share2,
  AlertTriangle,
  Heart,
  Check,
  X
} from 'lucide-react';

interface PatientPortalProps {
  activeTab: string;
  onNavigateTab: (tab: string) => void;
}

export const PatientPortal: React.FC<PatientPortalProps> = ({ activeTab, onNavigateTab }) => {
  const { user, token, updateUserAvatar } = useAuth();
  const { showToast } = useSocket();

  // Core Data
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<MedicalRecordItem[]>([]);
  const [labCatalog, setLabCatalog] = useState<any[]>([]);
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);

  // Search & Filter States
  const [searchDoc, setSearchDoc] = useState('');
  const [selectedSpec, setSelectedSpec] = useState('');
  const [appointmentFilter, setAppointmentFilter] = useState('ALL');
  const [recordCategoryFilter, setRecordCategoryFilter] = useState('ALL');
  const [recordSearch, setRecordSearch] = useState('');

  // Modals & Details State (Specific entity for each modal!)
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

  // Record Upload Form State
  const [newRecordTitle, setNewRecordTitle] = useState('');
  const [newRecordCategory, setNewRecordCategory] = useState('Lab Report');
  const [newRecordFacility, setNewRecordFacility] = useState('CarePlus Diagnostics');
  const [newRecordSummary, setNewRecordSummary] = useState('');

  // Medicines Management State (Real CRUD)
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
  const [medFreq, setMedFreq] = useState('Daily');

  // Health Tracking Vitals State (Real CRUD)
  const [vitalsList, setVitalsList] = useState([
    { id: 'v-1', date: '2026-08-30 08:30 AM', metric: 'Blood Pressure', value: '118/76', unit: 'mmHg', status: 'NORMAL', notes: 'Resting morning check' },
    { id: 'v-2', date: '2026-08-29 07:15 AM', metric: 'Fasting Glucose', value: '92', unit: 'mg/dL', status: 'OPTIMAL', notes: 'Fasting 10 hours' },
    { id: 'v-3', date: '2026-08-28 06:45 PM', metric: 'Heart Rate', value: '72', unit: 'BPM', status: 'OPTIMAL', notes: 'Post-walk resting' },
    { id: 'v-4', date: '2026-08-27 08:00 AM', metric: 'Body Weight', value: '68.4', unit: 'kg', status: 'TARGET', notes: 'Morning weigh-in' }
  ]);
  const [isAddVitalOpen, setIsAddVitalOpen] = useState(false);
  const [vitalMetric, setVitalMetric] = useState('Blood Pressure');
  const [vitalValue, setVitalValue] = useState('');
  const [vitalNotes, setVitalNotes] = useState('');

  // Health Articles State
  const [bookmarkedArticles, setBookmarkedArticles] = useState<Record<string, boolean>>({});
  const articles = [
    {
      id: 'art-1',
      title: 'Evidence-Based Cardiovascular Health: Managing Lipid Profiles',
      author: 'Dr. Arjun Rao, MD (Cardiology)',
      category: 'Cardiology',
      readTime: '4 min read',
      image: '/assets/images/articles/heart_health.jpg',
      summary: 'Clinical guidelines on interpreting ApoB, LDL particle count, and early dietary interventions for arterial plaque prevention.',
      fullText: 'Cardiovascular wellness begins with comprehensive hemodynamic and biochemical tracking. While standard lipid panels report total LDL cholesterol, modern cardiology places significant emphasis on Apolipoprotein B (ApoB) and Non-HDL cholesterol as direct markers of atherogenic particles. Implementing dietary adjustments rich in soluble fiber (psyllium husk, oats, legumes) combined with aerobic conditioning at Zone 2 intensity (60-70% maximum heart rate) provides measurable endothelial protection.',
      takeaways: [
        'ApoB and Non-HDL cholesterol correlate more accurately with plaque burden than standard LDL alone.',
        'Target 150 minutes of weekly Zone 2 cardiovascular exercise to optimize vascular compliance.',
        'Soluble dietary fiber binds intestinal bile acids to assist in hepatic LDL clearance.'
      ]
    },
    {
      id: 'art-2',
      title: 'Circadian Biology & Sleep Architecture for Endocrine Balance',
      author: 'Dr. Rahul Mehta, MD (Neurology)',
      category: 'Neurology',
      readTime: '5 min read',
      image: '/assets/images/articles/sleep.jpg',
      summary: 'How sleep staging directly modulates cortisol, human growth hormone, and neurocognitive performance.',
      fullText: 'Sleep architecture comprises cyclic oscillations between Non-Rapid Eye Movement (NREM Stages 1-3) and Rapid Eye Movement (REM) sleep. Slow-Wave Sleep (Stage 3 NREM) is the critical window where cerebral glymphatic clearance removes metabolic byproducts, including amyloid proteins. Disruptions in nocturnal circadian alignment induce morning cortisol spikes and insulin resistance.',
      takeaways: [
        'Maintain a consistent wake time (within 30 minutes) 7 days a week to stabilize retinal suprachiasmatic input.',
        'Cease blue-spectrum optical exposure 90 minutes before bedtime to encourage endogenous melatonin synthesis.',
        'A bedroom ambient temperature between 18°C and 20°C facilitates nocturnal core body temperature drop.'
      ]
    },
    {
      id: 'art-3',
      title: 'Clinical Nutrition: Glycemic Index vs. Glycemic Load in Metabolic Health',
      author: 'Dr. Priya Sharma, MD (Endocrinology)',
      category: 'Nutrition',
      readTime: '6 min read',
      image: '/assets/images/articles/nutrition.jpg',
      summary: 'A physiological guide to minimizing postprandial glucose excursions and optimizing insulin sensitivity.',
      fullText: 'Metabolic health depends on stabilizing glycemic variability. Carbohydrates that digest rapidly into glucose generate postprandial glycemic spikes, triggering hyperinsulinemia. By pairing carbohydrate sources with healthy lipids and protein matrices, gastric emptying is prolonged, dampening the glycemic curve and preventing reactive hypoglycemia.',
      takeaways: [
        'Consume fiber and protein before simple carbohydrates during meals to flatten postprandial glucose excursions.',
        'Incorporate resistance training to increase GLUT4 receptor density in skeletal muscle without requiring insulin.',
        'Maintain fasting blood glucose consistently under 99 mg/dL.'
      ]
    },
    {
      id: 'art-4',
      title: 'Progressive Overload and Musculoskeletal Longevity',
      author: 'Dr. Rajesh Nambiar, MS (Orthopedics)',
      category: 'Orthopedics',
      readTime: '4 min read',
      image: '/assets/images/articles/fitness.jpg',
      summary: 'Preventing sarcopenia and preserving bone mineral density through calibrated resistance protocols.',
      fullText: 'Age-related loss of skeletal muscle mass and functional strength (sarcopenia) accelerates after the fourth decade. Progressive axial loading through compound movements (squats, hinges, presses) exerts mechanical strain on cortical bone, prompting osteoblastic bone deposition and preventing osteopenia.',
      takeaways: [
        'Engage in resistance training at least two to three times per week targeting all major muscle groups.',
        'Ensure daily protein intake is distributed evenly across meals (1.2 to 1.6 grams per kilogram of body weight).',
        'Prioritize multi-joint functional movements to maintain joint mobility and proprioception.'
      ]
    },
    {
      id: 'art-5',
      title: 'Cognitive Stress Reduction and Autonomic Regulation',
      author: 'Dr. Meera Iyer, MD (Psychiatry)',
      category: 'Mental Health',
      readTime: '5 min read',
      image: '/assets/images/articles/mental_health.jpg',
      summary: 'Neurobiological mechanisms of down-regulating sympathetic arousal through vagal nerve stimulation.',
      fullText: 'Chronic psychological stressors provoke persistent activation of the sympathetic nervous system, elevated catecholamines, and subclinical vascular inflammation. Intentional parasympathetic engagement—such as diaphragmatic breathing with extended expirations (the physiological sigh)—stimulates the vagus nerve and lowers resting heart rate variability.',
      takeaways: [
        'Perform 5 minutes of cyclic physiological sighing (two inhales through the nose, long exhale through the mouth) during acute stress.',
        'Schedule daily restorative non-screen periods to down-regulate sensory overstimulation.',
        'Establish firm boundaries around work notifications after 7:00 PM.'
      ]
    }
  ];

  // Profile Form State
  const [profileName, setProfileName] = useState(user?.name || 'Vaseem Basha');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '+91 98765 43210');
  const [profileAddress, setProfileAddress] = useState('Indiranagar 100ft Rd, Bengaluru, Karnataka 560038');

  // Load backend data
  const loadData = async () => {
    try {
      const [resDoc, resApt, resRec, resLabCat, resLabOrd] = await Promise.all([
        fetch('/api/doctors').then(r => r.json()),
        fetch('/api/appointments', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch('/api/clinical/records', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch('/api/labs/catalog').then(r => r.json()),
        fetch('/api/labs/orders', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
      ]);

      if (resDoc.success) setDoctors(resDoc.doctors);
      if (resApt.success) setAppointments(resApt.appointments);
      if (resRec.success) setRecords(resRec.records);
      if (resLabCat.success) setLabCatalog(resLabCat.tests);
      if (resLabOrd.success) setLabOrders(resLabOrd.orders);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };

  useEffect(() => {
    if (token) loadData();
  }, [token]);

  // Dynamic booking slots
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

  // Dynamic reschedule slots
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

  // Handlers
  const handleConfirmBooking = async () => {
    if (!bookingDoctor || !selectedSlot) {
      showToast('Selection Required', 'Please select an available consultation slot.', 'alert');
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
        showToast('Appointment Booked', `Visit scheduled with ${bookingDoctor.name} on ${bookingDate} at ${selectedSlot}`, 'success');
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
        showToast('Appointment Rescheduled', `Moved to ${reschedDate} at ${selectedReschedSlot}`, 'success');
        setReschedulingAppointment(null);
        loadData();
      } else {
        showToast('Reschedule Failed', data.message, 'alert');
      }
    } catch (err: any) {
      showToast('Error', err.message, 'alert');
    }
  };

  const handleCancelAppointment = async (apt: Appointment) => {
    if (!window.confirm(`Are you sure you want to cancel appointment ${apt.appointmentCode} with ${apt.doctor}?`)) return;
    try {
      const res = await fetch(`/api/appointments/${apt.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'CANCELLED' })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Appointment Cancelled', `Appointment ${apt.appointmentCode} has been cancelled.`, 'info');
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
        showToast('Profile Updated', 'Personal information saved to database.', 'success');
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
      showToast('Photo Saved', 'Profile photo updated and saved.', 'success');
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
    showToast('Photo Removed', 'Reverted to default monogram initials.', 'info');
  };

  const handleUploadRecord = async () => {
    if (!newRecordTitle.trim()) {
      showToast('Title Required', 'Please enter a title for this record.', 'alert');
      return;
    }
    try {
      const res = await fetch('/api/clinical/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: newRecordTitle,
          category: newRecordCategory,
          facility: newRecordFacility,
          summary: newRecordSummary || 'Uploaded patient record file.'
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Record Uploaded', `"${newRecordTitle}" added to health records.`, 'success');
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
    if (!window.confirm(`Are you sure you want to delete record "${title}"?`)) return;
    try {
      const res = await fetch(`/api/clinical/records/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast('Record Deleted', `"${title}" removed from medical history.`, 'info');
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
      // Edit specific medicine
      setMedicines(medicines.map(m => m.id === editingMed.id ? { ...m, name: medName, dosage: medDose, timing: medTiming, frequency: medFreq } : m));
      showToast('Medicine Updated', `Saved modifications for ${medName}.`, 'success');
      setEditingMed(null);
    } else {
      // Add new medicine
      const newMed = {
        id: 'med-' + Date.now(),
        name: medName,
        dosage: medDose || '1 unit',
        timing: medTiming || 'As indicated',
        frequency: medFreq,
        status: 'Active',
        takenToday: false
      };
      setMedicines([...medicines, newMed]);
      showToast('Medicine Added', `Added ${medName} to medication schedule.`, 'success');
      setIsAddMedOpen(false);
    }
    setMedName('');
    setMedDose('');
    setMedTiming('');
  };

  const handleDeleteMedicine = (id: string, name: string) => {
    if (!window.confirm(`Remove ${name} from your medicines list?`)) return;
    setMedicines(medicines.filter(m => m.id !== id));
    showToast('Medicine Removed', `${name} removed from your roster.`, 'info');
  };

  const toggleMedTaken = (id: string) => {
    setMedicines(medicines.map(m => m.id === id ? { ...m, takenToday: !m.takenToday } : m));
  };

  // Vitals Handlers
  const handleSaveVital = () => {
    if (!vitalValue.trim()) return;
    const newVital = {
      id: 'v-' + Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      metric: vitalMetric,
      value: vitalValue,
      unit: vitalMetric === 'Blood Pressure' ? 'mmHg' : vitalMetric === 'Heart Rate' ? 'BPM' : vitalMetric === 'Fasting Glucose' ? 'mg/dL' : vitalMetric === 'Body Weight' ? 'kg' : '%',
      status: 'LOGGED',
      notes: vitalNotes || 'Self-logged'
    };
    setVitalsList([newVital, ...vitalsList]);
    showToast('Vital Reading Logged', `Logged ${vitalMetric}: ${vitalValue}`, 'success');
    setIsAddVitalOpen(false);
    setVitalValue('');
    setVitalNotes('');
  };

  const handleDeleteVital = (id: string) => {
    setVitalsList(vitalsList.filter(v => v.id !== id));
    showToast('Log Entry Removed', 'Reading deleted from history.', 'info');
  };

  // CSV Exporters
  const exportAppointmentsCsv = () => {
    const header = 'Appointment ID,Doctor,Specialty,Hospital,Date,Time,Type,Status\\n';
    const rows = appointments.map(a => `"${a.appointmentCode}","${a.doctor}","${a.specialty}","${a.hospital}","${a.date}","${a.time}","${a.type}","${a.status}"`).join('\\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'CarePlus_Appointments_Schedule.csv';
    link.click();
    showToast('Export Complete', 'Appointments schedule downloaded as CSV.', 'success');
  };

  const exportVitalsCsv = () => {
    const header = 'Timestamp,Metric,Value,Unit,Status,Notes\\n';
    const rows = vitalsList.map(v => `"${v.date}","${v.metric}","${v.value}","${v.unit}","${v.status}","${v.notes}"`).join('\\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'CarePlus_Vitals_Telemetry.csv';
    link.click();
    showToast('Export Complete', 'Biometric tracking log downloaded as CSV.', 'success');
  };

  const downloadEmergencyCard = () => {
    const text = `========================================
CAREPLUS EMERGENCY MEDICAL PROFILE CARD
========================================
Full Name: ${user?.name || 'Vaseem Basha'}
Email: ${user?.email || 'patient@careplus.com'}
Phone: ${profilePhone}
Address: ${profileAddress}

CLINICAL DEMOGRAPHICS:
Blood Group: O Positive (O+)
Chronic Diagnoses: Essential Hypertension (Controlled)
Known Allergies: Penicillin, NSAIDs
Current Medications: Atorvastatin 20mg, Vitamin D3 60,000 IU

EMERGENCY HOTLINE CONTACTS:
Ambulance Dispatch: 108 / 102
CarePlus Trauma Center: +91 80 2345 6789
Attending Physician: Dr. Arjun Rao (Cardiology)

Card Generated: ${new Date().toLocaleString()}
========================================`;
    const blob = new Blob([text], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'CarePlus_Emergency_Medical_Card.txt';
    link.click();
    showToast('Card Downloaded', 'Emergency medical card saved to device.', 'success');
  };

  const nextApt = appointments.find(a => a.status === 'CONFIRMED' || a.status === 'PENDING');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* 1. DASHBOARD VIEW */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-slide-up">
          {/* Hero Banner */}
          <div className="bg-[#0c756e] text-white p-8 rounded-2xl shadow-sm border border-teal-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <span className="text-teal-200 text-xs font-extrabold uppercase tracking-wider">Clinical Dashboard</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">Good morning, {user?.firstName}</h1>
              <p className="text-teal-100 text-sm mt-1 max-w-xl">
                Your health vitals are stable. You have {appointments.filter(a => a.status === 'CONFIRMED').length} upcoming appointment and active treatment protocols.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => onNavigateTab('doctors')}
                className="px-4 py-2.5 bg-white text-[#0c756e] hover:bg-teal-50 rounded-xl font-bold text-xs shadow-sm transition"
              >
                + Book Doctor
              </button>
              <button
                onClick={() => onNavigateTab('records')}
                className="px-4 py-2.5 bg-teal-800/80 text-white hover:bg-teal-800 rounded-xl font-bold text-xs border border-teal-600 transition"
              >
                View Records
              </button>
            </div>
          </div>

          {/* Clean Medical Telemetry Cards (NO Artificial Icons) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-extrabold tracking-wider text-slate-400 uppercase">Heart Rate</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">OPTIMAL</span>
              </div>
              <div className="text-2xl font-extrabold text-slate-800 dark:text-white">72 <span className="text-sm font-semibold text-slate-400">BPM</span></div>
              <div className="text-xs text-emerald-600 font-semibold mt-1">Normal Resting Rhythm</div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-extrabold tracking-wider text-slate-400 uppercase">Blood Pressure</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">NORMAL</span>
              </div>
              <div className="text-2xl font-extrabold text-slate-800 dark:text-white">118/76 <span className="text-sm font-semibold text-slate-400">mmHg</span></div>
              <div className="text-xs text-emerald-600 font-semibold mt-1">Optimal Hemodynamics</div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-extrabold tracking-wider text-slate-400 uppercase">Body Weight</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300">TARGET</span>
              </div>
              <div className="text-2xl font-extrabold text-slate-800 dark:text-white">68.4 <span className="text-sm font-semibold text-slate-400">kg</span></div>
              <div className="text-xs text-teal-600 font-semibold mt-1">BMI 22.4 · Healthy Range</div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-extrabold tracking-wider text-slate-400 uppercase">Fasting Glucose</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">OPTIMAL</span>
              </div>
              <div className="text-2xl font-extrabold text-slate-800 dark:text-white">92 <span className="text-sm font-semibold text-slate-400">mg/dL</span></div>
              <div className="text-xs text-emerald-600 font-semibold mt-1">Glycemic Target Achieved</div>
            </div>
          </div>

          {/* Next Visit & Daily Meds */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">Next Scheduled Visit</h3>
                <button onClick={() => onNavigateTab('appointments')} className="text-xs font-bold text-teal-600 hover:underline">View All</button>
              </div>

              {nextApt ? (
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100">{nextApt.doctor}</h4>
                    <p className="text-xs text-slate-500">{nextApt.specialty} · {nextApt.hospital}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs font-semibold text-teal-700 dark:text-teal-400">
                      <span>📅 {nextApt.date}</span>
                      <span>⏰ {nextApt.time}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-200">{nextApt.status}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedAppointmentDetails(nextApt);
                    }}
                    className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:bg-slate-50"
                  >
                    View Details
                  </button>
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-slate-400">
                  No upcoming appointments. <button onClick={() => onNavigateTab('doctors')} className="text-teal-600 font-bold hover:underline">Book consultation</button>
                </div>
              )}
            </div>

            {/* Daily Medication Checklist */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">Today's Medication Checklist</h3>
                <button onClick={() => onNavigateTab('medicines')} className="text-xs font-bold text-teal-600 hover:underline">Manage Rx</button>
              </div>

              <div className="space-y-3">
                {medicines.slice(0, 3).map((m) => (
                  <div key={m.id} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">{m.name} {m.dosage}</h5>
                      <p className="text-[11px] text-slate-400">{m.timing} · {m.frequency}</p>
                    </div>
                    <button
                      onClick={() => toggleMedTaken(m.id)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg transition ${
                        m.takenToday
                          ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'text-slate-600 hover:text-teal-700 bg-white dark:bg-slate-800 border'
                      }`}
                    >
                      {m.takenToday ? '✓ Taken' : 'Mark Done'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. DOCTORS DIRECTORY (Doctor A vs Doctor B Profile Modals) */}
      {activeTab === 'doctors' && (
        <div className="space-y-6 animate-slide-up">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Medical Specialists</h1>
              <p className="text-xs text-slate-400">Consult licensed physicians and clinical consultants.</p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search doctor or specialty..."
                  value={searchDoc}
                  onChange={(e) => setSearchDoc(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <select
                value={selectedSpec}
                onChange={(e) => setSelectedSpec(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors
              .filter(d => (!searchDoc || (d.name + d.specialty).toLowerCase().includes(searchDoc.toLowerCase())) && (!selectedSpec || d.specialty === selectedSpec))
              .map((doc) => (
                <div key={doc.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700 shrink-0 bg-teal-50 text-teal-800 flex items-center justify-center font-bold text-base">
                        {doc.photo ? (
                          <img src={doc.photo} alt={doc.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{doc.name.replace('Dr. ', '').split(' ').map(n=>n[0]).join('')}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{doc.name}</h3>
                        <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">{doc.specialty}</p>
                        <div className="text-[11px] text-slate-400 mt-0.5">★ {doc.rating} · {doc.experience}</div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                      {doc.bio}
                    </p>

                    <div className="flex justify-between items-center py-2 px-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs mb-4">
                      <span className="text-slate-500 font-medium">Consultation Fee</span>
                      <strong className="text-slate-800 dark:text-white font-extrabold">₹{doc.fee}</strong>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedDoctorProfile(doc)}
                      className="flex-1 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => {
                        setBookingDoctor(doc);
                      }}
                      className="flex-1 py-2 bg-[#0c756e] hover:bg-[#09635d] text-white rounded-xl font-bold text-xs shadow transition"
                    >
                      Book Visit
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 3. APPOINTMENTS VIEW (Filters, Details Modal, Reschedule Modal, Cancel) */}
      {activeTab === 'appointments' && (
        <div className="space-y-6 animate-slide-up">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Appointments Schedule</h1>
              <p className="text-xs text-slate-400">View upcoming, completed, and past consultation visits.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportAppointmentsCsv}
                className="px-3.5 py-2 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:bg-slate-50 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => onNavigateTab('doctors')}
                className="px-3.5 py-2 text-xs font-bold bg-[#0c756e] text-white rounded-xl shadow hover:bg-[#09635d] flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Book New</span>
              </button>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-bold">
            {['ALL', 'CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED'].map((tab) => (
              <button
                key={tab}
                onClick={() => setAppointmentFilter(tab)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  appointmentFilter === tab
                    ? 'bg-[#0c756e] text-white'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Appointments Table */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-4">Doctor</th>
                  <th className="p-4">Specialty</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Mode</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {appointments
                  .filter(a => appointmentFilter === 'ALL' || a.status === appointmentFilter)
                  .map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                      <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{a.doctor}</td>
                      <td className="p-4 text-slate-500">{a.specialty}</td>
                      <td className="p-4 text-slate-700 dark:text-slate-300">
                        <div>{a.date}</div>
                        <div className="text-[11px] text-slate-400">{a.time}</div>
                      </td>
                      <td className="p-4 text-slate-500">{a.type}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          a.status === 'CONFIRMED'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : a.status === 'PENDING'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedAppointmentDetails(a)}
                          className="px-2.5 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-bold"
                          title="View Details"
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
                              className="px-2.5 py-1 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950 rounded-lg font-bold"
                              title="Reschedule"
                            >
                              Reschedule
                            </button>
                            <button
                              onClick={() => handleCancelAppointment(a)}
                              className="px-2.5 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg font-bold"
                              title="Cancel"
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

      {/* 4. HEALTH RECORDS VIEW (Upload, View Details, Download, Delete) */}
      {activeTab === 'records' && (
        <div className="space-y-6 animate-slide-up">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Health Records</h1>
              <p className="text-xs text-slate-400">Authenticated diagnostic reports, prescriptions, and clinical discharge summaries.</p>
            </div>
            <button
              onClick={() => setIsUploadRecordOpen(true)}
              className="px-4 py-2 bg-[#0c756e] text-white rounded-xl text-xs font-bold shadow hover:bg-[#09635d] flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Upload Record</span>
            </button>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-bold">
            {['ALL', 'Lab Report', 'Prescription', 'Radiology', 'Clinical Summary'].map((tab) => (
              <button
                key={tab}
                onClick={() => setRecordCategoryFilter(tab)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  recordCategoryFilter === tab
                    ? 'bg-[#0c756e] text-white'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {records
              .filter(r => recordCategoryFilter === 'ALL' || r.category.toLowerCase().includes(recordCategoryFilter.toLowerCase()))
              .map((r) => (
                <div key={r.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-300 uppercase tracking-wider">
                      {r.category}
                    </span>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mt-3">{r.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{r.date} · {r.facility}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">{r.summary}</p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                    <button
                      onClick={() => setSelectedRecord(r)}
                      className="flex-1 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white rounded-xl transition"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => {
                        const text = `CAREPLUS CLINICAL DOCUMENT\\nTitle: ${r.title}\\nCategory: ${r.category}\\nDate: ${r.date}\\nFacility: ${r.facility}\\nPhysician: ${r.doctor}\\nPatient: ${r.patient}\\n\\nSUMMARY & OBSERVATIONS:\\n${r.summary}`;
                        const blob = new Blob([text], { type: 'text/plain' });
                        const link = document.createElement('a');
                        link.href = URL.createObjectURL(blob);
                        link.download = `${r.title.replace(/\\s+/g, '_')}.txt`;
                        link.click();
                        showToast('Report Downloaded', `Saved ${r.title}.txt`, 'success');
                      }}
                      className="px-3 py-2 text-xs font-bold bg-[#0c756e] text-white hover:bg-[#09635d] rounded-xl transition flex items-center justify-center"
                      title="Download Summary"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteRecord(r.id, r.title)}
                      className="px-3 py-2 text-xs font-bold bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition flex items-center justify-center"
                      title="Delete Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 5. MEDICINES VIEW (Full CRUD: Add, Edit, Delete, Taken Checkbox) */}
      {activeTab === 'medicines' && (
        <div className="space-y-6 animate-slide-up">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Active Medications</h1>
              <p className="text-xs text-slate-400">Manage prescriptions, dosage frequencies, and daily adherence checklists.</p>
            </div>
            <button
              onClick={() => {
                setEditingMed(null);
                setMedName('');
                setMedDose('');
                setMedTiming('');
                setIsAddMedOpen(true);
              }}
              className="px-4 py-2 bg-[#0c756e] text-white rounded-xl text-xs font-bold shadow hover:bg-[#09635d] flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Medicine</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {medicines.map((m) => (
              <div key={m.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-300 uppercase">
                      {m.frequency}
                    </span>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-2">{m.name}</h3>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">Dosage: {m.dosage} · {m.timing}</p>
                  </div>

                  <button
                    onClick={() => toggleMedTaken(m.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-extrabold transition ${
                      m.takenToday
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-700'
                    }`}
                  >
                    {m.takenToday ? '✓ Taken Today' : '○ Not Taken'}
                  </button>
                </div>

                <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                  <button
                    onClick={() => {
                      setEditingMed(m);
                      setMedName(m.name);
                      setMedDose(m.dosage);
                      setMedTiming(m.timing);
                      setMedFreq(m.frequency);
                      setIsAddMedOpen(true);
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteMedicine(m.id, m.name)}
                    className="px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. LAB TESTS VIEW (Catalog, View Details, Book Test) */}
      {activeTab === 'labs' && (
        <div className="space-y-6 animate-slide-up">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Diagnostic Laboratory Services</h1>
            <p className="text-xs text-slate-400">Schedule certified pathology panels with NABL-accredited diagnostic labs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {labCatalog.map((t) => (
              <div key={t.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 uppercase">
                    {t.category}
                  </span>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-2">{t.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{t.description}</p>
                  <div className="flex justify-between items-center mt-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs">
                    <span className="text-slate-500">Price</span>
                    <strong className="text-slate-800 dark:text-white font-extrabold">₹{t.price}</strong>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setSelectedLabTestDetails(t)}
                    className="flex-1 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 rounded-xl transition"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => setBookingLabTest(t)}
                    className="flex-1 py-2 bg-[#0c756e] hover:bg-[#09635d] text-white font-bold text-xs rounded-xl shadow transition"
                  >
                    Book Test
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. HEALTH TRACKING VIEW (Vitals, Log Reading, Export CSV) */}
      {activeTab === 'tracking' && (
        <div className="space-y-6 animate-slide-up">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Biometric Telemetry & Tracking</h1>
              <p className="text-xs text-slate-400">Track longitudinal vital statistics, blood pressure, glucose, and weight.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportVitalsCsv}
                className="px-3.5 py-2 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:bg-slate-50 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Log</span>
              </button>
              <button
                onClick={() => setIsAddVitalOpen(true)}
                className="px-3.5 py-2 text-xs font-bold bg-[#0c756e] text-white rounded-xl shadow hover:bg-[#09635d] flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Reading</span>
              </button>
            </div>
          </div>

          {/* Vitals History Table */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Telemetry Indicator</th>
                  <th className="p-4">Recorded Reading</th>
                  <th className="p-4">Clinical Status</th>
                  <th className="p-4">Context Notes</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {vitalsList.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                    <td className="p-4 text-slate-500">{v.date}</td>
                    <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{v.metric}</td>
                    <td className="p-4 font-extrabold text-teal-700 dark:text-teal-400">{v.value} {v.unit}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        {v.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 text-[11px]">{v.notes}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteVital(v.id)}
                        className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded"
                        title="Delete Entry"
                      >
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

      {/* 8. HEALTH ARTICLES VIEW (Article A vs Article B Readers, Bookmarks) */}
      {activeTab === 'articles' && (
        <div className="space-y-6 animate-slide-up">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Clinical & Wellness Articles</h1>
            <p className="text-xs text-slate-400">Peer-reviewed health guidelines authored by licensed medical physicians.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((art) => (
              <div key={art.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm flex flex-col justify-between">
                <div>
                  <div className="h-44 overflow-hidden relative">
                    <img src={art.image} alt={art.title} className="w-full h-full object-cover hover:scale-105 transition duration-500" />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-900/80 text-white backdrop-blur-sm">
                      {art.category}
                    </span>
                  </div>

                  <div className="p-5">
                    <span className="text-[10px] text-slate-400 font-semibold">{art.readTime} · {art.author}</span>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mt-1.5 line-clamp-2 leading-snug">{art.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">{art.summary}</p>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedArticle(art)}
                    className="flex-1 py-2 bg-[#0c756e] hover:bg-[#09635d] text-white font-bold text-xs rounded-xl shadow transition"
                  >
                    Read Article
                  </button>
                  <button
                    onClick={() => {
                      setBookmarkedArticles(prev => ({ ...prev, [art.id]: !prev[art.id] }));
                      showToast(bookmarkedArticles[art.id] ? 'Bookmark Removed' : 'Article Bookmarked', art.title, 'info');
                    }}
                    className={`p-2 rounded-xl border transition ${
                      bookmarkedArticles[art.id]
                        ? 'bg-amber-50 text-amber-600 border-amber-300'
                        : 'border-slate-200 text-slate-400 hover:text-slate-600'
                    }`}
                    title="Bookmark"
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. EMERGENCY VIEW (Verified Contacts, Direct Call, Medical Profile Download) */}
      {activeTab === 'emergency' && (
        <div className="space-y-6 animate-slide-up max-w-4xl">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Emergency Services & Speed Dial</h1>
            <p className="text-xs text-slate-400">Immediate access to 24/7 trauma centers, ambulance dispatch, and critical response.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="tel:108"
              className="p-6 bg-red-600 hover:bg-red-700 text-white rounded-2xl shadow-lg flex flex-col justify-between transition group"
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-red-200">National Ambulance</span>
                <div className="text-4xl font-extrabold mt-2">108</div>
                <p className="text-xs text-red-100 mt-1">24/7 Emergency Medical Response</p>
              </div>
              <div className="mt-6 flex items-center gap-2 font-bold text-xs">
                <PhoneCall className="w-4 h-4" />
                <span>Tap to Call Instantly</span>
              </div>
            </a>

            <a
              href="tel:102"
              className="p-6 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl shadow-lg flex flex-col justify-between transition group"
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-200">Free Ambulance</span>
                <div className="text-4xl font-extrabold mt-2">102</div>
                <p className="text-xs text-rose-100 mt-1">Maternity & Pediatric Transport</p>
              </div>
              <div className="mt-6 flex items-center gap-2 font-bold text-xs">
                <PhoneCall className="w-4 h-4" />
                <span>Tap to Call Instantly</span>
              </div>
            </a>

            <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-lg flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">CarePlus Trauma Desk</span>
                <div className="text-lg font-extrabold mt-2">+91 80 2345 6789</div>
                <p className="text-xs text-slate-400 mt-1">Hospital Emergency Admissions</p>
              </div>
              <button
                onClick={downloadEmergencyCard}
                className="mt-6 py-2 px-3 bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Medical Card</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. PROFILE VIEW (Demographics, Photo Upload / Removal) */}
      {activeTab === 'profile' && (
        <div className="space-y-6 animate-slide-up max-w-2xl">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Patient Profile & Demographics</h1>
            <p className="text-xs text-slate-400">Manage verified personal demographics, contact information, and avatar.</p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
            <div className="flex items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-700">
              <div className="w-20 h-20 rounded-full border-2 border-[#0c756e] overflow-hidden bg-teal-50 text-teal-800 flex items-center justify-center font-extrabold text-2xl shadow-sm shrink-0">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{user?.name ? user.name.split(' ').map(n=>n[0]).join('').toUpperCase() : 'VB'}</span>
                )}
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">Profile Photo</h4>
                <p className="text-xs text-slate-400 mt-0.5">Upload a custom picture or keep the clean monogram initials.</p>
                <div className="flex items-center gap-2 mt-3">
                  <label className="px-3 py-1.5 text-xs font-bold bg-[#0c756e] text-white hover:bg-[#09635d] rounded-lg shadow-sm cursor-pointer transition">
                    Upload Photo
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  </label>
                  <button
                    onClick={handleRemovePhoto}
                    className="px-3 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 rounded-lg transition"
                  >
                    Remove Photo
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Full Name</label>
                <input
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Email Address</label>
                <input
                  disabled
                  value={user?.email || 'patient@careplus.com'}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/50 text-slate-400 font-semibold cursor-not-allowed"
                />
              </div>

              <div>
                <label className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Phone Number</label>
                <input
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Blood Group</label>
                <input
                  disabled
                  value="O Positive (O+)"
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/50 text-slate-400 font-semibold cursor-not-allowed"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Residential Address</label>
                <input
                  value={profileAddress}
                  onChange={(e) => setProfileAddress(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-semibold"
                />
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              className="px-5 py-2.5 bg-[#0c756e] text-white font-bold text-xs rounded-xl shadow hover:bg-[#09635d] transition"
            >
              Save Profile Changes
            </button>
          </div>
        </div>
      )}

      {/* 11. SETTINGS VIEW (Themes, Notifications, Full Backup JSON Export) */}
      {activeTab === 'settings' && (
        <div className="space-y-6 animate-slide-up max-w-2xl">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Portal Settings & Privacy</h1>
            <p className="text-xs text-slate-400">Configure application appearance, notifications, and export personal data.</p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">Export Complete Health Archive</h4>
              <p className="text-xs text-slate-400 mt-0.5">Download an authenticated JSON backup containing all appointments, medical records, and medication logs.</p>
              <button
                onClick={() => {
                  const backup = {
                    patient: user,
                    appointments,
                    records,
                    medicines,
                    vitals: vitalsList,
                    exportedAt: new Date().toISOString()
                  };
                  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
                  const link = document.createElement('a');
                  link.href = URL.createObjectURL(blob);
                  link.download = 'CarePlus_Complete_Medical_Backup.json';
                  link.click();
                  showToast('Archive Generated', 'Complete JSON health records backup downloaded.', 'success');
                }}
                className="mt-3 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON Archive</span>
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">Clear Local Cache & Re-Sync</h4>
              <p className="text-xs text-slate-400 mt-0.5">Force re-synchronization with database seed records.</p>
              <button
                onClick={() => {
                  localStorage.removeItem('careplus_token');
                  window.location.reload();
                }}
                className="mt-3 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition"
              >
                Reset Session Cache
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SPECIFIC MODALS FOR EACH BUTTON ACTION */}
      {/* ------------------------------------------------------------- */}

      {/* Doctor Profile Modal (Doctor A vs Doctor B) */}
      <Modal
        isOpen={!!selectedDoctorProfile}
        onClose={() => setSelectedDoctorProfile(null)}
        title={selectedDoctorProfile?.name || 'Physician Profile'}
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#0c756e] shrink-0 bg-teal-50 text-teal-800 flex items-center justify-center font-bold text-lg">
              {selectedDoctorProfile?.photo ? (
                <img src={selectedDoctorProfile.photo} alt="Doctor" className="w-full h-full object-cover" />
              ) : (
                <span>{selectedDoctorProfile?.name.replace('Dr. ', '').split(' ').map(n=>n[0]).join('')}</span>
              )}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{selectedDoctorProfile?.name}</h3>
              <p className="text-xs font-bold text-teal-600 dark:text-teal-400">{selectedDoctorProfile?.specialty}</p>
              <p className="text-slate-400 text-[11px]">{selectedDoctorProfile?.department} · {selectedDoctorProfile?.hospital}</p>
              <div className="mt-1 text-slate-600 dark:text-slate-300 font-semibold">★ {selectedDoctorProfile?.rating} Rating · {selectedDoctorProfile?.experience} Clinical Experience</div>
            </div>
          </div>

          <div>
            <h5 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">Clinical Background & Bio</h5>
            <p className="text-slate-600 dark:text-slate-400 mt-1 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl leading-relaxed">
              {selectedDoctorProfile?.bio}
            </p>
          </div>

          <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <span className="font-bold text-slate-600 dark:text-slate-400">Standard Consultation Fee:</span>
            <strong className="text-base font-extrabold text-slate-900 dark:text-white">₹{selectedDoctorProfile?.fee}</strong>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button onClick={() => setSelectedDoctorProfile(null)} className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 rounded-xl">Close</button>
            <button
              onClick={() => {
                setBookingDoctor(selectedDoctorProfile);
                setSelectedDoctorProfile(null);
              }}
              className="px-5 py-2 font-bold bg-[#0c756e] text-white hover:bg-[#09635d] rounded-xl shadow"
            >
              Book Appointment
            </button>
          </div>
        </div>
      </Modal>

      {/* Appointment Details Modal (Appointment A vs Appointment B) */}
      <Modal
        isOpen={!!selectedAppointmentDetails}
        onClose={() => setSelectedAppointmentDetails(null)}
        title={`Appointment - ${selectedAppointmentDetails?.appointmentCode}`}
      >
        <div className="space-y-4 text-xs">
          <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Status</span>
              <div className="font-extrabold text-sm text-teal-700 dark:text-teal-400">{selectedAppointmentDetails?.status}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Consultation Mode</span>
              <div className="font-bold text-slate-800 dark:text-white">{selectedAppointmentDetails?.type}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <h5 className="font-bold text-slate-500 uppercase text-[10px]">Physician</h5>
              <p className="font-bold text-slate-800 dark:text-white text-sm mt-0.5">{selectedAppointmentDetails?.doctor}</p>
              <p className="text-slate-400">{selectedAppointmentDetails?.specialty}</p>
            </div>
            <div>
              <h5 className="font-bold text-slate-500 uppercase text-[10px]">Hospital</h5>
              <p className="font-bold text-slate-800 dark:text-white text-sm mt-0.5">{selectedAppointmentDetails?.hospital}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <h5 className="font-bold text-slate-500 uppercase text-[10px]">Scheduled Date</h5>
              <p className="font-bold text-slate-800 dark:text-white text-sm mt-0.5">{selectedAppointmentDetails?.date}</p>
            </div>
            <div>
              <h5 className="font-bold text-slate-500 uppercase text-[10px]">Time Slot</h5>
              <p className="font-bold text-slate-800 dark:text-white text-sm mt-0.5">{selectedAppointmentDetails?.time}</p>
            </div>
          </div>

          {selectedAppointmentDetails?.reason && (
            <div>
              <h5 className="font-bold text-slate-500 uppercase text-[10px]">Checkup Reason / Symptoms</h5>
              <p className="text-slate-600 dark:text-slate-300 mt-1 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl leading-relaxed">
                {selectedAppointmentDetails.reason}
              </p>
            </div>
          )}

          <div className="flex justify-end pt-3">
            <button onClick={() => setSelectedAppointmentDetails(null)} className="px-5 py-2 font-bold bg-[#0c756e] text-white rounded-xl">
              Done
            </button>
          </div>
        </div>
      </Modal>

      {/* Reschedule Appointment Modal */}
      <Modal
        isOpen={!!reschedulingAppointment}
        onClose={() => setReschedulingAppointment(null)}
        title="Reschedule Appointment"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-500">
            Rescheduling visit with <strong>{reschedulingAppointment?.doctor}</strong> (Current: {reschedulingAppointment?.date} at {reschedulingAppointment?.time})
          </p>

          <div>
            <label className="font-bold text-slate-600 dark:text-slate-300">Choose New Date</label>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={reschedDate}
              onChange={(e) => setReschedDate(e.target.value)}
              className="w-full p-2.5 rounded-xl border mt-1 font-semibold"
            />
          </div>

          <div>
            <label className="font-bold text-slate-600 dark:text-slate-300">Choose New Available Slot</label>
            <div className="grid grid-cols-3 gap-2 mt-2 max-h-36 overflow-y-auto p-1">
              {reschedSlots.map((slot) => (
                <button
                  key={slot.time}
                  disabled={slot.isBooked}
                  onClick={() => setSelectedReschedSlot(slot.time)}
                  className={`p-2 rounded-xl text-center font-bold text-xs border transition ${
                    slot.isBooked
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                      : selectedReschedSlot === slot.time
                      ? 'bg-[#0c756e] text-white border-[#0c756e] shadow-sm'
                      : 'bg-white text-slate-700 hover:border-teal-500 border-slate-200'
                  }`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button onClick={() => setReschedulingAppointment(null)} className="px-4 py-2 font-bold text-slate-500">Cancel</button>
            <button onClick={handleConfirmReschedule} className="px-5 py-2 font-bold bg-[#0c756e] text-white rounded-xl shadow">
              Confirm Reschedule
            </button>
          </div>
        </div>
      </Modal>

      {/* Record Preview Modal (Record A vs Record B) */}
      <Modal
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        title={selectedRecord?.title || 'Health Record'}
      >
        <div className="space-y-4 text-xs">
          <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Category</span>
              <div className="font-bold text-slate-800 dark:text-white">{selectedRecord?.category}</div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Date</span>
              <div className="font-bold text-slate-800 dark:text-white">{selectedRecord?.date}</div>
            </div>
          </div>

          <div>
            <h5 className="font-bold text-slate-700 dark:text-slate-300">Facility & Physician</h5>
            <p className="text-slate-500 mt-0.5">{selectedRecord?.facility} · {selectedRecord?.doctor}</p>
          </div>

          <div>
            <h5 className="font-bold text-slate-700 dark:text-slate-300">Clinical Findings & Summary</h5>
            <p className="text-slate-600 dark:text-slate-400 mt-1 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl leading-relaxed">
              {selectedRecord?.summary}
            </p>
          </div>

          <div className="flex justify-end pt-3">
            <button onClick={() => setSelectedRecord(null)} className="px-4 py-2 font-bold bg-[#0c756e] text-white rounded-xl">
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Upload Record Modal */}
      <Modal
        isOpen={isUploadRecordOpen}
        onClose={() => setIsUploadRecordOpen(false)}
        title="Upload Clinical Health Record"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-600">Document Title</label>
            <input
              placeholder="e.g. Annual Cardiovascular Treadmill Stress Test"
              value={newRecordTitle}
              onChange={(e) => setNewRecordTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl border mt-1 font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-600">Category</label>
              <select
                value={newRecordCategory}
                onChange={(e) => setNewRecordCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border mt-1 font-semibold"
              >
                <option value="Lab Report">Lab Report</option>
                <option value="Prescription">Prescription</option>
                <option value="Radiology">Radiology / Imaging</option>
                <option value="Discharge Summary">Discharge Summary</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-600">Facility / Hospital</label>
              <input
                value={newRecordFacility}
                onChange={(e) => setNewRecordFacility(e.target.value)}
                className="w-full p-2.5 rounded-xl border mt-1 font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-600">Summary & Key Findings</label>
            <textarea
              rows={3}
              placeholder="Enter brief report summary, doctor conclusions, and observations..."
              value={newRecordSummary}
              onChange={(e) => setNewRecordSummary(e.target.value)}
              className="w-full p-2.5 rounded-xl border mt-1 font-semibold"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button onClick={() => setIsUploadRecordOpen(false)} className="px-4 py-2 font-bold text-slate-500">Cancel</button>
            <button onClick={handleUploadRecord} className="px-5 py-2 font-bold bg-[#0c756e] text-white rounded-xl shadow">
              Save Record
            </button>
          </div>
        </div>
      </Modal>

      {/* Add / Edit Medicine Modal */}
      <Modal
        isOpen={isAddMedOpen}
        onClose={() => setIsAddMedOpen(false)}
        title={editingMed ? `Edit Medication - ${editingMed.name}` : 'Add Medication'}
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-600">Medicine Name</label>
            <input
              placeholder="e.g. Rosuvastatin"
              value={medName}
              onChange={(e) => setMedName(e.target.value)}
              className="w-full p-2.5 rounded-xl border mt-1 font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-600">Dosage Strength</label>
              <input
                placeholder="e.g. 10mg / 1 tablet"
                value={medDose}
                onChange={(e) => setMedDose(e.target.value)}
                className="w-full p-2.5 rounded-xl border mt-1 font-semibold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-600">Timing</label>
              <input
                placeholder="e.g. After dinner"
                value={medTiming}
                onChange={(e) => setMedTiming(e.target.value)}
                className="w-full p-2.5 rounded-xl border mt-1 font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-600">Frequency</label>
            <select
              value={medFreq}
              onChange={(e) => setMedFreq(e.target.value)}
              className="w-full p-2.5 rounded-xl border mt-1 font-semibold"
            >
              <option value="Once daily">Once daily</option>
              <option value="Twice daily (12h)">Twice daily (12h)</option>
              <option value="Weekly">Weekly</option>
              <option value="As needed (SOS)">As needed (SOS)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button onClick={() => setIsAddMedOpen(false)} className="px-4 py-2 font-bold text-slate-500">Cancel</button>
            <button onClick={handleSaveMedicine} className="px-5 py-2 font-bold bg-[#0c756e] text-white rounded-xl shadow">
              {editingMed ? 'Save Modifications' : 'Add Medication'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Log Vital Modal */}
      <Modal
        isOpen={isAddVitalOpen}
        onClose={() => setIsAddVitalOpen(false)}
        title="Log Biometric Vitals Reading"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-600">Metric Indicator</label>
            <select
              value={vitalMetric}
              onChange={(e) => setVitalMetric(e.target.value)}
              className="w-full p-2.5 rounded-xl border mt-1 font-semibold"
            >
              <option value="Blood Pressure">Blood Pressure (mmHg)</option>
              <option value="Heart Rate">Heart Rate (BPM)</option>
              <option value="Fasting Glucose">Fasting Glucose (mg/dL)</option>
              <option value="Body Weight">Body Weight (kg)</option>
              <option value="Blood Oxygen (SpO2)">Blood Oxygen SpO2 (%)</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-600">Reading Value</label>
            <input
              placeholder="e.g. 120/80 or 72 or 95"
              value={vitalValue}
              onChange={(e) => setVitalValue(e.target.value)}
              className="w-full p-2.5 rounded-xl border mt-1 font-semibold"
            />
          </div>

          <div>
            <label className="font-bold text-slate-600">Measurement Context / Notes</label>
            <input
              placeholder="e.g. Resting morning reading before coffee"
              value={vitalNotes}
              onChange={(e) => setVitalNotes(e.target.value)}
              className="w-full p-2.5 rounded-xl border mt-1 font-semibold"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button onClick={() => setIsAddVitalOpen(false)} className="px-4 py-2 font-bold text-slate-500">Cancel</button>
            <button onClick={handleSaveVital} className="px-5 py-2 font-bold bg-[#0c756e] text-white rounded-xl shadow">
              Save Reading
            </button>
          </div>
        </div>
      </Modal>

      {/* Lab Test Details Modal (Test A vs Test B) */}
      <Modal
        isOpen={!!selectedLabTestDetails}
        onClose={() => setSelectedLabTestDetails(null)}
        title={selectedLabTestDetails?.name || 'Lab Test Details'}
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-400">Category</span>
            <div className="font-extrabold text-sm text-slate-800 dark:text-white">{selectedLabTestDetails?.category}</div>
          </div>
          <div>
            <h5 className="font-bold text-slate-700 dark:text-slate-300">Description & Diagnostic Scope</h5>
            <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{selectedLabTestDetails?.description}</p>
          </div>
          <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <span className="font-bold text-slate-600">Standard Test Fee:</span>
            <strong className="text-base font-extrabold text-slate-900 dark:text-white">₹{selectedLabTestDetails?.price}</strong>
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button onClick={() => setSelectedLabTestDetails(null)} className="px-4 py-2 font-bold text-slate-500">Close</button>
            <button
              onClick={() => {
                setBookingLabTest(selectedLabTestDetails);
                setSelectedLabTestDetails(null);
              }}
              className="px-5 py-2 font-bold bg-[#0c756e] text-white rounded-xl"
            >
              Book Now
            </button>
          </div>
        </div>
      </Modal>

      {/* Book Lab Test Modal */}
      <Modal
        isOpen={!!bookingLabTest}
        onClose={() => setBookingLabTest(null)}
        title={`Book Diagnostic Test - ${bookingLabTest?.name}`}
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-500">Test: <strong>{bookingLabTest?.name}</strong> · Fee: ₹{bookingLabTest?.price}</p>
          <div>
            <label className="font-bold text-slate-600">Sample Collection Mode</label>
            <select className="w-full p-2.5 rounded-xl border mt-1 font-semibold">
              <option value="Home Collection">Home Sample Collection (Technician visit)</option>
              <option value="Hospital Walk-in">CarePlus Hospital Laboratory Walk-in</option>
            </select>
          </div>
          <div>
            <label className="font-bold text-slate-600">Preferred Collection Date</label>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              defaultValue={new Date().toISOString().split('T')[0]}
              className="w-full p-2.5 rounded-xl border mt-1 font-semibold"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button onClick={() => setBookingLabTest(null)} className="px-4 py-2 font-bold text-slate-500">Cancel</button>
            <button
              onClick={async () => {
                try {
                  const res = await fetch('/api/labs/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({
                      testId: bookingLabTest.id,
                      sampleMode: 'Home Collection'
                    })
                  });
                  const data = await res.json();
                  if (data.success) {
                    showToast('Lab Test Ordered', `Booked ${bookingLabTest.name}. Order sent to Pathology.`, 'success');
                    setBookingLabTest(null);
                    loadData();
                  }
                } catch (err: any) {
                  showToast('Error', err.message, 'alert');
                }
              }}
              className="px-5 py-2 font-bold bg-[#0c756e] text-white rounded-xl"
            >
              Confirm Lab Order
            </button>
          </div>
        </div>
      </Modal>

      {/* Article Reader Modal (Article A vs Article B) */}
      <Modal
        isOpen={!!selectedArticle}
        onClose={() => setSelectedArticle(null)}
        title={selectedArticle?.title || 'Health Article'}
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between text-slate-400 pb-2 border-b">
            <span>By {selectedArticle?.author}</span>
            <span>{selectedArticle?.readTime}</span>
          </div>

          <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
            {selectedArticle?.fullText}
          </p>

          <div className="p-4 bg-teal-50 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-800">
            <h5 className="font-extrabold text-teal-900 dark:text-teal-200 text-xs mb-2">Key Clinical Takeaways:</h5>
            <ul className="space-y-1.5 list-disc list-inside text-teal-800 dark:text-teal-300">
              {selectedArticle?.takeaways?.map((t: string, idx: number) => (
                <li key={idx}>{t}</li>
              ))}
            </ul>
          </div>

          <div className="flex justify-end pt-3">
            <button onClick={() => setSelectedArticle(null)} className="px-5 py-2 font-bold bg-[#0c756e] text-white rounded-xl">
              Done Reading
            </button>
          </div>
        </div>
      </Modal>

      {/* Booking Doctor Modal with Double-Booking Prevention */}
      <Modal
        isOpen={!!bookingDoctor}
        onClose={() => setBookingDoctor(null)}
        title={`Book Appointment - ${bookingDoctor?.name}`}
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-600 dark:text-slate-300">Physician</label>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl mt-1 font-semibold text-slate-800 dark:text-white">
              {bookingDoctor?.name} ({bookingDoctor?.specialty}) · ₹{bookingDoctor?.fee}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-600 dark:text-slate-300">Consultation Date</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 mt-1 bg-white dark:bg-slate-800 font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-600 dark:text-slate-300">Format</label>
              <select
                value={consultType}
                onChange={(e) => setConsultType(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 mt-1 bg-white dark:bg-slate-800 font-semibold"
              >
                <option value="In-person">In-person Visit</option>
                <option value="Video">HD Video Teleconsult</option>
              </select>
            </div>
          </div>

          {/* Dynamic Available Time Slots */}
          <div>
            <label className="font-bold text-slate-600 dark:text-slate-300">Select Available Slot</label>
            <div className="grid grid-cols-3 gap-2 mt-2 max-h-36 overflow-y-auto p-1">
              {bookingSlots.map((slot) => (
                <button
                  key={slot.time}
                  disabled={slot.isBooked}
                  onClick={() => setSelectedSlot(slot.time)}
                  className={`p-2 rounded-xl text-center font-bold text-xs border transition ${
                    slot.isBooked
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed dark:bg-slate-800/40 dark:border-slate-800'
                      : selectedSlot === slot.time
                      ? 'bg-[#0c756e] text-white border-[#0c756e] shadow-sm'
                      : 'bg-white text-slate-700 hover:border-teal-500 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
                  }`}
                >
                  {slot.time}
                  {slot.isBooked && <span className="block text-[9px] font-normal text-red-500">Booked</span>}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-600 dark:text-slate-300">Reason / Symptoms (Optional)</label>
            <textarea
              rows={2}
              value={bookingReason}
              onChange={(e) => setBookingReason(e.target.value)}
              placeholder="Briefly describe checkup goal or symptoms..."
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 mt-1 bg-white dark:bg-slate-800"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setBookingDoctor(null)}
              className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmBooking}
              className="px-5 py-2 font-bold bg-[#0c756e] text-white hover:bg-[#09635d] rounded-xl shadow"
            >
              Confirm Booking
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
