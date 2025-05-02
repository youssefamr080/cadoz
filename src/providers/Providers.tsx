"use client"

import type React from "react"

import { Provider } from "react-redux"
import { store } from "@/lib/redux/store"

import { ThemeProvider } from "@/context/ThemeContext"
import { GiftProvider } from "@/context/gift-context"
import { AuthProvider } from "@/context/AuthContext"
import { CartProvider } from "@/context/CartContext"
import { WishlistProvider } from "@/context/WishlistContext"

// ToastContainer is now centralized in layout.tsx

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
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
    </Provider>
  )
}
