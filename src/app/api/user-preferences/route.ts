import { NextResponse } from "next/server"
import { connectToDatabase } from "../../../lib/mongodb"

// الحصول على تفضيلات المستخدم
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // البحث عن تفضيلات المستخدم
    const preferences = await db.collection("userPreferences").findOne({ userId })

    if (!preferences) {
      return NextResponse.json({
        success: true,
        data: {
          categories: {},
          tags: {},
          brands: {},
          priceRange: { min: 0, max: 10000, count: 0 },
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: preferences,
    })
  } catch (error) {
    console.error("Error fetching user preferences:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch user preferences" }, { status: 500 })
  }
}

// تحديث تفضيلات المستخدم
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, preferences } = body

    if (!userId || !preferences) {
      return NextResponse.json({ success: false, message: "User ID and preferences are required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // تحديث تفضيلات المستخدم
    await db
      .collection("userPreferences")
      .updateOne({ userId }, { $set: { ...preferences, updatedAt: new Date() } }, { upsert: true })

    return NextResponse.json({
      success: true,
      message: "User preferences updated successfully",
    })
  } catch (error) {
    console.error("Error updating user preferences:", error)
    return NextResponse.json({ success: false, message: "Failed to update user preferences" }, { status: 500 })
  }
}

