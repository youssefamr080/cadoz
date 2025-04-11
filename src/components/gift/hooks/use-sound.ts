import { useCallback, useEffect, useRef } from "react"

type SoundType = "click" | "success" | "error" | "complete"

const soundMap: Record<SoundType, string> = {
  click: "/sounds/click.mp3",
  success: "/sounds/success.mp3",
  error: "/sounds/error.mp3",
  complete: "/sounds/complete.mp3",
}

export const useSound = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // إنشاء عنصر الصوت
    audioRef.current = new Audio()
    audioRef.current.volume = 0.5 // ضبط مستوى الصوت

    // تنظيف عند إزالة المكون
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const playSound = useCallback((type: SoundType) => {
    if (typeof window === "undefined" || !audioRef.current) return

    // التحقق من تفضيلات المستخدم للصوت
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    if (prefersReducedMotion) return

    // تشغيل الصوت
    audioRef.current.src = soundMap[type]
    audioRef.current.play().catch((error) => {
      console.error("Error playing sound:", error)
    })
  }, [])

  return { playSound }
} 