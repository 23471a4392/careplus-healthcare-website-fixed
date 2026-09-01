import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';

export const SuperAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-slide-up">
      <div className="bg-slate-950 text-white p-8 rounded-2xl">
        <span className="text-xs font-bold text-slate-400 uppercase">Super Admin Portal</span>
        <h1 className="text-3xl font-extrabold mt-1">{user?.name}</h1>
        <p className="text-slate-400 text-xs mt-1">Global System Governance & Multi-Tenant Management</p>
      </div>
    </div>
  );
};
