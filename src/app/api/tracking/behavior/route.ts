import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth.config'
import { BehaviorTracker } from '@/lib/services/behavior-tracker'
import { prisma } from '@/lib/prisma'

const behaviorTracker = BehaviorTracker.getInstance()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      eventType,
      productId,
      searchQuery,
      categoryId,
      duration,
      context = {},
      source
    } = body

    // الحصول على معلومات الجلسة
    const session = await getServerSession(authOptions)
    const sessionId = request.headers.get('x-session-id') || `anonymous_${Date.now()}`

    // إذا كان المستخدم مسجل دخول
    if (session?.user?.email) {
      const customer = await prisma.customer.findUnique({
        where: { email: session.user.email }
      })

      if (customer) {
        // تتبع أحداث خاصة
        switch (eventType) {
          case 'product_view':
            if (productId) {
              await behaviorTracker.trackProductView({
                customerId: customer.id,
                sessionId,
                productId,
                duration: duration || 0,
                source,
                context
              })
            }
            break

          case 'search':
            if (searchQuery) {
              await behaviorTracker.trackSearch({
                customerId: customer.id,
                sessionId,
                searchTerm: searchQuery,
                category: categoryId,
                resultsCount: context.resultsCount || 0,
                source
              })
            }
            break

          case 'add_to_cart':
            if (productId) {
              await behaviorTracker.trackEvent({
                customerId: customer.id,
                sessionId,
                eventType: 'add_to_cart',
                productId,
                context: { quantity: context.quantity || 1 }
              })
            }
            break

          case 'purchase':
            if (context.productIds && context.totalAmount) {
              await behaviorTracker.trackEvent({
                customerId: customer.id,
                sessionId,
                eventType: 'purchase',
                context: {
                  productIds: context.productIds,
                  totalAmount: context.totalAmount
                }
              })
            }
            break

          default:
            // تتبع حدث عام
            await behaviorTracker.trackEvent({
              customerId: customer.id,
              sessionId,
              eventType,
              productId,
              searchTerm: searchQuery,
              category: categoryId,
              value: duration,
              context,
              source
            })
        }

        return NextResponse.json({
          success: true,
          message: 'تم تسجيل الحدث بنجاح',
          customerId: customer.id
        })
      }
    }

    // للمستخدمين غير المسجلين - تتبع محدود
    if (eventType === 'product_view' && productId) {
      // تحديث عدد المشاهدات فقط
      await prisma.product.update({
        where: { id: productId },
        data: {
          views: {
            increment: 1
          }
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'تم تسجيل الحدث (ضيف)',
      anonymous: true
    })

  } catch (error) {
    console.error('خطأ في تتبع السلوك:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'فشل في تسجيل الحدث'
      },
      { status: 500 }
    )
  }
}
