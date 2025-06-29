import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth.config'
import { behaviorTracker } from '@/lib/services/behavior-tracker'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: 'غير مسموح' }, { status: 401 })
    }

    const body = await request.json()
    const { pageType, pathname, context, sessionId } = body

    // جلب بيانات العميل
    const customer = await prisma.customer.findUnique({
      where: { email: session.user.email },
    })

    if (!customer) {
      return NextResponse.json({ success: false, message: 'العميل غير موجود' }, { status: 404 })
    }

    // تسجيل الحدث
    await behaviorTracker.trackEvent({
      customerId: customer.id,
      sessionId,
      eventType: 'page_view',
      context: {
        pageType,
        pathname,
        ...context,
      },
    })

    // تتبع خاص بناءً على نوع الصفحة
    if (pageType === 'product' && context.productId) {
      await behaviorTracker.trackProductView({
        customerId: customer.id,
        sessionId,
        productId: context.productId,
        source: 'direct',
      })
    }

    if (pageType === 'search' && context.query) {
      await behaviorTracker.trackSearch({
        customerId: customer.id,
        sessionId,
        searchTerm: context.query,
        category: context.category,
        resultsCount: 0, // سيتم تحديثه لاحقاً
      })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('خطأ في تتبع مشاهدة الصفحة:', error)
    return NextResponse.json({ success: false, message: 'حدث خطأ' }, { status: 500 })
  }
}
