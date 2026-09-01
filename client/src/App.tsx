import React, { useState } from 'react';
import { useAuth } from './context/AuthContext.tsx';
import { RoleSwitcher } from './components/RoleSwitcher.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { PatientPortal } from './pages/patient/PatientPortal.tsx';
import { DoctorDashboard } from './pages/doctor/DoctorDashboard.tsx';
import { SeniorDoctorDashboard } from './pages/senior-doctor/SeniorDoctorDashboard.tsx';
import { NurseDashboard } from './pages/nurse/NurseDashboard.tsx';
import { LabDashboard } from './pages/lab/LabDashboard.tsx';
import { PharmacyDashboard } from './pages/pharmacy/PharmacyDashboard.tsx';
import { HospitalAdminDashboard } from './pages/hospital-admin/HospitalAdminDashboard.tsx';
import { SuperAdminDashboard } from './pages/super-admin/SuperAdminDashboard.tsx';
import { ReceptionistDashboard } from './pages/receptionist/ReceptionistDashboard.tsx';
import { AccountantDashboard } from './pages/accountant/AccountantDashboard.tsx';

export const App: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');

  if (isLoading && !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4" />
        <div className="font-semibold text-lg tracking-tight">CarePlus Healthcare System</div>
        <div className="text-xs text-slate-400 mt-1">Connecting real-time clinical services...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* 1-Click Fast Role Switcher */}
      <RoleSwitcher />

      {/* Main Top Header */}
      <Navbar
        onOpenEmergencyModal={() => setActivePage('emergency')}
        onNavigateProfile={() => setActivePage('profile')}
        onNavigateTab={(tab) => setActivePage(tab)}
      />

      {/* Body Layout */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar activePage={activePage} onSelectPage={setActivePage} />

        {/* Content Area */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          {user?.role === 'PATIENT' && (
            <PatientPortal activeTab={activePage} onNavigateTab={setActivePage} />
          )}

          {user?.role === 'DOCTOR' && (
            <DoctorDashboard activeTab={activePage} onNavigateTab={setActivePage} />
          )}

          {user?.role === 'SENIOR_DOCTOR' && (
            <SeniorDoctorDashboard activeTab={activePage} onNavigateTab={setActivePage} />
          )}

          {user?.role === 'NURSE' && <NurseDashboard />}

          {user?.role === 'LAB_TECHNICIAN' && <LabDashboard />}

          {user?.role === 'PHARMACIST' && <PharmacyDashboard />}

          {(user?.role === 'HOSPITAL_ADMIN' || user?.role === 'SUPER_ADMIN') && activePage !== 'audit_logs' && (
            <HospitalAdminDashboard />
          )}

          {user?.role === 'SUPER_ADMIN' && activePage === 'audit_logs' && (
            <SuperAdminDashboard />
          )}

          {user?.role === 'RECEPTIONIST' && <ReceptionistDashboard />}

          {user?.role === 'ACCOUNTANT' && <AccountantDashboard />}
        </main>
      </div>
    </div>
  );
};
