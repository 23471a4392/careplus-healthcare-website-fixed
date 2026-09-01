import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/index.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  demoUsers: { id: string; email: string; name: string; role: UserRole; specialty?: string }[];
  isLoading: boolean;
  loginAsDemoUser: (email: string) => Promise<void>;
  logout: () => void;
  updateUserAvatar: (avatarUrl: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('careplus_token'));
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
        localStorage.setItem('careplus_token', data.token);
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
        localStorage.removeItem('careplus_token');
        await loginAsDemoUser('patient@careplus.com');
      }
    } catch {
      localStorage.removeItem('careplus_token');
      await loginAsDemoUser('patient@careplus.com');
    }
  };

  useEffect(() => {
    fetchDemoUsers();
    if (token) {
      fetchMe(token);
    } else {
      loginAsDemoUser('patient@careplus.com');
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('careplus_token');
    // Smoothly switch to default demo patient on logout
    loginAsDemoUser('patient@careplus.com');
  };

  const updateUserAvatar = (avatarUrl: string) => {
    if (user) {
      setUser({ ...user, avatarUrl });
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, demoUsers, isLoading, loginAsDemoUser, logout, updateUserAvatar }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
