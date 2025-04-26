"use client"

import { useToast } from "../hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "./ui/toast"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { ToastIcons } from "./ui/toast-icons"
import { ToastSettings } from "./ui/toast-settings"
import { memo } from "react"
import { cn } from "../lib/utils"

const slideAnimation = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 100 },
}

const ToastItem = memo(({ 
  id, 
  title, 
  description, 
  variant = "default", 
  visible 
}: {
  id: string
  title: string
  description?: string
  variant?: "default" | "success" | "error" | "warning" | "info"
  visible: boolean
}) => {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      layout
      variants={prefersReducedMotion ? undefined : slideAnimation}
      initial="initial"
      animate={visible ? "animate" : "exit"}
      exit="exit"
      transition={{ 
        type: "spring",
        duration: 0.4,
        bounce: 0.1
      }}
    >
      <Toast
        variant={variant}
        className={cn(
          "toast-base",
          variant !== "default" && `toast-${variant}`
        )}
        aria-labelledby={`toast-${id}-title`}
        aria-describedby={description ? `toast-${id}-description` : undefined}
        role={variant === "error" ? "alert" : "status"}
      >
        {variant !== "default" && (
          <div className="toast-icon" aria-hidden="true">
            {ToastIcons[variant as keyof typeof ToastIcons]}
          </div>
        )}
        <div className="grid gap-1 flex-1">
          {title && (
            <ToastTitle id={`toast-${id}-title`} className="toast-title">
              {title}
            </ToastTitle>
          )}
          {description && (
            <ToastDescription id={`toast-${id}-description`} className="toast-description">
              {description}
            </ToastDescription>
          )}
        </div>
        <ToastClose className="toast-close" aria-label="إغلاق التنبيه" />
      </Toast>
    </motion.div>
  )
})

ToastItem.displayName = "ToastItem"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      <div className="fixed top-4 right-4 z-[100] flex items-center gap-2">
        <ToastSettings />
      </div>
      <AnimatePresence mode="sync" initial={false}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} {...toast} />
        ))}
      </AnimatePresence>
      <ToastViewport className="toast-container" />
    </ToastProvider>
  )
}

