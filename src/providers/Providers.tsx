"use client"

import type React from "react"

import { ThemeProvider } from "@/context/ThemeContext"
import { GiftProvider } from "@/context/gift-context"
import { AuthProvider } from "./AuthProvider"
import { CartProvider } from "@/context/CartContext"
import { WishlistProvider } from "@/context/WishlistContext"

// ToastContainer is now centralized in layout.tsx

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <GiftProvider>
              {children}
              {/* ToastContainer moved to root layout for centralized notifications */}
            </GiftProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
