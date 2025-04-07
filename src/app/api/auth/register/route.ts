import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth.config"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, phone, email, password } = body
    const userAgent = request.headers.get("user-agent") || ""
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "0.0.0.0"

    if (!name || !phone || !password) {
      return NextResponse.json({ success: false, message: "جميع الحقول مطلوبة" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // التحقق من وجود المستخدم مسبقًا
    const existingUser = await db.collection("customers").findOne({ phone })

    if (existingUser) {
      return NextResponse.json({ success: false, message: "رقم الهاتف مسجل بالفعل" }, { status: 400 })
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10)

    // إنشاء معرف فريد للمستخدم
    const userId = uuidv4()
    const sessionId = uuidv4()

    // إنشاء المستخدم الجديد
    const newUser = {
      id: userId,
      name,
      phone,
      email: email || "",
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: new Date(),
      lastIp: ip,
      lastUserAgent: userAgent,
      isActive: true,
      currentSessionId: sessionId,
      loginCount: 1,
      devices: [{
        deviceId: sessionId,
        userAgent,
        ip,
        lastUsedAt: new Date(),
      }],
      orders: [],
      orderCount: 0,
    }

    await db.collection("customers").insertOne(newUser)

    // إنشاء جلسة جديدة
    await db.collection("customerSessions").insertOne({
      userId,
      sessionId,
      startedAt: new Date(),
      device: {
        userAgent,
        ip,
        type: detectDeviceType(userAgent),
        browser: detectBrowser(userAgent),
        os: detectOS(userAgent),
      },
      isActive: true,
    })

    // إنشاء جلسة NextAuth
    const session = await getServerSession(authOptions)
    if (session) {
      // تحديث الجلسة الحالية
      session.user = {
        ...session.user,
        id: userId,
        name,
        email: email || "",
        phone,
      }
    }

    // إعادة بيانات المستخدم بدون كلمة المرور
    const userWithoutPassword = { ...newUser }
    delete userWithoutPassword.password

    return NextResponse.json({
      success: true,
      message: "تم التسجيل بنجاح",
      user: {
        ...userWithoutPassword,
        sessionId,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ success: false, message: "حدث خطأ أثناء التسجيل" }, { status: 500 })
  }
}

// وظائف مساعدة للكشف عن نوع الجهاز والمتصفح ونظام التشغيل
function detectDeviceType(userAgent: string): string {
  if (/mobile/i.test(userAgent)) return "mobile"
  if (/tablet/i.test(userAgent)) return "tablet"
  return "desktop"
}

function detectBrowser(userAgent: string): string {
  if (/chrome/i.test(userAgent)) return "chrome"
  if (/firefox/i.test(userAgent)) return "firefox"
  if (/safari/i.test(userAgent)) return "safari"
  if (/edge/i.test(userAgent)) return "edge"
  return "other"
}

function detectOS(userAgent: string): string {
  if (/windows/i.test(userAgent)) return "windows"
  if (/macintosh/i.test(userAgent)) return "macos"
  if (/linux/i.test(userAgent)) return "linux"
  if (/android/i.test(userAgent)) return "android"
  if (/iphone|ipad|ipod/i.test(userAgent)) return "ios"
  return "other"
}

