import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// الحصول على تفضيلات المستخدم
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID is required" }, { status: 400 })
    }

    // البحث عن تفضيلات المستخدم
    const preferences = await prisma.userPreference.findUnique({
      where: { userId }
    })

    if (!preferences) {
      return NextResponse.json({
        success: true,
        data: {
          categories: [],
          tags: [],
          brands: [],
          priceRange: null,
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

    // تحديث تفضيلات المستخدم
    await prisma.userPreference.upsert({
      where: { userId },
      update: {
        categories: preferences.categories || [],
        tags: preferences.tags || [],
        brands: preferences.brands || [],
        priceRange: preferences.priceRange,
        updatedAt: new Date()
      },
      create: {
        userId,
        categories: preferences.categories || [],
        tags: preferences.tags || [],
        brands: preferences.brands || [],
        priceRange: preferences.priceRange,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: "User preferences updated successfully",
    })
  } catch (error) {
    console.error("Error updating user preferences:", error)
    return NextResponse.json({ success: false, message: "Failed to update user preferences" }, { status: 500 })
  }
}

