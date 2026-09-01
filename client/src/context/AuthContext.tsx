import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/index.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  portalKey: string;
  demoUsers: { id: string; email: string; name: string; role: UserRole; specialty?: string }[];
  isLoading: boolean;
  loginWithCredentials: (email: string, password: string, targetPortalKey: string) => Promise<boolean>;
  loginAsDemoUser: (email: string) => Promise<boolean>;
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
  const tokenStorageKey = `careplus_token_${portalKey}`;

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem(tokenStorageKey));
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
        // Validate user role matches the active portal
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
          localStorage.removeItem(tokenStorageKey);
          setUser(null);
          setToken(null);
        }
      } else {
        localStorage.removeItem(tokenStorageKey);
        setUser(null);
        setToken(null);
      }
    } catch {
      localStorage.removeItem(tokenStorageKey);
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

  // Login with Email & Password Credentials
  const loginWithCredentials = async (email: string, pass: string, targetPortalKey: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: pass.trim() })
      });
      const data = await res.json();

      if (data.success && data.user && data.token) {
        const role = data.user.role;
        // Verify role authorization for this specific portal
        const isAuthorized =
          (targetPortalKey === 'patient' && role === 'PATIENT') ||
          (targetPortalKey === 'doctor' && (role === 'DOCTOR' || role === 'SENIOR_DOCTOR')) ||
          (targetPortalKey === 'senior' && role === 'SENIOR_DOCTOR') ||
          (targetPortalKey === 'nurse' && role === 'NURSE') ||
          (targetPortalKey === 'lab' && role === 'LAB_TECHNICIAN');

        if (!isAuthorized) {
          throw new Error(`Your account (${role}) is not authorized for the ${targetPortalKey} portal.`);
        }

        setToken(data.token);
        setUser(data.user);
        localStorage.setItem(tokenStorageKey, data.token);
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Login error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(tokenStorageKey);
    setUser(null);
    setToken(null);
    setIsLoading(false);
  };

  const updateUserAvatar = (avatarUrl: string) => {
    if (user) {
      setUser({ ...user, avatarUrl });
    }
  };

  const loginAsDemoUser = async (email: string) => {
    return loginWithCredentials(email, 'password123', portalKey);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, portalKey, demoUsers, isLoading, loginWithCredentials, loginAsDemoUser, logout, updateUserAvatar }}
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
