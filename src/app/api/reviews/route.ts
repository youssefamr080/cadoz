import { NextResponse } from "next/server"
import { connectToDatabase } from "../../../lib/mongodb"
import { ObjectId } from "mongodb"

// Get reviews for a specific product
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")
    const userId = searchParams.get("userId") // إضافة معرف المستخدم للتخصيص

    if (!productId) {
      return NextResponse.json({ success: false, message: "Product ID is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Get reviews for this product
    const reviews = await db
      .collection("productReviews")
      .find({ productId: Number(productId) })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray()

    // Get average rating
    const aggregation = await db
      .collection("productReviews")
      .aggregate([
        { $match: { productId: Number(productId) } },
        { $group: { _id: null, averageRating: { $avg: "$rating" }, count: { $sum: 1 } } },
      ])
      .toArray()

    const stats =
      aggregation.length > 0
        ? { averageRating: aggregation[0].averageRating, count: aggregation[0].count }
        : { averageRating: 0, count: 0 }

    // إذا كان المستخدم مسجل الدخول، قم بتسجيل مشاهدة التقييمات
    if (userId && userId !== "guest-user") {
      // تحديث سجل مشاهدة المنتج لتسجيل قراءة التقييمات
      await db.collection("productViews").updateOne(
        {
          userId,
          productId: Number(productId),
          viewedAt: { $gte: new Date(Date.now() - 3600000) }, // آخر ساعة
        },
        { $set: { "interactions.readReviews": true } },
      )

      // تسجيل حدث قراءة التقييمات
      await db.collection("customerEvents").insertOne({
        userId,
        eventType: "read_reviews",
        timestamp: new Date(),
        context: {
          productId: Number(productId),
          reviewCount: reviews.length,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: { reviews, stats },
    })
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch reviews" }, { status: 500 })
  }
}

// Add a new review
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { productId, userId, userName, rating, comment } = body
    const userAgent = request.headers.get("user-agent") || ""
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "0.0.0.0"

    // Verificar que el usuario esté autenticado
    if (!userId || userId === "guest-user") {
      return NextResponse.json(
        {
          success: false,
          message: "يجب تسجيل الدخول لإضافة تقييم",
        },
        { status: 401 },
      )
    }

    if (!productId || !rating) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Check if user already reviewed this product
    const existingReview = await db.collection("productReviews").findOne({ productId: Number(productId), userId })

    const now = new Date()

    if (existingReview) {
      // Update existing review
      await db.collection("productReviews").updateOne(
        { _id: existingReview._id },
        {
          $set: {
            rating,
            comment,
            updatedAt: now,
            lastIp: ip,
            lastUserAgent: userAgent,
          },
        },
      )

      // تسجيل حدث تحديث التقييم
      await db.collection("customerEvents").insertOne({
        userId,
        eventType: "update_review",
        timestamp: now,
        context: {
          productId: Number(productId),
          reviewId: existingReview._id,
          oldRating: existingReview.rating,
          newRating: rating,
        },
      })

      return NextResponse.json({
        success: true,
        message: "Review updated successfully",
        data: { reviewId: existingReview._id },
      })
    }

    // Obtener el nombre real del usuario desde la base de datos
    const userInfo = await db.collection("customers").findOne({ id: userId })
    const displayName = userInfo ? userInfo.name : userName || "مستخدم"

    // Create new review
    const result = await db.collection("productReviews").insertOne({
      productId: Number(productId),
      userId,
      userName: displayName, // Usar el nombre real del usuario
      rating,
      comment,
      createdAt: now,
      updatedAt: now,
      helpful: 0,
      notHelpful: 0,
      ip,
      userAgent,
      verified: true, // Siempre es verificado porque requiere autenticación
    })

    // تحديث متوسط تقييم المنتج
    await updateProductRating(db, Number(productId))

    // تحديث عدد التقييمات للعميل
    await db.collection("customers").updateOne(
      { id: userId },
      {
        $inc: { reviewCount: 1 },
        $set: { lastReviewAt: now },
      },
    )

    // تسجيل حدث إضافة تقييم
    await db.collection("customerEvents").insertOne({
      userId,
      eventType: "add_review",
      timestamp: now,
      context: {
        productId: Number(productId),
        reviewId: result.insertedId,
        rating,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Review added successfully",
      data: { reviewId: result.insertedId },
    })
  } catch (error) {
    console.error("Error adding review:", error)
    return NextResponse.json({ success: false, message: "Failed to add review" }, { status: 500 })
  }
}

// تحديث متوسط تقييم المنتج
async function updateProductRating(db, productId) {
  try {
    const aggregation = await db
      .collection("productReviews")
      .aggregate([
        { $match: { productId: Number(productId) } },
        { $group: { _id: null, averageRating: { $avg: "$rating" }, count: { $sum: 1 } } },
      ])
      .toArray()

    if (aggregation.length > 0) {
      await db.collection("products").updateOne(
        { id: Number(productId) },
        {
          $set: {
            rating: aggregation[0].averageRating,
            reviewCount: aggregation[0].count,
          },
        },
      )
    }
  } catch (error) {
    console.error("Error updating product rating:", error)
  }
}

// إضافة وظيفة PUT لتحديث مدى فائدة التقييم
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { reviewId, userId, action } = body

    // Verificar que el usuario esté autenticado
    if (!userId || userId === "guest-user") {
      return NextResponse.json(
        {
          success: false,
          message: "يجب تسجيل الدخول لتقييم المراجعات",
        },
        { status: 401 },
      )
    }

    if (!reviewId || !action) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    if (action !== "helpful" && action !== "notHelpful") {
      return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // التحقق من وجود التقييم
    const review = await db.collection("productReviews").findOne({ _id: new ObjectId(reviewId) })

    if (!review) {
      return NextResponse.json({ success: false, message: "Review not found" }, { status: 404 })
    }

    // التحقق مما إذا كان المستخدم قد قام بتقييم هذا التقييم من قبل
    const existingVote = await db.collection("reviewVotes").findOne({ reviewId, userId })

    if (existingVote) {
      // إذا كان التصويت الجديد مختلفًا عن السابق، قم بتحديثه
      if (existingVote.action !== action) {
        // تحديث التصويت
        await db
          .collection("reviewVotes")
          .updateOne({ _id: existingVote._id }, { $set: { action: action, updatedAt: new Date() } })

        // تحديث عدد التصويتات على التقييم
        if (existingVote.action === "helpful" && action === "notHelpful") {
          await db
            .collection("productReviews")
            .updateOne({ _id: new ObjectId(reviewId) }, { $inc: { helpful: -1, notHelpful: 1 } })
        } else if (existingVote.action === "notHelpful" && action === "helpful") {
          await db
            .collection("productReviews")
            .updateOne({ _id: new ObjectId(reviewId) }, { $inc: { helpful: 1, notHelpful: -1 } })
        }
      }
    } else {
      // إضافة تصويت جديد
      await db.collection("reviewVotes").insertOne({
        reviewId,
        userId,
        action,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      // تحديث عدد التصويتات على التقييم
      const updateField = action === "helpful" ? "helpful" : "notHelpful"
      await db.collection("productReviews").updateOne({ _id: new ObjectId(reviewId) }, { $inc: { [updateField]: 1 } })
    }

    // تسجيل حدث التصويت
    await db.collection("customerEvents").insertOne({
      userId,
      eventType: "review_vote",
      timestamp: new Date(),
      context: {
        reviewId,
        productId: review.productId,
        action,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Vote recorded successfully",
    })
  } catch (error) {
    console.error("Error voting on review:", error)
    return NextResponse.json({ success: false, message: "Failed to record vote" }, { status: 500 })
  }
}
