"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import type { InspirationBag } from "@/../prisma/generated/client"

// جلب جميع الشنط
export async function getAllBags(): Promise<InspirationBag[]> {
  try {
    const bags = await prisma.inspirationBag.findMany({
      include: {
        inspiration: true
      }
    })
    return bags
  } catch (error) {
    console.error("Error fetching bags:", error)
    throw new Error("فشل في جلب الشنط")
  }
}

// جلب الشنط المتوفرة في المخزون
export async function getAvailableBags(): Promise<InspirationBag[]> {
  try {
    const bags = await prisma.inspirationBag.findMany({
      where: {
        stock: {
          gt: 0
        }
      },
      include: {
        inspiration: true
      }
    })
    return bags
  } catch (error) {
    console.error("Error fetching available bags:", error)
    throw new Error("فشل في جلب الشنط المتوفرة")
  }
}

// جلب شنطة واحدة حسب المعرف
export async function getBagById(id: string): Promise<InspirationBag | null> {
  try {
    // التحقق من صحة تنسيق ObjectId
    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      return null
    }

    const bag = await prisma.inspirationBag.findUnique({
      where: { id },
      include: {
        inspiration: true
      }
    })
    return bag  } catch (error) {
    console.error("Error fetching bag by id:", error)
    throw new Error("فشل في جلب الشنطة")
  }
}

// جلب عدة شنط حسب قائمة المعرفات
export async function getBagsByIds(ids: string[]): Promise<InspirationBag[]> {
  try {
    if (!ids || ids.length === 0) return [];
    
    // التحقق من صحة تنسيق المعرفات
    const validIds = ids.filter(id => /^[a-fA-F0-9]{24}$/.test(id));
    
    const bags = await prisma.inspirationBag.findMany({
      where: {
        id: { in: validIds }
      },
      include: {
        inspiration: true
      }
    });
    
    return bags;
  } catch (error) {
    console.error("Error fetching bags by ids:", error);
    throw new Error("فشل في جلب الشنط حسب المعرفات");
  }
}

// تحديث مخزون الشنطة
export async function updateBagStock(id: string, newStock: number): Promise<void> {
  try {
    // التحقق من صحة تنسيق ObjectId
    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      throw new Error("معرف غير صحيح")
    }

    await prisma.inspirationBag.update({
      where: { id },
      data: { stock: newStock }
    })
    
    revalidatePath("/")
  } catch (error) {
    console.error("Error updating bag stock:", error)
    throw new Error("فشل في تحديث مخزون الشنطة")
  }
}
