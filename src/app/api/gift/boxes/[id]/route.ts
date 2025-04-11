import { NextResponse, NextRequest } from "next/server"
import { getBoxesCollection } from "@/lib/gift-db-helpers"
import { ObjectId } from "mongodb"

// Use the async params pattern introduced in Next.js 15
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params promise to get the actual values
    const { id } = await params

    const collection = await getBoxesCollection()
    const box = await collection.findOne({ _id: new ObjectId(id) })

    if (!box) {
      return NextResponse.json({ success: false, message: "Box not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        ...box,
        id: box._id.toString(),
      },
    })
  } catch (error) {
    console.error("Error fetching box:", error)
    return NextResponse.json({ success: false, message: "Error fetching box", error: String(error) }, { status: 500 })
  }
}
