"use client"

import { useState, useEffect, useCallback } from "react"
import { Bell, BellOff } from "lucide-react"
import { Button } from "../ui/button"
import LoginModal from "../auth/login-modal"
import { toast } from "react-toastify"
import { useAuth } from "../../providers/AuthProvider"

interface ProductNotificationProps {
  productId: number
  productName: string
  isOutOfStock: boolean
}

export interface UserData {
  id: string
  name: string
  phone: string
  email?: string
  password: string
}

export default function ProductNotification({ productId, productName, isOutOfStock }: ProductNotificationProps) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const { user } = useAuth()
  const [hasNotification, setHasNotification] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(
    () => localStorage.getItem("sessionId") || `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
  )

  // التحقق من وجود إشعار مسبق
  const checkExistingNotification = useCallback(
    async (userId: string) => {
      try {
        const response = await fetch(`/api/notifications?userId=${userId}&productId=${productId}`)
        const data = await response.json()

        if (data.success && data.data.length > 0) {
          setHasNotification(true)
        }
      } catch (error) {
        console.error("Error checking notification:", error)
      }
    },
    [productId],
  )

  useEffect(() => {
    // تخزين معرف الجلسة في localStorage إذا لم يكن موجودًا
    if (!localStorage.getItem("sessionId")) {
      localStorage.setItem("sessionId", sessionId)
    }

    if (user?.id) {
      // التحقق من وجود إشعار مسبق
      checkExistingNotification(user.id)
    }
  }, [productId, checkExistingNotification, user, sessionId])

  // إضافة إشعار جديد
  const addNotification = async (userId: string, productId: number, productName: string) => {
    if (!user || !user.id || !user.phone || !user.name) {
      setIsLoginModalOpen(true)
      return
    }

    setIsLoading(true)

    try {
      // تسجيل حدث طلب الإشعار
      await fetch("/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          productId,
          action: "notification_request",
          sessionId,
          context: {
            productName,
            isOutOfStock,
          },
        }),
      }).catch((error) => console.error("Error recording notification request:", error))

      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          productId,
          productName,
          phone: user.phone,
          name: user.name,
          createdAt: new Date(),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setHasNotification(true)
        toast.success("سنخبرك عندما يتوفر هذا المنتج")
      } else {
        toast.error(data.message || "حدث خطأ أثناء تسجيل الإشعار")
      }
    } catch (error) {
      console.error("Error adding notification:", error)
      toast.error("حدث خطأ أثناء تسجيل الإشعار")
    } finally {
      setIsLoading(false)
    }
  }

  // إلغاء الإشعار
  const removeNotification = async () => {
    if (!user) return

    try {
      // تسجيل حدث إلغاء الإشعار
      await fetch("/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          productId,
          action: "notification_cancel",
          sessionId,
          context: {
            productName,
          },
        }),
      }).catch((error) => console.error("Error recording notification cancel:", error))

      // البحث عن الإشعار الحالي
      const response = await fetch(`/api/notifications?userId=${user.id}&productId=${productId}`)
      const data = await response.json()

      if (data.success && data.data.length > 0) {
        const notification = data.data[0]

        // تحديث حالة الإشعار إلى ملغي
        await fetch("/api/notifications", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            notificationId: notification._id,
            status: "cancelled",
            userId: user.id,
          }),
        })
      }

      setHasNotification(false)
      toast.info("تم إلغاء الإشعار")
    } catch (error) {
      console.error("Error removing notification:", error)
      toast.error("حدث خطأ أثناء إلغاء الإشعار")
    }
  }

  // معالجة نجاح تسجيل الدخول
  const handleLoginSuccess = (userData) => {
    setIsLoginModalOpen(false)
    console.log("Login successful, adding notification for user:", userData.id)

    // إضافة الإشعار بعد تسجيل الدخول
    setTimeout(() => {
      addNotification(userData.id, productId, productName)
    }, 500)
  }

  if (!isOutOfStock) {
    return null
  }

  return (
    <>
      {hasNotification ? (
        <Button
          onClick={removeNotification}
          variant="outline"
          className="flex items-center gap-2 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
        >
          <BellOff className="w-4 h-4" />
          <span>تم تسجيل إشعار</span>
        </Button>
      ) : (
        <Button
          onClick={() => {
            if (!user) {
              setIsLoginModalOpen(true)
            } else {
              addNotification(user.id, productId, productName)
            }
          }}
          variant="outline"
          className="flex items-center gap-2 bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              جاري التسجيل...
            </span>
          ) : (
            <>
              <Bell className="w-4 h-4" />
              <span>أشعرني عند التوفر</span>
            </>
          )}
        </Button>
      )}

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
        forNotification={true}
        productId={productId}
        productName={productName}
      />
    </>
  )
}
