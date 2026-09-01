import React, { useState } from 'react';
import { Plus, Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface LoginPageProps {
  portalKey: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ portalKey }) => {
  const { loginWithCredentials, demoUsers } = useAuth();

  const getPortalInfo = () => {
    switch (portalKey) {
      case 'doctor':
        return {
          title: 'Physician Portal Login',
          subtitle: 'Doctor clinical workspace, consultation schedule & diagnostics.',
          defaultEmail: 'doctor.arjun@careplus.com',
          defaultName: 'Dr. Arjun Rao',
          roleTag: 'DOCTOR',
          accounts: [
            { email: 'doctor.arjun@careplus.com', name: 'Dr. Arjun Rao (Cardiology)', pass: 'password123' },
            { email: 'doctor.priya@careplus.com', name: 'Dr. Priya Sharma (Dermatology)', pass: 'password123' },
            { email: 'doctor.rahul@careplus.com', name: 'Dr. Rahul Mehta (Neurology)', pass: 'password123' }
          ]
        };
      case 'senior':
        return {
          title: 'Senior Doctor Portal Login',
          subtitle: 'Chief of Medicine clinical supervision & care plan approvals.',
          defaultEmail: 'senior.verma@careplus.com',
          defaultName: 'Dr. K. S. Verma',
          roleTag: 'SENIOR_DOCTOR',
          accounts: [
            { email: 'senior.verma@careplus.com', name: 'Dr. K. S. Verma (Chief of Medicine)', pass: 'password123' }
          ]
        };
      case 'nurse':
        return {
          title: 'Nurse Station Login',
          subtitle: 'Inpatient ward rounds, electronic vitals & care telemetry.',
          defaultEmail: 'nurse.sarah@careplus.com',
          defaultName: 'Sarah Jenkins, RN',
          roleTag: 'NURSE',
          accounts: [
            { email: 'nurse.sarah@careplus.com', name: 'Sarah Jenkins, RN (Inpatient Ward)', pass: 'password123' }
          ]
        };
      case 'lab':
        return {
          title: 'Diagnostic Lab Portal Login',
          subtitle: 'Pathology diagnostic orders queue & test result reports.',
          defaultEmail: 'lab.david@careplus.com',
          defaultName: 'David Miller',
          roleTag: 'LAB_TECHNICIAN',
          accounts: [
            { email: 'lab.david@careplus.com', name: 'David Miller (Pathologist)', pass: 'password123' }
          ]
        };
      case 'patient':
      default:
        return {
          title: 'Patient Portal Login',
          subtitle: 'Access personal health records, appointments & prescriptions.',
          defaultEmail: 'patient@careplus.com',
          defaultName: 'Vaseem Basha',
          roleTag: 'PATIENT',
          accounts: [
            { email: 'patient@careplus.com', name: 'Vaseem Basha (Primary Patient)', pass: 'password123' },
            { email: 'patient.ananya@careplus.com', name: 'Ananya Sen (Patient)', pass: 'password123' },
            { email: 'patient.vikram@careplus.com', name: 'Vikram Sethi (Patient)', pass: 'password123' }
          ]
        };
    }
  };

  const portalInfo = getPortalInfo();

  const [email, setEmail] = useState(portalInfo.defaultEmail);
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const success = await loginWithCredentials(email, password, portalKey);
      if (!success) {
        setErrorMessage('Invalid credentials or unauthorized role for this portal.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutofill = (accEmail: string, accPass: string) => {
    setEmail(accEmail);
    setPassword(accPass);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-[#f3f8f7] text-[#132e2b] flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="h-16 bg-white border-b border-slate-100 px-6 sm:px-8 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0c756e] flex items-center justify-center text-white shadow-sm">
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-[#0c756e]">
            CarePlus
          </span>
          <span className="text-xs text-[#0c756e] bg-[#e6f5f2] border border-[#cbe7e2] px-2.5 py-0.5 rounded-full font-semibold ml-2">
            {portalInfo.roleTag.replace('_', ' ')}
          </span>
        </a>

        <a
          href="/"
          className="text-xs font-bold text-[#0c756e] hover:underline flex items-center gap-1"
        >
          <span>All Portals</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white rounded-2xl border border-[#d6ebe7] shadow-sm p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 rounded-2xl bg-[#e6f5f2] border border-[#cbe7e2] text-[#0c756e] flex items-center justify-center mx-auto mb-3 shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-extrabold text-[#132e2b] tracking-tight">
              {portalInfo.title}
            </h1>
            <p className="text-xs text-[#4d7872] leading-relaxed max-w-xs mx-auto">
              {portalInfo.subtitle}
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#234c47] mb-1.5">
                Official Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@careplus.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-[#d6ebe7] rounded-xl text-xs font-semibold text-[#132e2b] focus:bg-white focus:border-[#0c756e] transition outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#234c47] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-[#d6ebe7] rounded-xl text-xs font-semibold text-[#132e2b] focus:bg-white focus:border-[#0c756e] transition outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-[#0c756e] hover:bg-[#095e58] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to {portalInfo.title.replace(' Login', '')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Box */}
          <div className="pt-4 border-t border-[#eef6f5] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#4d7872] uppercase tracking-wider">
                Quick Demo Credentials
              </span>
              <span className="text-[10px] text-[#0c756e] font-semibold">Click to Autofill</span>
            </div>

            <div className="space-y-1.5">
              {portalInfo.accounts.map((acc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAutofill(acc.email, acc.pass)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs transition flex items-center justify-between ${
                    email === acc.email
                      ? 'bg-[#e6f5f2] border-[#cbe7e2] text-[#0c756e] font-bold'
                      : 'bg-[#f8fbfb] border-[#eef6f5] text-[#36615b] hover:bg-[#f0f7f6] hover:border-[#d6ebe7]'
                  }`}
                >
                  <div>
                    <div className="font-bold text-[11px] leading-snug">{acc.name}</div>
                    <div className="text-[10px] opacity-75 font-mono">{acc.email} · pass: {acc.pass}</div>
                  </div>
                  {email === acc.email && (
                    <CheckCircle2 className="w-4 h-4 text-[#0c756e] shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-[#6b9690] border-t border-slate-100 bg-white">
        CarePlus Hospital Information Management System · HIPAA & NABH Compliant
      </footer>
    </div>
  );
};
