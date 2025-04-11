"use server"

import { getCustomGiftsCollection } from "@/lib/gift-db-helpers"
import type { CustomGift, CustomGiftDocument } from "@/types/database"
import { ObjectId } from "mongodb"

// تحويل كائن المستند من MongoDB إلى النوع المستخدم في الواجهة
function mapCustomGiftDocument(doc: CustomGiftDocument): CustomGift {
  return {
    id: doc._id.toString(),
    name: doc.name,
    description: doc.description,
    price: doc.price,
    image: doc.image,
    category: doc.category,
  }
}

// جلب جميع الهدايا المخصصة
export async function getAllCustomGifts(): Promise<CustomGift[]> {
  try {
    const collection = await getCustomGiftsCollection()
    const customGifts = await collection.find({}).toArray()
    return customGifts.map(mapCustomGiftDocument)
  } catch (error) {
    console.error("Error fetching custom gifts:", error)
    throw new Error("فشل في جلب الهدايا المخصصة")
  }
}

// جلب الهدايا المخصصة حسب الفئة
export async function getCustomGiftsByCategory(category: string): Promise<CustomGift[]> {
  try {
    const collection = await getCustomGiftsCollection()
    const customGifts =
      category === "all" ? await collection.find({}).toArray() : await collection.find({ category }).toArray()
    return customGifts.map(mapCustomGiftDocument)
  } catch (error) {
    console.error("Error fetching custom gifts by category:", error)
    throw new Error("فشل في جلب الهدايا المخصصة حسب الفئة")
  }
}

// جلب هدية مخصصة واحدة حسب المعرف
export async function getCustomGiftById(id: string): Promise<CustomGift | null> {
  try {
    const collection = await getCustomGiftsCollection()
    const customGift = await collection.findOne({ _id: new ObjectId(id) })
    return customGift ? mapCustomGiftDocument(customGift) : null
  } catch (error) {
    console.error("Error fetching custom gift by id:", error)
    throw new Error("فشل في جلب الهدية المخصصة")
  }
}
