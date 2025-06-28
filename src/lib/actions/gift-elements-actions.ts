"use server"

import { prisma } from "@/lib/prisma"
import type { Sweet, Box, Bag } from "../../../prisma/generated/client"

// ================ SWEETS ACTIONS ================

// جلب جميع الحلويات
export async function getAllSweets(): Promise<Sweet[]> {
  try {
    return await prisma.sweet.findMany({
      where: { stock: { gt: 0 } }, // فقط المتوفرة في المخزون
      orderBy: { name: 'asc' }
    })
  } catch (error) {
    console.error("Error fetching sweets:", error)
    throw new Error("فشل في جلب الحلويات")
  }
}

// جلب الحلويات حسب الفئة
export async function getSweetsByCategory(category: string): Promise<Sweet[]> {
  try {
    return await prisma.sweet.findMany({
      where: { 
        category,
        stock: { gt: 0 }
      },
      orderBy: { name: 'asc' }
    })
  } catch (error) {
    console.error("Error fetching sweets by category:", error)
    throw new Error("فشل في جلب الحلويات")
  }
}

// جلب حلوى واحدة
export async function getSweetById(id: string): Promise<Sweet | null> {
  try {
    return await prisma.sweet.findUnique({
      where: { id }
    })
  } catch (error) {
    console.error("Error fetching sweet by id:", error)
    throw new Error("فشل في جلب الحلوى")
  }
}

// إنشاء حلوى جديدة
export async function createSweet(data: {
  name: string
  price: number
  old_price?: number
  category: string
  image?: string
  stock: number
}) {
  try {
    return await prisma.sweet.create({
      data
    })
  } catch (error) {
    console.error("Error creating sweet:", error)
    throw new Error("فشل في إنشاء الحلوى")
  }
}

// تحديث حلوى
export async function updateSweet(id: string, data: Partial<{
  name: string
  price: number
  old_price: number
  category: string
  image: string
  stock: number
}>) {
  try {
    return await prisma.sweet.update({
      where: { id },
      data
    })
  } catch (error) {
    console.error("Error updating sweet:", error)
    throw new Error("فشل في تحديث الحلوى")
  }
}

// ================ BOXES ACTIONS ================

// جلب جميع الصناديق
export async function getAllBoxes(): Promise<Box[]> {
  try {
    return await prisma.box.findMany({
      where: { stock: { gt: 0 } },
      orderBy: { name: 'asc' }
    })
  } catch (error) {
    console.error("Error fetching boxes:", error)
    throw new Error("فشل في جلب الصناديق")
  }
}

// جلب صندوق واحد
export async function getBoxById(id: string): Promise<Box | null> {
  try {
    return await prisma.box.findUnique({
      where: { id }
    })
  } catch (error) {
    console.error("Error fetching box by id:", error)
    throw new Error("فشل في جلب الصندوق")
  }
}

// إنشاء صندوق جديد
export async function createBox(data: {
  name: string
  description?: string
  price: number
  image?: string
  stock: number
  dimensions?: string
}) {
  try {
    return await prisma.box.create({
      data
    })
  } catch (error) {
    console.error("Error creating box:", error)
    throw new Error("فشل في إنشاء الصندوق")
  }
}

// تحديث صندوق
export async function updateBox(id: string, data: Partial<{
  name: string
  description: string
  price: number
  image: string
  stock: number
  dimensions: string
}>) {
  try {
    return await prisma.box.update({
      where: { id },
      data
    })
  } catch (error) {
    console.error("Error updating box:", error)
    throw new Error("فشل في تحديث الصندوق")
  }
}

// ================ BAGS ACTIONS ================

// جلب جميع الشنط
export async function getAllBags(): Promise<Bag[]> {
  try {
    return await prisma.bag.findMany({
      where: { stock: { gt: 0 } },
      orderBy: { name: 'asc' }
    })
  } catch (error) {
    console.error("Error fetching bags:", error)
    throw new Error("فشل في جلب الشنط")
  }
}

// جلب شنطة واحدة
export async function getBagById(id: string): Promise<Bag | null> {
  try {
    return await prisma.bag.findUnique({
      where: { id }
    })
  } catch (error) {
    console.error("Error fetching bag by id:", error)
    throw new Error("فشل في جلب الشنطة")
  }
}

// إنشاء شنطة جديدة
export async function createBag(data: {
  name: string
  description?: string
  price: number
  image?: string
  stock: number
}) {
  try {
    return await prisma.bag.create({
      data
    })
  } catch (error) {
    console.error("Error creating bag:", error)
    throw new Error("فشل في إنشاء الشنطة")
  }
}

// تحديث شنطة
export async function updateBag(id: string, data: Partial<{
  name: string
  description: string
  price: number
  image: string
  stock: number
}>) {
  try {
    return await prisma.bag.update({
      where: { id },
      data
    })
  } catch (error) {
    console.error("Error updating bag:", error)
    throw new Error("فشل في تحديث الشنطة")
  }
}

// ================ COMBINED ACTIONS ================

// جلب جميع عناصر الهدايا (للاستخدام في بناء الهدايا المخصصة)
export async function getAllGiftElements() {
  try {
    const [sweets, boxes, bags] = await Promise.all([
      getAllSweets(),
      getAllBoxes(),
      getAllBags()
    ])

    return {
      sweets,
      boxes,
      bags
    }
  } catch (error) {
    console.error("Error fetching all gift elements:", error)
    throw new Error("فشل في جلب عناصر الهدايا")
  }
}

// البحث في جميع العناصر
export async function searchGiftElements(query: string) {
  try {
    const searchQuery = {
      contains: query,
      mode: 'insensitive' as const
    }

    const [sweets, boxes, bags] = await Promise.all([
      prisma.sweet.findMany({
        where: {
          OR: [
            { name: searchQuery },
            { category: searchQuery }
          ],
          stock: { gt: 0 }
        }
      }),
      prisma.box.findMany({
        where: {
          OR: [
            { name: searchQuery },
            { description: searchQuery }
          ],
          stock: { gt: 0 }
        }
      }),
      prisma.bag.findMany({
        where: {
          OR: [
            { name: searchQuery },
            { description: searchQuery }
          ],
          stock: { gt: 0 }
        }
      })
    ])

    return {
      sweets,
      boxes,
      bags
    }
  } catch (error) {
    console.error("Error searching gift elements:", error)
    throw new Error("فشل في البحث عن عناصر الهدايا")
  }
}
