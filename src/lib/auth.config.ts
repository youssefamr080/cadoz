import { type AuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { connectToDatabase } from "@/lib/mongodb"
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"

// تعريف واجهة مخصصة لبيانات المستخدم في الجلسة
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string;
      email?: string;
      image?: string;
      phone?: string;
      phoneNumber?: string; // إضافة لدعم التوافق
      role?: string;
    }
  }
}

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
        console.log("[AUTH] Received credentials:", credentials ? { phone: credentials.phone, hasPassword: !!credentials.password } : "no credentials");
        
        if (!credentials?.phone || !credentials?.password) {
          console.error("[AUTH] Missing phone or password in credentials");
          return null;
        }
        
        try {
          const { db } = await connectToDatabase();
          console.log(`[AUTH] Looking for user with phone: ${credentials.phone}`);
          
          const user = await db.collection("customers").findOne({ phone: credentials.phone });
          
          if (!user) {
            console.error(`[AUTH] No user found for phone: ${credentials.phone}`);
            return null;
          }
          
          console.log(`[AUTH] User found for phone: ${credentials.phone}`);
          
          // Defensive: ensure password exists
          if (!user.password) {
            console.error(`[AUTH] User found but missing password. User ID: ${user.id}`);
            return null;
          }
          
          console.log(`[AUTH] Validating password for user: ${user.id}`);
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          
          if (!isPasswordValid) {
            console.error(`[AUTH] Invalid password for phone: ${credentials.phone}`);
            return null;
          }
          
          console.log(`[AUTH] Password valid for user: ${user.id}`);
          
          // Defensive: ensure id, name, phone exist
          if (!user.id || !user.name || !user.phone) {
            console.error(`[AUTH] User missing required fields (id, name, phone). User ID: ${user.id || 'missing'}`);
            return null;
          }
          
          console.log(`[AUTH] Updating login information for user: ${user.id}`);
          
          // Update user's last login information
          await db.collection("customers").updateOne(
            { id: user.id },
            {
              $set: {
                lastLoginAt: new Date(),
                isActive: true,
                lastIp: "0.0.0.0", // Could be updated with actual IP if available
                lastUserAgent: "Web Login",
              },
              $inc: { loginCount: 1 },
            }
          );
          
          const userObj = {
            id: user.id,
            name: user.name,
            email: user.email || "",
            phone: user.phone,
            phoneNumber: user.phone, // Add phoneNumber for compatibility
            image: user.image || undefined,
            role: user.role || "user",
          };
          
          console.log("[AUTH] Successfully authorized user:", { id: userObj.id, name: userObj.name, phone: userObj.phone });
          return userObj;
        } catch (error) {
          console.error("[AUTH] Error in authorize function:", error);
          return null;
        }
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
      try {
        console.log("[AUTH] Session callback started with token:", token ? { id: token.id, name: token.name, phone: token.phone } : "no token");
        
        // Defensive check to ensure session and session.user exist
        if (!session) {
          console.log("[AUTH] Session callback - no session provided, creating default session");
          // Create a valid session with required properties
          return { 
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            user: { id: "", name: "", email: "", phone: "", phoneNumber: "" } 
          };
        }
        
        if (!session.user) {
          console.log("[AUTH] Session callback - no user in session, creating default user");
          session.user = { id: "", name: "", email: "", phone: "", phoneNumber: "" };
        }
        
        // Type the session user properly to allow additional properties
        const user = session.user as Record<string, unknown>;
        
        // First check if we have user data in localStorage
        let localUserData = null;
        if (typeof window !== 'undefined') {
          try {
            const storedUser = localStorage.getItem('userData');
            if (storedUser) {
              localUserData = JSON.parse(storedUser);
              console.log("[AUTH] Found user data in localStorage:", localUserData ? { id: localUserData.id } : "invalid data");
            }
          } catch (e) {
            console.error("[AUTH] Error reading from localStorage:", e);
          }
        }
        
        // If we have token data, use it (highest priority)
        if (token) {
          console.log("[AUTH] Setting user properties from token");
          // Set core properties if token exists
          if (token.id) user.id = token.id as string;
          if (token.name) user.name = token.name as string;
          if (token.email) user.email = token.email as string;
          if (token.phone) {
            user.phone = token.phone as string;
            user.phoneNumber = token.phone as string; // For backward compatibility
          }
          if (token.picture) user.image = token.picture as string;
          if (token.role) user.role = token.role as string;
        } 
        // If we have localStorage data and no token data, use localStorage
        else if (localUserData && localUserData.id) {
          console.log("[AUTH] Setting user properties from localStorage");
          user.id = localUserData.id;
          if (localUserData.name) user.name = localUserData.name;
          if (localUserData.email) user.email = localUserData.email;
          if (localUserData.phone) {
            user.phone = localUserData.phone;
            user.phoneNumber = localUserData.phone; // For backward compatibility
          }
          if (localUserData.image) user.image = localUserData.image;
          user.role = localUserData.role || "user";
        }
        // Ensure all required properties exist with defaults
        if (!user.id) user.id = "";
        if (!user.name) user.name = "";
        if (!user.email) user.email = "";
        if (!user.phone) user.phone = "";
        if (!user.phoneNumber) user.phoneNumber = "";
        if (!user.role) user.role = "user";
        
        console.log("[AUTH] Session callback - returning session with user:", { 
          id: user.id, 
          name: user.name, 
          phone: user.phone || user.phoneNumber 
        });
        
        return session;
      } catch (error) {
        console.error("[AUTH] Error in session callback:", error);
        // Return a minimal valid session to prevent errors
        return { 
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          user: { id: "", name: "", email: "", phone: "", phoneNumber: "" } 
        };
      }
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