"use server"

import { prisma } from "@/lib/prisma"
import type { CustomGift } from "../../../prisma/generated/client"

// جلب جميع الهدايا المخصصة
export async function getAllCustomGifts(): Promise<CustomGift[]> {
  try {
    const customGifts = await prisma.customGift.findMany()
    return customGifts
  } catch (error) {
    console.error("Error fetching custom gifts:", error)
    throw new Error("فشل في جلب الهدايا المخصصة")
  }
}

// جلب الهدايا المخصصة حسب الفئة
export async function getCustomGiftsByCategory(category: string): Promise<CustomGift[]> {
  try {
    const customGifts = category === "all" 
      ? await prisma.customGift.findMany()
      : await prisma.customGift.findMany({ where: { category } })
    return customGifts
  } catch (error) {
    console.error("Error fetching custom gifts by category:", error)
    throw new Error("فشل في جلب الهدايا المخصصة حسب الفئة")
  }
}

// جلب هدية مخصصة واحدة حسب المعرف
export async function getCustomGiftById(id: string): Promise<CustomGift | null> {
  try {
    const customGift = await prisma.customGift.findUnique({
      where: { id }
    })
    return customGift
  } catch (error) {
    console.error("Error fetching custom gift by id:", error)
    throw new Error("فشل في جلب الهدية المخصصة")
  }
}
