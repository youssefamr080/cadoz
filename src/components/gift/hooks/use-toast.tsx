"use client"

import { useState, useCallback } from "react"

type ToastVariant = "default" | "destructive" | "success" | "warning"

interface ToastProps {
  title: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

interface Toast extends ToastProps {
  id: string
  visible: boolean
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback(({ title, description, variant = "default", duration = 3000 }: ToastProps) => {
    const id = Math.random().toString(36).substring(2, 9)

    // إضافة التنبيه الجديد
    setToasts((prevToasts) => [...prevToasts, { id, title, description, variant, duration, visible: true }])

    // إخفاء التنبيه بعد المدة المحددة
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.map((t) => (t.id === id ? { ...t, visible: false } : t)))

      // إزالة التنبيه من المصفوفة بعد انتهاء الرسوم المتحركة
      setTimeout(() => {
        setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id))
      }, 300)
    }, duration)

    return id
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.map((t) => (t.id === id ? { ...t, visible: false } : t)))

    // إزالة التنبيه من المصفوفة بعد انتهاء الرسوم المتحركة
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id))
    }, 300)
  }, [])

  // مكون التنبيهات
  const ToastContainer = useCallback(() => {
    if (toasts.length === 0) return null

    return (
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`
              p-4 rounded-lg shadow-lg transform transition-all duration-300
              ${t.visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
              ${t.variant === "default" ? "bg-white text-gray-800 border border-gray-200" : ""}
              ${t.variant === "destructive" ? "bg-red-500 text-white" : ""}
              ${t.variant === "success" ? "bg-green-500 text-white" : ""}
              ${t.variant === "warning" ? "bg-amber-500 text-white" : ""}
            `}
            onClick={() => dismissToast(t.id)}
            role="alert"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold">{t.title}</h3>
                {t.description && <p className="text-sm mt-1">{t.description}</p>}
              </div>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={(e) => {
                  e.stopPropagation()
                  dismissToast(t.id)
                }}
                aria-label="إغلاق"
              >
                &times;
              </button>
            </div>
          </div>
        ))}
      </div>
    )
  }, [toasts, dismissToast])

  return { toast, dismissToast, ToastContainer }
}

