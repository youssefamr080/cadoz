"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light")

  useEffect(() => {
    // تحقق من وجود قيمة مخزنة في localStorage
    const storedTheme = localStorage.getItem("theme") as Theme | null

    // تحقق من تفضيلات المستخدم في النظام
    const systemPreference = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"

    // استخدم القيمة المخزنة أو تفضيلات النظام
    const initialTheme = storedTheme || systemPreference
    setTheme(initialTheme)

    // تطبيق السمة على عنصر html
    document.documentElement.classList.toggle("dark", initialTheme === "dark")
  }, [])

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  return <ThemeContext.Provider value={{ theme, setTheme: handleThemeChange }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

