import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "../../../../lib/mongodb"

// Fix: Use the async params pattern introduced in Next.js 15
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    // Await the params promise to get the actual values
    const { productId } = await params
    const productIdNum = Number.parseInt(productId)

    if (isNaN(productIdNum)) {
      return NextResponse.json({ success: false, message: "Invalid product ID" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Get product
    const product = await db.collection("products").findOne({ id: productIdNum })

    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 })
    }

    // Update view count if needed
    await db.collection("products").updateOne({ id: productIdNum }, { $inc: { views: 1 } })

    return NextResponse.json({
      success: true,
      data: product,
    })
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch product" }, { status: 500 })
  }
}

