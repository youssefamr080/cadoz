"use server"

import { prisma } from "@/lib/prisma"
import type { Decoration } from "../../../prisma/generated/client"
import { revalidatePath } from "next/cache"

// جلب جميع الزينة
export async function getAllDecorations(): Promise<Decoration[]> {
  try {
    const decorations = await prisma.decoration.findMany()
    return decorations
  } catch (error) {
    console.error("Error fetching decorations:", error)
    throw new Error("فشل في جلب الزينة")
  }
}

// جلب الزينة المتوفرة في المخزون
export async function getAvailableDecorations(): Promise<Decoration[]> {
  try {
    const decorations = await prisma.decoration.findMany({
      where: { stock: { gt: 0 } }
    })
    return decorations
  } catch (error) {
    console.error("Error fetching available decorations:", error)
    throw new Error("فشل في جلب الزينة المتوفرة")
  }
}

// جلب زينة واحدة حسب المعرف
export async function getDecorationById(id: string): Promise<Decoration | null> {
  try {
    const decoration = await prisma.decoration.findUnique({
      where: { id }
    })
    return decoration
  } catch (error) {
    console.error("Error fetching decoration by id:", error)
    throw new Error("فشل في جلب الزينة")
  }
}

// جلب عدة زينة حسب قائمة المعرفات
export async function getDecorationsByIds(ids: string[]): Promise<Decoration[]> {
  try {
    if (!ids || ids.length === 0) return [];
    const decorations = await prisma.decoration.findMany({
      where: { id: { in: ids } }
    })
    return decorations;
  } catch (error) {
    console.error("Error fetching decorations by ids:", error);
    throw new Error("فشل في جلب الزينة حسب المعرفات");
  }
}

// تحديث مخزون الزينة
export async function updateDecorationStock(id: string, newStock: number): Promise<void> {
  try {
    await prisma.decoration.update({
      where: { id },
      data: { stock: newStock }
    })
    revalidatePath("/")
  } catch (error) {
    console.error("Error updating decoration stock:", error)
    throw new Error("فشل في تحديث مخزون الزينة")
  }
}
