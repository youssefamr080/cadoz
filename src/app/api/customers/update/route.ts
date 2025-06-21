import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, name, phone, email, password, image } = body

    if (!id) {
      return NextResponse.json({ success: false, message: "معرف المستخدم مطلوب" }, { status: 400 })
    }

    // التحقق من وجود المستخدم
    const existingUser = await prisma.customer.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json({ success: false, message: "المستخدم غير موجود" }, { status: 404 })
    }

    // إعداد البيانات للتحديث
    const updateData: {
      updatedAt: Date;
      name?: string;
      phone?: string;
      email?: string;
      image?: string;
      password?: string;
    } = {
      updatedAt: new Date(),
    }

    if (name) updateData.name = name
    if (phone) updateData.phone = phone
    if (email) updateData.email = email
    if (image) updateData.image = image

    // تشفير كلمة المرور إذا تم توفيرها
    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    // تحديث بيانات المستخدم
    await prisma.customer.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      message: "تم تحديث بيانات المستخدم بنجاح",
    })
  } catch (error) {
    console.error("Error updating customer:", error)
    return NextResponse.json({ success: false, message: "حدث خطأ أثناء تحديث بيانات المستخدم" }, { status: 500 })
  }
}

