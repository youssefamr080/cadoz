"use client"

import type React from "react"
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
