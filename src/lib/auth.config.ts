import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { connectToDatabase } from "./mongodb"
import { createSession } from "./security/session-manager"
import { sanitizeUserData } from "./security/auth-validator"
import bcrypt from "bcryptjs"
import type { Document } from "mongodb"

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

interface MongoUser extends Document {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  password?: string;
  role: 'user' | 'admin';
  image?: string;
  needsPhoneUpdate?: boolean;
}

function transformToUserData(user: MongoUser): UserData {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    image: user.image,
    needsPhoneUpdate: user.needsPhoneUpdate
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
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("الرجاء إدخال البريد الإلكتروني وكلمة المرور")
        }

        const { db } = await connectToDatabase()
        const user = await db.collection("customers").findOne<MongoUser>({ 
          email: credentials.email.toLowerCase() 
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
        const { db } = await connectToDatabase()
        
        // Check if user exists
        const existingUser = await db.collection("customers").findOne({ id: user.id })
        
        if (existingUser) {
          // Update existing user
          await db.collection("customers").updateOne(
            { id: user.id },
            { 
              $set: {
                name: user.name,
                email: user.email?.toLowerCase(),
                image: user.image,
                lastLoginAt: new Date(),
                isActive: true
              }
            }
          )
        } else {
          // Create new user
          await db.collection("customers").insertOne({
            id: user.id,
            name: user.name,
            email: user.email?.toLowerCase(),
            image: user.image,
            role: 'user',
            createdAt: new Date(),
            lastLoginAt: new Date(),
            isActive: true,
            needsPhoneUpdate: true // Set needsPhoneUpdate for new users
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
