import { create } from 'zustand';
import { signIn, signOut } from 'next-auth/react';

interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'user' | 'admin';
  image?: string;
  needsPhoneUpdate?: boolean;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'حدث خطأ أثناء تسجيل الدخول' });
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    set({ loading: true, error: null });
    try {
      await signOut({ redirect: true, callbackUrl: '/' });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'حدث خطأ أثناء تسجيل الخروج' });
    } finally {
      set({ loading: false });
    }
  },

  updateProfile: async (userData: Partial<User>) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('فشل تحديث الملف الشخصي');
      }

      const updatedUser = await response.json();
      set({ user: updatedUser });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'حدث خطأ أثناء تحديث الملف الشخصي' });
    } finally {
      set({ loading: false });
    }
  },
}));
