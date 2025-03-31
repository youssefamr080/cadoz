"use client"

import type React from "react"

import { useState } from "react"
import { X, User, Phone, Lock, Eye, EyeOff } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog" 
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { toast } from "react-toastify"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (userData: UserData) => void
  forNotification?: boolean
  forSaveForLater?: boolean
  productId?: number
  productName?: string
}

export interface UserData {
  name: string
  phone: string
  email?: string
  password: string
}

export default function LoginModal({
  isOpen,
  onClose,
  onSuccess,
  forNotification = false,
  forSaveForLater = false,
  productId,
  productName,
}: LoginModalProps) {
  const [formData, setFormData] = useState<UserData>({
    name: "",
    phone: "",
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<"login" | "register" | "forgot">("login")

  // التحقق من وجود بيانات مستخدم مسجلة مسبقًا
  const checkExistingUser = async (phone: string) => {
    try {
      const response = await fetch(`/api/customers?phone=${phone}`)
      const data = await response.json()
      return data.exists
    } catch (error) {
      console.error("Error checking user:", error)
      return false
    }
  }

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
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: formData.phone,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // حفظ بيانات المستخدم في localStorage
        localStorage.setItem("userData", JSON.stringify(data.user))

        // حفظ توكن الجلسة إذا كان موجوداً
        if (data.user.sessionId) {
          localStorage.setItem("authToken", data.user.sessionId)
        }

        toast.success("تم تسجيل الدخول بنجاح")
        onSuccess(data.user)

        // إغلاق النافذة بعد تسجيل الدخول
        setTimeout(() => {
          onClose()
        }, 500)
      } else {
        toast.error(data.message || "فشل تسجيل الدخول")
      }
    } catch (error) {
      console.error("Login error:", error)
      toast.error("حدث خطأ أثناء تسجيل الدخول")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.phone || !formData.password) {
      toast.error("الرجاء إدخال جميع البيانات المطلوبة")
      return
    }

    // التحقق من صحة رقم الهاتف (11 رقم يبدأ بـ 01)
    if (!/^01[0-9]{9}$/.test(formData.phone)) {
      toast.error("الرجاء إدخال رقم هاتف صحيح (11 رقم يبدأ بـ 01)")
      return
    }

    setIsLoading(true)

    try {
      // التحقق من وجود المستخدم مسبقًا
      const userExists = await checkExistingUser(formData.phone)

      if (userExists) {
        toast.error("رقم الهاتف مسجل بالفعل، الرجاء تسجيل الدخول")
        setStep("login")
        setIsLoading(false)
        return
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email || undefined,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // حفظ بيانات المستخدم في localStorage
        localStorage.setItem("userData", JSON.stringify(data.user))

        // حفظ توكن الجلسة إذا كان موجوداً
        if (data.user.sessionId) {
          localStorage.setItem("authToken", data.user.sessionId)
        }

        // إذا كان التسجيل من أجل الإشعار، قم بإضافة الإشعار
        if (forNotification && productId && productName) {
          await addNotification(data.user.id, productId, productName)
        }

        toast.success("تم التسجيل بنجاح")
        onSuccess(data.user)

        // إغلاق النافذة بعد التسجيل
        setTimeout(() => {
          onClose()
        }, 500)
      } else {
        toast.error(data.message || "فشل التسجيل")
      }
    } catch (error) {
      console.error("Registration error:", error)
      toast.error("حدث خطأ أثناء التسجيل")
    } finally {
      setIsLoading(false)
    }
  }

  const addNotification = async (userId: string, productId: number, productName: string) => {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          productId,
          productName,
          phone: formData.phone,
          createdAt: new Date(),
        }),
      })
    } catch (error) {
      console.error("Error adding notification:", error)
    }
  }

  const handleForgotPassword = () => {
    if (!formData.phone) {
      toast.error("الرجاء إدخال رقم الهاتف")
      return
    }

    // إنشاء رابط واتساب مع رسالة
    const message = `نسيت كلمة المرور الخاصة بي. رقم الهاتف: ${formData.phone}`
    const whatsappUrl = `https://wa.me/201026972523?text=${encodeURIComponent(message)}`

    // فتح رابط الواتساب
    window.open(whatsappUrl, "_blank")

    toast.info("تم فتح واتساب لإرسال طلب استعادة كلمة المرور")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {step === "login" ? "تسجيل الدخول" : step === "register" ? "إنشاء حساب جديد" : "استعادة كلمة المرور"}
            {forNotification && " للإشعار بتوفر المنتج"}
            {forSaveForLater && " لحفظ المنتجات للشراء لاحقًا"}
          </DialogTitle>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">إغلاق</span>
          </button>
        </DialogHeader>

        {step === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="01xxxxxxxxx"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="pl-10 pr-3"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="كلمة المرور"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button type="button" onClick={() => setStep("forgot")} className="text-sm text-blue-600 hover:underline">
                نسيت كلمة المرور؟
              </button>
              <button
                type="button"
                onClick={() => setStep("register")}
                className="text-sm text-blue-600 hover:underline"
              >
                إنشاء حساب جديد
              </button>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </Button>
          </form>
        )}

        {step === "register" && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">الاسم</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="الاسم الكامل"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="pl-10 pr-3"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف (واتساب)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="01xxxxxxxxx"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="pl-10 pr-3"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني (اختياري)</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="example@example.com"
                value={formData.email}
                onChange={handleInputChange}
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="كلمة المرور"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="text-center">
              <button type="button" onClick={() => setStep("login")} className="text-sm text-blue-600 hover:underline">
                لديك حساب بالفعل؟ تسجيل الدخول
              </button>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading
                ? "جاري التسجيل..."
                : forNotification
                  ? "تسجيل وإضافة إشعار"
                  : forSaveForLater
                    ? "تسجيل وحفظ المنتج"
                    : "تسجيل"}
            </Button>
          </form>
        )}

        {step === "forgot" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="01xxxxxxxxx"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="pl-10 pr-3"
                  dir="ltr"
                />
              </div>
            </div>

            <p className="text-sm text-gray-600">
              سيتم فتح واتساب لإرسال طلب استعادة كلمة المرور. الرجاء إدخال رقم الهاتف المسجل.
            </p>

            <div className="flex gap-2">
              <Button type="button" onClick={handleForgotPassword} className="flex-1">
                إرسال طلب استعادة
              </Button>
              <Button type="button" onClick={() => setStep("login")} variant="outline" className="flex-1">
                العودة للتسجيل
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

