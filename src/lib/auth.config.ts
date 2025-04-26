import { type AuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { connectToDatabase } from "@/lib/mongodb"
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        phone: { label: "Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      // Enhanced authorize for better debugging and reliability
      async authorize(credentials) {
        console.log("[AUTH] Received credentials:", credentials);
        if (!credentials?.phone || !credentials?.password) {
          console.error("[AUTH] Missing phone or password in credentials", credentials);
          return null;
        }
        const { db } = await connectToDatabase();
        const user = await db.collection("customers").findOne({ phone: credentials.phone });
        if (!user) {
          console.error(`[AUTH] No user found for phone: ${credentials.phone}`);
          return null;
        }
        // Defensive: ensure password exists
        if (!user.password) {
          console.error(`[AUTH] User found but missing password. User:`, user);
          return null;
        }
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) {
          console.error(`[AUTH] Invalid password for phone: ${credentials.phone}`);
          return null;
        }
        // Defensive: ensure id, name, phone exist
        if (!user.id || !user.name || !user.phone) {
          console.error(`[AUTH] User missing required fields (id, name, phone):`, user);
          return null;
        }
        const userObj = {
          id: user.id,
          name: user.name,
          email: user.email || "",
          phone: user.phone,
          image: user.image || undefined,
        };
        console.log("[AUTH] Authorized user:", userObj);
        return userObj;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.phone = user.phone
      }

      // إذا كان تسجيل الدخول عبر جوجل
      if (token.email) {
        try {
          const { db } = await connectToDatabase()

          // البحث عن المستخدم بواسطة البريد الإلكتروني
          const existingUser = await db.collection("customers").findOne({ email: token.email })

          if (existingUser) {
            // تحديث معلومات المستخدم
            token.id = existingUser.id
            token.phone = existingUser.phone

            // تحديث معلومات المستخدم في قاعدة البيانات
            await db.collection("customers").updateOne(
              { id: existingUser.id },
              {
                $set: {
                  lastLoginAt: new Date(),
                  lastIp: "0.0.0.0", // يمكن تحديثه لاحقًا
                  lastUserAgent: "Google Login",
                  isActive: true,
                  image: token.picture,
                },
                $inc: { loginCount: 1 },
              },
            )
          } else {
            // إنشاء مستخدم جديد
            const userId = uuidv4()
            const newUser = {
              id: userId,
              name: token.name,
              email: token.email,
              phone: "", // يمكن تحديثه لاحقًا
              password: await bcrypt.hash(uuidv4(), 10), // كلمة مرور عشوائية
              image: token.picture,
              createdAt: new Date(),
              updatedAt: new Date(),
              lastLoginAt: new Date(),
              isActive: true,
              loginCount: 1,
              orders: [],
              orderCount: 0,
            }

            await db.collection("customers").insertOne(newUser)

            token.id = userId
          }
        } catch (error) {
          console.error("Error handling Google login:", error)
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.phone = token.phone as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
} 