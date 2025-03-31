import { NextResponse } from "next/server"
import { connectToDatabase } from "../../../../lib/mongodb"

// API endpoint para verificar la sesión del usuario
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, phone } = body

    if (!userId || !phone) {
      return NextResponse.json(
        {
          success: false,
          message: "معرف المستخدم ورقم الهاتف مطلوبان",
          valid: false,
        },
        { status: 400 },
      )
    }

    const { db } = await connectToDatabase()

    // Buscar al usuario por ID y teléfono
    const user = await db.collection("customers").findOne({ id: userId, phone })

    if (!user) {
      return NextResponse.json({
        success: false,
        message: "جلسة المستخدم غير صالحة، يرجى تسجيل الدخول مرة أخرى",
        valid: false,
      })
    }

    // Devolver solo la información necesaria
    const userInfo = {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
    }

    return NextResponse.json({
      success: true,
      valid: true,
      user: userInfo,
    })
  } catch (error) {
    console.error("Session verification error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء التحقق من جلسة المستخدم",
        valid: false,
      },
      { status: 500 },
    )
  }
}

