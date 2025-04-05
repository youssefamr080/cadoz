import { NextResponse } from "next/server"
import { connectToDatabase } from "../../../lib/mongodb"
import type { Order, OrderItem } from "../../../models/Order"
import { v4 as uuidv4 } from "uuid"
import type { Document, UpdateFilter } from "mongodb"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { items, shipping, totals, promoCode, customerId, customerName, customerPhone } = body

    if (!items || !shipping || !totals) {
      return NextResponse.json({ success: false, message: "بيانات الطلب غير مكتملة" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // إنشاء طلب جديد
    const newOrder: Order = {
      id: uuidv4(),
      customerId,
      customerName,
      customerPhone,
      items: items as OrderItem[],
      shipping,
      payment: {
        method: "cash_on_delivery",
        status: "pending",
      },
      status: "pending",
      totals,
      promoCode,
      createdAt: new Date(),
      updatedAt: new Date(),
      source: "website" as "website" | "whatsapp" | "phone" | "instagram",
    }

    // حفظ الطلب في قاعدة البيانات
    const result = await db.collection("orders").insertOne(newOrder)

    if (!result.acknowledged) {
      throw new Error("فشل في إنشاء الطلب")
    }

    // إذا كان المستخدم مسجل، قم بتحديث بيانات العميل
    if (customerId) {
      // Verificar si el cliente existe
      const customer = await db.collection("customers").findOne({ id: customerId })

      if (customer) {
        // Usar tipos correctos para las operaciones de MongoDB
        if (Array.isArray(customer.orders)) {
          // Si ya existe un array de orders, usamos $push
          await db.collection("customers").updateOne({ id: customerId }, {
            $set: { lastOrderAt: new Date() },
            $inc: { orderCount: 1 },
            $push: { orders: newOrder.id },
          } as unknown as UpdateFilter<Document>)
        } else {
          // Si no existe, inicializamos el array
          await db.collection("customers").updateOne({ id: customerId }, {
            $set: {
              lastOrderAt: new Date(),
              orders: [newOrder.id],
            },
            $inc: { orderCount: 1 },
          } as UpdateFilter<Document>)
        }
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

    const { db } = await connectToDatabase()

    // البحث عن طلبات العميل
    let query = db.collection("orders").find({ customerId }).sort({ createdAt: -1 })

    // تطبيق الحد إذا تم تحديده
    if (limit) {
      query = query.limit(limit)
    }

    const orders = await query.toArray()

    return NextResponse.json({
      success: true,
      orders,
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ success: false, message: "حدث خطأ أثناء جلب الطلبات" }, { status: 500 })
  }
}
