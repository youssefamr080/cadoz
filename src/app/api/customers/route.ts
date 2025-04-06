import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

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

    const { db } = await connectToDatabase()

    // بناء استعلام البحث
    interface SearchQuery {
      phone?: string;
      email?: string;
      id?: string;
    }
    const query: SearchQuery = {}
    if (phone) query.phone = phone
    if (email) query.email = email
    if (id) query.id = id

    // البحث عن المستخدم
    const user = await db.collection("customers").findOne(query)

    if (user) {
      // إعادة معلومات محددة فقط للأمان
      return NextResponse.json({
        success: true,
        exists: true,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
          isActive: user.isActive,
          orderCount: user.orderCount,
        },
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

