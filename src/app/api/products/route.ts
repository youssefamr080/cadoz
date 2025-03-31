import { NextResponse } from "next/server"
import type { Filter, Document, Sort } from "mongodb"
import { connectToDatabase } from "../../../lib/mongodb"

export async function GET(request: Request) {
  try {
    console.log("🔍 تم استلام طلب API للمنتجات")

    // استخراج معلمات الاستعلام من URL
    const { searchParams } = new URL(request.url)
    console.log("📝 معلمات الاستعلام:", Object.fromEntries(searchParams.entries()))

    // إنشاء كائن استعلام فارغ
    const query: Filter<Document> = {}

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

    // إضافة جميع المعلمات المتاحة إلى الاستعلام
    // البيانات الأساسية
    if (searchParams.has("id")) {
      const id = safeParseInt(searchParams.get("id"))
      if (id !== null) query.id = id
    }

    // Support for multiple IDs
    if (searchParams.has("ids")) {
      const idsString = searchParams.get("ids")
      if (idsString) {
        const ids = idsString
          .split(",")
          .map((id) => Number.parseInt(id))
          .filter((id) => !isNaN(id))
        if (ids.length > 0) {
          query.id = { $in: ids }
        }
      }
    }

    if (searchParams.has("name")) query.name = { $regex: searchParams.get("name"), $options: "i" }
    if (searchParams.has("brand")) query.brand = searchParams.get("brand")
    if (searchParams.has("category")) query.category = searchParams.get("category")
    if (searchParams.has("subCategory")) query.subCategory = searchParams.get("subCategory")

    // البحث في الوصف
    if (searchParams.has("description")) query.description = { $regex: searchParams.get("description"), $options: "i" }

    // Search in name, description, and tags
    if (searchParams.has("search")) {
      const searchTerm = searchParams.get("search")
      query.$or = [
        { name: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
        { tags: { $in: [new RegExp(searchTerm as string, "i")] } },
      ]
    }

    // نطاق السعر
    if (searchParams.has("minPrice")) {
      const minPrice = safeParseFloat(searchParams.get("minPrice"))
      if (minPrice !== null) query.price = { ...query.price, $gte: minPrice }
    }
    if (searchParams.has("maxPrice")) {
      const maxPrice = safeParseFloat(searchParams.get("maxPrice"))
      if (maxPrice !== null) query.price = { ...query.price, $lte: maxPrice }
    }

    // نطاق السعر القديم
    if (searchParams.has("minOldPrice")) {
      const minOldPrice = safeParseFloat(searchParams.get("minOldPrice"))
      if (minOldPrice !== null) query.old_price = { ...query.old_price, $gte: minOldPrice }
    }
    if (searchParams.has("maxOldPrice")) {
      const maxOldPrice = safeParseFloat(searchParams.get("maxOldPrice"))
      if (maxOldPrice !== null) query.old_price = { ...query.old_price, $lte: maxOldPrice }
    }

    // فلترة الخصومات
    if (searchParams.has("discount") && searchParams.get("discount") === "true") {
      query.$expr = { $gt: ["$old_price", "$price"] }
      query.old_price = { $ne: null }
    }

    // المخزون
    if (searchParams.has("inStock")) query.stock = { $gt: 0 }
    if (searchParams.has("minStock")) {
      const minStock = safeParseInt(searchParams.get("minStock"))
      if (minStock !== null) query.stock = { ...query.stock, $gte: minStock }
    }

    // العلامات الخاصة
    if (searchParams.has("trending") && searchParams.get("trending") === "true") query.trending = true
    if (searchParams.has("sale") && searchParams.get("sale") === "true") query.sale = true
    if (searchParams.has("best_seller") && searchParams.get("best_seller") === "true") query.best_seller = true
    if (searchParams.has("new_arrival") && searchParams.get("new_arrival") === "true") query.new_arrival = true
    if (searchParams.has("isGift") && searchParams.get("isGift") === "true") query.isGift = true

    // استبعاد القيم الخالية
    if (searchParams.has("excludeNullRating") && searchParams.get("excludeNullRating") === "true") {
      query.rating = { ...query.rating, $ne: null }
    }

    // البحث في الوسوم
    if (searchParams.has("tag")) {
      query.tags = { $in: [searchParams.get("tag")] }
    }

    // البحث المتعدد في الوسوم
    if (searchParams.has("tags")) {
      const tagsArray = searchParams.get("tags")!.split(",")
      query.tags = { $all: tagsArray }
    }

    // البحث في الألوان
    if (searchParams.has("color")) {
      query.colors = { $in: [searchParams.get("color")] }
    }

    // البحث المتعدد في الألوان
    if (searchParams.has("colors")) {
      const colorsArray = searchParams.get("colors")!.split(",")
      query.colors = { $in: colorsArray }
    }

    // البحث في المناسبات
    if (searchParams.has("occasion")) {
      query.occasion = { $in: [searchParams.get("occasion")] }
    }

    // البحث المتعدد في المناسبات
    if (searchParams.has("occasions")) {
      const occasionsArray = searchParams.get("occasions")!.split(",")
      query.occasion = { $in: occasionsArray }
    }

    // البحث في المواسم
    if (searchParams.has("season")) {
      query.season = { $in: [searchParams.get("season")] }
    }

    // البحث المتعدد في المواسم
    if (searchParams.has("seasons")) {
      const seasonsArray = searchParams.get("seasons")!.split(",")
      query.season = { $in: seasonsArray }
    }

    // التقييم
    if (searchParams.has("minRating")) {
      const minRating = safeParseFloat(searchParams.get("minRating"))
      if (minRating !== null) query.rating = { ...query.rating, $gte: minRating }
    }

    // البحث عن الصور المتعددة
    if (searchParams.has("hasMultipleImages") && searchParams.get("hasMultipleImages") === "true") {
      query.images = { $exists: true, $not: { $size: 0 } }
    }

    // الاتصال بقاعدة البيانات
    console.log("🔌 جاري الاتصال بقاعدة البيانات MongoDB...")
    const { db } = await connectToDatabase()
    console.log("✅ تم الاتصال بنجاح بقاعدة البيانات MongoDB")

    // البحث في المفضلات (إذا كان مطلوبًا)
    if (searchParams.has("favorites") && searchParams.has("userId") && searchParams.get("favorites") === "true") {
      const userId = searchParams.get("userId")
      const favorites = await db.collection("favorites").find({ userId: userId }).toArray()
      const favoriteProductIds = favorites.map((f) => f.productId)
      if (favoriteProductIds.length > 0) {
        query.id = { $in: favoriteProductIds }
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
    let sort: Sort = { _id: -1 } // الافتراضي: الأحدث أولاً
    if (searchParams.has("sort")) {
      const sortParam = searchParams.get("sort")
      switch (sortParam) {
        case "price_asc":
          sort = { price: 1 }
          break
        case "price_desc":
          sort = { price: -1 }
          break
        case "name_asc":
          sort = { name: 1 }
          break
        case "name_desc":
          sort = { name: -1 }
          break
        case "rating_desc":
          sort = { rating: -1 }
          break
        case "popularity":
          sort = { views: -1 }
          break
        case "discount":
          sort = { discount_percentage: -1 }
          break
      }
    }

    // إعداد خيارات التقييد والتوسعة (إذا لزم الأمر)
    const projection: Partial<Document> = {}
    if (searchParams.has("fields")) {
      const fields = searchParams.get("fields")!.split(",")
      fields.forEach((field) => {
        projection[field] = 1
      })
    }

    try {
      // جلب المنتجات من قاعدة البيانات
      console.log("🔍 استعلام المنتجات مع:", JSON.stringify(query))
      const products = await db
        .collection("products")
        .find(query)
        .project(Object.keys(projection).length > 0 ? projection : {})
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray()

      console.log(`✅ تم العثور على ${products.length} منتج`)

      // الحصول على إجمالي عدد المنتجات للتصفح
      const total = await db.collection("products").countDocuments(query)
      console.log(`📊 إجمالي المنتجات المطابقة للاستعلام: ${total}`)

      // حساب خصائص إضافية للعرض (إذا لزم الأمر)
      const enhancedProducts = products.map((product) => {
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
