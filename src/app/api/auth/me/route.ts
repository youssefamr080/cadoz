import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth.config'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: 'غير مسموح' }, { status: 401 })
    }

    const customer = await prisma.customer.findUnique({
      where: { email: session.user.email },
      include: {
        behavior: true,
        preferenceProfile: true,
        segments: true,
      },
    })

    if (!customer) {
      return NextResponse.json({ success: false, message: 'العميل غير موجود' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        behavior: customer.behavior,
        preferenceProfile: customer.preferenceProfile,
        segments: customer.segments,
      },
    })

  } catch (error) {
    console.error('خطأ في جلب بيانات العميل:', error)
    return NextResponse.json({ success: false, message: 'حدث خطأ' }, { status: 500 })
  }
}
