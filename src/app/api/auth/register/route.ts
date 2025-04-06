import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, phone, email, password } = body

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
      isActive: true,
      loginCount: 1,
      orders: [],
      orderCount: 0,
    }

    await db.collection("customers").insertOne(newUser)

    // إعادة بيانات المستخدم بدون كلمة المرور
    const userWithoutPassword = { ...newUser }
    delete userWithoutPassword.password

    return NextResponse.json({
      success: true,
      message: "تم التسجيل بنجاح",
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ success: false, message: "حدث خطأ أثناء التسجيل" }, { status: 500 })
  }
}

