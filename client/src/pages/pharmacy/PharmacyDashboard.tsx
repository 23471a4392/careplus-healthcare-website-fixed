import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useSocket } from '../../context/SocketContext.tsx';
import { Pill, Package } from 'lucide-react';

export const PharmacyDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useSocket();

  const handleDispense = (rx: string) => {
    showToast('Medicines Dispensed', `${rx} dispensed. Patient notified in real-time.`, 'success');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-slide-up">
      <div className="bg-purple-900 text-white p-8 rounded-2xl shadow-sm">
        <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">Hospital Pharmacy Dispensary</span>
        <h1 className="text-3xl font-extrabold mt-1">{user?.name}</h1>
        <p className="text-purple-200 text-xs mt-1">Prescription Fulfillment & Inventory Management</p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-white mb-4">
          Pending Prescription Orders
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          <div className="py-4 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">READY FOR DISPENSING</span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">Atorvastatin 20mg (30 Tablets)</h4>
              <p className="text-xs text-slate-500">Patient: <strong>Vaseem Basha</strong> · Prescribed by: <strong>Dr. Arjun Rao</strong></p>
            </div>
            <button
              onClick={() => handleDispense('Atorvastatin 20mg')}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-sm"
            >
              Dispense & Alert Patient
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
