"use client"

import type React from "react"
import { Suspense } from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn, useSession } from "next-auth/react"
import { FcGoogle } from "react-icons/fc"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "react-toastify"
import { useAuth } from "@/context/AuthContext"

const LoginContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"
  const { status } = useSession()
  const { login } = useAuth()

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<"login" | "register" | "forgot">("login")

  useEffect(() => {
    // إذا كان المستخدم مسجل الدخول بالفعل، قم بتوجيهه إلى الصفحة الرئيسية
    if (status === "authenticated") {
      router.push(callbackUrl)
    }
  }, [status, router, callbackUrl])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.phone || !formData.password) {
      toast.error("الرجاء إدخال رقم الهاتف وكلمة المرور")
      return
    }

    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        redirect: false,
        phone: formData.phone,
        password: formData.password,
      })

      if (result?.ok) {
        // الحصول على بيانات المستخدم
        const response = await fetch("/api/auth/session")
        const session = await response.json()

        if (session?.user) {
          const userData = {
            id: session.user.id,
            name: session.user.name,
            phone: session.user.phone || formData.phone,
            email: session.user.email,
          }

          // حفظ بيانات المستخدم في localStorage
          localStorage.setItem("userData", JSON.stringify(userData))

          toast.success("تم تسجيل الدخول بنجاح")
          login(userData)

          // توجيه المستخدم إلى الصفحة المطلوبة
          router.push(callbackUrl)
        }
      } else {
        toast.error("فشل تسجيل الدخول. تأكد من صحة البيانات")
      }
    } catch (error) {
      console.error("Login error:", error)
      toast.error("حدث خطأ أثناء تسجيل الدخول")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      await signIn("google", { callbackUrl })
    } catch (error) {
      console.error("Google login error:", error)
      toast.error("حدث خطأ أثناء تسجيل الدخول بواسطة جوجل")
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.phone || !formData.password) {
      toast.error("الرجاء إدخال جميع البيانات المطلوبة")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        // تسجيل الدخول تلقائيًا بعد التسجيل
        const result = await signIn("credentials", {
          redirect: false,
          phone: formData.phone,
          password: formData.password,
        })

        if (result?.ok) {
          // الحصول على بيانات المستخدم
          const sessionResponse = await fetch("/api/auth/session")
          const session = await sessionResponse.json()

          if (session?.user) {
            const userData = {
              id: session.user.id,
              name: session.user.name,
              phone: session.user.phone || formData.phone,
              email: session.user.email,
            }

            // حفظ بيانات المستخدم في localStorage
            localStorage.setItem("userData", JSON.stringify(userData))

            // تحديث حالة المصادقة
            login(userData)

            toast.success("تم إنشاء الحساب وتسجيل الدخول بنجاح")
            router.push("/")
          }
        } else {
          toast.error("تم إنشاء الحساب بنجاح ولكن فشل تسجيل الدخول التلقائي")
          setStep("login")
        }
      } else {
        toast.error(data.message || "حدث خطأ أثناء إنشاء الحساب")
      }
    } catch (error) {
      console.error("Registration error:", error)
      toast.error("حدث خطأ أثناء إنشاء الحساب")
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!formData.phone) {
      toast.error("الرجاء إدخال رقم الهاتف")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: formData.phone }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("تم إرسال رابط استعادة كلمة المرور")
        setStep("login")
      } else {
        toast.error(data.message || "حدث خطأ أثناء استعادة كلمة المرور")
      }
    } catch (error) {
      console.error("Forgot password error:", error)
      toast.error("حدث خطأ أثناء استعادة كلمة المرور")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            {step === "login" ? "تسجيل الدخول" : step === "register" ? "إنشاء حساب" : "استعادة كلمة المرور"}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={step === "login" ? handleLogin : step === "register" ? handleRegister : handleForgotPassword}>
          <div className="-space-y-px rounded-md shadow-sm">
            {step === "register" && (
              <div>
                <Label htmlFor="name">الاسم</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="relative block w-full rounded-t-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="الاسم"
                />
              </div>
            )}
            <div>
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input
                id="phone"
                name="phone"
                type="text"
                required
                value={formData.phone}
                onChange={handleInputChange}
                className="relative block w-full rounded-t-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="رقم الهاتف"
              />
            </div>
            {step === "register" && (
              <div>
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="relative block w-full rounded-t-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="البريد الإلكتروني"
                />
              </div>
            )}
            {step !== "forgot" && (
              <div>
                <Label htmlFor="password">كلمة المرور</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="relative block w-full rounded-b-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="كلمة المرور"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <Button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-md bg-indigo-600 py-2 px-3 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              {isLoading ? "جاري التحميل..." : step === "login" ? "تسجيل الدخول" : step === "register" ? "إنشاء حساب" : "استعادة كلمة المرور"}
            </Button>
          </div>

          {step === "login" && (
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex items-center justify-center rounded-md bg-white px-4 py-2 text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                <FcGoogle className="mr-2 h-5 w-5" />
                تسجيل الدخول بواسطة جوجل
              </button>
            </div>
          )}

          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={() => setStep(step === "login" ? "register" : "login")}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              {step === "login" ? "إنشاء حساب جديد" : "لديك حساب بالفعل؟ تسجيل الدخول"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const LoginPage = () => {
  return (
    <Suspense fallback={<div>جاري التحميل...</div>}>
      <LoginContent />
    </Suspense>
  )
}

export default LoginPage

