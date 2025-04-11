import { NextResponse } from "next/server"
import { getBoxesCollection } from "@/lib/gift-db-helpers"
import { ObjectId } from "mongodb"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

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
