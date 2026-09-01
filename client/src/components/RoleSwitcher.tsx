import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';

export const RoleSwitcher: React.FC = () => {
  const { user, demoUsers, loginAsDemoUser } = useAuth();

  const roleColors: Record<string, string> = {
    PATIENT: 'bg-teal-700 text-white',
    DOCTOR: 'bg-blue-700 text-white',
    SENIOR_DOCTOR: 'bg-indigo-700 text-white',
    NURSE: 'bg-emerald-700 text-white',
    LAB_TECHNICIAN: 'bg-amber-700 text-white',
    PHARMACIST: 'bg-purple-700 text-white',
    HOSPITAL_ADMIN: 'bg-rose-700 text-white',
    SUPER_ADMIN: 'bg-slate-800 text-white',
    RECEPTIONIST: 'bg-cyan-700 text-white',
    ACCOUNTANT: 'bg-stone-700 text-white'
  };

  return (
    <div className="bg-slate-900 text-white text-xs px-4 py-2 flex items-center justify-between overflow-x-auto gap-3 border-b border-slate-800 z-50 sticky top-0">
      <div className="flex items-center gap-2 shrink-0">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-semibold text-slate-300">Switch Live Demo Role:</span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
        {demoUsers.map((u) => {
          const isActive = user?.email === u.email;
          return (
            <button
              key={u.email}
              onClick={() => loginAsDemoUser(u.email)}
              title={`Switch to ${u.name} (${u.role})`}
              className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isActive
                  ? `${roleColors[u.role] || 'bg-teal-700 text-white'} shadow ring-2 ring-white/50 font-bold`
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <span>{u.name.split(' ')[0]}</span>
              <span className="text-[10px] opacity-75 font-mono">({u.role.replace('_', ' ')})</span>
            </button>
          );
        })}
      </div>

      <div className="text-slate-400 shrink-0 font-mono hidden md:block">
        Active: <strong className="text-emerald-400">{user?.role}</strong>
      </div>
    </div>
  );
};
