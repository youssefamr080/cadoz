"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import type { Bag } from "@/types/database"
import { convertPrismaBagToBag } from "@/types/database"

// جلب جميع الشنط
export async function getAllBags(): Promise<Bag[]> {
  try {
    const bags = await prisma.bag.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    // تحويل التواريخ إلى strings لتجنب مشاكل serialization في Redux
    return bags.map(convertPrismaBagToBag)
  } catch (error) {
    console.error("Error fetching bags:", error)
    throw new Error("فشل في جلب الشنط")
  }
}

// جلب الشنط المتوفرة في المخزون
export async function getAvailableBags(): Promise<Bag[]> {
  try {
    const bags = await prisma.bag.findMany({
      where: {
        stock: {
          gt: 0
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return bags.map(convertPrismaBagToBag)
  } catch (error) {
    console.error("Error fetching available bags:", error)
    throw new Error("فشل في جلب الشنط المتوفرة")
  }
}

// جلب شنطة واحدة حسب المعرف
export async function getBagById(id: string): Promise<Bag | null> {
  try {
    // التحقق من صحة تنسيق ObjectId
    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      return null
    }

    const bag = await prisma.bag.findUnique({
      where: {
        id: id
      }
    })
    
    if (!bag) return null
    
    return convertPrismaBagToBag(bag)
  } catch (error) {
    console.error("Error fetching bag by ID:", error)
    throw new Error("فشل في جلب الشنطة")
  }
}

// جلب عدة شنط حسب قائمة المعرفات
export async function getBagsByIds(ids: string[]): Promise<Bag[]> {
  try {
    if (!ids || ids.length === 0) return [];
    
    // التحقق من صحة تنسيق المعرفات
    const validIds = ids.filter(id => /^[a-fA-F0-9]{24}$/.test(id));
    
    const bags = await prisma.bag.findMany({
      where: {
        id: { in: validIds }
      }
    });
    
    return bags.map(convertPrismaBagToBag);
  } catch (error) {
    console.error("Error fetching bags by IDs:", error)
    throw new Error("فشل في جلب الشنط")
  }
}

// تحديث مخزون شنطة
export async function updateBagStock(bagId: string, quantityUsed: number): Promise<void> {
  try {
    await prisma.bag.update({
      where: { id: bagId },
      data: {
        stock: {
          decrement: quantityUsed
        }
      }
    })
    
    revalidatePath("/")
  } catch (error) {
    console.error("Error updating bag stock:", error)
    throw new Error("فشل في تحديث مخزون الشنطة")
  }
}
