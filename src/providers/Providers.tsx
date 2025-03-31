"use client"


import { AuthProvider } from "../context/AuthContext"
import { CartProvider } from "../context/CartContext"
import { WishlistProvider } from "../context/WishlistContext"
import { GiftProvider } from "../context/GiftContext"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

export function Providers({ children }: { children: React.ReactNode }) {
  return (

      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <GiftProvider>
              {children}
              <ToastContainer position="top-center" />
            </GiftProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>

  )
} 