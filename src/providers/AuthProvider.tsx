"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import useAuthStore from '@/lib/stores/useAuthStore';
import { useSession } from 'next-auth/react';

// Tipo para el usuario autenticado
interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  phoneNumber?: string;
}

// Interfaz para la actualización del número de teléfono
interface PhoneUpdateData {
  userId: string;
  phoneNumber: string;
}

// Tipo para el contexto de autenticación
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phoneNumber?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  updatePhoneNumber: (data: PhoneUpdateData) => Promise<void>;
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Proveedor del contexto
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { data: session } = useSession();
  const setUser = useAuthStore((state) => state.setUser);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const logout = useAuthStore((state) => state.logout);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const updatePhoneNumber = useAuthStore((state) => state.updatePhoneNumber);

  // Sync Zustand user state with NextAuth session
  React.useEffect(() => {
    if (session?.user) {
      setUser({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        phoneNumber: (() => {
          const u = session.user as unknown;
          if (u && typeof u === 'object') {
            if ('phoneNumber' in u && typeof (u as { phoneNumber: unknown }).phoneNumber === 'string') {
              return (u as { phoneNumber: string }).phoneNumber;
            }
            if ('phone' in u && typeof (u as { phone: unknown }).phone === 'string') {
              return (u as { phone: string }).phone;
            }
          }
          return undefined;
        })(),
        role: (() => {
          const u = session.user as unknown;
          if (u && typeof u === 'object' && 'role' in u && typeof (u as { role: unknown }).role === 'string') {
            const roleVal = (u as { role: string }).role;
            if (roleVal === 'user' || roleVal === 'admin') return roleVal;
          }
          return 'user';
        })(),
        emailVerified: (() => {
          const u = session.user as unknown;
          if (u && typeof u === 'object' && 'emailVerified' in u) {
            const ev = (u as { emailVerified: unknown }).emailVerified;
            if (ev instanceof Date) return ev;
            if (typeof ev === 'string') return new Date(ev);
          }
          return undefined;
        })(),
      });
    } else {
      setUser(null);
    }
  }, [session, setUser]);

  // Remove any old localStorage userData on mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userData');
    }
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    updatePhoneNumber
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
