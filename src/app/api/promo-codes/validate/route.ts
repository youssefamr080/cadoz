import { NextResponse } from "next/server"
import { connectToDatabase } from "../../../../lib/mongodb"

export async function POST(request: Request) {
  try {
    const { code, userId } = await request.json()

    if (!code || !userId) {
      return NextResponse.json(
        { success: false, message: "يجب توفير كود الخصم ومعرف المستخدم" },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    // التحقق من استخدام الكود من قبل
    const existingUse = await db.collection("usedPromoCodes").findOne({
      userId,
      promoCode: code.toUpperCase()
    })

    if (existingUse) {
      return NextResponse.json(
        { success: false, message: "لقد قمت باستخدام هذا الكود من قبل" },
        { status: 400 }
      )
    }

    // حفظ استخدام الكود
    await db.collection("usedPromoCodes").insertOne({
      userId,
      promoCode: code.toUpperCase(),
      usedAt: new Date()
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