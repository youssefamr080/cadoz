"use server"

import { prisma } from "@/lib/prisma"
import type { GiftProduct } from "../../../prisma/generated/client"
import { revalidatePath } from "next/cache"

// جلب جميع المنتجات
export async function getAllProducts(): Promise<GiftProduct[]> {
  try {
    const products = await prisma.giftProduct.findMany()
    return products
  } catch (error) {
    console.error("Error fetching products:", error)
    throw new Error("فشل في جلب المنتجات")
  }
}

// جلب المنتجات حسب الفئة
export async function getProductsByCategory(category: string): Promise<GiftProduct[]> {
  try {
    const products = await prisma.giftProduct.findMany({
      where: { category }
    })
    return products
  } catch (error) {
    console.error("Error fetching products by category:", error)
    throw new Error("فشل في جلب المنتجات حسب الفئة")
  }
}

// جلب المنتجات الشائعة
export async function getPopularProducts(): Promise<GiftProduct[]> {
  try {
    const products = await prisma.giftProduct.findMany({
      where: { popular: true }
    })
    return products
  } catch (error) {
    console.error("Error fetching popular products:", error)
    throw new Error("فشل في جلب المنتجات الشائعة")
  }
}

// جلب منتج واحد حسب المعرف
export async function getProductById(id: string): Promise<GiftProduct | null> {
  try {
    const product = await prisma.giftProduct.findUnique({
      where: { id }
    })
    return product
  } catch (error) {
    console.error("Error fetching product by id:", error)
    throw new Error("فشل في جلب المنتج")
  }
}

// جلب عدة منتجات حسب قائمة المعرفات
export async function getGiftProductsByIds(ids: string[]): Promise<GiftProduct[]> {
  try {
    if (!ids || ids.length === 0) return [];
    const products = await prisma.giftProduct.findMany({
      where: { id: { in: ids } }
    })
    return products;
  } catch (error) {
    console.error("Error fetching products by ids:", error);
    throw new Error("فشل في جلب المنتجات حسب المعرفات");
  }
}

// تحديث مخزون المنتج
export async function updateProductStock(id: string, newStock: number): Promise<void> {
  try {
    await prisma.giftProduct.update({
      where: { id },
      data: { stock: newStock }
    })
    revalidatePath("/")
  } catch (error) {
    console.error("Error updating product stock:", error)
    throw new Error("فشل في تحديث مخزون المنتج")
  }
}

// البحث عن المنتجات
export async function searchProducts(searchTerm: string): Promise<GiftProduct[]> {
  try {
    const products = await prisma.giftProduct.findMany({
      where: {
        name: {
          contains: searchTerm,
          mode: 'insensitive'
        }
      }
    })
    return products
  } catch (error) {
    console.error("Error searching products:", error)
    throw new Error("فشل في البحث عن المنتجات")
  }
}

// فلترة المنتجات حسب النكهة والمناسبة
export async function filterProducts(filters: {
  category?: string
  flavor?: string[]
  occasion?: string
  inStock?: boolean
}): Promise<GiftProduct[]> {
  try {
    const whereClause: Record<string, unknown> = {}

    if (filters.category && filters.category !== "الكل") {
      whereClause.category = filters.category
    }

    if (filters.flavor && filters.flavor.length > 0) {
      whereClause.colors = { hasSome: filters.flavor }
    }

    if (filters.occasion && filters.occasion !== "all") {
      whereClause.occasion = { has: filters.occasion }
    }

    if (filters.inStock) {
      whereClause.stock = { gt: 0 }
    }

    const products = await prisma.giftProduct.findMany({
      where: whereClause
    })
    return products
  } catch (error) {
    console.error("Error filtering products:", error)
    throw new Error("فشل في فلترة المنتجات")
  }
}
