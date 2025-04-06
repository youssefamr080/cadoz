import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { connectToDatabase } from "@/lib/mongodb"
import { authOptions } from "@/lib/auth.config"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ success: false, message: "غير مصرح به" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // البحث عن المستخدم
    const user = await db.collection("customers").findOne({ id: session.user.id })

    if (!user) {
      return NextResponse.json({ success: false, message: "المستخدم غير موجود" }, { status: 404 })
    }

    // إعادة معلومات المستخدم بدون كلمة المرور
    const {  ...userWithoutPassword } = user
    delete userWithoutPassword.password

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ success: false, message: "حدث خطأ أثناء جلب الملف الشخصي" }, { status: 500 })
  }
}

