import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    console.log("🔍 تم استلام طلب API للمنتجات")

    // استخراج معلمات الاستعلام من URL
    const { searchParams } = new URL(request.url)
    console.log("📝 معلمات الاستعلام:", Object.fromEntries(searchParams.entries()))

    // تعريف دوال مساعدة للتحقق من صحة القيم
    const safeParseInt = (value: string | null): number | null => {
      if (!value) return null
      const parsed = Number.parseInt(value)
      return isNaN(parsed) ? null : parsed
    }

    const safeParseFloat = (value: string | null): number | null => {
      if (!value) return null
      const parsed = Number.parseFloat(value)
      return isNaN(parsed) ? null : parsed
    }

    // بناء استعلام Prisma
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}

    // البيانات الأساسية
    if (searchParams.has("id")) {
      const id = searchParams.get("id")
      // تحقق أن id موجود وصحيح الطول (24 حرف hex)
      if (id && /^[a-fA-F0-9]{24}$/.test(id)) {
        where.id = id
      } else if (id) {
        return NextResponse.json({ success: false, message: "Invalid product id" }, { status: 400 })
      }
    }

    // Support for multiple IDs
    if (searchParams.has("ids")) {
      const idsString = searchParams.get("ids")
      if (idsString) {
        const ids = idsString
          .split(",")
          .map((id) => id.trim())
          .filter((id) => /^[a-fA-F0-9]{24}$/.test(id))
        if (ids.length > 0) {
          where.id = { in: ids }
        }
      }
    }

    if (searchParams.has("name")) {
      where.name = { contains: searchParams.get("name")!, mode: 'insensitive' }
    }
    if (searchParams.has("brand")) where.brand = searchParams.get("brand")!
    if (searchParams.has("category")) where.category = searchParams.get("category")!
    if (searchParams.has("subCategory")) where.subCategory = searchParams.get("subCategory")!

    // البحث في الوصف
    if (searchParams.has("description")) {
      where.description = { contains: searchParams.get("description")!, mode: 'insensitive' }
    }

    // Search in name, description, and tags
    if (searchParams.has("search")) {
      const searchTerm = searchParams.get("search")!
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { tags: { has: searchTerm } },
      ]
    }

    // نطاق السعر
    if (searchParams.has("minPrice")) {
      const minPrice = safeParseFloat(searchParams.get("minPrice"))
      if (minPrice !== null) {
        if (!where.price) where.price = {}
        where.price.gte = minPrice
      }
    }
    if (searchParams.has("maxPrice")) {
      const maxPrice = safeParseFloat(searchParams.get("maxPrice"))
      if (maxPrice !== null) {
        if (!where.price) where.price = {}
        where.price.lte = maxPrice
      }
    }

    // نطاق السعر القديم
    if (searchParams.has("minOldPrice")) {
      const minOldPrice = safeParseFloat(searchParams.get("minOldPrice"))
      if (minOldPrice !== null) {
        if (!where.old_price) where.old_price = {}
        where.old_price.gte = minOldPrice
      }
    }
    if (searchParams.has("maxOldPrice")) {
      const maxOldPrice = safeParseFloat(searchParams.get("maxOldPrice"))
      if (maxOldPrice !== null) {
        if (!where.old_price) where.old_price = {}
        where.old_price.lte = maxOldPrice
      }
    }

    // فلترة الخصومات - تبسيط المنطق
    if (searchParams.has("discount") && searchParams.get("discount") === "true") {
      where.old_price = { not: null }
    }

    // المخزون
    if (searchParams.has("inStock")) where.stock = { gt: 0 }
    if (searchParams.has("minStock")) {
      const minStock = safeParseInt(searchParams.get("minStock"))
      if (minStock !== null) {
        if (!where.stock) where.stock = {}
        where.stock.gte = minStock
      }
    }

    // العلامات الخاصة
    if (searchParams.has("trending") && searchParams.get("trending") === "true") where.trending = true
    if (searchParams.has("sale") && searchParams.get("sale") === "true") where.sale = true
    if (searchParams.has("best_seller") && searchParams.get("best_seller") === "true") where.best_seller = true
    if (searchParams.has("new_arrival") && searchParams.get("new_arrival") === "true") where.new_arrival = true
    if (searchParams.has("isGift") && searchParams.get("isGift") === "true") where.isGift = true

    // استبعاد القيم الخالية
    if (searchParams.has("excludeNullRating") && searchParams.get("excludeNullRating") === "true") {
      where.rating = { not: null }
    }

    // البحث في الوسوم
    if (searchParams.has("tag")) {
      where.tags = { has: searchParams.get("tag")! }
    }

    // البحث المتعدد في الوسوم
    if (searchParams.has("tags")) {
      const tagsArray = searchParams.get("tags")!.split(",")
      where.tags = { hasEvery: tagsArray }
    }

    // البحث في الألوان
    if (searchParams.has("color")) {
      where.colors = { has: searchParams.get("color")! }
    }

    // البحث المتعدد في الألوان
    if (searchParams.has("colors")) {
      const colorsArray = searchParams.get("colors")!.split(",")
      where.colors = { hasSome: colorsArray }
    }

    // البحث في المناسبات
    if (searchParams.has("occasion")) {
      where.occasion = { has: searchParams.get("occasion")! }
    }

    // البحث المتعدد في المناسبات
    if (searchParams.has("occasions")) {
      const occasionsArray = searchParams.get("occasions")!.split(",")
      where.occasion = { hasSome: occasionsArray }
    }

    // البحث في المواسم
    if (searchParams.has("season")) {
      where.season = { has: searchParams.get("season")! }
    }

    // البحث المتعدد في المواسم
    if (searchParams.has("seasons")) {
      const seasonsArray = searchParams.get("seasons")!.split(",")
      where.season = { hasSome: seasonsArray }
    }

    // التقييم
    if (searchParams.has("minRating")) {
      const minRating = safeParseFloat(searchParams.get("minRating"))
      if (minRating !== null) {
        if (!where.rating) where.rating = {}
        where.rating.gte = minRating
      }
    }

    // البحث عن الصور المتعددة
    if (searchParams.has("hasMultipleImages") && searchParams.get("hasMultipleImages") === "true") {
      where.images = { isEmpty: false }
    }

    // البحث في المفضلات (إذا كان مطلوبًا)
    if (searchParams.has("favorites") && searchParams.has("userId") && searchParams.get("favorites") === "true") {
      const userId = searchParams.get("userId")!
      const favorites = await prisma.customerPreferences.findMany({
        where: { customerId: userId },
        select: { favoriteProducts: true }
      })
      const favoriteProductIds = favorites.flatMap(f => f.favoriteProducts).map(id => id.toString())
      if (favoriteProductIds.length > 0) {
        where.id = { in: favoriteProductIds }
      } else {
        // إذا لم تكن هناك منتجات مفضلة، إرجاع مصفوفة فارغة
        return NextResponse.json({
          success: true,
          data: [],
          pagination: {
            total: 0,
            page: 1,
            limit: 0,
            pages: 0,
          },
        })
      }
    }

    // خيارات الترتيب والتصفح
    const limit = safeParseInt(searchParams.get("limit")) || 20
    const page = safeParseInt(searchParams.get("page")) || 1
    const skip = (page - 1) * limit

    // تحديد طريقة الترتيب
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let orderBy: any = { createdAt: 'desc' } // الافتراضي: الأحدث أولاً
    if (searchParams.has("sort")) {
      const sortParam = searchParams.get("sort")
      switch (sortParam) {
        case "price_asc":
          orderBy = { price: 'asc' }
          break
        case "price_desc":
          orderBy = { price: 'desc' }
          break
        case "name_asc":
          orderBy = { name: 'asc' }
          break
        case "name_desc":
          orderBy = { name: 'desc' }
          break
        case "rating_desc":
          orderBy = { rating: 'desc' }
          break
        case "popularity":
          orderBy = { views: 'desc' }
          break
        case "discount":
          orderBy = { discountPercentage: 'desc' }
          break
      }
    }

    // تحديد الحقول المطلوبة
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let select: any = undefined
    if (searchParams.has("fields")) {
      const fields = searchParams.get("fields")!.split(",")
      select = {}
      fields.forEach((field) => {
        select[field] = true
      })
    }

    try {
      // جلب المنتجات من قاعدة البيانات
      console.log("🔍 استعلام المنتجات مع:", JSON.stringify(where))
      
      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          select: select || undefined,
          orderBy,
          skip,
          take: limit,
        }),
        prisma.product.count({ where })
      ])

      console.log(`✅ تم العثور على ${products.length} منتج`)

      // الحصول على إجمالي عدد المنتجات للتصفح
      console.log(`📊 إجمالي المنتجات المطابقة للاستعلام: ${total}`)

      // حساب خصائص إضافية للعرض (إذا لزم الأمر)
      const enhancedProducts = products.map((product) => {
        // إضافة نسبة الخصم إذا كان هناك سعر قديم
        if (
          typeof product.old_price === 'number' &&
          typeof product.price === 'number' &&
          product.old_price > 0
        ) {
          (product as any).discountPercentage = Math.round(
            ((product.old_price - product.price) / product.old_price) * 100
          )
        }
        return product
      })

      // Debug logs
      console.log('🔎 where:', JSON.stringify(where))
      console.log('🔎 orderBy:', JSON.stringify(orderBy))
      console.log('🔎 select:', JSON.stringify(select))
      console.log('🔎 products:', JSON.stringify(products))

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
    } catch (dbError) {
      console.error("❌ خطأ في استعلام قاعدة البيانات:", dbError)
      return NextResponse.json(
        {
          success: false,
          message: "خطأ في استعلام قاعدة البيانات",
          error: String(dbError),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("❌ خطأ في معالجة طلب API للمنتجات:", error)
    return NextResponse.json(
      {
        success: false,
        message: "خطأ في الخادم الداخلي",
        error: String(error),
        stack: process.env.NODE_ENV === "development" ? (error as Error).stack : undefined,
      },
      { status: 500 },
    )
  }
}