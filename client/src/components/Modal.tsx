import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a1e1b]/40">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-xl shadow-lg border border-[#cbe7e2] dark:border-slate-800 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#e4f3f0] dark:border-slate-800 flex items-center justify-between bg-[#f8fbfb] dark:bg-slate-900">
          <h3 className="font-semibold text-sm text-[#0c756e] dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#527d77] hover:text-[#0c756e] hover:bg-[#e6f5f2] dark:hover:bg-slate-800 transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
