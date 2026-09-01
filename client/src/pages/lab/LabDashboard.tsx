import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useSocket } from '../../context/SocketContext.tsx';
import { Modal } from '../../components/Modal.tsx';
import { TestTube, CheckCircle } from 'lucide-react';

export const LabDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const { showToast } = useSocket();
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [resultSummary, setResultSummary] = useState('All parameters within standard clinical reference intervals.');

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/labs/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) fetchOrders();
  }, [token]);

  const handleUpdateStatus = async (id: string, status: string, summary?: string) => {
    try {
      const res = await fetch(`/api/labs/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, resultSummary: summary })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Lab Status Updated', `Order marked as ${status}.`, 'success');
        setSelectedOrder(null);
        fetchOrders();
      }
    } catch (err: any) {
      showToast('Error', err.message, 'alert');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-slide-up">
      <div className="bg-amber-900 text-white p-8 rounded-2xl shadow-sm">
        <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Clinical Pathology Lab</span>
        <h1 className="text-3xl font-extrabold mt-1">{user?.name}</h1>
        <p className="text-amber-200 text-xs mt-1">Diagnostic Specimen Processing & Pathology Validation</p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-white mb-4">
          Incoming Diagnostic Orders Queue
        </h3>

        {orders.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No diagnostic orders in queue.</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {orders.map((o) => (
              <div key={o.id} className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    o.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {o.status}
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">{o.testName}</h4>
                  <p className="text-xs text-slate-500">Patient: <strong>{o.patientName}</strong> · Prescribed by: <strong>{o.doctorName}</strong></p>
                  {o.resultSummary && <p className="text-xs text-slate-400 mt-1 italic">Findings: {o.resultSummary}</p>}
                </div>

                <div className="flex gap-2">
                  {o.status === 'REQUESTED' && (
                    <button
                      onClick={() => handleUpdateStatus(o.id, 'SAMPLE_COLLECTED')}
                      className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm"
                    >
                      Sample Collected
                    </button>
                  )}
                  {o.status !== 'COMPLETED' && (
                    <button
                      onClick={() => {
                        setSelectedOrder(o);
                      }}
                      className="px-3.5 py-2 bg-[#0c756e] hover:bg-[#09635d] text-white font-bold text-xs rounded-xl shadow-sm"
                    >
                      Enter Results & Finalize
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Enter Findings - ${selectedOrder?.testName}`}
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-500">Patient: <strong>{selectedOrder?.patientName}</strong></p>
          <div>
            <label className="font-bold text-slate-600">Pathology Result Summary</label>
            <textarea
              rows={3}
              value={resultSummary}
              onChange={(e) => setResultSummary(e.target.value)}
              className="w-full p-2.5 rounded-xl border mt-1 font-semibold"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button onClick={() => setSelectedOrder(null)} className="px-4 py-2 font-bold text-slate-500">Cancel</button>
            <button
              onClick={() => handleUpdateStatus(selectedOrder.id, 'COMPLETED', resultSummary)}
              className="px-5 py-2 font-bold bg-[#0c756e] text-white rounded-xl"
            >
              Finalize & Notify Doctor/Patient
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
