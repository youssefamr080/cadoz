import { NextResponse } from "next/server"
import { connectToDatabase } from "../../../../lib/mongodb"

export async function GET(request: Request, { params }: { params: { productId: string } }) {
  try {
    const productId = Number.parseInt(params.productId)

    if (isNaN(productId)) {
      return NextResponse.json({ success: false, message: "Invalid product ID" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Get product
    const product = await db.collection("products").findOne({ id: productId })

    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 })
    }

    // Update view count if needed
    await db.collection("products").updateOne({ id: productId }, { $inc: { views: 1 } })

    return NextResponse.json({
      success: true,
      data: product,
    })
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch product" }, { status: 500 })
  }
}

