import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ success: false, message: "معرف المستخدم مطلوب" }, { status: 400 })
    }

    // يمكن إضافة منطق إضافي هنا مثل تسجيل وقت تسجيل الخروج
    const { db } = await connectToDatabase()

    await db.collection("customers").updateOne({ id: userId }, { $set: { lastLogoutAt: new Date() } })

    return NextResponse.json({
      success: true,
      message: "تم تسجيل الخروج بنجاح",
    })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ success: false, message: "حدث خطأ أثناء تسجيل الخروج" }, { status: 500 })
  }
}

