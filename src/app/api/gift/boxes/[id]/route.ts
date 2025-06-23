import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

// Use the async params pattern introduced in Next.js 15
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params promise to get the actual values
    const { id } = await params

    const box = await prisma.box.findUnique({
      where: { id }
    })

    if (!box) {
      return NextResponse.json({ success: false, message: "Box not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: box,
    })
  } catch (error) {
    console.error("Error fetching box:", error)
    return NextResponse.json({ success: false, message: "Error fetching box", error: String(error) }, { status: 500 })
  }
}
