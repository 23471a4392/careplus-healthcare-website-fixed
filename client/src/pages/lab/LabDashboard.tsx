import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useSocket } from '../../context/SocketContext.tsx';
import { Modal } from '../../components/Modal.tsx';

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
        showToast('Updated', `Order marked as ${status}.`, 'success');
        setSelectedOrder(null);
        fetchOrders();
      }
    } catch (err: any) {
      showToast('Error', err.message, 'alert');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">{user?.name}</h1>
        <p className="text-xs text-slate-500">Clinical Pathology Laboratory · Specimen Processing</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
          Diagnostic Orders Queue ({orders.length})
        </h3>

        {orders.length === 0 ? (
          <p className="text-xs text-slate-400 py-3">No orders currently in queue.</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {orders.map((o) => (
              <div key={o.id} className="py-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-slate-900 dark:text-white">{o.testName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                      {o.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Patient: {o.patientName} · Doctor: {o.doctorName}</p>
                </div>

                <div className="flex gap-2">
                  {o.status === 'REQUESTED' && (
                    <button
                      onClick={() => handleUpdateStatus(o.id, 'SAMPLE_COLLECTED')}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
                    >
                      Sample Collected
                    </button>
                  )}
                  {o.status !== 'COMPLETED' && (
                    <button
                      onClick={() => setSelectedOrder(o)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium"
                    >
                      Finalize Report
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
        title={`Finalize Report - ${selectedOrder?.testName}`}
      >
        <div className="space-y-3 text-xs">
          <p className="text-slate-500">Patient: <strong>{selectedOrder?.patientName}</strong></p>
          <div>
            <label className="text-slate-500 font-medium">Summary & Findings</label>
            <textarea rows={3} value={resultSummary} onChange={(e) => setResultSummary(e.target.value)} className="w-full p-2 rounded-lg border mt-1 font-medium" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setSelectedOrder(null)} className="px-3 py-1.5 text-slate-500">Cancel</button>
            <button onClick={() => handleUpdateStatus(selectedOrder.id, 'COMPLETED', resultSummary)} className="px-4 py-1.5 bg-slate-900 text-white rounded-lg font-medium">
              Save & Finalize
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
