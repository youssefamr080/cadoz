import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from 'axios';

// Types
type UserRole = 'user' | 'admin';

interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  phone?: string; // Added for compatibility with phone-based authentication
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
}

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  authMethod: 'none',
  phoneNumberRequired: false,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password, phone }: { email?: string; password: string; phone?: string }, { rejectWithValue }) => {
    try {
      // Support both email and phone-based login
      const payload = phone ? { phone, password } : { email, password };
      console.log('Login payload:', payload);
      
      const response = await axios.post('/api/auth/login', payload);
      
      if (response.data.success) {
        console.log('Login successful, user data:', response.data.user);
        return response.data.user;
      } else {
        console.error('Login failed:', response.data.message);
        return rejectWithValue(response.data.message || 'فشل تسجيل الدخول');
      }
    } catch (error) {
      console.error('Login error:', error);
      return rejectWithValue((error as Error).message);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async ({ name, email, password, phoneNumber }: { 
    name: string; 
    email: string; 
    password: string;
    phoneNumber: string;
  }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/auth/register', { 
        name, 
        email, 
        password,
        phoneNumber
      });
      
      if (response.data.success) {
        return response.data.user;
      } else {
        return rejectWithValue(response.data.message || 'فشل إنشاء الحساب');
      }
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await axios.post('/api/auth/logout');
      return null;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData: Partial<User>, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/auth/profile', userData);
      
      if (response.data.success) {
        return userData;
      } else {
        return rejectWithValue(response.data.message || 'فشل تحديث الملف الشخصي');
      }
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updatePhoneNumber = createAsyncThunk(
  'auth/updatePhoneNumber',
  async ({ userId, phoneNumber }: PhoneUpdateData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/auth/update-phone', { 
        userId, 
        phoneNumber 
      });
      
      if (response.data.success) {
        return { phoneNumber };
      } else {
        return rejectWithValue(response.data.message || 'فشل تحديث رقم الهاتف');
      }
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const checkSession = createAsyncThunk(
  'auth/checkSession',
  async (_, { rejectWithValue }) => {
    try {
      console.log('[REDUX] Checking session status');
      
      // 1. أولاً، نحاول الحصول على بيانات الجلسة من localStorage
      let localUserData = null;
      if (typeof window !== 'undefined') {
        try {
          const storedUser = localStorage.getItem('userData');
          if (storedUser) {
            localUserData = JSON.parse(storedUser);
            console.log('[REDUX] Found user data in localStorage:', { id: localUserData.id });
          }
        } catch (e) {
          console.error('[REDUX] Error reading from localStorage:', e);
        }
      }
      
      // 2. نحاول الحصول على بيانات الجلسة من API
      const response = await axios.get('/api/auth/check-session', {
        // إضافة معالجة للأخطاء لتجنب رفض الوعد عند حدوث خطأ 401
        validateStatus: function () {
          // قبول جميع رموز الحالة لتجنب رفض الوعد
          return true;
        }
      });
      
      if (response.data.user) {
        console.log('[REDUX] Session API returned user data:', { id: response.data.user.id });
        
        // 3. إذا نجحنا في الحصول على بيانات من API، نستخدمها
        return {
          user: response.data.user,
          provider: response.data.provider
        };
      } else if (localUserData && localUserData.id) {
        // 4. إذا لم نحصل على بيانات من API ولكن لدينا بيانات في localStorage، نستخدمها
        console.log('[REDUX] Using localStorage data as fallback');
        return {
          user: {
            id: localUserData.id,
            name: localUserData.name || '',
            email: localUserData.email || '',
            phone: localUserData.phone || '',
            phoneNumber: localUserData.phone || localUserData.phoneNumber || '',
            image: localUserData.image,
            role: localUserData.role || 'user'
          },
          provider: 'credentials'
        };
      } else {
        // 5. إذا لم نحصل على بيانات من أي مصدر، نعتبر المستخدم غير مسجل الدخول
        console.log('[REDUX] No session data found');
        return null;
      }
    } catch (error) {
      console.error('[REDUX] Error checking session:', error);
      
      // 6. في حالة حدوث خطأ، نحاول استخدام بيانات localStorage كحل بديل
      if (typeof window !== 'undefined') {
        try {
          const storedUser = localStorage.getItem('userData');
          if (storedUser) {
            const localUserData = JSON.parse(storedUser);
            if (localUserData && localUserData.id) {
              console.log('[REDUX] Using localStorage data after API error');
              return {
                user: {
                  id: localUserData.id,
                  name: localUserData.name || '',
                  email: localUserData.email || '',
                  phone: localUserData.phone || '',
                  phoneNumber: localUserData.phone || localUserData.phoneNumber || '',
                  image: localUserData.image,
                  role: localUserData.role || 'user'
                },
                provider: 'credentials'
              };
            }
          }
        } catch (e) {
          console.error('[REDUX] Error reading from localStorage after API error:', e);
        }
      }
      
      return rejectWithValue((error as Error).message);
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    resetError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
      state.authMethod = 'credentials';
      state.phoneNumberRequired = false;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
      state.isAuthenticated = false;
    });

    // Register
    builder.addCase(register.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
      state.authMethod = 'credentials';
      state.phoneNumberRequired = false;
    });
    builder.addCase(register.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Logout
    builder.addCase(logout.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(logout.fulfilled, (state) => {
      state.isLoading = false;
      state.user = null;
      state.isAuthenticated = false;
      state.authMethod = 'none';
      state.phoneNumberRequired = false;
      state.error = null;
    });
    builder.addCase(logout.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Update Profile
    builder.addCase(updateProfile.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.isLoading = false;
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    });
    builder.addCase(updateProfile.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Update Phone Number
    builder.addCase(updatePhoneNumber.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updatePhoneNumber.fulfilled, (state, action) => {
      state.isLoading = false;
      if (state.user) {
        state.user = { ...state.user, phoneNumber: action.payload.phoneNumber };
      }
      state.phoneNumberRequired = false;
    });
    builder.addCase(updatePhoneNumber.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Check Session
    builder.addCase(checkSession.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(checkSession.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.authMethod = action.payload.provider === 'google' ? 'google' : 'credentials';
        state.phoneNumberRequired = action.payload.provider === 'google' && !action.payload.user.phoneNumber;
      } else {
        state.user = null;
        state.isAuthenticated = false;
        state.authMethod = 'none';
        state.phoneNumberRequired = false;
      }
    });
    builder.addCase(checkSession.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setUser, resetError } = authSlice.actions;
export default authSlice.reducer;
