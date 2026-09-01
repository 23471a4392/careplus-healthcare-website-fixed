import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/index.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  portalKey: string;
  demoUsers: { id: string; email: string; name: string; role: UserRole; specialty?: string }[];
  isLoading: boolean;
  loginAsDemoUser: (email: string) => Promise<void>;
  logout: () => void;
  updateUserAvatar: (avatarUrl: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode; defaultPortalRole?: string }> = ({
  children,
  defaultPortalRole
}) => {
  // Determine active portal key based on pathname or prop
  const getPortalKey = () => {
    const path = window.location.pathname.toLowerCase();
    if (path.startsWith('/patient')) return 'patient';
    if (path.startsWith('/doctor')) return 'doctor';
    if (path.startsWith('/senior')) return 'senior';
    if (path.startsWith('/nurse')) return 'nurse';
    if (path.startsWith('/lab')) return 'lab';
    return defaultPortalRole || 'patient';
  };

  const portalKey = getPortalKey();
  const tokenStorageKey = `careplus_token_${portalKey}`;

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem(tokenStorageKey));
  const [demoUsers, setDemoUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Default emails per portal
  const getDefaultEmailForPortal = (key: string) => {
    switch (key) {
      case 'doctor': return 'doctor.arjun@careplus.com';
      case 'senior': return 'senior.verma@careplus.com';
      case 'nurse': return 'nurse.sarah@careplus.com';
      case 'lab': return 'lab.david@careplus.com';
      case 'patient':
      default:
        return 'patient@careplus.com';
    }
  };

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

  const loginAsDemoUser = async (email: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'password123' })
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem(tokenStorageKey, data.token);
      }
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMe = async (authToken: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        setIsLoading(false);
      } else {
        localStorage.removeItem(tokenStorageKey);
        await loginAsDemoUser(getDefaultEmailForPortal(portalKey));
      }
    } catch {
      localStorage.removeItem(tokenStorageKey);
      await loginAsDemoUser(getDefaultEmailForPortal(portalKey));
    }
  };

  useEffect(() => {
    fetchDemoUsers();
    if (token) {
      fetchMe(token);
    } else {
      loginAsDemoUser(getDefaultEmailForPortal(portalKey));
    }
  }, [portalKey]);

  const logout = () => {
    localStorage.removeItem(tokenStorageKey);
    loginAsDemoUser(getDefaultEmailForPortal(portalKey));
  };

  const updateUserAvatar = (avatarUrl: string) => {
    if (user) {
      setUser({ ...user, avatarUrl });
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, portalKey, demoUsers, isLoading, loginAsDemoUser, logout, updateUserAvatar }}
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
