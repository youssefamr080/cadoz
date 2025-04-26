import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

type UserRole = 'user' | 'admin';

interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  role: UserRole;
  image?: string;
  emailVerified?: Date;
}

interface PhoneUpdateData {
  userId: string;
  phoneNumber: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  authMethod: 'credentials' | 'google' | 'none';
  phoneNumberRequired: boolean;
  
  // وظائف المصادقة
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phoneNumber: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  updatePhoneNumber: (data: PhoneUpdateData) => Promise<void>;
  checkSession: () => Promise<void>;
  setUser: (user: User | null) => void;
  resetError: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      authMethod: 'none',
      phoneNumberRequired: false,
      
      login: async (email, password) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await axios.post('/api/auth/login', { email, password });
          
          if (response.data.success) {
            set({ 
              user: response.data.user,
              isAuthenticated: true,
              authMethod: 'credentials',
              phoneNumberRequired: false,
              isLoading: false
            });
          } else {
            throw new Error(response.data.message || 'فشل تسجيل الدخول');
          }
        } catch (error) {
          set({ 
            isLoading: false, 
            error: (error as Error).message,
            isAuthenticated: false 
          });
        }
      },
      
      register: async (name, email, password, phoneNumber) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await axios.post('/api/auth/register', { 
            name, 
            email, 
            password,
            phoneNumber
          });
          
          if (response.data.success) {
            set({ 
              user: response.data.user,
              isAuthenticated: true,
              authMethod: 'credentials',
              phoneNumberRequired: false,
              isLoading: false
            });
          } else {
            throw new Error(response.data.message || 'فشل إنشاء الحساب');
          }
        } catch (error) {
          set({ 
            isLoading: false, 
            error: (error as Error).message 
          });
        }
      },
      
      logout: async () => {
        try {
          set({ isLoading: true });
          
          await axios.post('/api/auth/logout');
          
          set({ 
            user: null,
            isAuthenticated: false,
            authMethod: 'none',
            phoneNumberRequired: false,
            isLoading: false,
            error: null
          });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: (error as Error).message 
          });
        }
      },
      
      updateProfile: async (userData) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await axios.post('/api/auth/profile', userData);
          
          if (response.data.success) {
            const currentUser = get().user;
            set({ 
              user: { ...currentUser, ...userData } as User,
              isLoading: false
            });
          } else {
            throw new Error(response.data.message || 'فشل تحديث الملف الشخصي');
          }
        } catch (error) {
          set({ 
            isLoading: false, 
            error: (error as Error).message 
          });
        }
      },
      
      updatePhoneNumber: async ({ userId, phoneNumber }) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await axios.post('/api/auth/update-phone', { 
            userId, 
            phoneNumber 
          });
          
          if (response.data.success) {
            const currentUser = get().user;
            set({ 
              user: { ...currentUser, phoneNumber } as User,
              phoneNumberRequired: false,
              isLoading: false
            });
          } else {
            throw new Error(response.data.message || 'فشل تحديث رقم الهاتف');
          }
        } catch (error) {
          set({ 
            isLoading: false, 
            error: (error as Error).message 
          });
        }
      },
      
      checkSession: async () => {
        try {
          set({ isLoading: true });
          
          const response = await axios.get('/api/auth/check-session');
          
          if (response.data.user) {
            const user = response.data.user as User;
            
            set({ 
              user,
              isAuthenticated: true,
              // تحديد ما إذا كان المستخدم مسجلاً بواسطة Google وليس لديه رقم هاتف
              authMethod: response.data.provider === 'google' ? 'google' : 'credentials',
              phoneNumberRequired: response.data.provider === 'google' && !user.phoneNumber,
              isLoading: false
            });
          } else {
            set({ 
              user: null,
              isAuthenticated: false,
              authMethod: 'none',
              phoneNumberRequired: false,
              isLoading: false
            });
          }
        } catch (error) {
          set({ 
            isLoading: false, 
            error: (error as Error).message,
            user: null,
            isAuthenticated: false
          });
        }
      },
      
      setUser: (user) => {
        set({ 
          user,
          isAuthenticated: !!user,
          // تحديد ما إذا كان المستخدم مسجلاً بواسطة Google وليس لديه رقم هاتف
          phoneNumberRequired: user?.id && !user?.phoneNumber && get().authMethod === 'google'
        });
      },
      
      resetError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'cadoz-auth-storage',
      // استثناء بعض الحقول من التخزين المستمر
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        authMethod: state.authMethod
      }),
    }
  )
);

export default useAuthStore;
