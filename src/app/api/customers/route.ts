import { NextResponse } from "next/server"
import { connectToDatabase } from "../../../lib/mongodb"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get("phone")

    if (!phone) {
      return NextResponse.json({ success: false, message: "الرجاء تحديد رقم الهاتف" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // البحث عن المستخدم بواسطة رقم الهاتف
    const user = await db.collection("customers").findOne({ phone })

    return NextResponse.json({
      success: true,
      exists: !!user,
    })
  } catch (error) {
    console.error("Error checking customer:", error)
    return NextResponse.json({ success: false, message: "حدث خطأ أثناء التحقق من المستخدم" }, { status: 500 })
  }
}

