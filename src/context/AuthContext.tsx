import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, RoleName } from '../types';
import { api } from '../api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  isBusinessOwnerAdmin: boolean;
  isPlatformAdmin: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isTherapist: boolean;
  hasRole: (role: RoleName) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('besawa_auth_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    api
      .getMe()
      .then((res) => {
        setUser(res.user);
      })
      .catch((err) => {
        console.warn('Session expired or invalid:', err.message);
        localStorage.removeItem('besawa_auth_token');
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    localStorage.setItem('besawa_auth_token', res.token);
    setUser(res.user);
  };

  const logout = () => {
    api.logout().catch(() => {});
    localStorage.removeItem('besawa_auth_token');
    setUser(null);
  };

  const hasRole = (role: RoleName): boolean => {
    if (!user) return false;
    return user.roles.includes(role);
  };

  const isBusinessOwnerAdmin = hasRole('BUSINESS_OWNER_ADMIN') || hasRole('SUPER_ADMIN');
  const isPlatformAdmin = hasRole('PLATFORM_ADMIN');
  const isSuperAdmin = isBusinessOwnerAdmin;
  const isAdmin = isBusinessOwnerAdmin || isPlatformAdmin || hasRole('ADMIN');
  const isTherapist = hasRole('THERAPIST');

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isBusinessOwnerAdmin,
        isPlatformAdmin,
        isSuperAdmin,
        isAdmin,
        isTherapist,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
