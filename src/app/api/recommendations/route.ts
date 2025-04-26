import { NextResponse } from "next/server"
import { connectToDatabase } from "../../../lib/mongodb"
import type { Document, UpdateFilter, Db } from "mongodb"

// Export the type for MongoDB update operations
export type CustomerRecommendationUpdateQuery = {
  $push?: {
    recommendations: {
      $each: RecommendationEntry[];
    };
  };
  $inc?: {
    "stats.totalShown"?: number;
    "stats.totalClicked"?: number;
    "stats.totalPurchased"?: number;
  };
  $set?: {
    lastUpdatedAt?: Date;
    "stats.ctr"?: number;
    "stats.conversionRate"?: number;
    "recommendations.$"?: Partial<RecommendationEntry>;
  };
};

interface DeviceInfo {
  userAgent: string
  ip: string
  type: string
  browser: string
  os: string
  screenResolution?: string
  language?: string
  timezone?: string
}

interface ProductContext {
  source?: string
  referrer?: string
  searchQuery?: string
  category?: string
  tags?: string[]
  priceRange?: {
    min: number
    max: number
  }
  fromRecommendation?: boolean
  recommendationId?: string
  device?: DeviceInfo
}

interface Product {
  id: number
  name: string
  image: string
  price: number
  stock: number
  category?: string
  tags?: string[]
  brand?: string
  discount_percentage?: number
  views?: number
  rating?: number
  score?: number
  reason?: string
  favoriteCount?: number
  cartAdds?: number
}

interface UserPreference {
  userId?: string
  categories: Record<string, number>
  tags: Record<string, number>
  brands: Record<string, number>
  priceRange: {
    min: number
    max: number
    count: number
  }
}

interface RecommendationEntry {
  productId: number
  score: number
  reason: string
  shown: boolean
  shownAt: Date
  clicked?: boolean
  clickedAt?: Date
  addedToCart?: boolean
  addedToCartAt?: Date
}

interface CustomerRecommendation extends Document {
  userId: string;
  generatedAt: Date;
  lastUpdatedAt: Date;
  recommendations: RecommendationEntry[];
  stats: {
    totalShown: number;
    totalClicked: number;
    totalPurchased: number;
    ctr: number;
    conversionRate: number;
  };
}

interface ProductView extends Document {
  userId: string
  productId: number
  viewedAt: Date
  sessionId?: string
  duration: number
  source: string
  device: DeviceInfo
  interactions: {
    scrollDepth: number
    clickedImages: boolean
    readReviews: boolean
    watchedVideo: boolean
  }
}

interface CustomerEvent extends Document {
  userId: string
  eventType: string
  timestamp: Date
  context: ProductContext
}

interface WishlistItem extends Document {
  userId: string
  productId: number
  addedAt: Date
  source: string
  device: DeviceInfo
}

// تحسين وظيفة GET لتسجيل المزيد من بيانات المستخدم
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const excludeIds = searchParams.get("excludeIds")?.split(",").map(Number) || []
    const category = searchParams.get("category")
    const tags = searchParams.get("tags")?.split(",") || []
    const userId = searchParams.get("userId")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const usePersonalized = searchParams.get("personalized") === "true"
    const priceRange = searchParams.get("priceRange")?.split("-").map(Number) || []
    const sessionId = searchParams.get("sessionId")

    const { db } = await connectToDatabase()

    // استخراج تفضيلات المستخدم إذا كان متاحًا
    let userPreferences: UserPreference | null = null
    if (userId && usePersonalized) {
      userPreferences = await getUserPreferences(db, userId)
    } else {
      userPreferences = createDefaultPreferences(category, tags, priceRange)
    }

    // الحصول على المنتجات الموصى بها
    const recommendations = await getRecommendedProducts(db, excludeIds, userPreferences, limit, usePersonalized)

    // تسجيل طلب التوصيات إذا كان المستخدم مسجل الدخول
    if (userId && userId !== "anonymous") {
      await db.collection("customerEvents").insertOne({
        userId,
        eventType: "recommendation_request",
        timestamp: new Date(),
        context: {
          category,
          tags,
          sessionId,
          excludeIds,
        },
        data: {
          usePersonalized,
          limit,
          priceRange,
        },
      })

      // تحديث آخر نشاط للمستخدم
      await db.collection("customers").updateOne(
        { id: userId },
        {
          $set: { lastActiveAt: new Date() },
          $inc: { recommendationRequests: 1 },
        },
      )

      // تسجيل التوصيات المقدمة للمستخدم المسجل
      const recommendationEntries: RecommendationEntry[] = recommendations.map((product) => ({
        productId: product.id,
        score: product.score || 0,
        reason: product.reason || "algorithm",
        shown: true,
        shownAt: new Date(),
      }))

      // First, try to find an existing recommendation document
      const existingRec = await db.collection<CustomerRecommendation>("customerRecommendations")
        .findOne({ userId, generatedAt: { $gte: new Date(Date.now() - 3600000) } });

      if (existingRec) {
        // Update existing document with proper typing
        await db.collection<CustomerRecommendation>("customerRecommendations").updateOne(
          { userId, generatedAt: { $gte: new Date(Date.now() - 3600000) } },
          {
            $set: { 
              lastUpdatedAt: new Date(),
              recommendations: [...existingRec.recommendations, ...recommendationEntries],
              "stats.totalShown": existingRec.stats.totalShown + recommendationEntries.length 
            }
          }
        );
      } else {
        // Create new document
        await db.collection<CustomerRecommendation>("customerRecommendations").insertOne({
          userId,
          generatedAt: new Date(),
          lastUpdatedAt: new Date(),
          recommendations: recommendationEntries,
          stats: {
            totalShown: recommendationEntries.length,
            totalClicked: 0,
            totalPurchased: 0,
            ctr: 0,
            conversionRate: 0
          }
        });
      }
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

// دالة لإنشاء تفضيلات افتراضية من المعلمات
function createDefaultPreferences(category?: string | null, tags?: string[], priceRange?: number[]): UserPreference {
  const preferences: UserPreference = {
    categories: {},
    tags: {},
    brands: {},
    priceRange: {
      min: 0,
      max: 10000,
      count: 1,
    },
  }

  if (category) {
    preferences.categories[category] = 10
  }

  if (tags && tags.length > 0) {
    tags.forEach((tag) => {
      preferences.tags[tag] = 5
    })
  }

  if (priceRange && priceRange.length === 2) {
    preferences.priceRange = {
      min: priceRange[0],
      max: priceRange[1],
      count: 1,
    }
  }

  return preferences
}

// دالة للحصول على تفضيلات المستخدم من قاعدة البيانات
async function getUserPreferences(db: Db, userId: string): Promise<UserPreference> {
  // البحث عن تفضيلات المستخدم المخزنة
  const storedPreferences = await db.collection<UserPreference>("userPreferences").findOne({ userId })

  if (storedPreferences) {
    return storedPreferences
  }

  // إذا لم تكن هناك تفضيلات مخزنة، قم بإنشاء تفضيلات جديدة بناءً على سلوك المستخدم
  const preferences: UserPreference = {
    userId,
    categories: {},
    tags: {},
    brands: {},
    priceRange: {
      min: 0,
      max: 10000,
      count: 0,
    },
  }

  // تحليل المنتجات التي تمت مشاهدتها
  const viewedProducts = await db.collection("productViews").find({ userId }).sort({ viewedAt: -1 }).limit(20).toArray()

  // تحليل المنتجات التي تم شراؤها
  const purchasedProducts = await db.collection("orders").find({ userId }).sort({ orderedAt: -1 }).limit(10).toArray()

  // تحليل المنتجات المفضلة
  const favoriteProducts = await db.collection("wishlist").find({ userId }).toArray()

  // جمع جميع المنتجات ذات الصلة
  const allRelevantProductIds = [
    ...viewedProducts.map((v) => v.productId),
    ...purchasedProducts.flatMap((p) => p.items.map((item) => item.productId)),
    ...favoriteProducts.map((f) => f.productId),
  ]

  if (allRelevantProductIds.length === 0) {
    return preferences
  }

  // الحصول على تفاصيل المنتجات
  const productDetails = await db
    .collection("products")
    .find({ id: { $in: allRelevantProductIds } })
    .toArray()

  // تحليل التفضيلات
  productDetails.forEach((product) => {
    // تحليل الفئات
    if (product.category) {
      preferences.categories[product.category] = (preferences.categories[product.category] || 0) + 1
    }

    // تحليل العلامات
    if (product.tags && Array.isArray(product.tags)) {
      product.tags.forEach((tag) => {
        preferences.tags[tag] = (preferences.tags[tag] || 0) + 1
      })
    }

    // تحليل العلامات التجارية
    if (product.brand) {
      preferences.brands[product.brand] = (preferences.brands[product.brand] || 0) + 1
    }

    // تحليل نطاق السعر
    if (product.price) {
      if (preferences.priceRange.count === 0) {
        preferences.priceRange.min = product.price
        preferences.priceRange.max = product.price
      } else {
        preferences.priceRange.min = Math.min(preferences.priceRange.min, product.price)
        preferences.priceRange.max = Math.max(preferences.priceRange.max, product.price)
      }
      preferences.priceRange.count++
    }
  })

  // تخزين التفضيلات للاستخدام المستقبلي
  await db.collection("userPreferences").updateOne({ userId }, { $set: preferences }, { upsert: true })

  return preferences
}

// دالة للحصول على المنتجات الموصى بها
async function getRecommendedProducts(
  db: Db,
  excludeIds: number[],
  preferences: UserPreference,
  limit: number,
  usePersonalized: boolean,
): Promise<Product[]> {
  // إنشاء استعلام أساسي
  const baseQuery: {
    id: { $nin: number[] };
    stock: { $gt: number };
    category?: { $in: string[] };
    tags?: { $in: string[] };
    brand?: { $in: string[] };
    price?: { $gte: number; $lte: number };
  } = {
    id: { $nin: excludeIds },
    stock: { $gt: 0 },
  }

  // إضافة معايير التصفية بناءً على تفضيلات المستخدم
  if (preferences.categories && Object.keys(preferences.categories).length > 0) {
    baseQuery.category = { $in: Object.keys(preferences.categories) }
  }

  if (preferences.tags && Object.keys(preferences.tags).length > 0) {
    baseQuery.tags = { $in: Object.keys(preferences.tags) }
  }

  if (preferences.brands && Object.keys(preferences.brands).length > 0) {
    baseQuery.brand = { $in: Object.keys(preferences.brands) }
  }

  if (preferences.priceRange) {
    baseQuery.price = {
      $gte: preferences.priceRange.min,
      $lte: preferences.priceRange.max,
    }
  }

  let recommendations: Product[] = []

  if (usePersonalized) {
    // استخدام نهج الترتيب بالنقاط للتوصيات الشخصية
    const allCandidates = await db
      .collection<Product>("products")
      .find(baseQuery)
      .limit(50)
      .toArray()

    // حساب درجة لكل منتج بناءً على تفضيلات المستخدم
    const scoredProducts = allCandidates.map((product) => {
      let score = 0

      // نقاط للفئة
      if (product.category && preferences.categories[product.category]) {
        score += preferences.categories[product.category] * 2
      }

      // نقاط للعلامات
      if (product.tags && Array.isArray(product.tags)) {
        product.tags.forEach((tag) => {
          if (preferences.tags[tag]) {
            score += preferences.tags[tag]
          }
        })
      }

      // نقاط للعلامة التجارية
      if (product.brand && preferences.brands[product.brand]) {
        score += preferences.brands[product.brand] * 1.5
      }

      // نقاط للتقييم
      if (product.rating) {
        score += product.rating
      }

      // نقاط للخصم
      if (product.discount_percentage) {
        score += product.discount_percentage / 10
      }

      // نقاط للشعبية
      if (product.views) {
        score += Math.min(product.views / 100, 5)
      }

      return { ...product, score }
    })

    // ترتيب المنتجات حسب الدرجة وإضافة عنصر عشوائي
    recommendations = scoredProducts.sort((a, b) => b.score - a.score).slice(0, limit)
  } else {
    // استخدام استعلام بسيط للتوصيات غير الشخصية
    if (Object.keys(preferences.categories).length > 0) {
      const topCategory = Object.entries(preferences.categories)
        .sort((a, b) => b[1] - a[1])
        .map((entry) => entry[0])[0]

      if (topCategory) {
        baseQuery.category = { $in: [topCategory] }
      }
    }

    if (Object.keys(preferences.tags).length > 0) {
      const topTags = Object.entries(preferences.tags)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map((entry) => entry[0])

      if (topTags.length > 0) {
        baseQuery.tags = { $in: topTags }
      }
    }

    recommendations = await db.collection<Product>("products").find(baseQuery).limit(limit).toArray()
  }

  // إذا لم يكن هناك ما يكفي من التوصيات، أضف منتجات عشوائية
  if (recommendations.length < limit) {
    const remainingLimit = limit - recommendations.length
    const existingIds = recommendations.map((p) => p.id)
    const fallbackQuery = {
      id: { $nin: [...excludeIds, ...existingIds] },
      stock: { $gt: 0 },
    }

    const fallbackRecommendations = await db
      .collection<Product>("products")
      .find(fallbackQuery)
      .sort({ views: -1 })
      .limit(remainingLimit)
      .toArray()

    recommendations = [...recommendations, ...fallbackRecommendations]
  }

  // إضافة عنصر عشوائي للتنوع
  return shuffleArray(recommendations).slice(0, limit)
}

// دالة لخلط المصفوفة (خوارزمية Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

// تحسين وظيفة POST لتسجيل المزيد من تفاعلات المستخدم
export async function POST(request: Request) {
  let body
  try {
    body = await request.json()
    const { userId, productId, action, sessionId, context = {} } = body

    if (!productId || !action) {
      return NextResponse.json({ success: false, message: "Product ID and action are required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const timestamp = new Date()
    const isLoggedIn = userId && userId !== "anonymous"

    // تسجيل مشاهدة المنتج مع بيانات إضافية
    if (action === "view") {
      // إنشاء سجل مشاهدة أكثر تفصيلاً
      const viewData: Omit<ProductView, "_id"> = {
        userId: userId || "anonymous",
        productId: Number(productId),
        viewedAt: timestamp,
        sessionId: sessionId || undefined,
        duration: 0,
        source: context.source || "direct",
        device: context.device || {},
        interactions: {
          scrollDepth: 0,
          clickedImages: false,
          readReviews: false,
          watchedVideo: false,
        },
      }

      await db.collection<ProductView>("productViews").insertOne(viewData as ProductView)

      // تحديث عداد المشاهدات للمنتج
      await db.collection("products").updateOne({ id: Number(productId) }, { $inc: { views: 1 } })

      // إذا كان المستخدم مسجل الدخول، قم بتحديث بيانات العميل
      if (isLoggedIn) {
        // تحديث آخر منتج تمت مشاهدته
        await db.collection("customers").updateOne(
          { id: userId },
          {
            $set: {
              lastProductViewed: Number(productId),
              lastActiveAt: timestamp,
            },
            $inc: { totalProductViews: 1 },
          },
        )

        // تحديث سجل الأحداث
        const customerEvent: Omit<CustomerEvent, "_id"> = {
          userId,
          eventType: "product_view",
          timestamp,
          context: {
            productId: Number(productId),
            sessionId,
            ...context,
          },
        }

        await db.collection<CustomerEvent>("customerEvents").insertOne(customerEvent as CustomerEvent)
      }
    }

    // تسجيل إضافة المنتج للمفضلة مع بيانات إضافية
    else if (action === "favorite") {
      if (!isLoggedIn) {
        return NextResponse.json({ success: false, message: "User ID is required for favorites" }, { status: 400 })
      }

      const wishlistItem: Omit<WishlistItem, "_id"> = {
        userId,
        productId: Number(productId),
        addedAt: timestamp,
        source: context.source || "product_page",
        device: context.device || {},
      }

      await db.collection<WishlistItem>("wishlist").updateOne(
        { userId, productId: Number(productId) },
        { $set: wishlistItem },
        { upsert: true },
      )

      // تحديث عدد المرات التي تمت فيها إضافة المنتج للمفضلة
      await db.collection("products").updateOne({ id: Number(productId) }, { $inc: { favoriteCount: 1 } })

      // تحديث بيانات العميل
      await db.collection("customers").updateOne(
        { id: userId },
        {
          $set: { lastActiveAt: timestamp },
          $inc: { wishlistCount: 1 },
        },
      )

      // تحديث سجل الأحداث
      const customerEvent: Omit<CustomerEvent, "_id"> = {
        userId,
        eventType: "add_to_wishlist",
        timestamp,
        context: {
          productId: Number(productId),
          sessionId,
          ...context,
        },
      }

      await db.collection<CustomerEvent>("customerEvents").insertOne(customerEvent as CustomerEvent)

      // تحديث سجل التوصيات إذا تمت إضافة المنتج للمفضلة من التوصيات
      if (context.fromRecommendation) {
        await db.collection("customerRecommendations").updateOne(
          {
            userId,
            "recommendations.productId": Number(productId),
            "recommendations.shown": true,
            "recommendations.clicked": { $ne: true },
          },
          {
            $set: {
              "recommendations.$.clicked": true,
              "recommendations.$.clickedAt": timestamp,
            },
            $inc: { "stats.totalClicked": 1 },
          },
        )

        // تحديث معدل النقر إلى الظهور
        await db.collection("customerRecommendations").updateOne({ userId }, [
          {
            $set: {
              "stats.ctr": {
                $divide: ["$stats.totalClicked", { $max: ["$stats.totalShown", 1] }],
              },
            },
          },
        ])
      }
    }

    // تسجيل إضافة المنتج للسلة
    else if (action === "add_to_cart") {
      // تحديث عداد إضافة المنتج للسلة
      await db.collection("products").updateOne({ id: Number(productId) }, { $inc: { cartAdds: 1 } })

      // إذا كان المستخدم مسجل الدخول
      if (isLoggedIn) {
        // تحديث بيانات العميل
        await db.collection("customers").updateOne(
          { id: userId },
          {
            $set: { lastActiveAt: timestamp },
            $inc: { cartAddsCount: 1 },
          },
        )

        // تحديث سجل الأحداث
        const customerEvent: Omit<CustomerEvent, "_id"> = {
          userId,
          eventType: "add_to_cart",
          timestamp,
          context: {
            productId: Number(productId),
            sessionId,
            quantity: body.quantity || 1,
            ...context,
          },
        }

        await db.collection<CustomerEvent>("customerEvents").insertOne(customerEvent as CustomerEvent)

        // تحديث سجل التوصيات إذا تمت إضافة المنتج للسلة من التوصيات
        if (context.fromRecommendation) {
          await db.collection("customerRecommendations").updateOne(
            {
              userId,
              "recommendations.productId": Number(productId),
            },
            {
              $set: {
                "recommendations.$.addedToCart": true,
                "recommendations.$.addedToCartAt": timestamp,
              },
            },
          )
        }
      }
    }

    // تسجيل تفاعلات أخرى مع المنتج
    else if (action === "interaction") {
      const { interactionType, value } = body

      if (isLoggedIn) {
        // تحديث تفاعلات المستخدم مع المنتج
        if (interactionType === "scroll_depth") {
          await db
            .collection("productViews")
            .updateOne(
              { userId, productId: Number(productId), viewedAt: { $gte: new Date(Date.now() - 3600000) } },
              { $set: { "interactions.scrollDepth": value } },
            )
        } else if (interactionType === "clicked_images") {
          await db
            .collection("productViews")
            .updateOne(
              { userId, productId: Number(productId), viewedAt: { $gte: new Date(Date.now() - 3600000) } },
              { $set: { "interactions.clickedImages": true } },
            )
        } else if (interactionType === "read_reviews") {
          await db
            .collection("productViews")
            .updateOne(
              { userId, productId: Number(productId), viewedAt: { $gte: new Date(Date.now() - 3600000) } },
              { $set: { "interactions.readReviews": true } },
            )
        } else if (interactionType === "watched_video") {
          await db
            .collection("productViews")
            .updateOne(
              { userId, productId: Number(productId), viewedAt: { $gte: new Date(Date.now() - 3600000) } },
              { $set: { "interactions.watchedVideo": true } },
            )
        }

        // تحديث سجل الأحداث
        const customerEvent: Omit<CustomerEvent, "_id"> = {
          userId,
          eventType: `product_${interactionType}`,
          timestamp,
          context: {
            productId: Number(productId),
            sessionId,
            value,
            ...context,
          },
        }

        await db.collection<CustomerEvent>("customerEvents").insertOne(customerEvent as CustomerEvent)
      }
    }

    // تسجيل مدة المشاهدة
    else if (action === "view_duration") {
      const { duration } = body

      await db.collection("productViews").updateOne(
        {
          userId: userId || "anonymous",
          productId: Number(productId),
          viewedAt: { $gte: new Date(Date.now() - 3600000) },
        },
        { $set: { duration: Number(duration) } },
      )

      if (isLoggedIn) {
        // تحديث متوسط مدة المشاهدة للعميل
        await db.collection("customers").updateOne({ id: userId }, [
          {
            $set: {
              totalViewDuration: { $add: [{ $ifNull: ["$totalViewDuration", 0] }, Number(duration)] },
              viewCount: { $add: [{ $ifNull: ["$viewCount", 0] }, 1] },
            },
          },
          {
            $set: {
              averageViewDuration: { $divide: ["$totalViewDuration", "$viewCount"] },
            },
          },
        ])
      }
    }

    // تسجيل نقرة على توصية
    else if (action === "recommendation_click") {
      if (isLoggedIn) {
        await db.collection("customerRecommendations").updateOne(
          {
            userId,
            "recommendations.productId": Number(productId),
            "recommendations.shown": true,
            "recommendations.clicked": { $ne: true },
          },
          {
            $set: {
              "recommendations.$.clicked": true,
              "recommendations.$.clickedAt": timestamp,
            },
            $inc: { "stats.totalClicked": 1 },
          },
        )

        // تحديث معدل النقر إلى الظهور
        await db.collection("customerRecommendations").updateOne({ userId }, [
          {
            $set: {
              "stats.ctr": {
                $divide: ["$stats.totalClicked", { $max: ["$stats.totalShown", 1] }],
              },
            },
          },
        ])

        // تحديث سجل الأحداث
        const customerEvent: Omit<CustomerEvent, "_id"> = {
          userId,
          eventType: "recommendation_click",
          timestamp,
          context: {
            productId: Number(productId),
            sessionId,
            ...context,
          },
        }

        await db.collection<CustomerEvent>("customerEvents").insertOne(customerEvent as CustomerEvent)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Product ${action} recorded successfully`,
    })
  } catch (error) {
    console.error(`Error recording product ${body?.action}:`, error)
    return NextResponse.json({ success: false, message: "Failed to record product action" }, { status: 500 })
  }
}

