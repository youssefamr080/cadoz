import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get("phone")
    const email = searchParams.get("email")
    const id = searchParams.get("id")

    if (!phone && !email && !id) {
      return NextResponse.json(
        { success: false, message: "يجب توفير معرف أو بريد إلكتروني أو رقم هاتف" },
        { status: 400 },
      )
    }

    // بناء استعلام البحث
    const where: { phone?: string; email?: string; id?: string } = {}
    if (phone) where.phone = phone
    if (email) where.email = email
    if (id) where.id = id

    // البحث عن المستخدم
    const user = await prisma.customer.findFirst({
      where,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        createdAt: true,
        lastLoginAt: true,
        isActive: true,
        orderCount: true,
      }
    })

    if (user) {
      // إعادة معلومات محددة فقط للأمان
      return NextResponse.json({
        success: true,
        exists: true,
        user,
      })
    } else {
      return NextResponse.json({
        success: true,
        exists: false,
      })
    }
  } catch (error) {
    console.error("Error checking customer:", error)
    return NextResponse.json({ success: false, message: "حدث خطأ أثناء البحث عن المستخدم" }, { status: 500 })
  }
}

