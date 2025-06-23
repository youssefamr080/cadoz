import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const category = searchParams.get("category")
    const id = searchParams.get("id")

    // إذا تم تقديم ID، إرجاع صندوق واحد
    if (id) {
      // التحقق من صحة تنسيق ObjectId
      if (!/^[a-fA-F0-9]{24}$/.test(id)) {
        return NextResponse.json({ success: false, message: "Invalid box ID format" }, { status: 400 })
      }

      const box = await prisma.inspirationBox.findUnique({
        where: { id },
        include: {
          inspiration: true
        }
      })

      if (!box) {
        return NextResponse.json({ success: false, message: "Box not found" }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        data: box,
      })
    }

    // إذا تم تقديم فئة، التصفية حسب الفئة
    const where: Record<string, unknown> = {}
    if (category) {
      where.category = category
    }

    const boxes = await prisma.inspirationBox.findMany({
      where,
      include: {
        inspiration: true
      }
    })

    return NextResponse.json({
      success: true,
      data: boxes,
    })
  } catch (error) {
    console.error("Error fetching boxes:", error)
    return NextResponse.json({ success: false, message: "Error fetching boxes", error: String(error) }, { status: 500 })
  }
}
