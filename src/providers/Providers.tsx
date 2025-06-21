"use client"

import type React from "react"
import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { hydrateCart } from "@/lib/redux/slices/cartSlice"
import { hydrateWishlist } from "@/lib/redux/slices/wishlistSlice"

import { ThemeProvider } from "@/context/ThemeContext"
import { AuthProvider } from "./AuthProvider"

// ToastContainer is now centralized in layout.tsx

export function Providers({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch()
  useEffect(() => {
    // Hydrate cart
    if (typeof window !== "undefined") {
      try {
        const cart = JSON.parse(localStorage.getItem("cadoz-cart") || "[]")
        const shipping = JSON.parse(localStorage.getItem("cadoz-shipping") || "{}")
        const promoCode = JSON.parse(localStorage.getItem("cadoz-promo") || "{}")
        if (cart.length > 0 || Object.keys(shipping).length > 0 || Object.keys(promoCode).length > 0) {
          dispatch(hydrateCart({ cart, shipping, promoCode }))
        }
      } catch {}
      // Hydrate wishlist
      try {
        const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]")
        if (wishlist.length > 0) {
          dispatch(hydrateWishlist({ wishlist }))
        }
      } catch {}
    }
  }, [dispatch])
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
        {/* ToastContainer moved to root layout for centralized notifications */}
      </AuthProvider>
    </ThemeProvider>
  )
}
