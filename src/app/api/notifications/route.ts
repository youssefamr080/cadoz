import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, productId, productName, phone, name } = body

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

    // التحقق من وجود إشعار مسبق لنفس المستخدم والمنتج
    const existingNotification = await prisma.notification.findFirst({
      where: {
        userId: String(userId), // تحويل إلى نص للتأكد من التطابق
        title: { contains: productName }, // استخدام العنوان للبحث عن المنتج
      }
    })

    if (existingNotification) {
      // تحديث الإشعار الموجود
      const updatedNotification = await prisma.notification.update({
        where: { id: existingNotification.id },
        data: {
          message: `تم تحديث طلب الإشعار للمنتج: ${productName}`,
          type: "CUSTOM",
          isRead: false,
        }
      })

      return NextResponse.json({
        success: true,
        message: "تم تحديث الإشعار",
        notification: updatedNotification,
      })
    }

    // إنشاء إشعار جديد
    const notification = await prisma.notification.create({
      data: {
        title: `إشعار جديد للمنتج: ${productName}`,
        message: `تم تسجيل طلب إشعار للمنتج: ${productName}`,
        type: "CUSTOM",
        userId: String(userId),
        isRead: false,
      }
    })

    // تحديث بيانات العميل
    await prisma.customer.upsert({
      where: { id: String(userId) },
      update: {
        name: String(name),
      },
      create: {
        id: String(userId),
        name: String(name),
        phone: String(phone),
        email: "",
        password: "", // سيتم تحديثه لاحقاً
      }
    })

    return NextResponse.json({
      success: true,
      message: "تم تسجيل الإشعار بنجاح",
      notification,
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
    const status = searchParams.get("status")

    // Validate userId format if provided - تحقق مرن أكثر
    if (userId && userId.length < 20) {
      return NextResponse.json({ 
        success: false, 
        message: "معرف المستخدم غير صالح" 
      }, { status: 400 })
    }

    const where: { userId?: string; isRead?: boolean } = {}

    if (userId) {
      where.userId = userId
    }

    if (status === "read") {
      where.isRead = true
    } else if (status === "unread") {
      where.isRead = false
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' as const },
      take: 50 // تحديد عدد الإشعارات لتحسين الأداء
    })

    return NextResponse.json({
      success: true,
      data: notifications,
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ 
      success: false, 
      message: "حدث خطأ أثناء جلب الإشعارات",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

