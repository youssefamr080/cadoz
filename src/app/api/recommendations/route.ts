import { NextResponse } from "next/server"
import { prisma } from '@/lib/prisma'

// دالة GET: جلب توصيات المنتجات بناءً على الفلاتر فقط
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const excludeIds = searchParams.get("excludeIds")?.split(",") || []
    const category = searchParams.get("category")
    const tags = searchParams.get("tags")?.split(",") || []
    const userId = searchParams.get("userId")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const priceRange = searchParams.get("priceRange")?.split("-").map(Number) || []

    // بناء استعلام المنتجات
    const where: any = {
      id: { notIn: excludeIds },
      stock: { gt: 0 },
    }
    if (category) {
      where.category = category
    }
    if (tags.length > 0) {
      where.tags = { hasSome: tags }
    }
    if (priceRange.length === 2) {
      where.price = { gte: priceRange[0], lte: priceRange[1] }
    }

    // جلب المنتجات
    const recommendations = await prisma.product.findMany({
      where,
      take: limit,
      orderBy: [{ rating: 'desc' }, { views: 'desc' }]
    })

    // تحديث آخر نشاط للمستخدم إذا كان userId موجود
    if (userId) {
      await prisma.customer.update({
        where: { id: userId },
        data: { lastActiveAt: new Date() },
      })
    }

    return NextResponse.json({
      success: true,
      data: recommendations,
    })
  } catch (error) {
    console.error("Error fetching recommendations:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch recommendations" }, { status: 500 })
  }
}

// دالة POST: تسجيل مشاهدة منتج فقط (مثال بسيط)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, productId, sessionId } = body
    if (!productId) {
      return NextResponse.json({ success: false, message: "Product ID is required" }, { status: 400 })
    }
    // تسجيل مشاهدة المنتج في ProductView إذا كان userId موجود
    if (userId) {
      await prisma.productView.create({
        data: {
          userId,
          productId,
          viewedAt: new Date(),
          sessionId: sessionId || undefined,
          duration: 0,
          source: "recommendation",
          device: {},
          interactions: {},
        }
      })
      // تحديث آخر نشاط للمستخدم
      await prisma.customer.update({
        where: { id: userId },
        data: { lastActiveAt: new Date(), lastProductViewed: productId },
      })
    }
    // زيادة عداد المشاهدات للمنتج
    await prisma.product.update({
      where: { id: productId },
      data: { views: { increment: 1 } }
    })
    return NextResponse.json({ success: true, message: "Product view recorded successfully" })
  } catch (error) {
    console.error("Error recording product view:", error)
    return NextResponse.json({ success: false, message: "Failed to record product view" }, { status: 500 })
  }
}

