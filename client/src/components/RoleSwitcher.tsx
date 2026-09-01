import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';

export const RoleSwitcher: React.FC = () => {
  const { user, demoUsers, loginAsDemoUser } = useAuth();

  return (
    <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex items-center justify-between overflow-x-auto gap-3 border-b border-slate-800 sticky top-0 z-50">
      <div className="flex items-center gap-2 shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
        <span className="text-slate-400 text-[11px]">Demo Role:</span>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto">
        {demoUsers.map((u) => {
          const isActive = user?.email === u.email;
          return (
            <button
              key={u.email}
              onClick={() => loginAsDemoUser(u.email)}
              className={`px-2.5 py-0.5 rounded text-[11px] font-medium whitespace-nowrap transition ${
                isActive
                  ? 'bg-slate-800 text-white border border-slate-700 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span>{u.name.split(' ')[0]}</span>
              <span className="text-[10px] text-slate-500 ml-1">({u.role.replace('_', ' ').toLowerCase()})</span>
            </button>
          );
        })}
      </div>

      <div className="text-slate-500 text-[11px] shrink-0 hidden lg:block font-mono">
        Active: <span className="text-slate-300">{user?.role}</span>
      </div>
    </div>
  );
};
