"use client"

import type React from "react"

import { ThemeProvider } from "@/context/ThemeContext"
import { GiftProvider } from "@/context/gift-context"
import { AuthProvider } from "./AuthProvider"
import { CartProvider } from "@/context/CartContext"
import { WishlistProvider } from "@/context/WishlistContext"
import { SearchProvider } from "./SearchProvider"

// ToastContainer is now centralized in layout.tsx

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <SearchProvider>
              <GiftProvider>
                {children}
                {/* ToastContainer moved to root layout for centralized notifications */}
              </GiftProvider>
            </SearchProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
