import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { LoginPage } from './components/LoginPage.tsx';
import { PatientPortal } from './pages/patient/PatientPortal.tsx';
import { DoctorDashboard } from './pages/doctor/DoctorDashboard.tsx';
import { SeniorDoctorDashboard } from './pages/senior-doctor/SeniorDoctorDashboard.tsx';
import { NurseDashboard } from './pages/nurse/NurseDashboard.tsx';
import { LabDashboard } from './pages/lab/LabDashboard.tsx';
import { HospitalHomePage } from './pages/public/HospitalHomePage.tsx';

export const App: React.FC = () => {
  const { user, isLoading, portalKey } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');

  const pathname = window.location.pathname.toLowerCase();

  // Route check
  const isHome = pathname === '/' || pathname === '' || pathname === '/home';
  const isPatient = pathname.startsWith('/patient');
  const isDoctor = pathname.startsWith('/doctor');
  const isSenior = pathname.startsWith('/senior');
  const isNurse = pathname.startsWith('/nurse');
  const isLab = pathname.startsWith('/lab');

  useEffect(() => {
    if (isPatient || user?.role === 'PATIENT') {
      setActivePage('dashboard');
    } else if (isDoctor || user?.role === 'DOCTOR') {
      setActivePage('overview');
    } else if (isSenior || user?.role === 'SENIOR_DOCTOR') {
      setActivePage('overview');
    } else if (isNurse || user?.role === 'NURSE') {
      setActivePage('inpatient');
    } else if (isLab || user?.role === 'LAB_TECHNICIAN') {
      setActivePage('lab_queue');
    }
  }, [pathname, user?.role]);

  // 1. PUBLIC HOSPITAL HOMEPAGE AT '/'
  if (isHome) {
    return <HospitalHomePage />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f3f8f7] flex flex-col items-center justify-center text-[#132e2b]">
        <div className="w-10 h-10 border-4 border-[#0c756e] border-t-transparent rounded-full animate-spin mb-4" />
        <div className="font-bold text-base tracking-tight text-[#0c756e]">Connecting to CarePlus Portal...</div>
      </div>
    );
  }

  // 2. DYNAMIC LOGIN SCREEN WHEN NOT AUTHENTICATED
  if (!user) {
    return <LoginPage portalKey={portalKey} />;
  }

  const getPortalLabel = () => {
    if (isPatient) return 'Patient Portal';
    if (isDoctor) return 'Physician Portal';
    if (isSenior) return 'Senior Doctor Portal';
    if (isNurse) return 'Nurse Station';
    if (isLab) return 'Diagnostic Lab Portal';
    return user?.role ? user.role.replace('_', ' ') : 'Portal';
  };

  return (
    <div className="min-h-screen bg-[#f3f8f7] text-[#132e2b] flex flex-col">
      {/* Top Navbar */}
      <Navbar
        portalName={getPortalLabel()}
        onOpenEmergencyModal={() => setActivePage('emergency')}
        onNavigateProfile={() => setActivePage('profile')}
        onNavigateTab={(tab) => setActivePage(tab)}
      />

      {/* Body Layout */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar activePage={activePage} onSelectPage={setActivePage} portalKey={portalKey} />

        {/* Content Area */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          {(isPatient || user?.role === 'PATIENT') && (
            <PatientPortal activeTab={activePage} onNavigateTab={setActivePage} />
          )}

          {(isDoctor || user?.role === 'DOCTOR') && (
            <DoctorDashboard activeTab={activePage} onNavigateTab={setActivePage} />
          )}

          {(isSenior || user?.role === 'SENIOR_DOCTOR') && (
            <SeniorDoctorDashboard activeTab={activePage} onNavigateTab={setActivePage} />
          )}

          {(isNurse || user?.role === 'NURSE') && <NurseDashboard />}

          {(isLab || user?.role === 'LAB_TECHNICIAN') && <LabDashboard />}
        </main>
      </div>
    </div>
  );
};
