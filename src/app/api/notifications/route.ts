import { NextResponse } from "next/server"
import { connectToDatabase } from "../../../lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, productId, productName, phone, createdAt } = body
    const userAgent = request.headers.get("user-agent") || ""
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "0.0.0.0"

    if (!userId || !productId || !productName || !phone) {
      return NextResponse.json({ success: false, message: "بيانات غير مكتملة" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // التحقق من وجود إشعار مسبق لنفس المستخدم والمنتج
    const existingNotification = await db.collection("notifications").findOne({
      userId,
      productId,
    })

    if (existingNotification) {
      // تحديث الإشعار الموجود
      await db.collection("notifications").updateOne(
        { _id: existingNotification._id },
        {
          $set: {
            updatedAt: new Date(),
            lastRequestIp: ip,
            lastUserAgent: userAgent,
            requestCount: (existingNotification.requestCount || 1) + 1,
          },
        },
      )

      // تسجيل حدث تحديث الإشعار
      await db.collection("customerEvents").insertOne({
        userId,
        eventType: "notification_update",
        timestamp: new Date(),
        context: {
          productId: Number(productId),
          notificationId: existingNotification._id,
          productName,
        },
      })

      return NextResponse.json({
        success: true,
        message: "تم تحديث الإشعار",
        notification: existingNotification,
      })
    }

    // إنشاء إشعار جديد
    const notification = {
      userId,
      productId: Number(productId),
      productName,
      phone,
      createdAt: createdAt || new Date(),
      updatedAt: new Date(),
      status: "pending", // pending, sent, cancelled
      ip,
      userAgent,
      requestCount: 1,
      source: "product_page", // يمكن تغييره حسب مصدر الطلب
    }

    const result = await db.collection("notifications").insertOne(notification)

    // تحديث بيانات العميل
    await db.collection("customers").updateOne(
      { id: userId },
      {
        $inc: { notificationCount: 1 },
        $set: { lastNotificationAt: new Date() },
        $addToSet: { interestedProducts: Number(productId) },
      },
    )

    // تحديث بيانات المنتج
    await db.collection("products").updateOne({ id: Number(productId) }, { $inc: { notificationRequests: 1 } })

    // تسجيل حدث إنشاء الإشعار
    await db.collection("customerEvents").insertOne({
      userId,
      eventType: "notification_create",
      timestamp: new Date(),
      context: {
        productId: Number(productId),
        notificationId: result.insertedId,
        productName,
      },
    })

    return NextResponse.json({
      success: true,
      message: "تم تسجيل الإشعار بنجاح",
      notification: {
        ...notification,
        _id: result.insertedId,
      },
    })
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json({ success: false, message: "حدث خطأ أثناء تسجيل الإشعار" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const productId = searchParams.get("productId")
    const status = searchParams.get("status")

    const { db } = await connectToDatabase()

    let query = {}

    if (userId) {
      query = { ...query, userId }
    }

    if (productId) {
      query = { ...query, productId: Number(productId) }
    }

    if (status) {
      query = { ...query, status }
    }

    const notifications = await db.collection("notifications").find(query).toArray()

    // تسجيل حدث استعلام عن الإشعارات إذا كان المستخدم محددًا
    if (userId && userId !== "guest-user") {
      await db.collection("customerEvents").insertOne({
        userId,
        eventType: "notifications_view",
        timestamp: new Date(),
        context: {
          count: notifications.length,
          filters: { productId, status },
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: notifications,
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ success: false, message: "حدث خطأ أثناء جلب الإشعارات" }, { status: 500 })
  }
}

// إضافة وظيفة لتحديث حالة الإشعار
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { notificationId, status, userId } = body

    if (!notificationId || !status) {
      return NextResponse.json({ success: false, message: "بيانات غير مكتملة" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // التحقق من وجود الإشعار
    const notification = await db.collection("notifications").findOne({ _id: new ObjectId(notificationId) })

    if (!notification) {
      return NextResponse.json({ success: false, message: "الإشعار غير موجود" }, { status: 404 })
    }

    // تحديث حالة الإشعار
    await db.collection("notifications").updateOne(
      { _id: new ObjectId(notificationId) },
      {
        $set: {
          status,
          statusUpdatedAt: new Date(),
          statusUpdatedBy: userId || "system",
        },
      },
    )

    // تسجيل حدث تحديث حالة الإشعار
    if (userId && userId !== "guest-user") {
      await db.collection("customerEvents").insertOne({
        userId,
        eventType: "notification_status_update",
        timestamp: new Date(),
        context: {
          notificationId,
          productId: notification.productId,
          oldStatus: notification.status,
          newStatus: status,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: "تم تحديث حالة الإشعار بنجاح",
    })
  } catch (error) {
    console.error("Error updating notification status:", error)
    return NextResponse.json({ success: false, message: "حدث خطأ أثناء تحديث حالة الإشعار" }, { status: 500 })
  }
}

