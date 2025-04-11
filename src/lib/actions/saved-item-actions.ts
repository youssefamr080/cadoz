"use server"

import { getSavedItemsCollection } from "@/lib/gift-db-helpers"
import type { SavedItem } from "@/types/database"
import { ObjectId } from "mongodb"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"

// الحصول على معرف المستخدم من الكوكيز أو إنشاء واحد جديد
export async function getUserId(): Promise<string> {
    const cookieStore = await cookies() // استخدم await هنا
  
    const userId = cookieStore.get("userId")?.value
  
    if (!userId) {
      const newUserId = uuidv4()
      await cookieStore.set("userId", newUserId, { // استخدم await هنا أيضًا
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
    const collection = await getSavedItemsCollection()

    const savedItemsDoc = await collection.findOne({ userId })

    if (!savedItemsDoc) {
      return []
    }

    return savedItemsDoc.items
  } catch (error) {
    console.error("Error fetching saved items:", error)
    throw new Error("فشل في جلب العناصر المحفوظة")
  }
}

// إضافة عنصر محفوظ
export async function addSavedItem(item: SavedItem): Promise<void> {
  try {
    const userId = await getUserId()
    const collection = await getSavedItemsCollection()

    const savedItemsDoc = await collection.findOne({ userId })

    if (!savedItemsDoc) {
      // إنشاء وثيقة جديدة للمستخدم
      await collection.insertOne({
        _id: new ObjectId(),
        userId,
        items: [item],
      })
    } else {
      // التأكد من عدم وجود العنصر بالفعل
      const itemExists = savedItemsDoc.items.some((i) => i.id === item.id)

      if (!itemExists) {
        // إضافة العنصر الجديد في بداية المصفوفة
        const newItems = [item, ...savedItemsDoc.items].slice(0, 3) // الاحتفاظ بـ 3 عناصر فقط

        await collection.updateOne({ userId }, { $set: { items: newItems } })
      }
    }

    revalidatePath("/")
  } catch (error) {
    console.error("Error adding saved item:", error)
    throw new Error("فشل في إضافة العنصر المحفوظ")
  }
}

// حذف عنصر محفوظ
export async function removeSavedItem(itemId: string): Promise<void> {
  try {
    const userId = await getUserId()
    const collection = await getSavedItemsCollection()

    await collection.updateOne({ userId }, { $pull: { items: { id: itemId } } })

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
    const collection = await getSavedItemsCollection()

    await collection.updateOne({ userId }, { $set: { items: [] } })

    revalidatePath("/")
  } catch (error) {
    console.error("Error clearing saved items:", error)
    throw new Error("فشل في حذف جميع العناصر المحفوظة")
  }
}
