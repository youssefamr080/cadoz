import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Get reviews for a specific product
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")
    const userId = searchParams.get("userId") // إضافة معرف المستخدم للتخصيص

    if (!productId) {
      return NextResponse.json({ success: false, message: "Product ID is required" }, { status: 400 })
    }

    // Validate productId format (should be a valid ObjectId)
    if (!/^[0-9a-fA-F]{24}$/.test(productId)) {
      return NextResponse.json({ success: false, message: "Invalid Product ID format" }, { status: 400 })
    }

    // Get reviews for this product
    const reviews = await prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' as const },
      take: 10,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })

    // Get average rating and count
    const stats = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: true,
    })

    const reviewStats = {
      averageRating: stats._avg.rating || 0,
      count: stats._count
    }

    // إذا كان المستخدم مسجل الدخول، قم بتسجيل مشاهدة التقييمات
    if (userId && userId !== "guest-user" && /^[0-9a-fA-F]{24}$/.test(userId)) {
      try {
        // تحديث سجل مشاهدة المنتج لتسجيل قراءة التقييمات
        await prisma.productView.updateMany({
          where: {
            userId,
            productId,
            viewedAt: { gte: new Date(Date.now() - 3600000) }, // آخر ساعة
          },
          data: {
            interactions: JSON.stringify({
              readReviews: true
            })
          }
        })

        // تسجيل حدث قراءة التقييمات
        await prisma.customerEvent.create({
          data: {
            userId,
            eventType: "read_reviews",
            timestamp: new Date(),
            context: JSON.stringify({
              productId,
              reviewCount: reviews.length,
            }),
          }
        })
      } catch (trackingError) {
        // لا نريد أن تؤثر أخطاء التتبع على جلب التقييمات
        console.warn("Warning: Failed to track review reading:", trackingError.message)
      }
    }

    return NextResponse.json({
      success: true,
      data: { reviews, stats: reviewStats },
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

    // Validate IDs format
    if (!/^[0-9a-fA-F]{24}$/.test(productId) || !/^[0-9a-fA-F]{24}$/.test(userId)) {
      return NextResponse.json({ success: false, message: "Invalid ID format" }, { status: 400 })
    }

    // Validate rating
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, message: "Rating must be between 1 and 5" }, { status: 400 })
    }

    const now = new Date()

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: { productId, userId }
    })

    if (existingReview) {
      // Update existing review
      await prisma.review.update({
        where: { id: existingReview.id },
        data: {
          rating,
          comment,
          updatedAt: now,
          ip,
          userAgent,
        },
      })

      // تسجيل حدث تحديث التقييم
      await prisma.customerEvent.create({
        data: {
          userId,
          eventType: "update_review",
          timestamp: now,
          context: JSON.stringify({
            productId,
            reviewId: existingReview.id,
            oldRating: existingReview.rating,
            newRating: rating,
          }),
        }
      })

      return NextResponse.json({
        success: true,
        message: "Review updated successfully",
        data: { reviewId: existingReview.id },
      })
    }

    // Obtener el nombre real del usuario desde la base de datos
    const userInfo = await prisma.customer.findUnique({
      where: { id: userId },
      select: { name: true }
    })
    const displayName = userInfo ? userInfo.name : userName || "مستخدم"

    // Create new review
    const newReview = await prisma.review.create({
      data: {
        productId,
        userId,
        userName: displayName, // Usar el nombre real del usuario
        rating,
        comment,
        ip,
        userAgent,
        verified: true, // Siempre es verificado porque requiere autenticación
      }
    })

    // تحديث متوسط تقييم المنتج
    await updateProductRating(productId)

    // تحديث عدد التقييمات للعميل (استخدام viewCount كبديل مؤقت)
    await prisma.customer.update({
      where: { id: userId },
      data: {
        viewCount: { increment: 1 }, // استخدام viewCount كبديل مؤقت
        lastReviewAt: now,
      },
    })

    // تسجيل حدث إضافة تقييم
    await prisma.customerEvent.create({
      data: {
        userId,
        eventType: "add_review",
        timestamp: now,
        context: JSON.stringify({
          productId,
          reviewId: newReview.id,
          rating,
        }),
      }
    })

    return NextResponse.json({
      success: true,
      message: "Review added successfully",
      data: { reviewId: newReview.id },
    })
  } catch (error) {
    console.error("Error adding review:", error)
    return NextResponse.json({ success: false, message: "Failed to add review" }, { status: 500 })
  }
}

// تحديث متوسط تقييم المنتج
async function updateProductRating(productId: string) {
  try {
    const stats = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: true,
    })

    if (stats._count > 0) {
      await prisma.product.update({
        where: { id: productId },
        data: {
          rating: stats._avg.rating || 0,
        },
      })
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

    // التحقق من وجود التقييم
    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    })

    if (!review) {
      return NextResponse.json({ success: false, message: "Review not found" }, { status: 404 })
    }

    // التحقق مما إذا كان المستخدم قد قام بتقييم هذا التقييم من قبل
    const existingVote = await prisma.reviewVote.findUnique({
      where: {
        reviewId_userId: {
          reviewId,
          userId
        }
      }
    })

    if (existingVote) {
      // إذا كان التصويت الجديد مختلفًا عن السابق، قم بتحديثه
      if (existingVote.action !== action) {
        // تحديث التصويت
        await prisma.reviewVote.update({
          where: { id: existingVote.id },
          data: { 
            action: action === "helpful" ? "HELPFUL" : "NOT_HELPFUL",
            updatedAt: new Date() 
          }
        })

        // تحديث عدد التصويتات على التقييم
        if (existingVote.action === "HELPFUL" && action === "notHelpful") {
          await prisma.review.update({
            where: { id: reviewId },
            data: { 
              helpful: { decrement: 1 },
              notHelpful: { increment: 1 }
            }
          })
        } else if (existingVote.action === "NOT_HELPFUL" && action === "helpful") {
          await prisma.review.update({
            where: { id: reviewId },
            data: { 
              helpful: { increment: 1 },
              notHelpful: { decrement: 1 }
            }
          })
        }
      }
    } else {
      // إضافة تصويت جديد
      await prisma.reviewVote.create({
        data: {
          reviewId,
          userId,
          action: action === "helpful" ? "HELPFUL" : "NOT_HELPFUL",
        }
      })

      // تحديث عدد التصويتات على التقييم
      const updateField = action === "helpful" ? "helpful" : "notHelpful"
      await prisma.review.update({
        where: { id: reviewId },
        data: { [updateField]: { increment: 1 } }
      })
    }

    // تسجيل حدث التصويت
    await prisma.customerEvent.create({
      data: {
        userId,
        eventType: "review_vote",
        timestamp: new Date(),
        context: JSON.stringify({
          reviewId,
          productId: review.productId,
          action,
        }),
      }
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
