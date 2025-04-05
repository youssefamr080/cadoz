"use client"

import { useToast } from "../components/gift/hooks/use-toast"

export function Toaster() {
  const { ToastContainer } = useToast()

  return <ToastContainer />
}

