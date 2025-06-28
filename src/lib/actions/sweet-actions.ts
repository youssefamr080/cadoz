"use server"

import { prisma } from "@/lib/prisma"
import type { Sweet } from "@/types/database"
import { convertPrismaSweetToSweet } from "@/types/database"

// جلب جميع الحلويات
export async function getAllSweets(): Promise<Sweet[]> {
  try {
    const sweets = await prisma.sweet.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    // تحويل التواريخ إلى strings لتجنب مشاكل serialization في Redux
    return sweets.map(convertPrismaSweetToSweet)
  } catch (error) {
    console.error("Error fetching sweets:", error)
    throw new Error("فشل في جلب الحلويات")
  }
}

// جلب الحلويات المتاحة (في المخزون)
export async function getAvailableSweets(): Promise<Sweet[]> {
  try {
    const sweets = await prisma.sweet.findMany({
      where: { stock: { gt: 0 } },
      orderBy: { createdAt: 'desc' }
    })
    
    // تحويل التواريخ إلى strings لتجنب مشاكل serialization في Redux
    return sweets.map(convertPrismaSweetToSweet)
  } catch (error) {
    console.error("Error fetching available sweets:", error)
    throw new Error("فشل في جلب الحلويات المتاحة")
  }
}

// جلب حلوى واحدة حسب المعرف
export async function getSweetById(id: string): Promise<Sweet | null> {
  try {
    const sweet = await prisma.sweet.findUnique({
      where: { id }
    })
    
    if (!sweet) return null
    
    // تحويل التواريخ إلى strings
    return convertPrismaSweetToSweet(sweet)
  } catch (error) {
    console.error("Error fetching sweet by id:", error)
    throw new Error("فشل في جلب الحلوى")
  }
}

// جلب حلويات متعددة حسب المعرفات
export async function getSweetsByIds(ids: string[]): Promise<Sweet[]> {
  try {
    const sweets = await prisma.sweet.findMany({
      where: {
        id: { in: ids }
      }
    })
    
    // تحويل التواريخ إلى strings
    return sweets.map(convertPrismaSweetToSweet)
  } catch (error) {
    console.error("Error fetching sweets by ids:", error)
    throw new Error("فشل في جلب الحلويات")
  }
}

// البحث في الحلويات
export async function searchSweets(query: string): Promise<Sweet[]> {
  try {
    const sweets = await prisma.sweet.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
        ]
      },
      orderBy: { createdAt: 'desc' }
    })
    
    // تحويل التواريخ إلى strings
    return sweets.map(convertPrismaSweetToSweet)
  } catch (error) {
    console.error("Error searching sweets:", error)
    throw new Error("فشل في البحث عن الحلويات")
  }
}
