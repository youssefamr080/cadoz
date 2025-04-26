"use client"

import type React from "react"

import { Provider } from "react-redux"
import { store } from "@/lib/redux/store"

import { ThemeProvider } from "@/context/ThemeContext"
import { GiftProvider } from "@/context/gift-context"
import { AuthProvider } from "@/context/AuthContext"
import { CartProvider } from "@/context/CartContext"
import { WishlistProvider } from "@/context/WishlistContext"

import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <GiftProvider>
                {children}
                <ToastContainer
                  position="bottom-right"
                  autoClose={2500}
                  hideProgressBar={false}
                  newestOnTop={true}
                  closeOnClick
                  rtl={true}
                  pauseOnFocusLoss={false}
                  draggable={false}
                  pauseOnHover={true}
                  theme="light"
                  limit={3}
                  style={{
                    "--toastify-icon-color-success": "var(--green-500)",
                    "--toastify-icon-color-error": "var(--red-500)",
                    "--toastify-icon-color-warning": "var(--yellow-500)",
                    "--toastify-icon-color-info": "var(--blue-500)",
                  } as any}
                />
              </GiftProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  )
}
