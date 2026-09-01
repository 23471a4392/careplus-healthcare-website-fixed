import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useSocket } from '../../context/SocketContext.tsx';
import { Modal } from '../../components/Modal.tsx';

export const NurseDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const { showToast, realtimeVersion } = useSocket();
  const [inpatients, setInpatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [pulse, setPulse] = useState('74');
  const [bp, setBp] = useState('118/78');
  const [spo2, setSpo2] = useState('98');
  const [notes, setNotes] = useState('Patient comfortable.');

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
  }, [token, realtimeVersion]);

  const handleRecordVitals = async () => {
    if (!selectedPatient) return;
    try {
      const res = await fetch('/api/nurse/vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ patientId: selectedPatient.patientId, pulse, bp, spo2, notes })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Vitals Recorded', `Logged Pulse: ${pulse} BPM, BP: ${bp} for ${selectedPatient.patientName}`, 'success');
        setSelectedPatient(null);
      }
    } catch (err: any) {
      showToast('Error', err.message, 'alert');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">{user?.name}</h1>
        <p className="text-xs text-slate-500">Inpatient Nursing Station · Ward 101-104</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
          Assigned Inpatient Roster ({inpatients.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {inpatients.map((pat) => (
            <div key={pat.admissionId} className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-slate-400 font-medium">Room {pat.roomNumber} · Bed {pat.bedNumber}</span>
                <div className="font-medium text-sm text-slate-900 dark:text-white mt-0.5">{pat.patientName}</div>
                <div className="text-xs text-slate-500">{pat.diagnosis}</div>
              </div>
              <button
                onClick={() => setSelectedPatient(pat)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium"
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
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-500 font-medium">Heart Rate (BPM)</label>
              <input value={pulse} onChange={(e) => setPulse(e.target.value)} className="w-full p-2 rounded-lg border mt-1 font-medium" />
            </div>
            <div>
              <label className="text-slate-500 font-medium">Blood Pressure (mmHg)</label>
              <input value={bp} onChange={(e) => setBp(e.target.value)} className="w-full p-2 rounded-lg border mt-1 font-medium" />
            </div>
          </div>
          <div>
            <label className="text-slate-500 font-medium">Observation Notes</label>
            <input value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full p-2 rounded-lg border mt-1 font-medium" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setSelectedPatient(null)} className="px-3 py-1.5 text-slate-500">Cancel</button>
            <button onClick={handleRecordVitals} className="px-4 py-1.5 bg-slate-900 text-white rounded-lg font-medium">
              Save Vitals
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
