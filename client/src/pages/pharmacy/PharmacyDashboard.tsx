import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useSocket } from '../../context/SocketContext.tsx';

export const PharmacyDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const { showToast, realtimeVersion } = useSocket();
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
  }, [token, realtimeVersion]);

  const handleDispense = async (rxId: string, patientName: string) => {
    try {
      const res = await fetch(`/api/pharmacy/prescriptions/${rxId}/dispense`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast('Dispensed', `Medicines dispensed to ${patientName}.`, 'success');
        fetchPharmacyData();
      }
    } catch (err: any) {
      showToast('Error', err.message, 'alert');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">{user?.name}</h1>
        <p className="text-xs text-slate-500">Hospital Pharmacy Dispensary & Inventory</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
          Prescriptions Queue ({prescriptions.length})
        </h3>

        {prescriptions.length === 0 ? (
          <p className="text-xs text-slate-400 py-3">No prescriptions in queue.</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {prescriptions.map((rx) => (
              <div key={rx.id} className="py-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                  <div className="font-medium text-sm text-slate-900 dark:text-white">
                    {rx.medications.map((m: any) => `${m.name} (${m.dosage})`).join(', ')}
                  </div>
                  <p className="text-xs text-slate-500">Patient: {rx.patientName} · Doctor: {rx.doctorName}</p>
                </div>

                {rx.status !== 'DISPENSED' && (
                  <button
                    onClick={() => handleDispense(rx.id, rx.patientName)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium"
                  >
                    Dispense
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
          Inventory Levels
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {inventory.map((item) => (
            <div key={item.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">{item.category}</span>
              <div className="font-medium text-slate-900 dark:text-white mt-0.5">{item.name}</div>
              <div className="mt-1.5 flex justify-between">
                <span className="text-slate-500">Stock:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{item.quantity} {item.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
