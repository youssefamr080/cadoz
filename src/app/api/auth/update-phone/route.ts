import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { connectToDatabase } from "@/lib/mongodb"
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

    const { db } = await connectToDatabase()

    // Check if phone number is already taken
    const existingUser = await db.collection("customers").findOne({ 
      phone,
      id: { $ne: session.user.id }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "رقم الهاتف مسجل بالفعل" },
        { status: 400 }
      )
    }

    // Update user's phone number
    await db.collection("customers").updateOne(
      { id: session.user.id },
      { 
        $set: { 
          phone,
          needsPhoneUpdate: false,
          updatedAt: new Date()
        }
      }
    )

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
