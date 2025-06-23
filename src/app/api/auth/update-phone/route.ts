import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth.config"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "غير مصرح" },
        { status: 401 }
      )
    }

    const { phone } = await request.json()

    if (!phone || phone.length < 10) {
      return NextResponse.json(
        { success: false, message: "رقم الهاتف غير صالح" },
        { status: 400 }
      )
    }

    // التحقق من أن رقم الهاتف غير مستخدم مسبقاً
    const existingUser = await prisma.customer.findFirst({
      where: {
        phone,
        id: {
          not: session.user.id
        }
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "رقم الهاتف مسجل بالفعل" },
        { status: 400 }
      )
    }

    // تحديث رقم هاتف المستخدم
    await prisma.customer.update({
      where: { id: session.user.id },
      data: {
        phone,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true,
      message: "تم تحديث رقم الهاتف بنجاح"
    })
  } catch (error) {
    console.error("[AUTH] Error updating phone number:", error)
    return NextResponse.json(
      { success: false, message: "حدث خطأ أثناء تحديث رقم الهاتف" },
      { status: 500 }
    )
  }
}
