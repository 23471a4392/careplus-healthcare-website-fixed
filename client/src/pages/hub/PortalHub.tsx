import React from 'react';
import { Plus, User, Stethoscope, ShieldCheck, Bed, TestTube, ArrowRight } from 'lucide-react';

export const PortalHub: React.FC = () => {
  const portals = [
    {
      id: 'patient',
      title: 'Patient Portal',
      url: '/patient',
      role: 'PATIENT',
      user: 'Vaseem Basha',
      desc: 'Book doctor appointments, monitor longitudinal vitals, access prescriptions & pathology lab records.',
      icon: User,
      badge: 'Self-Service & Telehealth'
    },
    {
      id: 'doctor',
      title: 'Doctor Portal',
      url: '/doctor',
      role: 'DOCTOR',
      user: 'Dr. Arjun Rao (Cardiologist)',
      desc: 'Review consultation schedule, accept appointments, issue prescriptions, and order diagnostics.',
      icon: Stethoscope,
      badge: 'Physician Practice'
    },
    {
      id: 'senior',
      title: 'Senior Doctor Portal',
      url: '/senior',
      role: 'SENIOR_DOCTOR',
      user: 'Dr. K. S. Verma (Chief of Medicine)',
      desc: 'Clinical supervision, critical care governance, and treatment plan approval workflows.',
      icon: ShieldCheck,
      badge: 'Clinical Governance'
    },
    {
      id: 'nurse',
      title: 'Nurse Portal',
      url: '/nurse',
      role: 'NURSE',
      user: 'Sarah Jenkins, RN',
      desc: 'Inpatient ward rounds, electronic vitals recording, and medication administration roster.',
      icon: Bed,
      badge: 'Inpatient Operations'
    },
    {
      id: 'lab',
      title: 'Lab Technician Portal',
      url: '/lab',
      role: 'LAB_TECHNICIAN',
      user: 'David Miller',
      desc: 'Diagnostic pathology orders queue, specimen processing, and verified report publishing.',
      icon: TestTube,
      badge: 'Pathology & Diagnostics'
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
            Multi-Portal Healthcare Ecosystem
          </span>
        </div>
      </header>

      {/* Main Hero */}
      <main className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h1 className="text-3xl font-extrabold text-[#132e2b] tracking-tight">
            5 Dedicated Role-Based Healthcare Portals
          </h1>
          <p className="text-sm text-[#4d7872] leading-relaxed">
            Open each portal in its own browser tab to test concurrent, bilateral real-time communication across the unified CarePlus backend.
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
                  <p className="text-xs font-semibold text-[#0c756e] mt-0.5">
                    User: {p.user}
                  </p>
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
                    <span>Launch Portal</span>
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
