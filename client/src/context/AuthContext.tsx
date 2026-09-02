import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/index.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  portalKey: string;
  demoUsers: { id: string; email: string; name: string; role: UserRole; specialty?: string }[];
  isLoading: boolean;
  loginWithCredentials: (email: string, password: string, targetPortalKey?: string) => Promise<{ success: boolean; redirectUrl: string; user?: any }>;
  registerUser: (formData: any) => Promise<boolean>;
  loginAsDemoUser: (email: string) => Promise<any>;
  logout: () => void;
  updateUserAvatar: (avatarUrl: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getPortalKey = () => {
    const path = window.location.pathname.toLowerCase();
    if (path.startsWith('/patient')) return 'patient';
    if (path.startsWith('/doctor')) return 'doctor';
    if (path.startsWith('/senior')) return 'senior';
    if (path.startsWith('/nurse')) return 'nurse';
    if (path.startsWith('/lab')) return 'lab';
    return 'patient';
  };

  const portalKey = getPortalKey();
  const tokenStorageKey = `careplus_session_${portalKey}`;

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(sessionStorage.getItem(tokenStorageKey) || sessionStorage.getItem('careplus_token'));
  const [demoUsers, setDemoUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDemoUsers = async () => {
    try {
      const res = await fetch('/api/auth/demo-users');
      const data = await res.json();
      if (data.success) {
        setDemoUsers(data.demoUsers);
      }
    } catch (err) {
      console.error('Failed to fetch demo users:', err);
    }
  };

  // Validate existing token
  const fetchMe = async (authToken: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (data.success && data.user) {
        const role = data.user.role;
        const valid =
          (portalKey === 'patient' && role === 'PATIENT') ||
          (portalKey === 'doctor' && (role === 'DOCTOR' || role === 'SENIOR_DOCTOR')) ||
          (portalKey === 'senior' && role === 'SENIOR_DOCTOR') ||
          (portalKey === 'nurse' && role === 'NURSE') ||
          (portalKey === 'lab' && role === 'LAB_TECHNICIAN');

        if (valid) {
          setUser(data.user);
        } else {
          sessionStorage.removeItem(tokenStorageKey);
          setUser(null);
          setToken(null);
        }
      } else {
        sessionStorage.removeItem(tokenStorageKey);
        setUser(null);
        setToken(null);
      }
    } catch {
      sessionStorage.removeItem(tokenStorageKey);
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDemoUsers();
    if (token) {
      fetchMe(token);
    } else {
      setIsLoading(false);
    }
  }, [portalKey]);

  // Clean Generic Login - Identifies role from unique credentials and routes accordingly
  const loginWithCredentials = async (email: string, pass: string, _targetPortalKey?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password: pass })
      });
      const data = await res.json();

      if (data.success && data.user && data.token) {
        const role = data.user.role;
        let redirectUrl = '/patient';

        if (role === 'DOCTOR') redirectUrl = '/doctor';
        else if (role === 'SENIOR_DOCTOR') redirectUrl = '/senior';
        else if (role === 'NURSE') redirectUrl = '/nurse';
        else if (role === 'LAB_TECHNICIAN') redirectUrl = '/lab';
        else redirectUrl = '/patient';

        setToken(data.token);
        setUser(data.user);

        // Store tokens across session scopes for instant seamless load
        sessionStorage.setItem('careplus_token', data.token);
        sessionStorage.setItem('careplus_session_patient', data.token);
        sessionStorage.setItem('careplus_session_doctor', data.token);
        sessionStorage.setItem('careplus_session_senior', data.token);
        sessionStorage.setItem('careplus_session_nurse', data.token);
        sessionStorage.setItem('careplus_session_lab', data.token);

        return { success: true, redirectUrl, user: data.user };
      } else {
        throw new Error('Invalid email or password.');
      }
    } catch (err: any) {
      throw new Error('Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const registerUser = async (formData: any): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success && data.user && data.token) {
        setToken(data.token);
        setUser(data.user);
        sessionStorage.setItem(tokenStorageKey, data.token);
        sessionStorage.setItem('careplus_token', data.token);
        return true;
      } else {
        throw new Error(data.message || 'Registration failed.');
      }
    } catch (err: any) {
      console.error('Register error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemoUser = async (email: string) => {
    return loginWithCredentials(email, 'password123');
  };

  const logout = () => {
    sessionStorage.clear();
    localStorage.removeItem('careplus_token');
    setUser(null);
    setToken(null);
    setIsLoading(false);
    window.location.href = '/';
  };

  const updateUserAvatar = (avatarUrl: string) => {
    if (user) {
      setUser({ ...user, avatarUrl });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        portalKey,
        demoUsers,
        isLoading,
        loginWithCredentials,
        registerUser,
        loginAsDemoUser,
        logout,
        updateUserAvatar
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
