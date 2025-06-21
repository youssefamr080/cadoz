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
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
        {/* ToastContainer moved to root layout for centralized notifications */}
      </AuthProvider>
    </ThemeProvider>
  )
}
