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
  ArrowRight
} from 'lucide-react';

interface PatientPortalProps {
  activeTab: string;
  onNavigateTab: (tab: string) => void;
}

export const PatientPortal: React.FC<PatientPortalProps> = ({ activeTab, onNavigateTab }) => {
  const { user, token, updateUserAvatar } = useAuth();
  const { showToast } = useSocket();

  // State
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<MedicalRecordItem[]>([]);
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [searchDoc, setSearchDoc] = useState('');
  const [selectedSpec, setSelectedSpec] = useState('');

  // Booking Modal State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingSlots, setBookingSlots] = useState<{ time: string; isBooked: boolean }[]>([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [consultType, setConsultType] = useState('In-person');
  const [bookingReason, setBookingReason] = useState('');

  // Record Modal
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecordItem | null>(null);

  // Profile Edit
  const [profileName, setProfileName] = useState(user?.name || 'Vaseem Basha');
  const [profilePhone, setProfilePhone] = useState('+91 98765 43210');
  const [profileAddress, setProfileAddress] = useState('Indiranagar 100ft Rd, Bengaluru, Karnataka 560038');

  // Load live data from backend
  const loadData = async () => {
    try {
      const [resDoc, resApt, resRec, resLab] = await Promise.all([
        fetch('/api/doctors').then(r => r.json()),
        fetch('/api/appointments', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch('/api/clinical/records', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch('/api/labs/orders', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
      ]);

      if (resDoc.success) setDoctors(resDoc.doctors);
      if (resApt.success) setAppointments(resApt.appointments);
      if (resRec.success) setRecords(resRec.records);
      if (resLab.success) setLabOrders(resLab.orders);
    } catch (err) {
      console.error('Failed to load patient portal data:', err);
    }
  };

  useEffect(() => {
    if (token) loadData();
  }, [token]);

  // Fetch slots when doctor and date change
  useEffect(() => {
    if (bookingDoctor && bookingDate) {
      fetch(`/api/doctors/${bookingDoctor.id}/slots?date=${bookingDate}`)
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            setBookingSlots(data.slots);
            const firstAvailable = data.slots.find((s: any) => !s.isBooked);
            setSelectedSlot(firstAvailable ? firstAvailable.time : '');
          }
        });
    }
  }, [bookingDoctor, bookingDate]);

  // Handle Booking Confirmation
  const handleConfirmBooking = async () => {
    if (!bookingDoctor || !selectedSlot) {
      showToast('Selection Required', 'Please choose a valid doctor and time slot.', 'alert');
      return;
    }

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
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
        showToast('Booking Successful', `Requested appointment with ${bookingDoctor.name} for ${bookingDate} at ${selectedSlot}`, 'success');
        setIsBookingOpen(false);
        loadData();
      } else {
        showToast('Booking Failed', data.message, 'alert');
      }
    } catch (err: any) {
      showToast('Error', err.message, 'alert');
    }
  };

  // Profile Avatar Handlers
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      updateUserAvatar(dataUrl);
      showToast('Profile Photo Updated', 'Your custom avatar has been saved.', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    updateUserAvatar('');
    showToast('Photo Removed', 'Reverted to default monogram initials.', 'info');
  };

  // CSV Export for Appointments
  const exportAppointmentsCsv = () => {
    const header = 'ID,Doctor,Specialty,Date,Time,Type,Status\\n';
    const rows = appointments.map(a => `"${a.appointmentCode}","${a.doctor}","${a.specialty}","${a.date}","${a.time}","${a.type}","${a.status}"`).join('\\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'CarePlus_Appointments.csv';
    link.click();
    showToast('Export Complete', 'Appointments schedule downloaded as CSV.', 'success');
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

          {/* Next Appointment & Medication Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Appointment */}
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
                  <button onClick={() => onNavigateTab('appointments')} className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
                    Manage
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
                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Vitamin D3 60,000 IU</h5>
                    <p className="text-[11px] text-slate-400">1 capsule · After breakfast</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">✓ Taken</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Omega 3 Fish Oil 1000mg</h5>
                    <p className="text-[11px] text-slate-400">1 softgel · After dinner</p>
                  </div>
                  <button className="text-xs font-bold text-slate-600 hover:text-teal-700 bg-white dark:bg-slate-800 border px-2.5 py-1 rounded-lg">Mark Done</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. DOCTORS CATALOG VIEW */}
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

          {/* Doctor Cards Grid */}
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
                      {doc.bio || 'Comprehensive clinical consultations, preventive screenings, and individualized treatments.'}
                    </p>

                    <div className="flex justify-between items-center py-2 px-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs mb-4">
                      <span className="text-slate-500 font-medium">Consultation Fee</span>
                      <strong className="text-slate-800 dark:text-white font-extrabold">₹{doc.fee}</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setBookingDoctor(doc);
                      setIsBookingOpen(true);
                    }}
                    className="w-full py-2.5 bg-[#0c756e] hover:bg-[#09635d] text-white rounded-xl font-bold text-xs shadow transition flex items-center justify-center gap-1.5"
                  >
                    <span>Book Appointment</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 3. APPOINTMENTS VIEW */}
      {activeTab === 'appointments' && (
        <div className="space-y-6 animate-slide-up">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Appointments</h1>
              <p className="text-xs text-slate-400">View and manage clinical visits with real-time status updates.</p>
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
                <span>New Appointment</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-4">Doctor</th>
                  <th className="p-4">Specialty</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Mode</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">No appointments scheduled.</td>
                  </tr>
                ) : (
                  appointments.map((a) => (
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. HEALTH RECORDS VIEW */}
      {activeTab === 'records' && (
        <div className="space-y-6 animate-slide-up">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Health Records</h1>
              <p className="text-xs text-slate-400">Authenticated diagnostic reports, imaging scans, and discharge documents.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {records.map((r) => (
              <div key={r.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-300 uppercase tracking-wider">
                    {r.category}
                  </span>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mt-3">{r.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{r.date} · {r.facility}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{r.summary}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                  <button
                    onClick={() => setSelectedRecord(r)}
                    className="flex-1 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-xl transition"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => {
                      const text = `CAREPLUS MEDICAL RECORD\\nTitle: ${r.title}\\nDate: ${r.date}\\nFacility: ${r.facility}\\nSummary: ${r.summary}`;
                      const blob = new Blob([text], { type: 'text/plain' });
                      const link = document.createElement('a');
                      link.href = URL.createObjectURL(blob);
                      link.download = `${r.title.replace(/\\s+/g, '_')}.txt`;
                      link.click();
                      showToast('Downloaded', 'Record document downloaded.', 'success');
                    }}
                    className="px-3 py-2 text-xs font-bold bg-[#0c756e] text-white hover:bg-[#09635d] rounded-xl transition flex items-center justify-center"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. PROFILE VIEW (With Photo Upload / Removal) */}
      {activeTab === 'profile' && (
        <div className="space-y-6 animate-slide-up max-w-2xl">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Patient Profile</h1>
            <p className="text-xs text-slate-400">Manage personal demographics and photo preferences.</p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
            {/* Photo Edit Row */}
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
                <p className="text-xs text-slate-400 mt-0.5">Upload a custom picture or keep the default monogram initials.</p>
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

            {/* Profile Fields */}
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
              onClick={() => showToast('Saved', 'Profile changes saved successfully.', 'success')}
              className="px-5 py-2.5 bg-[#0c756e] text-white font-bold text-xs rounded-xl shadow hover:bg-[#09635d] transition"
            >
              Save Profile Changes
            </button>
          </div>
        </div>
      )}

      {/* Booking Appointment Modal with Real Availability Verification */}
      <Modal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        title={`Book Appointment - ${bookingDoctor?.name}`}
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-600 dark:text-slate-300">Specialist</label>
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
              onClick={() => setIsBookingOpen(false)}
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

      {/* Record Preview Modal */}
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
            <h5 className="font-bold text-slate-700 dark:text-slate-300">Facility & Doctor</h5>
            <p className="text-slate-500 mt-0.5">{selectedRecord?.facility} · {selectedRecord?.doctor}</p>
          </div>

          <div>
            <h5 className="font-bold text-slate-700 dark:text-slate-300">Clinical Findings & Summary</h5>
            <p className="text-slate-600 dark:text-slate-400 mt-1 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl leading-relaxed">
              {selectedRecord?.summary}
            </p>
          </div>

          <div className="flex justify-end pt-3">
            <button
              onClick={() => setSelectedRecord(null)}
              className="px-4 py-2 font-bold bg-[#0c756e] text-white rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
