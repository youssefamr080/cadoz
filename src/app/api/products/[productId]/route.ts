import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ productId: string }> }
) {
  console.log('🔍 تم استلام طلب في [productId] endpoint:', request.url);
  try {
    // Await the params promise to get the actual values
    const { productId } = await context.params
    console.log('📝 productId المستلم:', productId);
    if (!productId) {
      return NextResponse.json({ success: false, message: "Product ID is required" }, { status: 400 })
    }
    // Get product
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })
    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 })
    }
    // Update view count if needed
    await prisma.product.update({
      where: { id: productId },
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