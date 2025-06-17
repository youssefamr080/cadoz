import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name: string
      email?: string
      phone?: string
      role: 'user' | 'admin'
      image?: string
      needsPhoneUpdate?: boolean
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    name: string
    email?: string
    phone?: string
    role: 'user' | 'admin'
    image?: string
    needsPhoneUpdate?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    name: string
    email?: string
    phone?: string
    role: 'user' | 'admin'
    image?: string
    needsPhoneUpdate?: boolean
  }
}

