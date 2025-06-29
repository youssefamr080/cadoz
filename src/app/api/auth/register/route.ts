import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, phone, email, password } = body
    const userAgent = request.headers.get("user-agent") || ""
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "0.0.0.0"

    // التحقق من البيانات الأساسية
    if (!name || !phone || !password) {
      return NextResponse.json({ 
        success: false, 
        message: "جميع الحقول مطلوبة" 
      }, { status: 400 })
    }

    // التحقق من طول كلمة المرور
    if (password.length < 6) {
      return NextResponse.json({ 
        success: false, 
        message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" 
      }, { status: 400 })
    }

    // التحقق من صحة البريد الإلكتروني إذا تم إدخاله
    if (email && email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ 
        success: false, 
        message: "البريد الإلكتروني غير صحيح" 
      }, { status: 400 })
    }

    // التحقق من وجود المستخدم مسبقاً بالهاتف
    const existingUserByPhone = await prisma.customer.findUnique({
      where: { phone }
    })

    if (existingUserByPhone) {
      return NextResponse.json({ 
        success: false, 
        message: "رقم الهاتف مسجل بالفعل" 
      }, { status: 400 })
    }

    // التحقق من وجود المستخدم مسبقاً بالبريد الإلكتروني
    if (email && email.trim()) {
      const existingUserByEmail = await prisma.customer.findUnique({
        where: { email: email.trim() }
      })

      if (existingUserByEmail) {
        return NextResponse.json({ 
          success: false, 
          message: "البريد الإلكتروني مسجل بالفعل" 
        }, { status: 400 })
      }
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 12)

    // إنشاء المستخدم الجديد
    const newUser = await prisma.customer.create({
      data: {
        name,
        phone,
        email: email && email.trim() ? email.trim() : null, // التأكد من عدم إرسال string فارغ
        password: hashedPassword,
        lastLoginAt: new Date(),
        lastIp: ip,
        lastUserAgent: userAgent,
        isActive: true,
        loginCount: 1,
        devices: {
          create: {
            deviceId: `device_${Date.now()}`,
            userAgent,
            ip,
            lastUsedAt: new Date(),
          }
        }
      }
    })

    // إرجاع بيانات المستخدم بدون كلمة المرور
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json({
      success: true,
      message: "تم التسجيل بنجاح",
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Registration error:", error)
    
    // التحقق من نوع الخطأ
    if (error instanceof Error) {
      if (error.message.includes('duplicate key')) {
        return NextResponse.json({ 
          success: false, 
          message: "البيانات موجودة بالفعل" 
        }, { status: 400 })
      }
    }
    
    return NextResponse.json({ 
      success: false, 
      message: "حدث خطأ أثناء التسجيل. حاول مرة أخرى." 
    }, { status: 500 })
  }
}

