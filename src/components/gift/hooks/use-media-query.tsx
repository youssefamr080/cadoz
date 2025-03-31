"use client"

import { useState, useEffect } from "react"

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    // تجنب تنفيذ هذا الكود على الخادم
    if (typeof window === "undefined") return

    const media = window.matchMedia(query)

    // تحديث الحالة عند التحميل الأولي
    setMatches(media.matches)

    // إنشاء مستمع للتغييرات
    const listener = (e: MediaQueryListEvent) => {
      setMatches(e.matches)
    }

    // إضافة المستمع
    media.addEventListener("change", listener)

    // إزالة المستمع عند تفكيك المكون
    return () => {
      media.removeEventListener("change", listener)
    }
  }, [query])

  return matches
}

