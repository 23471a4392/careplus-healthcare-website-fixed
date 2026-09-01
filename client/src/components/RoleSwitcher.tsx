import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';

export const RoleSwitcher: React.FC = () => {
  const { user, demoUsers, loginAsDemoUser } = useAuth();

  return (
    <div className="bg-[#0b2421] text-[#9fc7c1] text-xs px-4 py-1.5 flex items-center justify-between overflow-x-auto gap-3 border-b border-[#143a35] sticky top-0 z-50">
      <div className="flex items-center gap-2 shrink-0">
        <span className="w-2 h-2 rounded-full bg-[#1de9b6]" />
        <span className="text-[#9fc7c1] text-[11px] font-medium">Demo Role:</span>
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
                  ? 'bg-[#0c756e] text-white border border-[#189b92] font-semibold'
                  : 'text-[#9fc7c1] hover:text-white hover:bg-[#143a35]'
              }`}
            >
              <span>{u.name.split(' ')[0]}</span>
              <span className="text-[10px] text-[#74a59e] ml-1">({u.role.replace('_', ' ').toLowerCase()})</span>
            </button>
          );
        })}
      </div>

      <div className="text-[#74a59e] text-[11px] shrink-0 hidden lg:block font-mono">
        Role: <span className="text-white font-medium">{user?.role}</span>
      </div>
    </div>
  );
};
