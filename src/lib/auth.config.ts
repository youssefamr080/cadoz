import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import { createSession } from "./security/session-manager"
import { sanitizeUserData } from "./security/auth-validator"
import bcrypt from "bcryptjs"

interface UserData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'user' | 'admin';
  image?: string;
  needsPhoneUpdate?: boolean;
  [key: string]: unknown;
}

function transformToUserData(user: Record<string, unknown>): UserData {
  return {
    id: user.id as string,
    name: user.name as string,
    email: (user.email as string) || undefined,
    phone: user.phone as string,
    role: 'user',
    image: undefined,
    needsPhoneUpdate: !user.phone
  }
}

declare module "next-auth" {
  interface User {
    id: string
    name: string
    email?: string
    phone?: string
    role: 'user' | 'admin'
    image?: string
    needsPhoneUpdate?: boolean
  }
  
  interface Session {
    user: User
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

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {        if (!credentials?.email || !credentials?.password) {
          throw new Error("الرجاء إدخال البريد الإلكتروني وكلمة المرور")
        }

        const user = await prisma.customer.findUnique({
          where: { email: credentials.email.toLowerCase() }
        })

        if (!user) {
          throw new Error("البريد الإلكتروني غير مسجل")
        }

        if (!user.password) {
          throw new Error("يرجى تسجيل الدخول باستخدام Google")
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) {
          throw new Error("كلمة المرور غير صحيحة")
        }

        return sanitizeUserData(transformToUserData(user))
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        // Check if user exists
        const existingUser = await prisma.customer.findUnique({
          where: { id: user.id }
        })
        
        if (existingUser) {
          // Update existing user
          await prisma.customer.update({
            where: { id: user.id },
            data: {
              name: user.name,
              email: user.email?.toLowerCase(),
              lastLoginAt: new Date(),
              isActive: true
            }
          })
        } else {          // Create new user
          await prisma.customer.create({
            data: {
              id: user.id,
              name: user.name,
              email: user.email?.toLowerCase() || "",
              phone: "",
              password: "",
              isActive: true,
              lastLoginAt: new Date()
            }
          })
        }

        // Create session for Google auth
        if (account?.provider === 'google') {
          await createSession({
            userId: user.id,
            accessToken: account.access_token,
            refreshToken: account.refresh_token,
            expiresAt: account.expires_at ? new Date(account.expires_at * 1000) : undefined
          })
        }

        return true
      } catch (error) {
        console.error("[AUTH] Error in signIn callback:", error)
        return false
      }
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.name = token.name
        session.user.email = token.email
        session.user.phone = token.phone
        session.user.role = token.role
        session.user.image = token.image
        session.user.needsPhoneUpdate = token.needsPhoneUpdate
      }
      return session
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        // Initial sign in
        token.id = user.id
        token.name = user.name
        token.email = user.email
        token.phone = user.phone
        token.role = user.role
        token.image = user.image
        token.needsPhoneUpdate = user.needsPhoneUpdate
      } else if (trigger === "update" && session) {
        // Update token when session is updated
        token.phone = session.user.phone
        token.needsPhoneUpdate = session.user.needsPhoneUpdate
      }
      return token
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  debug: process.env.NODE_ENV === 'development'
}
