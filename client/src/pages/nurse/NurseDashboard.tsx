import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useSocket } from '../../context/SocketContext.tsx';
import { Modal } from '../../components/Modal.tsx';
import { Activity, Bed } from 'lucide-react';

export const NurseDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const { showToast } = useSocket();
  const [inpatients, setInpatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [pulse, setPulse] = useState('74');
  const [bp, setBp] = useState('118/78');
  const [spo2, setSpo2] = useState('98');
  const [temp, setTemp] = useState('98.6');
  const [notes, setNotes] = useState('Patient comfortable, resting comfortably.');

  const fetchInpatients = async () => {
    try {
      const res = await fetch('/api/nurse/patients', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setInpatients(data.inpatients);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) fetchInpatients();
  }, [token]);

  const handleRecordVitals = async () => {
    if (!selectedPatient) return;
    try {
      const res = await fetch('/api/nurse/vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          patientId: selectedPatient.patientId,
          pulse,
          bp,
          spo2,
          temp,
          notes
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Vitals Recorded', `Logged Pulse: ${pulse} BPM, BP: ${bp} mmHg, SpO2: ${spo2}% for ${selectedPatient.patientName}`, 'success');
        setSelectedPatient(null);
      }
    } catch (err: any) {
      showToast('Error', err.message, 'alert');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-slide-up">
      <div className="bg-emerald-900 text-white p-8 rounded-2xl shadow-sm">
        <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Inpatient Nursing Station</span>
        <h1 className="text-3xl font-extrabold mt-1">{user?.name}</h1>
        <p className="text-emerald-200 text-xs mt-1">Shift: Morning Duty · Ward 101-104 Telemetry</p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-white mb-4">
          Assigned Inpatients & Bed Roster
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {inpatients.map((pat) => (
            <div key={pat.admissionId} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Room {pat.roomNumber} · Bed {pat.bedNumber}
                </span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                  {pat.patientName} ({pat.gender} · {pat.bloodGroup})
                </h4>
                <p className="text-xs text-slate-500">Diagnosis: {pat.diagnosis}</p>
              </div>
              <button
                onClick={() => setSelectedPatient(pat)}
                className="px-3.5 py-2 bg-[#0c756e] text-white font-bold text-xs rounded-xl shadow-sm hover:bg-[#09635d]"
              >
                Record Vitals
              </button>
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={!!selectedPatient}
        onClose={() => setSelectedPatient(null)}
        title={`Record Vitals - ${selectedPatient?.patientName}`}
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-600">Heart Rate (BPM)</label>
              <input value={pulse} onChange={(e) => setPulse(e.target.value)} className="w-full p-2.5 rounded-xl border mt-1 font-semibold" />
            </div>
            <div>
              <label className="font-bold text-slate-600">Blood Pressure (mmHg)</label>
              <input value={bp} onChange={(e) => setBp(e.target.value)} className="w-full p-2.5 rounded-xl border mt-1 font-semibold" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-600">SpO2 Oxygen (%)</label>
              <input value={spo2} onChange={(e) => setSpo2(e.target.value)} className="w-full p-2.5 rounded-xl border mt-1 font-semibold" />
            </div>
            <div>
              <label className="font-bold text-slate-600">Temperature (°F)</label>
              <input value={temp} onChange={(e) => setTemp(e.target.value)} className="w-full p-2.5 rounded-xl border mt-1 font-semibold" />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-600">Clinical Observation Notes</label>
            <input value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full p-2.5 rounded-xl border mt-1 font-semibold" />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button onClick={() => setSelectedPatient(null)} className="px-4 py-2 font-bold text-slate-500">Cancel</button>
            <button onClick={handleRecordVitals} className="px-5 py-2 font-bold bg-[#0c756e] text-white rounded-xl">
              Save Vitals to Chart
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
