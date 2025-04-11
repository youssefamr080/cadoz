import { useState, useCallback } from "react"

export type ToastVariant = "default" | "success" | "error" | "warning"

export type ToastProps = {
  title: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

export type Toast = ToastProps & {
  id: string
  visible: boolean
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback(
    ({ title, description, variant = "default", duration = 3000 }: ToastProps) => {
      const id = Math.random().toString(36).substring(2, 9)
      const newToast: Toast = {
        id,
        title,
        description,
        variant,
        visible: true,
      }

      setToasts((prev) => [...prev, newToast])

      setTimeout(() => {
        setToasts((prev) =>
          prev.map((t) => (t.id === id ? { ...t, visible: false } : t))
        )
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id))
        }, 300)
      }, duration)
    },
    []
  )

  return { toasts, toast }
} 