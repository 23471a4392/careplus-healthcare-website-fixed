import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useSocket } from '../../context/SocketContext.tsx';
import { Modal } from '../../components/Modal.tsx';
import {
  TestTube,
  CheckCircle,
  Clock,
  Activity,
  FileText,
  Search,
  Filter,
  ArrowRight,
  Check,
  X,
  Download,
  AlertTriangle,
  ClipboardList
} from 'lucide-react';

export const LabDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const { showToast, realtimeVersion } = useSocket();

  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [resultSummary, setResultSummary] = useState('All parameters within standard clinical reference intervals.');
  const [parameterDetails, setParameterDetails] = useState('');

  const fetchOrders = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/labs/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Error fetching lab orders:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token, realtimeVersion]);

  const handleUpdateStatus = async (id: string, status: string, summary?: string) => {
    try {
      const res = await fetch(`/api/labs/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, resultSummary: summary })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Status Updated', `Order marked as ${status}.`, 'success');
        setIsResultModalOpen(false);
        setIsReportModalOpen(false);
        fetchOrders();
      }
    } catch (err: any) {
      showToast('Error', err.message, 'alert');
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesTab =
      activeTab === 'ALL' ||
      (activeTab === 'PENDING' && (o.status === 'PENDING' || o.status === 'REQUESTED')) ||
      (activeTab === 'ACCEPTED' && o.status === 'ACCEPTED') ||
      (activeTab === 'SAMPLE_COLLECTED' && o.status === 'SAMPLE_COLLECTED') ||
      (activeTab === 'PROCESSING' && o.status === 'PROCESSING') ||
      (activeTab === 'RESULT_READY' && o.status === 'RESULT_READY') ||
      (activeTab === 'COMPLETED' && o.status === 'COMPLETED') ||
      (activeTab === 'CANCELLED' && (o.status === 'CANCELLED' || o.status === 'REJECTED'));

    const matchesSearch =
      !searchQuery ||
      o.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.doctorName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
      case 'REQUESTED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">1. PENDING REQUEST</span>;
      case 'ACCEPTED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">2. ACCEPTED</span>;
      case 'SAMPLE_COLLECTED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">3. SAMPLE COLLECTED</span>;
      case 'PROCESSING':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">4. PROCESSING</span>;
      case 'RESULT_READY':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">5. RESULT READY</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e6f5f2] text-[#0c756e] border border-[#cbe7e2]">6. COMPLETED & VERIFIED</span>;
      case 'CANCELLED':
      case 'REJECTED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">CANCELLED</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const downloadReportTxt = (o: any) => {
    const content = `CAREPLUS CLINICAL PATHOLOGY LABORATORY
=====================================================
DIAGNOSTIC TEST REPORT: ${o.testName}
Test Order ID: ${o.id}
Test Category: ${o.category || 'General Diagnostic'}
Date of Order: ${new Date(o.createdAt).toLocaleDateString()}
Completion Date: ${o.completedAt ? new Date(o.completedAt).toLocaleString() : 'Finalized'}

PATIENT INFORMATION:
Name: ${o.patientName}
Patient ID: ${o.patientCode || o.patientId}

ORDERING PHYSICIAN:
${o.doctorName}
Department: General Hospital Faculty

FINDINGS & PARAMETER OBSERVATIONS:
${o.resultSummary || 'All parameters evaluated and verified.'}

QUALITY ASSURANCE:
NABL Accredited Laboratory · Automated Clinical Chemistry
Verified By: David Miller, Senior Pathology Technician`;

    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Lab_Report_${o.testName.replace(/\s+/g, '_')}_${o.patientName.replace(/\s+/g, '_')}.txt`;
    link.click();
    showToast('Downloaded', 'Diagnostic report text file downloaded.', 'success');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#d6ebe7] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-[#0c756e] font-semibold uppercase tracking-wider">Diagnostic Pathology Workspace</span>
          <h1 className="text-xl font-bold text-[#132e2b] mt-0.5">{user?.name}</h1>
          <p className="text-xs text-[#4d7872]">Automated Clinical Analyzers · Complete Specimen Lifecycle</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-[#132e2b]">{orders.length} Total Orders</div>
            <div className="text-[11px] text-[#0c756e]">
              {orders.filter(o => o.status === 'PENDING' || o.status === 'REQUESTED').length} Awaiting Acceptance
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto bg-white p-1 rounded-xl border border-[#d6ebe7]">
          {[
            { id: 'ALL', label: 'All Orders' },
            { id: 'PENDING', label: '1. Pending' },
            { id: 'ACCEPTED', label: '2. Accepted' },
            { id: 'SAMPLE_COLLECTED', label: '3. Sample Collected' },
            { id: 'PROCESSING', label: '4. Processing' },
            { id: 'RESULT_READY', label: '5. Result Ready' },
            { id: 'COMPLETED', label: '6. Completed' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                activeTab === t.id
                  ? 'bg-[#0c756e] text-white shadow-sm'
                  : 'text-[#4d7872] hover:text-[#132e2b] hover:bg-[#f8fbfb]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search test, patient, doctor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#d6ebe7] bg-white w-full sm:w-64 font-medium outline-none focus:border-[#0c756e]"
          />
        </div>
      </div>

      {/* Orders List / Cards */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-[#d6ebe7] space-y-2">
            <ClipboardList className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="font-bold text-sm text-[#132e2b]">No Diagnostic Orders Found</h3>
            <p className="text-xs text-slate-400">There are no orders matching this filter tab.</p>
          </div>
        ) : (
          filteredOrders.map((o) => (
            <div
              key={o.id}
              className="bg-white p-5 rounded-2xl border border-[#d6ebe7] shadow-sm hover:shadow-md transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {getStatusBadge(o.status)}
                    <span className="text-xs font-mono font-bold text-slate-400">ID: {o.id.slice(-8)}</span>
                    <span className="text-xs font-bold text-[#0c756e] bg-[#e6f5f2] px-2 py-0.5 rounded border border-[#cbe7e2]">
                      ₹{o.price || 500}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-[#132e2b] mt-1">
                    {o.testName}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1 text-xs text-[#4d7872]">
                    <div><strong>Patient:</strong> {o.patientName}</div>
                    <div><strong>Ordering Doctor:</strong> {o.doctorName}</div>
                    <div><strong>Sample Mode:</strong> {o.sampleMode}</div>
                    <div><strong>Order Date:</strong> {new Date(o.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>

                {/* Lifecycle Action Buttons */}
                <div className="flex flex-wrap gap-2 shrink-0">
                  {/* Step 1: PENDING -> ACCEPT / DECLINE */}
                  {(o.status === 'PENDING' || o.status === 'REQUESTED') && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(o.id, 'ACCEPTED')}
                        className="px-3.5 py-1.5 bg-[#0c756e] hover:bg-[#095e58] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept Request</span>
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(o.id, 'CANCELLED', 'Declined by laboratory')}
                        className="px-3 py-1.5 border border-[#d6ebe7] hover:bg-rose-50 text-rose-700 rounded-xl text-xs font-bold"
                      >
                        Decline
                      </button>
                    </>
                  )}

                  {/* Step 2: ACCEPTED -> SAMPLE COLLECTED */}
                  {o.status === 'ACCEPTED' && (
                    <button
                      onClick={() => handleUpdateStatus(o.id, 'SAMPLE_COLLECTED')}
                      className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <TestTube className="w-3.5 h-3.5" />
                      <span>Mark Sample Collected</span>
                    </button>
                  )}

                  {/* Step 3: SAMPLE COLLECTED -> START PROCESSING */}
                  {o.status === 'SAMPLE_COLLECTED' && (
                    <button
                      onClick={() => handleUpdateStatus(o.id, 'PROCESSING')}
                      className="px-3.5 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>Start Processing</span>
                    </button>
                  )}

                  {/* Step 4: PROCESSING -> ENTER RESULTS */}
                  {o.status === 'PROCESSING' && (
                    <button
                      onClick={() => {
                        setSelectedOrder(o);
                        setIsResultModalOpen(true);
                      }}
                      className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Enter Results & Findings</span>
                    </button>
                  )}

                  {/* Step 5: RESULT READY -> FINALIZE & UPLOAD REPORT */}
                  {o.status === 'RESULT_READY' && (
                    <button
                      onClick={() => {
                        setSelectedOrder(o);
                        setIsReportModalOpen(true);
                      }}
                      className="px-3.5 py-1.5 bg-[#0c756e] hover:bg-[#095e58] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Finalize & Upload Report</span>
                    </button>
                  )}

                  {/* Step 6: COMPLETED -> DOWNLOAD REPORT */}
                  {o.status === 'COMPLETED' && (
                    <button
                      onClick={() => downloadReportTxt(o)}
                      className="px-3.5 py-1.5 bg-[#e6f5f2] hover:bg-[#d8efe9] text-[#0c756e] border border-[#cbe7e2] rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Report (.txt)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Result Summary Preview if Available */}
              {o.resultSummary && (
                <div className="p-3.5 bg-[#f8fbfb] rounded-xl border border-[#eef6f5] text-xs">
                  <span className="font-bold text-[#0c756e] block mb-1">Pathology Findings & Verification:</span>
                  <p className="text-[#36615b] leading-relaxed">{o.resultSummary}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal 1: Enter Results & Observations */}
      <Modal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        title={`Enter Findings - ${selectedOrder?.testName}`}
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-[#f8fbfb] rounded-xl border border-[#eef6f5]">
            <div><strong>Patient:</strong> {selectedOrder?.patientName}</div>
            <div className="mt-0.5"><strong>Test:</strong> {selectedOrder?.testName} ({selectedOrder?.category})</div>
          </div>

          <div>
            <label className="block font-bold text-[#234c47] mb-1">Clinical Findings & Parameter Values</label>
            <textarea
              rows={4}
              value={resultSummary}
              onChange={(e) => setResultSummary(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#d6ebe7] font-medium outline-none focus:border-[#0c756e]"
              placeholder="e.g. Hemoglobin: 14.2 g/dL, RBC: 4.8 million/mcL, WBC: 6,800 /mcL, Platelets: 240,000 /mcL. All parameters normal."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setIsResultModalOpen(false)} className="px-3.5 py-1.5 text-slate-500 font-semibold">Cancel</button>
            <button
              onClick={() => handleUpdateStatus(selectedOrder.id, 'RESULT_READY', resultSummary)}
              className="px-4 py-2 bg-[#0c756e] text-white rounded-xl font-bold shadow-sm"
            >
              Save Results (Status: RESULT_READY)
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal 2: Finalize & Upload Report */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title={`Finalize & Upload Report - ${selectedOrder?.testName}`}
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-[#f8fbfb] rounded-xl border border-[#eef6f5]">
            <p className="text-slate-600 leading-relaxed">
              Finalizing will officially upload this report and immediately dispatch real-time verified notifications to <strong>{selectedOrder?.doctorName}</strong> and patient <strong>{selectedOrder?.patientName}</strong>.
            </p>
          </div>

          <div>
            <label className="block font-bold text-[#234c47] mb-1">Final Summary Report</label>
            <textarea
              rows={4}
              value={resultSummary}
              onChange={(e) => setResultSummary(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#d6ebe7] font-medium outline-none focus:border-[#0c756e]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setIsReportModalOpen(false)} className="px-3.5 py-1.5 text-slate-500 font-semibold">Cancel</button>
            <button
              onClick={() => handleUpdateStatus(selectedOrder.id, 'COMPLETED', resultSummary)}
              className="px-4 py-2 bg-[#0c756e] text-white rounded-xl font-bold shadow-sm"
            >
              Upload Report & Notify Doctor + Patient
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
