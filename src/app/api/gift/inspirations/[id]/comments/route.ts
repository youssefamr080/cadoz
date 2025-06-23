import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "معرف الإلهام مطلوب" },
        { status: 400 }
      );
    }    const comments = await prisma.inspirationComment.findMany({
      where: { inspirationId: id },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching inspiration comments:", error);
    return NextResponse.json(
      { error: "حدث خطأ في جلب التعليقات" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { userId, userName, comment } = await request.json();

    if (!id || !userId || !comment) {
      return NextResponse.json(
        { error: "معرف الإلهام ومعرف المستخدم والتعليق مطلوبة" },
        { status: 400 }
      );
    }

    const newComment = await prisma.inspirationComment.create({
      data: {
        inspirationId: id,
        userId,
        userName: userName || "مستخدم مجهول",
        comment
      }
    });

    return NextResponse.json(newComment);
  } catch (error) {
    console.error("Error creating inspiration comment:", error);
    return NextResponse.json(
      { error: "حدث خطأ في إضافة التعليق" },
      { status: 500 }
    );
  }
}
