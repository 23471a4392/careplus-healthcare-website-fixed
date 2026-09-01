import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';

export const ReceptionistDashboard: React.FC = () => {
  const { user } = useAuth();
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-slide-up">
      <div className="bg-cyan-900 text-white p-8 rounded-2xl">
        <span className="text-xs font-bold text-cyan-300 uppercase">Reception & Patient Admissions</span>
        <h1 className="text-3xl font-extrabold mt-1">{user?.name}</h1>
        <p className="text-cyan-200 text-xs mt-1">Front Desk Intake & Walk-in Scheduling</p>
      </div>
    </div>
  );
};
