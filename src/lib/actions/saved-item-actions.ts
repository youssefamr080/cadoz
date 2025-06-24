"use server"

import { prisma } from "@/lib/prisma"
import type { SavedItem } from "../../../prisma/generated/client"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"

// الحصول على معرف المستخدم من الكوكيز أو إنشاء واحد جديد
export async function getUserId(): Promise<string> {
    const cookieStore = await cookies()
  
    const userId = cookieStore.get("userId")?.value
  
    if (!userId) {
      const newUserId = uuidv4()
      await cookieStore.set("userId", newUserId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 365, // سنة
        path: "/",
      })
      return newUserId
    }
  
    return userId
}

// جلب العناصر المحفوظة للمستخدم
export async function getSavedItems(): Promise<SavedItem[]> {
  try {
    const userId = await getUserId()

    const savedItems = await prisma.savedItem.findMany({
      where: { userId }
    })

    return savedItems
  } catch (error) {
    console.error("Error fetching saved items:", error)
    throw new Error("فشل في جلب العناصر المحفوظة")
  }
}

// إضافة عنصر محفوظ
export async function addSavedItem(item: {
  productId: string
  type: string
  name: string
  price: number
  image?: string
}): Promise<SavedItem> {
  try {
    const userId = await getUserId()

    // التأكد من عدم وجود العنصر بالفعل
    const existingItem = await prisma.savedItem.findUnique({
      where: {
        userId_productId_type: {
          userId,
          productId: item.productId,
          type: item.type
        }
      }
    })

    if (existingItem) {
      return existingItem
    }

    const newItem = await prisma.savedItem.create({
      data: {
        userId,
        productId: item.productId,
        type: item.type,
        name: item.name,
        price: item.price,
        image: item.image
      }
    })

    revalidatePath("/")
    return newItem
  } catch (error) {
    console.error("Error adding saved item:", error)
    throw new Error("فشل في إضافة العنصر المحفوظ")
  }
}

// حذف عنصر محفوظ
export async function removeSavedItem(itemId: string): Promise<void> {
  try {
    await prisma.savedItem.delete({
      where: { id: itemId }
    })

    revalidatePath("/")
  } catch (error) {
    console.error("Error removing saved item:", error)
    throw new Error("فشل في حذف العنصر المحفوظ")
  }
}

// حذف جميع العناصر المحفوظة
export async function clearSavedItems(): Promise<void> {
  try {
    const userId = await getUserId()

    await prisma.savedItem.deleteMany({
      where: { userId }
    })

    revalidatePath("/")
  } catch (error) {
    console.error("Error clearing saved items:", error)
    throw new Error("فشل في حذف جميع العناصر المحفوظة")
  }
}
