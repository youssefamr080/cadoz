import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { connectToDatabase } from "@/lib/mongodb"
import bcrypt from "bcryptjs"

declare module "next-auth" {
  interface User {
    phone?: string | null
    role?: string | null
  }
  
  interface Session {
    user: User & {
      id: string
      rememberMe?: boolean
    }
  }
}

export const authOptions: NextAuthOptions = {
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
        rememberMe: { label: "Remember Me", type: "checkbox" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.phone || !credentials?.password) {
            return null;
          }

          const { db } = await connectToDatabase();
          const user = await db.collection("customers").findOne({ phone: credentials.phone });

          if (!user || !user.password) {
            return null;
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);

          if (!isValid) {
            return null;
          }

          return {
            id: user.id,
            name: user.name || "",
            email: user.email || "",
            phone: user.phone,
            role: user.role || "user",
            rememberMe: credentials.rememberMe === "true"
          };
        } catch (error) {
          console.error("[AUTH] Error in authorize:", error);
          return null;
        }
      }
    })
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.phone = user.phone;
        token.role = user.role;
        token.rememberMe = (user as { rememberMe?: boolean }).rememberMe;
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.phone = token.phone as string;
        session.user.role = token.role as string;
        session.user.rememberMe = token.rememberMe as boolean;
      }
      return session;
    }
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 4 * 60 * 60, // 4 hours
  },

  secret: process.env.NEXTAUTH_SECRET
}
