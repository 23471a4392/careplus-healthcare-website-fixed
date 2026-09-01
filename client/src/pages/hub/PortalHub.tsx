import React from 'react';
import { Plus, User, Stethoscope, ShieldCheck, Bed, TestTube, ArrowRight } from 'lucide-react';

export const PortalHub: React.FC = () => {
  const portals = [
    {
      id: 'patient',
      title: 'Patient Portal',
      url: '/patient',
      role: 'PATIENT',
      desc: 'Dynamic login for patients to book consultations, track longitudinal biometrics, and manage prescriptions.',
      icon: User,
      badge: 'Patient Access'
    },
    {
      id: 'doctor',
      title: 'Doctor Portal',
      url: '/doctor',
      role: 'DOCTOR',
      desc: 'Dynamic login for physicians to manage appointments, issue e-prescriptions, and order diagnostic labs.',
      icon: Stethoscope,
      badge: 'Physicians'
    },
    {
      id: 'senior',
      title: 'Senior Doctor Portal',
      url: '/senior',
      role: 'SENIOR_DOCTOR',
      desc: 'Dynamic login for Chiefs of Medicine to review and approve specialized clinical protocols.',
      icon: ShieldCheck,
      badge: 'Clinical Governance'
    },
    {
      id: 'nurse',
      title: 'Nurse Station',
      url: '/nurse',
      role: 'NURSE',
      desc: 'Dynamic login for nursing staff to record inpatient observation vitals and manage bedside care.',
      icon: Bed,
      badge: 'Inpatient Ward'
    },
    {
      id: 'lab',
      title: 'Diagnostic Lab Portal',
      url: '/lab',
      role: 'LAB_TECHNICIAN',
      desc: 'Dynamic login for pathology technicians to receive specimen orders and publish verified results.',
      icon: TestTube,
      badge: 'Pathology & Labs'
    }
  ];

  return (
    <div className="min-h-screen bg-[#f3f8f7] text-[#132e2b]">
      {/* Top Header */}
      <header className="h-16 bg-white border-b border-slate-100 px-8 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0c756e] flex items-center justify-center text-white shadow-sm">
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-[#0c756e]">
            CarePlus
          </span>
          <span className="text-xs text-[#0c756e] bg-[#e6f5f2] border border-[#cbe7e2] px-2.5 py-0.5 rounded-full font-semibold ml-2">
            Healthcare Portal Network
          </span>
        </div>
      </header>

      {/* Main Hero */}
      <main className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h1 className="text-3xl font-extrabold text-[#132e2b] tracking-tight">
            5 Role-Based Healthcare Portals
          </h1>
          <p className="text-xs text-[#4d7872] leading-relaxed">
            Enter your credentials on each portal's dedicated login page. Any registered user or staff member can sign in to their authorized portal.
          </p>
        </div>

        {/* 5 Portals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portals.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl p-6 border border-[#d6ebe7] shadow-sm hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#e6f5f2] border border-[#cbe7e2] text-[#0c756e] flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#e6f5f2] text-[#0c756e] border border-[#cbe7e2]">
                      {p.badge}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-[#132e2b] group-hover:text-[#0c756e] transition">
                    {p.title}
                  </h3>
                  <p className="text-xs text-[#4d7872] mt-2.5 leading-relaxed">
                    {p.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#eef6f5] flex justify-between items-center">
                  <span className="text-[11px] font-mono text-[#6b9690]">{p.url}</span>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-[#0c756e] hover:bg-[#095e58] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                  >
                    <span>Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};
