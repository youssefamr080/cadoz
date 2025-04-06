"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { toast } from "react-toastify"
import { useSession, signOut } from "next-auth/react"

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
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { data: session, status } = useSession()

  // الحصول على التوكن
  const getToken = (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("authToken")
    }
    return null
  }

  // تحديث بيانات المستخدم
  const updateUserData = (data: Partial<UserData>) => {
    if (user) {
      const updatedUser = { ...user, ...data }
      setUser(updatedUser)
      localStorage.setItem("userData", JSON.stringify(updatedUser))
    }
  }

  // تحميل بيانات المستخدم عند بدء التطبيق
  useEffect(() => {
    const loadUser = async () => {
      try {
        setIsLoading(true)

        // التحقق من وجود جلسة NextAuth
        if (status === "authenticated" && session?.user) {
          const userData: UserData = {
            id: session.user.id as string,
            name: session.user.name || "",
            phone: (session.user as { phone?: string }).phone || "",
            email: session.user.email || "",
            image: session.user.image || undefined,
          }

          setUser(userData)
          localStorage.setItem("userData", JSON.stringify(userData))
          return
        }

        // التحقق من وجود بيانات المستخدم في التخزين المحلي
        const userDataStr = localStorage.getItem("userData")

        if (userDataStr) {
          const userData = JSON.parse(userDataStr) as UserData

          // التحقق من صحة الجلسة
          const isValid = await verifyUserSession(userData)

          if (isValid) {
            console.log("تم التحقق من صحة جلسة المستخدم:", userData.name)
            setUser(userData)
          } else {
            // إذا كانت الجلسة غير صالحة، قم بتسجيل الخروج
            localStorage.removeItem("authToken")
            localStorage.removeItem("userData")
            console.log("جلسة المستخدم غير صالحة، تم تسجيل الخروج")
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error)
        localStorage.removeItem("authToken")
        localStorage.removeItem("userData")
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [session, status])

  // التحقق من صحة جلسة المستخدم
  const verifyUserSession = async (userData: UserData): Promise<boolean> => {
    if (!userData || !userData.id || !userData.phone) return false

    try {
      const response = await fetch("/api/auth/check-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userData.id,
          phone: userData.phone,
        }),
      })

      const data = await response.json()
      return data.valid === true
    } catch (error) {
      console.error("Error verifying user session:", error)
      return false
    }
  }

  // تعديل دالة login لتحفظ بيانات المستخدم بشكل صحيح
  const login = (userData: UserData) => {
    setUser(userData)
    localStorage.setItem("userData", JSON.stringify(userData))

    // إذا كان هناك توكن في الاستجابة، قم بتخزينه
    if (userData.sessionId) {
      localStorage.setItem("authToken", userData.sessionId)
    }

    // إضافة تأكيد على نجاح تسجيل الدخول
    toast.success(`مرحباً ${userData.name}! تم تسجيل الدخول بنجاح`)
  }

  // تسجيل الخروج
  const logout = async () => {
    try {
      // تسجيل الخروج من NextAuth
      await signOut({ redirect: false })

      // إرسال طلب لإنهاء الجلسة على الخادم
      if (user) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
          }),
        })
      }
    } catch (error) {
      console.error("Error logging out:", error)
    } finally {
      // حذف بيانات المستخدم من التخزين المحلي
      setUser(null)
      localStorage.removeItem("authToken")
      localStorage.removeItem("userData")
      toast.info("تم تسجيل الخروج بنجاح")
    }
  }

  // التحقق من جلسة المستخدم الحالية
  const checkSession = async (): Promise<boolean> => {
    if (!user) return false
    return await verifyUserSession(user)
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

