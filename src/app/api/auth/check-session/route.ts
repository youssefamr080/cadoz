import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth.config";

export async function GET(request: Request) {
  try {
    console.log("[API] check-session: Checking session status");
    
    // 1. محاولة الحصول على الجلسة من NextAuth
    const session = await getServerSession(authOptions);
    
    // 2. إذا كانت الجلسة موجودة، نعيد بيانات المستخدم
    if (session && session.user && session.user.id) {
      console.log("[API] check-session: Found NextAuth session for user:", session.user.id);
      return NextResponse.json({ 
        user: session.user, 
        provider: 'credentials',
        source: 'nextauth'
      });
    }
    
    // 3. إذا لم تكن الجلسة موجودة، نحاول البحث عن بيانات المستخدم في قاعدة البيانات
    // نحصل على معرف المستخدم من الكوكيز إذا كان متاحًا
    const cookies = request.headers.get('cookie');
    let userId = null;
    
    if (cookies) {
      const userIdMatch = cookies.match(/userId=([^;]+)/);
      if (userIdMatch) {
        userId = userIdMatch[1];
        console.log("[API] check-session: Found userId in cookies:", userId);
      }
    }
    
    if (userId) {
      const { db } = await connectToDatabase();
      const user = await db.collection("customers").findOne({ id: userId });
      
      if (user) {
        console.log("[API] check-session: Found user in database:", user.id);
        // تحويل بيانات المستخدم إلى الصيغة المطلوبة
        const userData = {
          id: user.id,
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          phoneNumber: user.phone || '',
          image: user.image,
          role: user.role || 'user'
        };
        
        return NextResponse.json({ 
          user: userData, 
          provider: 'credentials',
          source: 'database'
        });
      }
    }
    
    // 4. إذا لم نجد بيانات المستخدم في أي مكان، نعيد استجابة ناجحة ولكن بدون بيانات مستخدم
    console.log("[API] check-session: No session found");
    return NextResponse.json({ user: null, message: "No session found" }, { status: 200 });
  } catch (error) {
    console.error("[API] Error in GET /api/auth/check-session:", error);
    return NextResponse.json({ user: null, message: "Internal server error" }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, phone, sessionId } = body

    if (!userId || !phone || !sessionId) {
      return NextResponse.json({ valid: false, message: "Missing required fields" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // البحث عن المستخدم والتحقق من الجلسة
    const user = await db.collection("customers").findOne({ 
      id: userId, 
      phone,
      currentSessionId: sessionId
    })

    if (!user) {
      return NextResponse.json({ valid: false, message: "Invalid session" }, { status: 404 })
    }

    // التحقق من أن الجلسة لا تزال نشطة
    const session = await db.collection("customerSessions").findOne({
      userId,
      sessionId,
      isActive: true
    })

    if (!session) {
      return NextResponse.json({ valid: false, message: "Session expired" }, { status: 401 })
    }

    // تحديث آخر وقت تسجيل دخول ووقت النشاط
    await db.collection("customers").updateOne(
      { id: userId }, 
      { 
        $set: { 
          lastLoginAt: new Date(),
          lastActiveAt: new Date()
        } 
      }
    )

    // تحديث وقت النشاط الأخير للجلسة
    await db.collection("customerSessions").updateOne(
      { userId, sessionId },
      { $set: { lastActiveAt: new Date() } }
    )

    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error("Error checking session:", error)
    return NextResponse.json({ valid: false, message: "Internal server error" }, { status: 500 })
  }
}
