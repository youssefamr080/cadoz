import { NextResponse } from "next/server"
import type { Filter, Document, Sort } from "mongodb"
import { connectToDatabase } from "../../../lib/mongodb"

export async function GET(request: Request) {
  try {
    // استخراج معلمات الاستعلام من URL
    const { searchParams } = new URL(request.url)

    // إنشاء كائن استعلام فارغ
    const query: Filter<Document> = {}

    // تعريف دوال مساعدة للتحقق من صحة القيم
    const safeParseInt = (value: string | null): number | null => {
      if (!value) return null
      const parsed = Number.parseInt(value)
      return isNaN(parsed) ? null : parsed
    }

    // استبعاد المنتجات التي شاهدها المستخدم بالفعل
    if (searchParams.has("excludeIds")) {
      const excludeIdsString = searchParams.get("excludeIds")
      if (excludeIdsString) {
        const excludeIds = excludeIdsString
          .split(",")
          .map((id) => Number.parseInt(id))
          .filter((id) => !isNaN(id))
        if (excludeIds.length > 0) {
          query.id = { $nin: excludeIds }
        }
      }
    }

    // إضافة معايير التوصية
    if (searchParams.has("category")) {
      query.category = searchParams.get("category")
    }

    if (searchParams.has("tags")) {
      const tagsParam = decodeURIComponent(searchParams.get("tags")!);
      const tagsArray = tagsParam.split(",");
      query.tags = { $in: tagsArray.map(tag => new RegExp(tag, 'i')) };
    }

    // إضافة معايير الجودة للتوصيات
    query.rating = { $gte: 4 } // منتجات ذات تقييم عالي فقط
    query.stock = { $gt: 0 } // منتجات متوفرة فقط

    // الاتصال بقاعدة البيانات
    const { db } = await connectToDatabase()

    // خيارات الترتيب والتصفح
    const limit = safeParseInt(searchParams.get("limit")) || 8
    const page = safeParseInt(searchParams.get("page")) || 1
    const skip = (page - 1) * limit

    // تحديد طريقة الترتيب - نستخدم مزيج من التقييم والشعبية
    const sort: Sort = { rating: -1, views: -1 }

    // جلب المنتجات الموصى بها من قاعدة البيانات
    const recommendedProducts = await db.collection("products").find(query).sort(sort).skip(skip).limit(limit).toArray()

    // الحصول على إجمالي عدد المنتجات للتصفح
    const total = await db.collection("products").countDocuments(query)

    // حساب خصائص إضافية للعرض
    const enhancedProducts = recommendedProducts.map((product) => {
      // إضافة نسبة الخصم إذا كان هناك سعر قديم
      if (product.old_price && product.price) {
        product.discount_percentage = Math.round(((product.old_price - product.price) / product.old_price) * 100)
      }
      return product
    })

    // إرجاع المنتجات مع معلومات التصفح
    return NextResponse.json({
      success: true,
      data: enhancedProducts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching recommended products:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error", error: String(error) },
      { status: 500 },
    )
  }
}

