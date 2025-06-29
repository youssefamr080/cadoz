import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

interface UserData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'user' | 'admin';
  image?: string;
  needsPhoneUpdate?: boolean;
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

function sanitizeUserData(userData: UserData): UserData {
  return {
    id: userData.id,
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
    role: userData.role || 'user',
    image: userData.image,
    needsPhoneUpdate: userData.needsPhoneUpdate
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
        phone: { label: "Phone", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) {
          throw new Error("الرجاء إدخال رقم الهاتف وكلمة المرور")
        }

        // البحث بالهاتف (المعرف الأساسي)
        const user = await prisma.customer.findUnique({
          where: { phone: credentials.phone }
        })

        if (!user) {
          throw new Error("رقم الهاتف غير مسجل")
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
        // تقليل عدد العمليات - فقط للمستخدمين الجدد من Google
        if (account?.provider === 'google') {
          const existingUser = await prisma.customer.findUnique({
            where: { email: user.email?.toLowerCase() }
          })
          
          if (!existingUser) {
            // إنشاء مستخدم جديد فقط إذا لم يكن موجوداً
            await prisma.customer.create({
              data: {
                name: user.name,
                email: user.email?.toLowerCase() || "",
                phone: "",
                password: "",
                isActive: true,
                lastLoginAt: new Date()
              }
            })
          }
        }
        
        return true
      } catch (error) {
        console.error("[AUTH] Error in signIn callback:", error)
        // السماح بتسجيل الدخول حتى لو فشل حفظ البيانات
        return true
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60 // 24 hours
  },
  // إضافة إعدادات لتقليل rate limiting
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 // 30 days
      }
    }
  },
  // تقليل عدد طلبات قاعدة البيانات
  events: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async signIn({ user, account, isNewUser }) {
      // تقليل عدد العمليات في callback
      console.log(`User ${user.id} signed in successfully`)
    }
  },
  debug: false // إيقاف debug في production
}
