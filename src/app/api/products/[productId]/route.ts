import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ productId: string }> }
) {
  try {
    // Await the params promise to get the actual values
    const { productId } = await context.params
    const productIdNum = Number.parseInt(productId)

    if (isNaN(productIdNum)) {
      return NextResponse.json({ success: false, message: "Invalid product ID" }, { status: 400 })
    }

    // Get product
    const product = await prisma.product.findUnique({
      where: { id: productIdNum.toString() }
    })

    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 })
    }

    // Update view count if needed
    await prisma.product.update({
      where: { id: productIdNum.toString() },
      data: { views: { increment: 1 } }
    })

    return NextResponse.json({
      success: true,
      data: product,
    })
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch product" }, { status: 500 })
  }
}