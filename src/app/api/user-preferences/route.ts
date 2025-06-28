import { NextResponse } from "next/server"

// الحصول على تفضيلات المستخدم (مؤقت - بيانات افتراضية)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID is required" }, { status: 400 })
    }

    // إرجاع تفضيلات افتراضية (يمكن تحسينها لاحقاً)
    return NextResponse.json({
      success: true,
      data: {
        categories: [],
        tags: [],
        brands: [],
        priceRange: null,
      },
    })

  } catch (error) {
    console.error("Error fetching user preferences:", error)
    return NextResponse.json({ success: false, message: "Error fetching user preferences" }, { status: 500 })
  }
}

// تحديث تفضيلات المستخدم (مؤقت)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, preferences } = body

    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID is required" }, { status: 400 })
    }

    // مؤقت - إرجاع نجاح بدون حفظ فعلي
    return NextResponse.json({
      success: true,
      message: "User preferences updated successfully",
      data: preferences,
    })

  } catch (error) {
    console.error("Error updating user preferences:", error)
    return NextResponse.json({ success: false, message: "Error updating user preferences" }, { status: 500 })
  }
}
