"use server"

import { prisma } from "@/lib/prisma"
import type { Box } from "@/types/database"
import { convertPrismaBoxToBox } from "@/types/database"
import { revalidatePath } from "next/cache"

// جلب جميع الصناديق
export async function getAllBoxes(): Promise<Box[]> {
  try {
    const boxes = await prisma.box.findMany({
      where: {
        stock: {
          gt: 0
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    // تحويل التواريخ إلى strings لتجنب مشاكل serialization في Redux
    return boxes.map(convertPrismaBoxToBox)
  } catch (error) {
    console.error("Error fetching boxes:", error)
    throw new Error("فشل في جلب الصناديق")
  }
}

// جلب الصناديق حسب الفئة (ملاحظة: Box لا يحتوي على category حالياً)
export async function getBoxesByCategory(): Promise<Box[]> {
  try {
    // جلب الصناديق المتاحة في المخزون فقط
    const boxes = await prisma.box.findMany({
      where: {
        stock: {
          gt: 0
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    // تحويل التواريخ إلى strings
    return boxes.map(convertPrismaBoxToBox)
  } catch (error) {
    console.error("Error fetching boxes by category:", error)
    throw new Error("فشل في جلب الصناديق حسب الفئة")
  }
}

// جلب صندوق واحد حسب المعرف
export async function getBoxById(id: string): Promise<Box | null> {
  try {
    const box = await prisma.box.findUnique({
      where: { id }
    })
    
    if (!box) return null
    
    // تحويل التواريخ إلى strings
    return convertPrismaBoxToBox(box)
  } catch (error) {
    console.error("Error fetching box by id:", error)
    throw new Error("فشل في جلب الصندوق")
  }
}

// جلب عدة صناديق حسب قائمة المعرفات
export async function getBoxesByIds(ids: string[]): Promise<Box[]> {
  try {
    if (!ids || ids.length === 0) return [];
    const boxes = await prisma.box.findMany({
      where: { id: { in: ids } }
    })
    
    // تحويل التواريخ إلى strings
    return boxes.map(convertPrismaBoxToBox);
  } catch (error) {
    console.error("Error fetching boxes by ids:", error);
    throw new Error("فشل في جلب الصناديق حسب المعرفات");
  }
}

// تحديث مخزون الصندوق
export async function updateBoxStock(id: string, newStock: number): Promise<void> {
  try {
    await prisma.box.update({
      where: { id },
      data: { stock: newStock }
    })
    revalidatePath("/") // إعادة التحقق من البيانات في الصفحات التي تستخدم هذه البيانات
  } catch (error) {
    console.error("Error updating box stock:", error)
    throw new Error("فشل في تحديث مخزون الصندوق")
  }
}
