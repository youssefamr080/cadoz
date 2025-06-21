import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
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

    // التحقق من وجود المستخدم مسبقًا
    const existingUser = await prisma.customer.findUnique({
      where: { phone }
    })

    if (existingUser) {
      return NextResponse.json({ success: false, message: "رقم الهاتف مسجل بالفعل" }, { status: 400 })
    }

    // Validate password strength
    const { validatePassword } = await import('@/lib/security/password-validator');
    const validationResult = validatePassword(password);
    
    if (!validationResult.isValid) {
      return NextResponse.json({
        success: false,
        message: "Password is too weak",
        feedback: validationResult.feedback
      }, { status: 400 });
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 12) // Increased rounds for better security

    // Create unique IDs
    const userId = uuidv4()
    const sessionId = uuidv4()

    // إنشاء المستخدم الجديد
    const newUser = await prisma.customer.create({
      data: {
        id: userId,
        name,
        phone,
        email: email || "",
        password: hashedPassword,
        lastLoginAt: new Date(),
        lastIp: ip,
        lastUserAgent: userAgent,
        isActive: true,
        currentSessionId: sessionId,
        loginCount: 1,
        devices: {
          create: {
            deviceId: sessionId,
            userAgent,
            ip,
            lastUsedAt: new Date(),
          }
        }
      }
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

