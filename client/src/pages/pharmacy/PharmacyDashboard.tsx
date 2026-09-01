import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useSocket } from '../../context/SocketContext.tsx';
import { Pill, Package, Check } from 'lucide-react';

export const PharmacyDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const { showToast } = useSocket();
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);

  const fetchPharmacyData = async () => {
    try {
      const [resRx, resInv] = await Promise.all([
        fetch('/api/clinical/prescriptions', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch('/api/pharmacy/inventory', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
      ]);
      if (resRx.success) setPrescriptions(resRx.prescriptions);
      if (resInv.success) setInventory(resInv.inventory);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) fetchPharmacyData();
  }, [token]);

  const handleDispense = async (rxId: string, patientName: string) => {
    try {
      const res = await fetch(`/api/pharmacy/prescriptions/${rxId}/dispense`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast('Prescription Dispensed', `Medicines dispensed to ${patientName}. Patient alerted in real-time.`, 'success');
        fetchPharmacyData();
      }
    } catch (err: any) {
      showToast('Error', err.message, 'alert');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-slide-up">
      <div className="bg-purple-900 text-white p-8 rounded-2xl shadow-sm">
        <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">Hospital Pharmacy Dispensary</span>
        <h1 className="text-3xl font-extrabold mt-1">{user?.name}</h1>
        <p className="text-purple-200 text-xs mt-1">Prescription Fulfillment & Controlled Substance Inventory</p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-white mb-4">
          Prescription Orders Queue
        </h3>

        {prescriptions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No prescriptions pending dispensing.</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {prescriptions.map((rx) => (
              <div key={rx.id} className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    rx.status === 'DISPENSED' ? 'bg-emerald-50 text-emerald-700' : 'bg-purple-50 text-purple-700'
                  }`}>
                    {rx.status}
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                    {rx.medications.map((m: any) => `${m.name} (${m.dosage})`).join(', ')}
                  </h4>
                  <p className="text-xs text-slate-500">Patient: <strong>{rx.patientName}</strong> · Prescribed by: <strong>{rx.doctorName}</strong></p>
                  <p className="text-xs text-slate-400 mt-0.5">{rx.instructions}</p>
                </div>

                {rx.status !== 'DISPENSED' && (
                  <button
                    onClick={() => handleDispense(rx.id, rx.patientName)}
                    className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Dispense & Alert Patient</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inventory Stock */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-white mb-4">
          Medicine Inventory Levels
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          {inventory.map((item) => (
            <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase">{item.category}</span>
              <div className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">{item.name}</div>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-slate-500">Stock:</span>
                <strong className={`font-extrabold ${item.quantity < 20 ? 'text-red-500' : 'text-emerald-600'}`}>
                  {item.quantity} {item.unit}
                </strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
