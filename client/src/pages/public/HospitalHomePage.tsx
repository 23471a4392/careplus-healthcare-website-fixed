import React, { useState } from 'react';
import {
  Plus,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Award,
  Activity,
  Heart,
  Stethoscope,
  TestTube,
  Pill,
  Bed,
  PhoneCall,
  ArrowRight,
  CheckCircle2,
  Users,
  Calendar,
  Building,
  ChevronRight,
  ExternalLink,
  Lock,
  UserPlus
} from 'lucide-react';

export const HospitalHomePage: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedRoleForLogin, setSelectedRoleForLogin] = useState<string | null>(null);

  const departments = [
    { name: 'Cardiology & Cardiac Surgery', icon: Heart, desc: 'Advanced coronary interventions, electrophysiology, and preventative heart care.', doc: 'Dr. Arjun Rao' },
    { name: 'Internal Medicine & Critical Care', icon: Stethoscope, desc: 'Comprehensive chronic disease management and 24/7 Level-1 Intensive Care.', doc: 'Dr. K. S. Verma' },
    { name: 'Dermatology & Cosmetology', icon: Activity, desc: 'Clinical dermatology, pediatric skin care, and advanced aesthetic procedures.', doc: 'Dr. Priya Sharma' },
    { name: 'Neurology & Neurosurgery', icon: ShieldCheck, desc: 'Comprehensive stroke protocols, epilepsy monitoring, and neuro-rehabilitation.', doc: 'Dr. Rahul Mehta' },
    { name: 'Pathology & Diagnostic Medicine', icon: TestTube, desc: 'Fully automated NABL-accredited laboratory delivering rapid precision analytics.', doc: 'David Miller' },
    { name: '24/7 Emergency & Trauma Center', icon: PhoneCall, desc: 'Rapid resuscitation bay, immediate ambulance dispatch, and trauma surgery.', doc: 'Trauma Team' }
  ];

  const doctors = [
    {
      name: 'Dr. Arjun Rao',
      title: 'Senior Consultant Cardiologist',
      dept: 'Department of Cardiology',
      exp: '12+ Years Experience',
      fee: '₹800',
      rating: '4.9 ★',
      desc: 'Expertise in interventional cardiology, hypertension management, and echocardiography.'
    },
    {
      name: 'Dr. Priya Sharma',
      title: 'Consultant Dermatologist',
      dept: 'Department of Dermatology',
      exp: '9+ Years Experience',
      fee: '₹700',
      rating: '4.9 ★',
      desc: 'Specialized in clinical dermatology, autoimmune skin conditions, and pediatric care.'
    },
    {
      name: 'Dr. Rahul Mehta',
      title: 'Senior Neurologist',
      dept: 'Department of Neurology',
      exp: '15+ Years Experience',
      fee: '₹900',
      rating: '4.8 ★',
      desc: 'Specialist in stroke intervention, chronic migraines, and neuromuscular disorders.'
    },
    {
      name: 'Dr. K. S. Verma',
      title: 'Chief of Medicine & Critical Care',
      dept: 'Department of Internal Medicine',
      exp: '22+ Years Experience',
      fee: '₹1200',
      rating: '5.0 ★',
      desc: 'Director of Clinical Governance, intensive care protocols, and complex diagnostic cases.'
    }
  ];

  const rolePortals = [
    { key: 'patient', name: 'Patient Portal', desc: 'Book consultations, access medical records, prescriptions & lab results.', url: '/patient', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { key: 'doctor', name: 'Doctor Portal', desc: 'Manage schedule, accept patient requests, issue e-prescriptions & order labs.', url: '/doctor', color: 'bg-teal-50 text-teal-700 border-teal-200' },
    { key: 'senior', name: 'Senior Doctor Portal', desc: 'Supervise critical cases, review treatment plans, and clinical governance.', url: '/senior', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { key: 'nurse', name: 'Nurse Station', desc: 'Inpatient ward rounds, bedside telemetry vitals logging & care rosters.', url: '/nurse', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { key: 'lab', name: 'Diagnostic Lab Portal', desc: 'Manage diagnostic test queues, specimen processing & report publishing.', url: '/lab', color: 'bg-purple-50 text-purple-700 border-purple-200' }
  ];

  return (
    <div className="min-h-screen bg-[#f3f8f7] text-[#132e2b] font-sans antialiased">
      {/* Top Header Bar */}
      <div className="bg-[#0c756e] text-white text-xs py-2 px-6 sm:px-12 flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 font-medium">
            <PhoneCall className="w-3.5 h-3.5 text-teal-200" />
            <span>Emergency 24/7: <strong>108</strong> / +91 80 2345 6789</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-teal-200" />
            <span>OPD: 8:00 AM – 8:00 PM (Mon–Sat)</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-teal-100">
          <span className="flex items-center gap-1"><Award className="w-3 h-3 text-amber-300" /> NABH & NABL Accredited</span>
          <span>·</span>
          <span>Sector 4, Healthcare Blvd, Metro City</span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40 px-6 sm:px-12 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0c756e] flex items-center justify-center text-white shadow-sm">
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-[#0c756e]">
              CarePlus Healthcare
            </span>
            <span className="hidden sm:inline-block text-[10px] uppercase font-bold text-slate-400 ml-2 tracking-wider">
              Multi-Specialty Tertiary Hospital
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600">
          <a href="#about" className="hover:text-[#0c756e] transition">About Hospital</a>
          <a href="#services" className="hover:text-[#0c756e] transition">Clinical Services</a>
          <a href="#departments" className="hover:text-[#0c756e] transition">Departments</a>
          <a href="#doctors" className="hover:text-[#0c756e] transition">Specialists</a>
          <a href="#laboratory" className="hover:text-[#0c756e] transition">Laboratory</a>
          <a href="#facilities" className="hover:text-[#0c756e] transition">Facilities</a>
          <a href="#contact" className="hover:text-[#0c756e] transition">Contact & Location</a>
        </nav>

        {/* TOP RIGHT CORNER: [Sign In] [Sign Up] */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="px-4 py-2 bg-[#0c756e] hover:bg-[#095e58] text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <a
            href="/patient"
            className="px-4 py-2 bg-white hover:bg-[#e6f5f2] text-[#0c756e] border border-[#cbe7e2] rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Sign Up</span>
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-white to-[#f3f8f7] border-b border-slate-100 py-16 sm:py-24 px-6 sm:px-12 overflow-hidden">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e6f5f2] border border-[#cbe7e2] text-[#0c756e] text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Center of Multi-Disciplinary Medical Excellence</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#132e2b] tracking-tight leading-tight">
              Exceptional Healthcare. <br />
              <span className="text-[#0c756e]">Compassionate Patient Care.</span>
            </h1>

            <p className="text-sm text-[#4d7872] leading-relaxed max-w-xl">
              CarePlus Healthcare is a premier multi-specialty tertiary care hospital dedicated to providing world-class medical treatments, 24/7 Level-1 emergency trauma care, NABL-accredited diagnostic laboratories, and verified clinical specialists.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="/patient"
                className="px-5 py-3 bg-[#0c756e] hover:bg-[#095e58] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Doctor Appointment</span>
              </a>
              <a
                href="tel:108"
                className="px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Emergency 24/7: 108</span>
              </a>
              <a
                href="#departments"
                className="px-5 py-3 bg-white hover:bg-slate-50 text-[#132e2b] border border-[#d6ebe7] rounded-xl text-xs font-bold transition"
              >
                Explore Departments
              </a>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-200">
              <div>
                <div className="text-2xl font-black text-[#0c756e]">500+</div>
                <div className="text-xs text-slate-500 font-medium">Inpatient Beds</div>
              </div>
              <div>
                <div className="text-2xl font-black text-[#0c756e]">50+</div>
                <div className="text-xs text-slate-500 font-medium">Specialist Doctors</div>
              </div>
              <div>
                <div className="text-2xl font-black text-[#0c756e]">24/7</div>
                <div className="text-xs text-slate-500 font-medium">Trauma & ICU</div>
              </div>
              <div>
                <div className="text-2xl font-black text-[#0c756e]">99.2%</div>
                <div className="text-xs text-slate-500 font-medium">Clinical Satisfaction</div>
              </div>
            </div>
          </div>

          {/* Hero Visual Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl p-7 border border-[#d6ebe7] shadow-xl relative overflow-hidden space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-[#e6f5f2] border border-[#cbe7e2] text-[#0c756e] flex items-center justify-center font-black">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0c756e]">Integrated Digital Healthcare</span>
                <h3 className="text-lg font-bold text-[#132e2b] mt-0.5">Real-Time Connected Medical Care</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  From electronic consultations and diagnostic pathology to in-house pharmacy dispensing, every step of your health journey is coordinated seamlessly in real time.
                </p>
              </div>

              <div className="p-4 bg-[#f8fbfb] rounded-2xl border border-[#eef6f5] space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#132e2b]">
                  <CheckCircle2 className="w-4 h-4 text-[#0c756e]" />
                  <span>Immediate Electronic Appointments & Live Queues</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#132e2b]">
                  <CheckCircle2 className="w-4 h-4 text-[#0c756e]" />
                  <span>Automated Pathology Lab & Digital Report Delivery</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#132e2b]">
                  <CheckCircle2 className="w-4 h-4 text-[#0c756e]" />
                  <span>24/7 Critical Care Supervision & Patient Monitoring</span>
                </div>
              </div>

              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full py-3 bg-[#0c756e] hover:bg-[#095e58] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
              >
                <span>Access Role Portals (Patient, Doctor, Staff)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose CarePlus */}
      <section id="about" className="py-16 px-6 sm:px-12 max-w-6xl mx-auto space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#0c756e]">Hospital Overview</span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#132e2b] tracking-tight">Why Patients Trust CarePlus Healthcare</h2>
          <p className="text-xs text-[#4d7872] leading-relaxed">
            Combining state-of-the-art medical technology with empathetic clinical care to achieve superior healthcare outcomes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-[#d6ebe7] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0c756e] flex items-center justify-center font-bold">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#132e2b]">Distinguished Senior Physicians</h3>
            <p className="text-xs text-[#4d7872] leading-relaxed">
              Our clinical faculty comprises renowned doctors with decades of tertiary experience across cardiology, neurology, surgery, and critical care medicine.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#d6ebe7] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <TestTube className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#132e2b]">NABL-Accredited Pathology</h3>
            <p className="text-xs text-[#4d7872] leading-relaxed">
              Equipped with fully automated biochemistry, hematology, and immunology analyzers to deliver accurate, verified diagnostic reports with real-time digital access.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#d6ebe7] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
              <PhoneCall className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#132e2b]">24/7 Critical Trauma Response</h3>
            <p className="text-xs text-[#4d7872] leading-relaxed">
              Dedicated Level-1 emergency department with dedicated resuscitation bays, mobile ICU ambulances, and emergency surgery operating rooms.
            </p>
          </div>
        </div>
      </section>

      {/* Clinical Departments */}
      <section id="departments" className="bg-white py-16 px-6 sm:px-12 border-y border-slate-100">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#0c756e]">Specialized Centers</span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#132e2b] tracking-tight mt-1">Clinical Departments</h2>
            </div>
            <a href="/patient" className="text-xs font-bold text-[#0c756e] hover:underline flex items-center gap-1">
              <span>View All OPD Schedules</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((d, i) => {
              const Icon = d.icon;
              return (
                <div key={i} className="p-6 rounded-2xl bg-[#f8fbfb] border border-[#d6ebe7] hover:border-[#0c756e] transition space-y-3 group">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-xl bg-white text-[#0c756e] border border-[#cbe7e2] flex items-center justify-center shadow-sm">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[#0c756e] border border-[#cbe7e2]">
                      {d.doc}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-[#132e2b] group-hover:text-[#0c756e] transition">{d.name}</h3>
                  <p className="text-xs text-[#4d7872] leading-relaxed">{d.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Doctors & Specialists Catalog */}
      <section id="doctors" className="py-16 px-6 sm:px-12 max-w-6xl mx-auto space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#0c756e]">Medical Faculty</span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#132e2b] tracking-tight">Our Leading Medical Specialists</h2>
          <p className="text-xs text-[#4d7872] leading-relaxed">
            Consult with verified experts across diverse medical and surgical disciplines.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {doctors.map((doc, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-[#d6ebe7] shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#e6f5f2] border border-[#0c756e] text-[#0c756e] flex items-center justify-center font-black text-base shadow-sm mb-3">
                  {doc.name.split(' ').map(n=>n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-sm text-[#132e2b]">{doc.name}</h3>
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">{doc.rating}</span>
                </div>
                <p className="text-xs font-semibold text-[#0c756e] mt-0.5">{doc.title}</p>
                <p className="text-[11px] text-slate-400">{doc.dept}</p>
                <p className="text-xs text-[#4d7872] mt-2.5 leading-relaxed">{doc.desc}</p>
              </div>

              <div className="pt-3 border-t border-[#eef6f5] flex justify-between items-center text-xs">
                <span className="font-bold text-[#132e2b]">Fee: {doc.fee}</span>
                <a
                  href="/patient"
                  className="px-3 py-1.5 bg-[#0c756e] hover:bg-[#095e58] text-white rounded-lg font-bold text-[11px]"
                >
                  Book Visit
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Laboratory, Pharmacy & Emergency Section */}
      <section id="laboratory" className="bg-white py-16 px-6 sm:px-12 border-y border-slate-100">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Lab */}
          <div className="p-6 rounded-2xl bg-[#f8fbfb] border border-[#d6ebe7] space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <TestTube className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#132e2b]">Diagnostic Pathology Lab</h3>
              <p className="text-xs text-[#4d7872] mt-1 leading-relaxed">
                Automated clinical pathology offering Complete Blood Count (CBC), Comprehensive Metabolic Panel, HbA1c, Lipid Profiles, and Thyroid panels with rapid digital reporting.
              </p>
            </div>
            <div className="text-xs font-semibold text-purple-700 bg-purple-50 p-2.5 rounded-xl border border-purple-100">
              ✓ Walk-in & Home Sample Collection Available
            </div>
          </div>

          {/* Pharmacy */}
          <div className="p-6 rounded-2xl bg-[#f8fbfb] border border-[#d6ebe7] space-y-4">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#0c756e] flex items-center justify-center">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#132e2b]">24/7 In-House Pharmacy</h3>
              <p className="text-xs text-[#4d7872] mt-1 leading-relaxed">
                Fully stocked hospital dispensary carrying authentic pharmaceuticals, critical care medications, and digital e-prescription fulfillment.
              </p>
            </div>
            <div className="text-xs font-semibold text-[#0c756e] bg-[#e6f5f2] p-2.5 rounded-xl border border-[#cbe7e2]">
              ✓ Direct Digital Prescription Integration
            </div>
          </div>

          {/* Emergency */}
          <div className="p-6 rounded-2xl bg-[#f8fbfb] border border-[#d6ebe7] space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#132e2b]">24/7 Trauma Care & Ambulance</h3>
              <p className="text-xs text-[#4d7872] mt-1 leading-relaxed">
                Emergency response unit with dedicated life-support ambulances, trauma surgical suites, and round-the-clock emergency physicians.
              </p>
            </div>
            <a
              href="tel:108"
              className="inline-block w-full py-2.5 text-center text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition"
            >
              Call National Emergency: 108
            </a>
          </div>
        </div>
      </section>

      {/* Facilities & Patient Care Information */}
      <section id="facilities" className="py-16 px-6 sm:px-12 max-w-6xl mx-auto space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#0c756e]">Hospital Infrastructure</span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#132e2b] tracking-tight">World-Class Healthcare Facilities</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-xl border border-[#d6ebe7] text-center space-y-1">
            <Bed className="w-6 h-6 text-[#0c756e] mx-auto" />
            <div className="font-bold text-xs text-[#132e2b]">500+ Inpatient Beds</div>
            <div className="text-[11px] text-slate-400">Deluxe & Private Rooms</div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-[#d6ebe7] text-center space-y-1">
            <ShieldCheck className="w-6 h-6 text-[#0c756e] mx-auto" />
            <div className="font-bold text-xs text-[#132e2b]">ICU & CCU Units</div>
            <div className="text-[11px] text-slate-400">Continuous Telemetry</div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-[#d6ebe7] text-center space-y-1">
            <Award className="w-6 h-6 text-[#0c756e] mx-auto" />
            <div className="font-bold text-xs text-[#132e2b]">Cashless Insurance TPA</div>
            <div className="text-[11px] text-slate-400">All Major Insurers</div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-[#d6ebe7] text-center space-y-1">
            <Activity className="w-6 h-6 text-[#0c756e] mx-auto" />
            <div className="font-bold text-xs text-[#132e2b]">Advanced Radiology</div>
            <div className="text-[11px] text-slate-400">MRI, CT Scan, X-Ray</div>
          </div>
        </div>
      </section>

      {/* Hospital Location, Address & Contact Details */}
      <section id="contact" className="bg-white py-16 px-6 sm:px-12 border-t border-slate-100">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-5">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#0c756e]">Contact Information</span>
            <h2 className="text-2xl font-black text-[#132e2b] tracking-tight">Visit CarePlus Healthcare</h2>
            <p className="text-xs text-[#4d7872] leading-relaxed">
              Conveniently located in Sector 4 with ample parking, dedicated emergency ambulance bays, and patient assistance desks.
            </p>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#0c756e] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#132e2b]">Hospital Campus Address:</strong>
                  <p className="text-[#4d7872]">CarePlus Multi-Specialty Hospital, Healthcare Boulevard, Sector 4, Metro City, 560001</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#0c756e] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#132e2b]">Telephone Hotlines:</strong>
                  <p className="text-[#4d7872]">Appointments: +91 80 2345 6789 · Emergency: 108</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#0c756e] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#132e2b]">Email Inquiries:</strong>
                  <p className="text-[#4d7872]">contact@careplus.com · appointments@careplus.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#0c756e] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#132e2b]">Operational Working Hours:</strong>
                  <p className="text-[#4d7872]">Outpatient Clinics: Mon–Sat 8:00 AM – 8:00 PM<br />Emergency & Inpatient Admissions: 24/7/365 Open</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Map Visual Card */}
          <div className="lg:col-span-7 bg-[#f8fbfb] p-6 rounded-3xl border border-[#d6ebe7] shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-[#0c756e]" />
                <span className="font-bold text-xs text-[#132e2b]">CarePlus Main Medical Campus</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Open 24/7</span>
            </div>

            {/* Stylized Hospital Map Diagram */}
            <div className="h-56 bg-slate-200 rounded-2xl overflow-hidden relative border border-slate-300 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-[#e8f3f1] flex items-center justify-center">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-[#0c756e] text-white flex items-center justify-center mx-auto shadow-md animate-pulse">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div className="font-bold text-xs text-[#0c756e]">CarePlus Healthcare Main Center</div>
                  <div className="text-[11px] text-slate-500">Healthcare Boulevard, Sector 4 · Metro City</div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Need driving directions or ambulance dispatch?</span>
              <a
                href="tel:108"
                className="px-4 py-2 bg-[#0c756e] text-white font-bold rounded-xl text-xs hover:bg-[#095e58] transition"
              >
                Emergency Dispatch
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Public Footer */}
      <footer className="bg-[#0b2421] text-teal-100 py-12 px-6 sm:px-12 border-t border-[#143a35]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-xs">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#1de9b6] text-[#0b2421] flex items-center justify-center font-black">
                <Plus className="w-4 h-4 stroke-[3]" />
              </div>
              <span className="font-extrabold text-base text-white">CarePlus Healthcare</span>
            </div>
            <p className="text-teal-300 leading-relaxed text-[11px]">
              Multi-specialty healthcare institution committed to delivering cutting-edge medical interventions and compassionate clinical care.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">Role Portals</h4>
            <div className="space-y-2 text-teal-300">
              <div><a href="/patient" className="hover:text-white transition">Patient Portal</a></div>
              <div><a href="/doctor" className="hover:text-white transition">Physician Portal</a></div>
              <div><a href="/senior" className="hover:text-white transition">Senior Doctor Portal</a></div>
              <div><a href="/nurse" className="hover:text-white transition">Nurse Station</a></div>
              <div><a href="/lab" className="hover:text-white transition">Diagnostic Lab Portal</a></div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">Clinical Centers</h4>
            <div className="space-y-2 text-teal-300">
              <div>Cardiology & CCU</div>
              <div>Internal Medicine</div>
              <div>Neurology Center</div>
              <div>Dermatology Clinic</div>
              <div>Automated Pathology</div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">Accreditation</h4>
            <p className="text-teal-300 text-[11px] leading-relaxed">
              CarePlus Healthcare is fully certified by NABH, NABL, and ISO 9001:2015 for clinical quality, patient safety, and medical governance.
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-6 border-t border-[#143a35] flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] text-teal-400">
          <div>© 2026 CarePlus Healthcare Management System. All rights reserved.</div>
          <div>HIPAA & NABH Compliant · Privacy Policy · Terms of Clinical Care</div>
        </div>
      </footer>

      {/* Role Sign In Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a1e1b]/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-[#cbe7e2] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#e4f3f0] flex items-center justify-between bg-[#f8fbfb]">
              <div>
                <h3 className="font-bold text-sm text-[#0c756e]">Sign In to CarePlus Healthcare</h3>
                <p className="text-xs text-slate-500">Select your role to access your dedicated clinical portal</p>
              </div>
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-3">
              {rolePortals.map((p) => (
                <a
                  key={p.key}
                  href={p.url}
                  className="p-3.5 rounded-xl border border-[#d6ebe7] hover:border-[#0c756e] hover:bg-[#f8fbfb] transition flex items-center justify-between group block"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#132e2b] group-hover:text-[#0c756e] transition">
                        {p.name}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${p.color}`}>
                        {p.key.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{p.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0c756e] transition shrink-0 ml-2" />
                </a>
              ))}
            </div>

            <div className="px-6 py-3 bg-[#f8fbfb] border-t border-[#e4f3f0] flex justify-between items-center text-xs">
              <span className="text-slate-500">New patient?</span>
              <a href="/patient" className="font-bold text-[#0c756e] hover:underline">
                Create Patient Account →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
