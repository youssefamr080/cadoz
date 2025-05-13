import { NextResponse } from "next/server"
import { connectToDatabase } from "../../../lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, productId, productName, phone, name, createdAt } = body
    const userAgent = request.headers.get("user-agent") || ""
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "0.0.0.0"

    // التحقق من البيانات المطلوبة
    if (!userId || !productId || !productName || !phone || !name) {
      return NextResponse.json({ 
        success: false, 
        message: "بيانات غير مكتملة",
        missingFields: {
          userId: !userId,
          productId: !productId,
          productName: !productName,
          phone: !phone,
          name: !name
        }
      }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // التحقق من وجود إشعار مسبق لنفس المستخدم والمنتج
    const existingNotification = await db.collection("notifications").findOne({
      userId: String(userId), // تحويل إلى نص للتأكد من التطابق
      productId: Number(productId),
    })

    if (existingNotification) {
      // تحديث الإشعار الموجود
      const updateResult = await db.collection("notifications").updateOne(
        { _id: existingNotification._id },
        {
          $set: {
            updatedAt: new Date(),
            lastRequestIp: ip,
            lastUserAgent: userAgent,
            requestCount: (existingNotification.requestCount || 1) + 1,
            name: String(name), // تحويل إلى نص للتأكد من التخزين الصحيح
          },
          $addToSet: {
            requestedProducts: {
              productId: Number(productId),
              productName: String(productName),
              requestedAt: new Date(),
            }
          }
        },
      )

      if (!updateResult.modifiedCount) {
        throw new Error("Failed to update existing notification")
      }

      // تسجيل حدث تحديث الإشعار
      await db.collection("customerEvents").insertOne({
        userId: String(userId),
        eventType: "notification_update",
        timestamp: new Date(),
        context: {
          productId: Number(productId),
          notificationId: existingNotification._id,
          productName: String(productName),
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
      userId: String(userId),
      productId: Number(productId),
      productName: String(productName),
      phone: String(phone),
      name: String(name),
      createdAt: createdAt || new Date(),
      updatedAt: new Date(),
      status: "pending",
      ip,
      userAgent,
      requestCount: 1,
      source: "product_page",
      requestedProducts: [{
        productId: Number(productId),
        productName: String(productName),
        requestedAt: new Date(),
      }]
    }

    const result = await db.collection("notifications").insertOne(notification)

    if (!result.insertedId) {
      throw new Error("Failed to create new notification")
    }

    // تحديث بيانات العميل
    await db.collection("customers").updateOne(
      { id: String(userId) },
      {
        $inc: { notificationCount: 1 },
        $set: { 
          lastNotificationAt: new Date(),
          name: String(name)
        },
        $addToSet: { interestedProducts: Number(productId) },
      },
      { upsert: true } // إنشاء وثيقة جديدة إذا لم تكن موجودة
    )

    // تحديث بيانات المنتج
    await db.collection("products").updateOne(
      { id: Number(productId) }, 
      { $inc: { notificationRequests: 1 } },
      { upsert: true } // إنشاء وثيقة جديدة إذا لم تكن موجودة
    )

    // تسجيل حدث إنشاء الإشعار
    await db.collection("customerEvents").insertOne({
      userId: String(userId),
      eventType: "notification_create",
      timestamp: new Date(),
      context: {
        productId: Number(productId),
        notificationId: result.insertedId,
        productName: String(productName),
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
    return NextResponse.json({ 
      success: false, 
      message: "حدث خطأ أثناء تسجيل الإشعار",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
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

