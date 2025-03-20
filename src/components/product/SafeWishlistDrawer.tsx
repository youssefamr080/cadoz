"use client"

import dynamic from "next/dynamic"
import { useState, useEffect } from "react"

// استيراد WishlistDrawer بشكل ديناميكي لتجنب مشاكل SSR
const WishlistDrawer = dynamic(() => import("../layout/WishlistDrawer"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">جاري تحميل قائمة المفضلة...</p>
      </div>
    </div>
  ),
})

interface SafeWishlistDrawerProps {
  isOpen: boolean
  onClose: () => void
}

// مكون آمن لعرض WishlistDrawer
export default function SafeWishlistDrawer({ isOpen, onClose }: SafeWishlistDrawerProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  return <WishlistDrawer isOpen={isOpen} onClose={onClose} />
}

