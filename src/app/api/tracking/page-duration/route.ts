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
    const { pathname, duration, sessionId } = body

    // جلب بيانات العميل
    const customer = await prisma.customer.findUnique({
      where: { email: session.user.email },
    })

    if (!customer) {
      return NextResponse.json({ success: false, message: 'العميل غير موجود' }, { status: 404 })
    }

    // تسجيل مدة البقاء
    await behaviorTracker.trackEvent({
      customerId: customer.id,
      sessionId,
      eventType: 'page_duration',
      context: {
        pathname,
        duration,
      },
    })

    // تحديث إحصائيات السلوك
    await prisma.customerBehavior.upsert({
      where: { customerId: customer.id },
      create: {
        customerId: customer.id,
        totalTimeSpent: duration,
        totalSessions: 1,
      },
      update: {
        totalTimeSpent: { increment: duration },
        lastUpdated: new Date(),
      },
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('خطأ في تتبع مدة البقاء:', error)
    return NextResponse.json({ success: false, message: 'حدث خطأ' }, { status: 500 })
  }
}
