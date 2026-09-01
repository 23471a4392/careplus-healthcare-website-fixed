import React from 'react';
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Pill,
  TestTube,
  Activity,
  BookOpen,
  PhoneCall,
  User,
  Settings,
  ClipboardList,
  CheckCircle,
  Bed,
  Stethoscope,
  LogOut,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface SidebarProps {
  activePage: string;
  onSelectPage: (page: string) => void;
  portalKey?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onSelectPage, portalKey }) => {
  const { user, logout } = useAuth();

  const getNavItems = () => {
    if (user?.role === 'PATIENT') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'doctors', label: 'Doctors', icon: Users },
        { id: 'appointments', label: 'Appointments', icon: Calendar },
        { id: 'records', label: 'Health Records', icon: FileText },
        { id: 'medicines', label: 'Medicines', icon: Pill },
        { id: 'labs', label: 'Lab Tests', icon: TestTube },
        { id: 'tracking', label: 'Health Tracking', icon: Activity },
        { id: 'articles', label: 'Health Articles', icon: BookOpen },
        { id: 'emergency', label: 'Emergency', icon: PhoneCall },
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'settings', label: 'Settings', icon: Settings }
      ];
    }

    if (user?.role === 'DOCTOR' || user?.role === 'SENIOR_DOCTOR') {
      return [
        { id: 'overview', label: 'Schedule', icon: LayoutDashboard },
        { id: 'requests', label: 'Appointment Requests', icon: Calendar },
        { id: 'patients', label: 'Patients', icon: Users },
        { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
        { id: 'labs', label: 'Lab Orders', icon: TestTube },
        { id: 'treatment_plans', label: 'Treatment Plans', icon: Stethoscope },
        { id: 'profile', label: 'Profile', icon: User }
      ];
    }

    if (user?.role === 'NURSE') {
      return [
        { id: 'inpatient', label: 'Inpatient Ward', icon: Bed },
        { id: 'vitals', label: 'Vitals Observation', icon: Activity },
        { id: 'med_schedule', label: 'Medication Roster', icon: Pill }
      ];
    }

    if (user?.role === 'LAB_TECHNICIAN') {
      return [
        { id: 'lab_queue', label: 'Orders Queue', icon: ClipboardList },
        { id: 'lab_results', label: 'Completed Results', icon: CheckCircle },
        { id: 'lab_catalog', label: 'Test Catalog', icon: TestTube }
      ];
    }

    return [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }];
  };

  const navItems = getNavItems();

  return (
    <aside className="w-56 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="py-4 pr-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectPage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-r-xl text-xs transition text-left ${
                isActive
                  ? 'bg-[#e6f5f2] text-[#0c756e] dark:bg-slate-800 dark:text-teal-300 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#0c756e] dark:text-teal-300' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
        <a
          href="/"
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 transition"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Switch Portal Hub</span>
        </a>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 transition"
        >
          <LogOut className="w-3.5 h-3.5 text-slate-400" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
