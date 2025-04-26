"use client"

import { useState, useCallback, useEffect, useMemo, useRef } from "react"
import { SoundManager } from "../lib/utils/sound-manager"

export type ToastVariant = "default" | "success" | "error" | "warning" | "info"

export interface ToastProps {
  title: string
  description?: string
  variant?: ToastVariant
  duration?: number
  id?: string
}

interface Toast extends ToastProps {
  id: string
  visible: boolean
  createdAt: number
  key?: string
}

const TOAST_LIMIT = 3
const TOAST_REMOVE_DELAY = 1000 // زيادة وقت الإزالة للسماح بانتهاء التحريك
const DUPLICATE_TIMEOUT = 3000
const CLEANUP_INTERVAL = 60000 // تنظيف كل دقيقة

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [duplicateTracker, setDuplicateTracker] = useState<Record<string, number>>({})
  const cleanupInterval = useRef<NodeJS.Timeout | null>(null)

  // Initialize cleanup interval
  useEffect(() => {
    cleanupInterval.current = setInterval(() => {
      const now = Date.now()
      setToasts(prevToasts => 
        prevToasts.filter(toast => 
          toast.visible || now - toast.createdAt < TOAST_REMOVE_DELAY
        )
      )
      setDuplicateTracker(prev => {
        const newTracker = { ...prev }
        Object.keys(newTracker).forEach(key => {
          if (now - newTracker[key] > DUPLICATE_TIMEOUT) {
            delete newTracker[key]
          }
        })
        return newTracker
      })
    }, CLEANUP_INTERVAL)

    return () => {
      if (cleanupInterval.current) {
        clearInterval(cleanupInterval.current)
      }
    }
  }, [])

  const activeToasts = useMemo(() => {
    return toasts.filter(toast => toast.visible)
  }, [toasts])

  const toast = useCallback(
    ({ id, title, description, variant = "default", duration = 3000 }: ToastProps) => {
      const now = Date.now()
      const toastKey = `${title}-${description}`
      
      if (duplicateTracker[toastKey] && now - duplicateTracker[toastKey] < DUPLICATE_TIMEOUT) {
        return
      }
      
      if (variant !== 'default') {
        SoundManager.play(variant as "success" | "error" | "warning" | "info")
      }

      setDuplicateTracker(prev => ({
        ...prev,
        [toastKey]: now
      }))

      setToasts(prevToasts => {
        const toastId = id || Math.random().toString(36).substring(2, 9)
        
        let newToasts = prevToasts
        const activeCount = prevToasts.filter(t => t.visible).length
        
        if (activeCount >= TOAST_LIMIT) {
          const oldestToast = [...prevToasts]
            .filter(t => t.visible)
            .sort((a, b) => a.createdAt - b.createdAt)[0]
            
          if (oldestToast) {
            newToasts = prevToasts.map(t =>
              t.id === oldestToast.id ? { ...t, visible: false } : t
            )
          }
        }

        const newToast: Toast = {
          id: toastId,
          title,
          description,
          variant,
          visible: true,
          createdAt: now,
          key: toastKey
        }

        setTimeout(() => {
          setToasts(current =>
            current.map(t =>
              t.id === toastId ? { ...t, visible: false } : t
            )
          )
        }, duration)

        return [...newToasts, newToast]
      })
    },
    [duplicateTracker]
  )

  const dismiss = useCallback((toastId: string) => {
    setToasts(prevToasts =>
      prevToasts.map(t =>
        t.id === toastId ? { ...t, visible: false } : t
      )
    )
  }, [])

  const dismissAll = useCallback(() => {
    setToasts(prevToasts =>
      prevToasts.map(t =>
        t.visible ? { ...t, visible: false } : t
      )
    )
  }, [])

  return {
    toasts: activeToasts,
    toast,
    dismiss,
    dismissAll,
    toggleMute: SoundManager.toggleMute,
    setMuted: SoundManager.setMuted,
  }
}