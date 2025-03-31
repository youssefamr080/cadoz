import { NextResponse } from "next/server"
import { connectToDatabase } from "../../../../lib/mongodb"
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, phone, email, password } = body
    const userAgent = request.headers.get("user-agent") || ""
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "0.0.0.0"

    if (!name || !phone || !password) {
      return NextResponse.json({ success: false, message: "الرجاء إدخال جميع البيانات المطلوبة" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // التحقق من وجود المستخدم مسبقًا
    const existingUser = await db.collection("customers").findOne({ phone })

    if (existingUser) {
      return NextResponse.json({ success: false, message: "رقم الهاتف مسجل بالفعل" }, { status: 409 })
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10)

    // إنشاء معرف فريد للمستخدم
    const userId = uuidv4()

    // إنشاء معرف جلسة
    const sessionId = crypto.randomUUID()

    // إنشاء كائن المستخدم
    const newUser = {
      id: userId,
      name,
      phone,
      email: email || null,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: new Date(),
      lastIp: ip,
      lastUserAgent: userAgent,
      isActive: true,
      currentSessionId: sessionId,
      loginCount: 1,
      devices: [
        {
          deviceId: sessionId,
          userAgent,
          ip,
          lastUsedAt: new Date(),
        },
      ],
      orders: [], // إضافة مصفوفة فارغة للطلبات
      orderCount: 0,
    }

    // إضافة المستخدم إلى قاعدة البيانات
    await db.collection("customers").insertOne(newUser)

    // تسجيل جلسة جديدة
    await db.collection("customerSessions").insertOne({
      userId: userId,
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

    // إعادة بيانات المستخدم بدون كلمة المرور
    const userWithoutPassword = { ...newUser }
    delete userWithoutPassword.password

    return NextResponse.json({
      success: true,
      message: "تم التسجيل بنجاح",
      user: {
        ...userWithoutPassword,
        sessionId, // إضافة معرف الجلسة للاستجابة
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ success: false, message: "حدث خطأ أثناء التسجيل" }, { status: 500 })
  }
}

// وظائف مساعدة لاكتشاف معلومات الجهاز
function detectDeviceType(userAgent: string): string {
  if (/mobile|android|iphone|ipad|ipod|windows phone/i.test(userAgent)) {
    return "mobile"
  }
  if (/tablet|ipad/i.test(userAgent)) {
    return "tablet"
  }
  return "desktop"
}

function detectBrowser(userAgent: string): string {
  if (/chrome/i.test(userAgent)) return "Chrome"
  if (/firefox/i.test(userAgent)) return "Firefox"
  if (/safari/i.test(userAgent)) return "Safari"
  if (/edge/i.test(userAgent)) return "Edge"
  if (/opera/i.test(userAgent)) return "Opera"
  if (/msie|trident/i.test(userAgent)) return "Internet Explorer"
  return "Unknown"
}

function detectOS(userAgent: string): string {
  if (/windows/i.test(userAgent)) return "Windows"
  if (/macintosh|mac os x/i.test(userAgent)) return "MacOS"
  if (/linux/i.test(userAgent)) return "Linux"
  if (/android/i.test(userAgent)) return "Android"
  if (/iphone|ipad|ipod/i.test(userAgent)) return "iOS"
  return "Unknown"
}

