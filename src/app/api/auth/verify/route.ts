import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// API endpoint للتحقق من وجود مستخدم في قاعدة البيانات
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, phone } = body

    if (!userId || !phone) {
      return NextResponse.json({ success: false, message: "معرف المستخدم ورقم الهاتف مطلوبان" }, { status: 400 })
    }

    // البحث عن المستخدم بالمعرف ورقم الهاتف
    const user = await prisma.customer.findFirst({
      where: {
        id: userId,
        phone: phone
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true
      }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        message: "المستخدم غير موجود في قاعدة البيانات",
        valid: false,
      })
    }

    return NextResponse.json({
      success: true,
      valid: true,
      user: user,
    })
  } catch (error) {
    console.error("User verification error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء التحقق من المستخدم",
        valid: false,
      },
      { status: 500 },
    )
  }
}

