import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { code, userId } = await request.json()

    if (!code || !userId) {
      return NextResponse.json(
        { success: false, message: "يجب توفير كود الخصم ومعرف المستخدم" },
        { status: 400 }
      )
    }

    const upperCaseCode = code.toUpperCase()

    // التحقق من استخدام الكود من قبل
    const existingUse = await prisma.usedPromoCode.findFirst({
      where: {
        userId,
        promoCode: upperCaseCode
      }
    })

    if (existingUse) {
      return NextResponse.json(
        { success: false, message: "لقد قمت باستخدام هذا الكود من قبل" },
        { status: 400 }
      )
    }

    // حفظ استخدام الكود
    await prisma.usedPromoCode.create({
      data: {
        userId,
        promoCode: upperCaseCode,
        usedAt: new Date()
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error validating promo code:", error)
    return NextResponse.json(
      { success: false, message: "حدث خطأ أثناء التحقق من كود الخصم" },
      { status: 500 }
    )
  }
}