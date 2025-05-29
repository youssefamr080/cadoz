"use client"

import { createContext, useContext, type ReactNode } from "react"
import { toast } from "react-toastify"
import { useSession, signOut } from "next-auth/react"
import { useSelector, useDispatch } from "react-redux"
import { RootState, AppDispatch } from "@/lib/redux/store"
import { setUser, logout as reduxLogout, updateProfile, checkSession as reduxCheckSession } from "@/lib/redux/slices/authSlice"

// استيراد نوع UserRole من Redux
type UserRole = 'user' | 'admin';

export interface UserData {
  id: string
  name: string
  phone: string
  email?: string
  password?: string
  avatarUrl?: string
  sessionId?: string
  createdAt?: string
  image?: string
  role?: UserRole // تغيير النوع من string إلى UserRole
  phoneNumber?: string // إضافة لدعم التوافق مع مكونات أخرى
  isLoggingOut?: boolean
}

interface AuthContextType {
  user: UserData | null
  isLoading: boolean
  login: (userData: UserData) => void
  logout: () => void
  checkSession: () => Promise<boolean>
  getToken: () => string | null
  updateUserData: (data: Partial<UserData>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useDispatch<AppDispatch>()
  const reduxUser = useSelector((state: RootState) => state.auth.user)
  const isLoading = useSelector((state: RootState) => state.auth.isLoading)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: session } = useSession()
  
  // Convert Redux user to AuthContext UserData format
  const user: UserData | null = reduxUser ? {
    id: reduxUser.id,
    name: reduxUser.name,
    phone: reduxUser.phoneNumber || "",
    email: reduxUser.email,
    image: reduxUser.image,
  } : null

  // الحصول على التوكن
  const getToken = (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("authToken")
    }
    return null
  }

  // تحديث بيانات المستخدم
  const updateUserData = (data: Partial<UserData>) => {
    if (reduxUser) {
      // Convert UserData format to Redux User format
      const reduxUserData = {
        ...data,
        phoneNumber: data.phone,
        // نستخدم نوع UserRole مباشرة لأنه متوافق مع النوع المطلوب في Redux
        role: data.role || 'user' as UserRole
      }
      
      dispatch(updateProfile(reduxUserData))
    }
  }

  // We don't need this useEffect anymore as the Redux state handles session management

  // ملاحظة: تم إزالة دالة verifyUserSession غير المستخدمة

  // تعديل دالة login لاستخدام Redux
  const login = (userData: UserData) => {
    if (!userData || !userData.id || !userData.name) {
      console.error("Invalid user data provided to login function")
      return
    }

    try {
      // Convert to Redux user format and dispatch setUser action
      dispatch(setUser({
        id: userData.id,
        name: userData.name,
        email: userData.email || "",
        // Support both phone and phoneNumber for better compatibility
        phoneNumber: userData.phone,
        phone: userData.phone,
        role: "user",
        image: userData.image,
      }))
      
      // Store minimal user data in localStorage for components that might need it
      if (typeof window !== "undefined") {
        const minimalUserData = {
          id: userData.id,
          name: userData.name,
          phone: userData.phone,
          email: userData.email || ""
        }
        localStorage.setItem("userData", JSON.stringify(minimalUserData))
      }
      
      // إضافة تأكيد على نجاح تسجيل الدخول
      toast.success(`مرحباً ${userData.name}! تم تسجيل الدخول بنجاح`)
      
      console.log("تم تسجيل دخول المستخدم بنجاح:", userData.name)
    } catch (error) {
      console.error("Error during login:", error)
      toast.error("حدث خطأ أثناء تسجيل الدخول")
    }
  }

  // تسجيل الخروج - with improved error handling
  const logout = async () => {
    try {
      // 1. تنفيذ تسجيل الخروج من NextAuth
      await signOut({ redirect: false })

      // 2. استدعاء API تسجيل الخروج
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'فشل تسجيل الخروج')
      }

      // 3. مسح بيانات المستخدم من التخزين المحلي
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userData')
        localStorage.removeItem('authToken')
        sessionStorage.clear() // Clear any session storage data
      }

      // 4. تحديث حالة Redux
      await dispatch(reduxLogout()).unwrap()

      // 5. إظهار رسالة نجاح
      toast.success('تم تسجيل الخروج بنجاح')
    } catch (error) {
      console.error("Error logging out:", error)
      toast.error(error instanceof Error ? error.message : 'حدث خطأ أثناء تسجيل الخروج')
      throw error // Re-throw to handle in the UI
    }
  }

  // التحقق من جلسة المستخدم الحالية
  const checkSession = async (): Promise<boolean> => {
    try {
      await dispatch(reduxCheckSession()).unwrap()
      return true
    } catch (error) {
      console.error("Error checking session:", error)
      return false
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        checkSession,
        getToken,
        updateUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Hook لاستخدام سياق المصادقة
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth يجب أن يستخدم داخل AuthProvider")
  }
  return context
}

