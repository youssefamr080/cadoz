"use server"

import { prisma } from "@/lib/prisma"
import type { MainProduct } from "../../../prisma/generated/client"

// جلب جميع المنتجات الأساسية
export async function getAllMainProducts(): Promise<MainProduct[]> {
  try {
    const products = await prisma.mainProduct.findMany()
    return products
  } catch (error) {
    console.error("Error fetching main products:", error)
    throw new Error("فشل في جلب المنتجات الأساسية")
  }
}

// جلب المنتجات الأساسية حسب الفئة
export async function getMainProductsByCategory(category: string): Promise<MainProduct[]> {
  try {
    const products = await prisma.mainProduct.findMany({
      where: { category }
    })
    return products
  } catch (error) {
    console.error("Error fetching main products by category:", error)
    throw new Error("فشل في جلب المنتجات الأساسية حسب الفئة")
  }
}

// جلب منتج أساسي واحد حسب المعرف
export async function getMainProductById(id: string): Promise<MainProduct | null> {
  try {
    const product = await prisma.mainProduct.findUnique({
      where: { id }
    })
    return product
  } catch (error) {
    console.error("Error fetching main product:", error)
    throw new Error("فشل في جلب المنتج الأساسي")
  }
}

// جلب عدة منتجات أساسية حسب قائمة المعرفات
export async function getMainProductsByIds(ids: string[]): Promise<MainProduct[]> {
  try {
    if (!ids || ids.length === 0) return []
    
    const products = await prisma.mainProduct.findMany({
      where: { id: { in: ids } }
    })
    
    return products
  } catch (error) {
    console.error("Error fetching main products by ids:", error)
    throw new Error("فشل في جلب المنتجات الأساسية حسب المعرفات")
  }
}

// البحث عن المنتجات الأساسية
export async function searchMainProducts(searchTerm: string): Promise<MainProduct[]> {
  try {
    const products = await prisma.mainProduct.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
          { category: { contains: searchTerm, mode: 'insensitive' } }
        ]
      }
    })
    return products
  } catch (error) {
    console.error("Error searching main products:", error)
    throw new Error("فشل في البحث عن المنتجات الأساسية")
  }
}
