import { NextResponse } from "next/server"
import { connectToDatabase } from "../../../../lib/mongodb"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ success: false, message: "معرف المستخدم مطلوب" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // تحديث آخر وقت تسجيل خروج للمستخدم
    await db.collection("customers").updateOne(
      { id: userId },
      {
        $set: {
          lastLogoutAt: new Date(),
        },
      },
    )

    return NextResponse.json({
      success: true,
      message: "تم تسجيل الخروج بنجاح",
    })
  } catch (error) {
    console.error("Error logging out:", error)
    return NextResponse.json({ success: false, message: "حدث خطأ أثناء تسجيل الخروج" }, { status: 500 })
  }
}

