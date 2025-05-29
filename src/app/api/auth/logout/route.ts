import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth.config"

export async function POST() {
  try {
    // Get the current session
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ 
        success: false, 
        message: "لا توجد جلسة مستخدم نشطة" 
      }, { status: 401 })
    }

    const userId = session.user.id

    // Update user's lastLogoutAt in the database
    const { db } = await connectToDatabase()
    await db.collection("customers").updateOne(
      { id: userId },
      { 
        $set: { 
          lastLogoutAt: new Date(),
          isOnline: false
        } 
      }
    )

    // Clear any persistent tokens or sessions
    await db.collection("sessions").deleteMany({ userId })

    return NextResponse.json({
      success: true,
      message: "تم تسجيل الخروج بنجاح",
    })
  } catch (error) {
    console.error("Logout error:", error)
    
    const errorMessage = error instanceof Error ? error.message : "حدث خطأ غير معروف"
    
    return NextResponse.json({ 
      success: false, 
      message: "حدث خطأ أثناء تسجيل الخروج",
      details: errorMessage
    }, { 
      status: 500 
    })
  }
}

