"use client";

import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import { RootState, AppDispatch } from '@/lib/redux/store';
import { setUser, login, register, logout, updateProfile, updatePhoneNumber, checkSession } from '@/lib/redux/slices/authSlice';

// Import the UserRole type
type UserRole = 'user' | 'admin';

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
  checkSession: () => Promise<void>;
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Proveedor del contexto
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { data: session } = useSession();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const isLoading = useSelector((state: RootState) => state.auth.isLoading);

  // Sync Redux user state with NextAuth session
  useEffect(() => {
    try {
      console.log('[AUTH_PROVIDER] Starting session sync');
      
      // 1. Check if there's a user in localStorage first
      let userData = null;
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('userData');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser && parsedUser.id) {
              console.log('[AUTH_PROVIDER] Found user data in localStorage:', { id: parsedUser.id, name: parsedUser.name });
              userData = {
                id: parsedUser.id,
                name: parsedUser.name || '',
                email: parsedUser.email || '',
                image: parsedUser.image || undefined,
                phoneNumber: parsedUser.phone || parsedUser.phoneNumber || '',
                phone: parsedUser.phone || parsedUser.phoneNumber || '',
                role: (parsedUser.role === 'admin' ? 'admin' : 'user') as UserRole,
              };
            }
          } catch (parseError) {
            console.error('[AUTH_PROVIDER] Error parsing user data from localStorage:', parseError);
          }
        } else {
          console.log('[AUTH_PROVIDER] No user data found in localStorage');
        }
      }
      
      // 2. If we have a session, use that data (it takes precedence over localStorage)
      if (session?.user) {
        const userObj = session.user as unknown as Record<string, unknown>;
        console.log('[AUTH_PROVIDER] NextAuth session user data:', { 
          id: userObj.id || 'missing', 
          name: userObj.name || 'missing',
          phone: userObj.phone || userObj.phoneNumber || 'missing'
        });
        
        // Safely extract user data with fallbacks
        userData = {
          id: userObj.id || userObj.sub || '',
          name: userObj.name || '',
          email: userObj.email || '',
          image: userObj.image || undefined,
          // Support both phoneNumber and phone fields for backward compatibility
          phoneNumber: userObj.phoneNumber || userObj.phone || '',
          phone: userObj.phone || userObj.phoneNumber || '',
          role: (userObj.role === 'admin' ? 'admin' : 'user') as UserRole,
          emailVerified: userObj.emailVerified ? 
            (userObj.emailVerified instanceof Date ? 
              userObj.emailVerified : 
              (typeof userObj.emailVerified === 'string' || typeof userObj.emailVerified === 'number' ? 
                new Date(userObj.emailVerified as string | number) : 
                undefined)) : 
            undefined
        };
        
        console.log('[AUTH_PROVIDER] Processed user data from session for Redux');
        
        // 3. Store minimal user data in localStorage for components that might need it
        if (typeof window !== 'undefined' && userData.id) {
          const minimalUserData = {
            id: userData.id,
            name: userData.name,
            phone: userData.phone || userData.phoneNumber,
            email: userData.email,
            role: userData.role,
            image: userData.image
          };
          console.log('[AUTH_PROVIDER] Saving user data to localStorage');
          localStorage.setItem('userData', JSON.stringify(minimalUserData));
        }
      } else {
        console.log('[AUTH_PROVIDER] No NextAuth session available');
      }
      
      // 4. Update Redux state with user data (from session or localStorage)
      if (userData && userData.id) {
        console.log('[AUTH_PROVIDER] Setting user data in Redux:', { id: userData.id, name: userData.name });
        dispatch(setUser(userData));
      } else {
        // 5. Try another approach - check if we can get user data from API
        if (typeof window !== 'undefined') {
          console.log('[AUTH_PROVIDER] Attempting to fetch user session from API');
          fetch('/api/auth/check-session')
            .then(response => response.json())
            .then(data => {
              if (data.user && data.user.id) {
                console.log('[AUTH_PROVIDER] Found user data from API:', { id: data.user.id, name: data.user.name });
                const apiUserData = {
                  id: data.user.id,
                  name: data.user.name || '',
                  email: data.user.email || '',
                  image: data.user.image || undefined,
                  phoneNumber: data.user.phone || data.user.phoneNumber || '',
                  phone: data.user.phone || data.user.phoneNumber || '',
                  role: (data.user.role === 'admin' ? 'admin' : 'user') as UserRole,
                };
                
                // Save to localStorage
                localStorage.setItem('userData', JSON.stringify({
                  id: apiUserData.id,
                  name: apiUserData.name,
                  phone: apiUserData.phone || apiUserData.phoneNumber,
                  email: apiUserData.email,
                  role: apiUserData.role,
                  image: apiUserData.image
                }));
                
                // Update Redux
                dispatch(setUser(apiUserData));
              } else {
                console.log('[AUTH_PROVIDER] No user data from API, setting null in Redux');
                dispatch(setUser(null));
                
                // Clear localStorage when no session exists
                localStorage.removeItem('userData');
              }
            })
            .catch(error => {
              console.error('[AUTH_PROVIDER] Error fetching session from API:', error);
              dispatch(setUser(null));
              localStorage.removeItem('userData');
            });
        } else {
          console.log('[AUTH_PROVIDER] No valid user data available, setting null in Redux');
          dispatch(setUser(null));
        }
      }
    } catch (error) {
      console.error('[AUTH_PROVIDER] Error processing user data:', error);
      dispatch(setUser(null));
      
      // Clear localStorage on error
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userData');
      }
    }
  }, [session, dispatch]);

  // تحقق من حالة المصادقة عند تحميل التطبيق
  React.useEffect(() => {
    const checkAuthStatus = async () => {
      console.log('[AUTH_PROVIDER] Checking auth status on mount');
      try {
        // 1. تحقق مما إذا كان هناك بيانات مستخدم في localStorage
        if (typeof window !== 'undefined') {
          const storedUser = localStorage.getItem('userData');
          if (storedUser) {
            try {
              const userData = JSON.parse(storedUser);
              if (userData && userData.id) {
                console.log('[AUTH_PROVIDER] Found user data in localStorage on mount:', { id: userData.id });
                
                // 2. استدعاء API للتحقق من صحة الجلسة
                const response = await fetch('/api/auth/check-session');
                const sessionData = await response.json();
                
                if (sessionData.user && sessionData.user.id) {
                  console.log('[AUTH_PROVIDER] Session verified from API:', { id: sessionData.user.id });
                  // تحديث Redux بالبيانات من API
                  dispatch(setUser({
                    id: sessionData.user.id,
                    name: sessionData.user.name || '',
                    email: sessionData.user.email || '',
                    phoneNumber: sessionData.user.phone || sessionData.user.phoneNumber || '',
                    phone: sessionData.user.phone || sessionData.user.phoneNumber || '',
                    image: sessionData.user.image,
                    role: sessionData.user.role || 'user',
                  }));
                } else {
                  console.log('[AUTH_PROVIDER] Session not verified from API, using localStorage data');
                  // استخدام بيانات localStorage كحل بديل
                  dispatch(setUser({
                    id: userData.id,
                    name: userData.name || '',
                    email: userData.email || '',
                    phoneNumber: userData.phone || userData.phoneNumber || '',
                    phone: userData.phone || userData.phoneNumber || '',
                    image: userData.image,
                    role: userData.role || 'user',
                  }));
                }
              }
            } catch (error) {
              console.error('[AUTH_PROVIDER] Error parsing userData from localStorage:', error);
            }
          } else {
            console.log('[AUTH_PROVIDER] No userData found in localStorage on mount');
          }
        }
      } catch (error) {
        console.error('[AUTH_PROVIDER] Error checking auth status on mount:', error);
      }
    };
    
    checkAuthStatus();
  }, [dispatch]);

  // Create wrapper functions to dispatch Redux actions with proper Promise handling
  const loginHandler = async (emailOrPhone: string, password: string): Promise<void> => {
    // Determine if the input is an email or phone number
    const isEmail = emailOrPhone.includes('@');
    
    if (isEmail) {
      await dispatch(login({ email: emailOrPhone, password })).unwrap();
    } else {
      await dispatch(login({ phone: emailOrPhone, password })).unwrap();
    }
  };
  
  const registerHandler = async (name: string, email: string, password: string, phoneNumber?: string): Promise<void> => {
    await dispatch(register({ name, email, password, phoneNumber: phoneNumber || '' })).unwrap();
  };
  
  const logoutHandler = async (): Promise<void> => {
    await dispatch(logout()).unwrap();
  };
  
  const updateProfileHandler = async (userData: Partial<User>): Promise<void> => {
    await dispatch(updateProfile(userData)).unwrap();
  };
  
  const updatePhoneNumberHandler = async (data: { userId: string, phoneNumber: string }): Promise<void> => {
    await dispatch(updatePhoneNumber(data)).unwrap();
  };
  
  // Add checkSession handler
  const checkSessionHandler = async (): Promise<void> => {
    await dispatch(checkSession()).unwrap();
  };
  
  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login: loginHandler,
    register: registerHandler,
    logout: logoutHandler,
    updateProfile: updateProfileHandler,
    updatePhoneNumber: updatePhoneNumberHandler,
    checkSession: checkSessionHandler
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
