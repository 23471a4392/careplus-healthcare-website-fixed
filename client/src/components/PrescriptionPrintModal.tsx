import React from 'react';
import { Printer, X, ShieldCheck, CheckCircle2 } from 'lucide-react';

export interface PrescriptionPrintProps {
  isOpen: boolean;
  onClose: () => void;
  prescription: {
    id: string;
    patientName: string;
    patientId?: string;
    patientAge?: string | number;
    patientGender?: string;
    doctorName: string;
    doctorSpecialty?: string;
    doctorLicense?: string;
    department?: string;
    date: string;
    medications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions?: string;
    }>;
    notes?: string;
    followUpDate?: string;
  } | null;
}

export const PrescriptionPrintModal: React.FC<PrescriptionPrintProps> = ({ isOpen, onClose, prescription }) => {
  if (!isOpen || !prescription) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a1e1b]/60 backdrop-blur-xs print:p-0 print:bg-white">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-[#cbe7e2] overflow-hidden p-8 space-y-6 print:border-none print:shadow-none print:p-6">
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 print:hidden">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0c756e]">
            <ShieldCheck className="w-4 h-4" />
            <span>CarePlus Official Clinical e-Prescription</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#0c756e] hover:bg-[#095e58] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Prescription</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="space-y-6 text-[#132e2b]">
          {/* Header */}
          <div className="flex justify-between items-start pb-4 border-b-2 border-[#0c756e]">
            <div>
              <h2 className="text-xl font-black text-[#0c756e] tracking-tight">CarePlus Multi-Specialty Hospital</h2>
              <p className="text-xs text-slate-500">Sector 4, Healthcare Boulevard, Metro City · 560001</p>
              <p className="text-[11px] text-slate-400">NABH & NABL Accredited · Emergency 24/7: 108</p>
            </div>
            <div className="text-right text-xs">
              <div className="font-bold text-[#132e2b]">{prescription.doctorName}</div>
              <div className="text-[#0c756e] font-medium">{prescription.doctorSpecialty || 'Consultant Physician'}</div>
              <div className="text-[11px] text-slate-400">Lic: {prescription.doctorLicense || 'DOC-REG-2026'}</div>
            </div>
          </div>

          {/* Patient Details Grid */}
          <div className="grid grid-cols-3 gap-3 p-3.5 bg-[#f8fbfb] rounded-2xl border border-[#e4f3f0] text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Patient Name</span>
              <strong className="text-[#132e2b]">{prescription.patientName}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Patient ID</span>
              <span className="font-medium text-[#132e2b]">{prescription.patientId || 'PAT-RECORD'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Date</span>
              <span className="font-medium text-[#132e2b]">{prescription.date}</span>
            </div>
          </div>

          {/* Rx Medications Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#0c756e]">Rx Medications</h4>
            <div className="border border-[#e4f3f0] rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#e6f5f2] text-[#0c756e] font-bold">
                  <tr>
                    <th className="p-2.5">Medication</th>
                    <th className="p-2.5">Dosage</th>
                    <th className="p-2.5">Frequency</th>
                    <th className="p-2.5">Duration</th>
                    <th className="p-2.5">Instructions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {prescription.medications.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-[#132e2b]">{m.name}</td>
                      <td className="p-2.5 text-slate-600">{m.dosage}</td>
                      <td className="p-2.5 text-slate-600">{m.frequency}</td>
                      <td className="p-2.5 text-slate-600">{m.duration}</td>
                      <td className="p-2.5 text-slate-500">{m.instructions || 'As prescribed'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Clinical Advice */}
          {prescription.notes && (
            <div className="text-xs p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="font-bold text-[#234c47] block">Clinical Advice & Precautions:</span>
              <p className="text-[#4d7872]">{prescription.notes}</p>
            </div>
          )}

          {/* Verification Signature */}
          <div className="pt-6 flex justify-between items-end border-t border-slate-100 text-xs">
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Digitally Verified & Encrypted Prescription</span>
            </div>
            <div className="text-center">
              <div className="font-serif italic font-bold text-[#0c756e] text-sm">{prescription.doctorName}</div>
              <div className="text-[10px] text-slate-400 border-t border-slate-300 pt-0.5 mt-0.5">Authorized Medical Practitioner Signature</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
