import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, phone, sessionId } = body

    if (!userId || !phone || !sessionId) {
      return NextResponse.json({ valid: false, message: "Missing required fields" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // البحث عن المستخدم والتحقق من الجلسة
    const user = await db.collection("customers").findOne({ 
      id: userId, 
      phone,
      currentSessionId: sessionId
    })

    if (!user) {
      return NextResponse.json({ valid: false, message: "Invalid session" }, { status: 404 })
    }

    // التحقق من أن الجلسة لا تزال نشطة
    const session = await db.collection("customerSessions").findOne({
      userId,
      sessionId,
      isActive: true
    })

    if (!session) {
      return NextResponse.json({ valid: false, message: "Session expired" }, { status: 401 })
    }

    // تحديث آخر وقت تسجيل دخول ووقت النشاط
    await db.collection("customers").updateOne(
      { id: userId }, 
      { 
        $set: { 
          lastLoginAt: new Date(),
          lastActiveAt: new Date()
        } 
      }
    )

    // تحديث وقت النشاط الأخير للجلسة
    await db.collection("customerSessions").updateOne(
      { userId, sessionId },
      { $set: { lastActiveAt: new Date() } }
    )

    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error("Error checking session:", error)
    return NextResponse.json({ valid: false, message: "Internal server error" }, { status: 500 })
  }
}

