import { NextResponse } from "next/server"
import { connectToDatabase } from "../../../../lib/mongodb"

interface UpdateData {
  status: string
  updatedAt: Date
  shippedAt?: Date
  deliveredAt?: Date
  cancelledAt?: Date
}

export async function GET(request: Request, { params }: { params: { orderId: string } }) {
  try {
    const orderId = params.orderId

    if (!orderId) {
      return NextResponse.json({ success: false, message: "معرف الطلب مطلوب" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // البحث عن الطلب
    const order = await db.collection("orders").findOne({ id: orderId })

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

export async function PATCH(request: Request, { params }: { params: { orderId: string } }) {
  try {
    const orderId = params.orderId
    const body = await request.json()
    const { status } = body

    if (!orderId) {
      return NextResponse.json({ success: false, message: "معرف الطلب مطلوب" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // تحديث حالة الطلب
    const updateData: UpdateData = {
      status,
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

    const result = await db.collection("orders").updateOne({ id: orderId }, { $set: updateData })

    if (result.matchedCount === 0) {
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

