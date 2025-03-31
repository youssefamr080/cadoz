"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface WishlistItem {
  id: number
  name: string
  price: number
  image: string
  productId: number
  type?: string
}

interface WishlistContextType {
  wishlist: WishlistItem[]
  addToWishlist: (item: WishlistItem) => void
  removeFromWishlist: (id: number) => void
  isInWishlist: (id: number) => boolean
  clearWishlist: () => void
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])

  // تحميل المفضلة من التخزين المحلي عند بدء التشغيل
  useEffect(() => {
    const savedWishlist = localStorage.getItem("wishlist")
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist))
      } catch (error) {
        console.error("Error loading wishlist from localStorage:", error)
      }
    }
  }, [])

  // حفظ المفضلة في التخزين المحلي عند التغيير
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist))
  }, [wishlist])

  // إضافة منتج إلى المفضلة
  const addToWishlist = (item: WishlistItem) => {
    setWishlist((prev) => {
      // التحقق مما إذا كان المنتج موجودًا بالفعل
      if (prev.some((i) => i.id === item.id)) {
        return prev
      }
      return [...prev, item]
    })
  }

  // إزالة منتج من المفضلة
  const removeFromWishlist = (id: number) => {
    setWishlist((prev) => prev.filter((item) => item.id !== id))
  }

  // التحقق مما إذا كان المنتج في المفضلة
  const isInWishlist = (id: number) => {
    return wishlist.some((item) => item.id === id)
  }

  // مسح المفضلة بالكامل
  const clearWishlist = () => {
    setWishlist([])
  }

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist, clearWishlist }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}

