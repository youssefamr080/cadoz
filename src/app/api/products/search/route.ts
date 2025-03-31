import { NextResponse } from "next/server"
import { connectToDatabase } from "../../../../lib/mongodb"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const category = searchParams.get("category")

    if (!query && !category) {
      return NextResponse.json(
        {
          success: false,
          message: "يجب توفير معايير البحث",
        },
        { status: 400 },
      )
    }

    const { db } = await connectToDatabase()

    // بناء استعلام البحث
    const searchQuery: any = {}

    if (query) {
      // البحث في اسم المنتج والوصف والعلامات
      searchQuery.$or = [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { tags: { $in: [new RegExp(query, "i")] } },
      ]
    }

    if (category) {
      searchQuery.category = category
    }

    // إضافة شرط توفر المنتج
    searchQuery.stock = { $gt: 0 }

    // تنفيذ البحث مع التصنيف والترقيم
    const skip = (page - 1) * limit

    const products = await db
      .collection("products")
      .find(searchQuery)
      .sort({ score: -1 }) // ترتيب حسب الأهمية
      .skip(skip)
      .limit(limit)
      .toArray()

    // الحصول على إجمالي عدد النتائج للترقيم
    const total = await db.collection("products").countDocuments(searchQuery)

    // تسجيل عملية البحث للتحليلات
    await db.collection("searchLogs").insertOne({
      query,
      category,
      timestamp: new Date(),
      resultsCount: products.length,
      userAgent: request.headers.get("user-agent") || "",
      ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "",
    })

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("خطأ في البحث عن المنتجات:", error)
    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء البحث عن المنتجات",
      },
      { status: 500 },
    )
  }
}

