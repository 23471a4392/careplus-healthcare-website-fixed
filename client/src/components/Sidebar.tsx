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
  Package,
  Bed,
  Stethoscope,
  BarChart3,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface SidebarProps {
  activePage: string;
  onSelectPage: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onSelectPage }) => {
  const { user, logout } = useAuth();

  // Role-specific navigation menus
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
        { id: 'overview', label: 'Doctor Schedule', icon: LayoutDashboard },
        { id: 'requests', label: 'Appointment Requests', icon: Calendar },
        { id: 'patients', label: 'Assigned Patients', icon: Users },
        { id: 'prescriptions', label: 'Write Prescription', icon: Pill },
        { id: 'labs', label: 'Order Lab Tests', icon: TestTube },
        { id: 'treatment_plans', label: 'Treatment Plans', icon: Stethoscope },
        { id: 'profile', label: 'Profile & Hours', icon: User }
      ];
    }

    if (user?.role === 'NURSE') {
      return [
        { id: 'inpatient', label: 'Inpatient Ward', icon: Bed },
        { id: 'vitals', label: 'Record Vitals', icon: Activity },
        { id: 'med_schedule', label: 'Medication Roster', icon: Pill }
      ];
    }

    if (user?.role === 'LAB_TECHNICIAN') {
      return [
        { id: 'lab_queue', label: 'Incoming Orders', icon: ClipboardList },
        { id: 'lab_results', label: 'Completed Results', icon: CheckCircle },
        { id: 'lab_catalog', label: 'Test Catalog', icon: TestTube }
      ];
    }

    if (user?.role === 'PHARMACIST') {
      return [
        { id: 'pharmacy_queue', label: 'Rx Dispensing Queue', icon: Pill },
        { id: 'inventory', label: 'Medicine Inventory', icon: Package }
      ];
    }

    if (user?.role === 'HOSPITAL_ADMIN' || user?.role === 'SUPER_ADMIN') {
      return [
        { id: 'admin_overview', label: 'Hospital Overview', icon: BarChart3 },
        { id: 'bed_management', label: 'Bed Management', icon: Bed },
        { id: 'staff_directory', label: 'Staff Roster', icon: Users },
        { id: 'audit_logs', label: 'System Audit Logs', icon: FileText }
      ];
    }

    if (user?.role === 'RECEPTIONIST') {
      return [
        { id: 'reception_intake', label: 'Patient Check-In', icon: Users },
        { id: 'walkin_booking', label: 'Walk-in Booking', icon: Calendar },
        { id: 'bed_status', label: 'Bed Availability', icon: Bed }
      ];
    }

    if (user?.role === 'ACCOUNTANT') {
      return [
        { id: 'billing_invoices', label: 'Billing Invoices', icon: FileText },
        { id: 'insurance_claims', label: 'Insurance Claims', icon: BarChart3 }
      ];
    }

    return [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }];
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0 min-h-[calc(100vh-6rem)]">
      <div className="p-4 space-y-1">
        <div className="px-3 py-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
          Navigation ({user?.role?.replace('_', ' ')})
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectPage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                isActive
                  ? 'bg-[#0c756e] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
