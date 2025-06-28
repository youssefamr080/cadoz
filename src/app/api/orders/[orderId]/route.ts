import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Fix: Use the async params pattern introduced in Next.js 15
export async function GET(request: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    // Await the params promise to get the actual values
    const { orderId } = await params

    if (!orderId) {
      return NextResponse.json({ success: false, message: "معرف الطلب مطلوب" }, { status: 400 })
    }    // البحث عن الطلب
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        shipping: true,
        payment: true,
        totals: true,
        promoCode: true,
        customer: true,
      }
    })

    if (!order) {
      return NextResponse.json({ success: false, message: "الطلب غير موجود" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      order,
    })
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ success: false, message: "حدث خطأ أثناء جلب الطلب" }, { status: 500 })
  }
}

// Fix: Use the async params pattern introduced in Next.js 15
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    // Await the params promise to get the actual values
    const { orderId } = await params
    const body = await request.json()
    const { status } = body

    if (!orderId) {
      return NextResponse.json({ success: false, message: "معرف الطلب مطلوب" }, { status: 400 })
    }

    // Map status to proper enum value
    const statusMap: Record<string, "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED"> = {
      pending: "PENDING",
      processing: "PROCESSING",
      shipped: "SHIPPED",
      delivered: "DELIVERED",
      cancelled: "CANCELLED",
    }

    const mappedStatus = statusMap[status.toLowerCase()] || "PENDING"

    // تحديث حالة الطلب
    const updateData: {
      status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
      updatedAt: Date;
      shippedAt?: Date;
      deliveredAt?: Date;
      cancelledAt?: Date;
    } = {
      status: mappedStatus,
      updatedAt: new Date(),
    }

    // إضافة تواريخ الحالة حسب الحالة الجديدة
    if (status === "shipped") {
      updateData.shippedAt = new Date()
    } else if (status === "delivered") {
      updateData.deliveredAt = new Date()
    } else if (status === "cancelled") {
      updateData.cancelledAt = new Date()
    }

    const result = await prisma.order.update({
      where: { id: orderId },
      data: updateData
    })

    if (!result) {
      return NextResponse.json({ success: false, message: "الطلب غير موجود" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "تم تحديث الطلب بنجاح",
    })
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ success: false, message: "حدث خطأ أثناء تحديث الطلب" }, { status: 500 })
  }
}

