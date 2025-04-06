import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, phone } = body

    if (!userId || !phone) {
      return NextResponse.json({ valid: false }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // البحث عن المستخدم
    const user = await db.collection("customers").findOne({ id: userId, phone })

    if (!user) {
      return NextResponse.json({ valid: false }, { status: 404 })
    }

    // تحديث آخر وقت تسجيل دخول
    await db.collection("customers").updateOne({ id: userId }, { $set: { lastLoginAt: new Date() } })

    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error("Error checking session:", error)
    return NextResponse.json({ valid: false }, { status: 500 })
  }
}

