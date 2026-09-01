import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';

export const AccountantDashboard: React.FC = () => {
  const { user } = useAuth();
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 ">
      <div className="bg-stone-900 text-white p-8 rounded-2xl">
        <span className="text-xs font-bold text-stone-300 uppercase">Financial Accounting & Billing</span>
        <h1 className="text-3xl font-semibold mt-1">{user?.name}</h1>
        <p className="text-stone-300 text-xs mt-1">Invoicing, Revenue Analytics & Claims Settlement</p>
      </div>
    </div>
  );
};
