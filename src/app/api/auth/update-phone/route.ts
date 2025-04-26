import { NextResponse, NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json();
    const { userId, phoneNumber } = body;

    if (!userId || !phoneNumber) {
      return NextResponse.json({ 
        success: false, 
        message: "يرجى توفير معرف المستخدم ورقم الهاتف" 
      }, { status: 400 });
    }

    // التحقق من صحة رقم الهاتف
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json({ 
        success: false, 
        message: "رقم الهاتف غير صالح" 
      }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // تحديث رقم الهاتف للمستخدم
    const result = await db.collection("customers").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { phoneNumber } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "لم يتم العثور على المستخدم" 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "تم تحديث رقم الهاتف بنجاح"
    });
  } catch (error) {
    console.error("Error updating phone number:", error);
    return NextResponse.json({ 
      success: false, 
      message: "حدث خطأ أثناء تحديث رقم الهاتف",
      error: (error as Error).message
    }, { status: 500 });
  }
}
