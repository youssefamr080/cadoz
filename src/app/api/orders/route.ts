import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { items, shipping, totals, promoCode, customerId, customerName, customerPhone, customerEmail } = body

    if (!items || !shipping || !totals) {
      return NextResponse.json({ success: false, message: "بيانات الطلب غير مكتملة" }, { status: 400 })
    }

    // إنشاء طلب جديد
    const newOrder = await prisma.order.create({
      data: {
        id: uuidv4(),
        customerId: customerId || null,
        customerName,
        customerPhone,
        customerEmail,
        status: "PENDING",
        source: "WEBSITE",
      }
    })

    // إنشاء عناصر الطلب
    await prisma.orderItem.createMany({
      data: items.map((item: {
        name: string;
        image: string;
        price: number;
        quantity: number;
        variant?: string;
        discount?: number;
        originalPrice?: number;
        giftDetails?: string;
      }) => ({
        orderId: newOrder.id,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        variant: item.variant,
        discount: item.discount,
        originalPrice: item.originalPrice,
        giftDetails: item.giftDetails,
      }))
    })

    // إنشاء معلومات الشحن
    const shippingInfo = await prisma.shippingInfo.create({
      data: {
        governorate: shipping.governorate,
        address: shipping.address,
        phone: shipping.phone,
        notes: shipping.notes,
      }
    })

    // إنشاء معلومات الدفع
    const paymentInfo = await prisma.paymentInfo.create({
      data: {
        method: "CASH_ON_DELIVERY",
        status: "PENDING",
      }
    })

    // إنشاء إجماليات الطلب
    const orderTotals = await prisma.orderTotals.create({
      data: {
        subtotal: totals.subtotal,
        shippingFees: totals.shippingFees,
        discount: totals.discount,
        tax: totals.tax,
        total: totals.total,
      }
    })

    // إنشاء كود الخصم إذا كان موجوداً
    if (promoCode) {
      await prisma.promoCode.create({
        data: {
          orderId: newOrder.id,
          code: promoCode.code,
          discountPercentage: promoCode.discountPercentage,
        }
      })
    }

    // تحديث الطلب بروابط النماذج المرتبطة
    await prisma.order.update({
      where: { id: newOrder.id },
      data: {
        shippingId: shippingInfo.id,
        paymentId: paymentInfo.id,
        totalsId: orderTotals.id,
      }
    })

    // إذا كان المستخدم مسجل، قم بتحديث بيانات العميل
    if (customerId) {
      // Verificar si el cliente existe
      const customer = await prisma.customer.findUnique({
        where: { id: customerId }
      })

      if (customer) {
        await prisma.customer.update({
          where: { id: customerId },
          data: {
            lastOrderAt: new Date(),
            email: customerEmail || customer.email, // Keep existing email if no new email provided
            orderCount: { increment: 1 },
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: "تم إنشاء الطلب بنجاح",
      orderId: newOrder.id,
    })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ success: false, message: "حدث خطأ أثناء إنشاء الطلب" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get("customerId")
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit") as string) : undefined

    if (!customerId) {
      return NextResponse.json({ success: false, message: "معرف العميل مطلوب" }, { status: 400 })
    }

    // البحث عن طلبات العميل
    const orders = await prisma.order.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        items: true,
        shipping: true,
        payment: true,
        totals: true,
        promoCode: true,
      }
    })

    return NextResponse.json({
      success: true,
      orders,
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ success: false, message: "حدث خطأ أثناء جلب الطلبات" }, { status: 500 })
  }
}
