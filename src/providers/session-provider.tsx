"use client"

import { SessionProvider } from "next-auth/react"
import type { ReactNode } from "react"

export default function NextAuthProvider({
  children,
}: {
  children: ReactNode
}) {
  return (
    <SessionProvider 
      basePath="/api/auth"
      refetchInterval={5 * 60}
      refetchOnWindowFocus={true}
    >
      {children}
    </SessionProvider>
  )
}

