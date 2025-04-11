import { NextResponse, NextRequest } from "next/server"
import { getBoxesCollection } from "@/lib/gift-db-helpers"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const category = searchParams.get("category")
    const id = searchParams.get("id")

    const collection = await getBoxesCollection()

    // Si se proporciona un ID, devolver un solo box
    if (id) {
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
    }

    // Si se proporciona una categoría, filtrar por categoría
    let query = {}
    if (category) {
      query = { category }
    }

    const boxes = await collection.find(query).toArray()

    return NextResponse.json({
      success: true,
      data: boxes.map((box) => ({
        ...box,
        id: box._id.toString(),
      })),
    })
  } catch (error) {
    console.error("Error fetching boxes:", error)
    return NextResponse.json({ success: false, message: "Error fetching boxes", error: String(error) }, { status: 500 })
  }
}
