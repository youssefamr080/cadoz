import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import bcrypt from "bcryptjs"

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, name, phone, email, password, image } = body

    if (!id) {
      return NextResponse.json({ success: false, message: "معرف المستخدم مطلوب" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // التحقق من وجود المستخدم
    const existingUser = await db.collection("customers").findOne({ id })

    if (!existingUser) {
      return NextResponse.json({ success: false, message: "المستخدم غير موجود" }, { status: 404 })
    }

    // إعداد البيانات للتحديث
    interface UpdateData {
      updatedAt: Date;
      name?: string;
      phone?: string;
      email?: string;
      image?: string;
      password?: string;
    }
    const updateData: UpdateData = {
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
    await db.collection("customers").updateOne({ id }, { $set: updateData })

    return NextResponse.json({
      success: true,
      message: "تم تحديث بيانات المستخدم بنجاح",
    })
  } catch (error) {
    console.error("Error updating customer:", error)
    return NextResponse.json({ success: false, message: "حدث خطأ أثناء تحديث بيانات المستخدم" }, { status: 500 })
  }
}

