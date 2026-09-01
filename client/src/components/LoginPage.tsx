import React, { useState } from 'react';
import { Plus, Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck, User, AlertCircle, CheckCircle2, Loader2, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface LoginPageProps {
  portalKey: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ portalKey }) => {
  const { loginWithCredentials, registerUser } = useAuth();

  const getPortalInfo = () => {
    switch (portalKey) {
      case 'doctor':
        return {
          title: 'Physician Portal Login',
          subtitle: 'Enter your medical credentials to access your consultation schedule and clinical desk.',
          roleTag: 'DOCTOR',
          allowRegister: false,
          sampleCredentials: [
            { email: 'doctor.arjun@careplus.com', label: 'Dr. Arjun Rao (Cardiology)' },
            { email: 'doctor.priya@careplus.com', label: 'Dr. Priya Sharma (Dermatology)' },
            { email: 'doctor.rahul@careplus.com', label: 'Dr. Rahul Mehta (Neurology)' }
          ]
        };
      case 'senior':
        return {
          title: 'Senior Doctor Portal Login',
          subtitle: 'Enter your clinical credentials for medical supervision and treatment protocol reviews.',
          roleTag: 'SENIOR_DOCTOR',
          allowRegister: false,
          sampleCredentials: [
            { email: 'senior.verma@careplus.com', label: 'Dr. K. S. Verma (Chief of Medicine)' }
          ]
        };
      case 'nurse':
        return {
          title: 'Nurse Station Login',
          subtitle: 'Enter your staff credentials for inpatient ward management and patient vitals telemetry.',
          roleTag: 'NURSE',
          allowRegister: false,
          sampleCredentials: [
            { email: 'nurse.sarah@careplus.com', label: 'Sarah Jenkins, RN (Inpatient Ward)' }
          ]
        };
      case 'lab':
        return {
          title: 'Diagnostic Lab Portal Login',
          subtitle: 'Enter your pathology technician credentials to access diagnostic queues and publish reports.',
          roleTag: 'LAB_TECHNICIAN',
          allowRegister: false,
          sampleCredentials: [
            { email: 'lab.david@careplus.com', label: 'David Miller (Pathologist)' }
          ]
        };
      case 'patient':
      default:
        return {
          title: 'Patient Portal Login',
          subtitle: 'Enter your registered email and password to access your health records and appointments.',
          roleTag: 'PATIENT',
          allowRegister: true,
          sampleCredentials: [
            { email: 'patient@careplus.com', label: 'Vaseem Basha (Primary Patient)' },
            { email: 'patient.ananya@careplus.com', label: 'Ananya Sen (Patient)' },
            { email: 'patient.vikram@careplus.com', label: 'Vikram Sethi (Patient)' }
          ]
        };
    }
  };

  const portalInfo = getPortalInfo();

  // Inputs start completely blank for manual typing
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Registration state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('O+');

  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setStatusMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setIsSubmitting(true);
    setStatusMessage('Verifying credentials with secure server...');

    try {
      const success = await loginWithCredentials(email, password, portalKey);
      if (success) {
        setStatusMessage('Authentication successful! Redirecting to portal...');
      } else {
        setErrorMessage('Invalid email or password.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
      setStatusMessage('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setStatusMessage('');

    if (!email.trim() || !password.trim() || !firstName.trim()) {
      setErrorMessage('Please provide your name, email, and a secure password.');
      return;
    }

    setIsSubmitting(true);
    setStatusMessage('Creating patient account...');

    try {
      const success = await registerUser({
        email: email.trim(),
        password: password.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        gender,
        bloodGroup,
        roleName: 'PATIENT'
      });
      if (success) {
        setStatusMessage('Registration complete! Redirecting to Patient Portal...');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try a different email.');
      setStatusMessage('');
    } finally {
      setIsSubmitting(false);
    }
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
          <span>All Portals Hub</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
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

          {/* Tab Switcher (Sign In vs Register for Patients) */}
          {portalInfo.allowRegister && (
            <div className="flex bg-[#f3f8f7] p-1 rounded-xl border border-[#d6ebe7]">
              <button
                type="button"
                onClick={() => { setActiveTab('signin'); setErrorMessage(''); setStatusMessage(''); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                  activeTab === 'signin'
                    ? 'bg-white text-[#0c756e] shadow-sm'
                    : 'text-[#4d7872] hover:text-[#132e2b]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('register'); setErrorMessage(''); setStatusMessage(''); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                  activeTab === 'register'
                    ? 'bg-white text-[#0c756e] shadow-sm'
                    : 'text-[#4d7872] hover:text-[#132e2b]'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {statusMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-2">
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              )}
              <span className="font-semibold">{statusMessage}</span>
            </div>
          )}

          {/* 1. SIGN IN FORM (Manual Entry) */}
          {activeTab === 'signin' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#234c47] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email (e.g. name@careplus.com)"
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
                    placeholder="Enter your password"
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
                className="w-full py-2.5 bg-[#0c756e] hover:bg-[#095e58] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50 mt-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Credentials & Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 2. DYNAMIC REGISTRATION FORM */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#234c47] mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className="w-full px-3 py-2 bg-slate-50 border border-[#d6ebe7] rounded-xl text-xs font-semibold text-[#132e2b] focus:bg-white focus:border-[#0c756e] transition outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#234c47] mb-1">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className="w-full px-3 py-2 bg-slate-50 border border-[#d6ebe7] rounded-xl text-xs font-semibold text-[#132e2b] focus:bg-white focus:border-[#0c756e] transition outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#234c47] mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@domain.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-[#d6ebe7] rounded-xl text-xs font-semibold text-[#132e2b] focus:bg-white focus:border-[#0c756e] transition outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#234c47] mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 bg-slate-50 border border-[#d6ebe7] rounded-xl text-xs font-semibold text-[#132e2b] focus:bg-white focus:border-[#0c756e] transition outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#234c47] mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-[#d6ebe7] rounded-xl text-xs font-semibold text-[#132e2b] focus:bg-white focus:border-[#0c756e] transition outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#234c47] mb-1">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-[#d6ebe7] rounded-xl text-xs font-semibold text-[#132e2b] focus:bg-white focus:border-[#0c756e] transition outline-none"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#234c47] mb-1">Create Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3 py-2 bg-slate-50 border border-[#d6ebe7] rounded-xl text-xs font-semibold text-[#132e2b] focus:bg-white focus:border-[#0c756e] transition outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-[#0c756e] hover:bg-[#095e58] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50 mt-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account & Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Register & Open Patient Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Reference Info Card for manual entry testing */}
          <div className="pt-4 border-t border-[#eef6f5] space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#234c47]">
              <KeyRound className="w-3.5 h-3.5 text-[#0c756e]" />
              <span>Registered Accounts Reference</span>
            </div>
            <p className="text-[11px] text-[#4d7872] leading-relaxed">
              Default password for pre-seeded staff & patients is <strong className="font-mono text-[#0c756e]">password123</strong>.
            </p>
            <div className="space-y-1 text-[11px] text-[#36615b]">
              {portalInfo.sampleCredentials.map((c, i) => (
                <div key={i} className="flex justify-between items-center py-1 px-2 rounded-lg bg-[#f8fbfb] border border-[#eef6f5]">
                  <span className="font-medium text-[#132e2b]">{c.label}</span>
                  <span className="font-mono text-[#0c756e]">{c.email}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-[#6b9690] border-t border-slate-100 bg-white">
        CarePlus Hospital Information Management System · Dynamic Manual Authentication
      </footer>
    </div>
  );
};
