import { NextResponse } from "next/server"
import { connectToDatabase } from "../../../../lib/mongodb"
import bcrypt from "bcryptjs"
import type { ICustomer } from "../../../../models/Customer"
import type { Document, UpdateFilter } from "mongodb"

type CustomerResponse = {
  id: string
  name: string
  phone: string
  email?: string
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
  lastIp?: string
  lastUserAgent?: string
  isActive: boolean
  currentSessionId?: string
  loginCount: number
  devices: Array<{
    deviceId: string
    userAgent: string
    ip: string
    lastUsedAt: Date
  }>
  lastProductViewed?: number
  lastActiveAt?: Date
  totalProductViews?: number
  totalViewDuration?: number
  viewCount?: number
  averageViewDuration?: number
  sessionId?: string
}

type CustomerDocument = Document & ICustomer

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { phone, password } = body
    const userAgent = request.headers.get("user-agent") || ""
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "0.0.0.0"

    if (!phone || !password) {
      return NextResponse.json({ success: false, message: "الرجاء إدخال رقم الهاتف وكلمة المرور" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // البحث عن المستخدم بواسطة رقم الهاتف
    const userDoc = await db.collection("customers").findOne({ phone })

    // إصلاح الخطأ: تحويل المستند إلى unknown أولاً ثم إلى CustomerDocument
    const user = userDoc as unknown as CustomerDocument

    if (!user) {
      // تسجيل محاولة تسجيل دخول فاشلة
      await db.collection("loginAttempts").insertOne({
        phone,
        success: false,
        reason: "user_not_found",
        timestamp: new Date(),
        ip,
        userAgent,
      })

      return NextResponse.json({ success: false, message: "رقم الهاتف غير مسجل" }, { status: 404 })
    }

    // التحقق من كلمة المرور
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      // تسجيل محاولة تسجيل دخول فاشلة
      await db.collection("loginAttempts").insertOne({
        userId: user.id,
        phone,
        success: false,
        reason: "invalid_password",
        timestamp: new Date(),
        ip,
        userAgent,
      })

      return NextResponse.json({ success: false, message: "كلمة المرور غير صحيحة" }, { status: 401 })
    }

    // تحديث بيانات المستخدم بعد تسجيل الدخول
    const sessionId = crypto.randomUUID()

    const updateFilter = {
      $set: {
        lastLoginAt: new Date(),
        lastIp: ip,
        lastUserAgent: userAgent,
        isActive: true,
        currentSessionId: sessionId,
      },
      $inc: { loginCount: 1 },
      $push: {
        devices: {
          deviceId: sessionId,
          userAgent,
          ip,
          lastUsedAt: new Date(),
        },
      },
    } as unknown as UpdateFilter<CustomerDocument>

    await db.collection("customers").updateOne({ _id: user._id }, updateFilter)

    // تسجيل جلسة جديدة
    await db.collection("customerSessions").insertOne({
      userId: user.id,
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

    // تسجيل محاولة تسجيل دخول ناجحة
    await db.collection("loginAttempts").insertOne({
      userId: user.id,
      phone,
      success: true,
      timestamp: new Date(),
      ip,
      userAgent,
      sessionId,
    })

    // إعداد بيانات المستخدم للإرجاع
    const response: CustomerResponse = {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt,
      lastIp: user.lastIp,
      lastUserAgent: user.lastUserAgent,
      isActive: user.isActive,
      currentSessionId: user.currentSessionId,
      loginCount: user.loginCount,
      devices: user.devices,
      lastProductViewed: user.lastProductViewed,
      lastActiveAt: user.lastActiveAt,
      totalProductViews: user.totalProductViews,
      totalViewDuration: user.totalViewDuration,
      viewCount: user.viewCount,
      averageViewDuration: user.averageViewDuration,
      sessionId, // إضافة معرف الجلسة للاستجابة
    }

    return NextResponse.json({
      success: true,
      message: "تم تسجيل الدخول بنجاح",
      user: response,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, message: "حدث خطأ أثناء تسجيل الدخول" }, { status: 500 })
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

