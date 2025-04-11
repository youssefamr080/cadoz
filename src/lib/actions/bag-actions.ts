"use server"

import { revalidatePath } from "next/cache"
import { getBagsCollection } from "@/lib/gift-db-helpers"
import type { Bag, BagDocument } from "@/types/database"
import { ObjectId } from "mongodb"

// تحويل كائن المستند من MongoDB إلى النوع المستخدم في الواجهة
function mapBagDocument(doc: BagDocument): Bag {
  return {
    id: doc._id.toString(),
    name: doc.name,
    price: doc.price,
    image: doc.image,
    description: doc.description,
    color: doc.color,
    stock: doc.stock,
  }
}

// جلب جميع الشنط
export async function getAllBags(): Promise<Bag[]> {
  try {
    const collection = await getBagsCollection()
    const bags = await collection.find({}).toArray()
    return bags.map(mapBagDocument)
  } catch (error) {
    console.error("Error fetching bags:", error)
    throw new Error("فشل في جلب الشنط")
  }
}

// جلب الشنط المتوفرة في المخزون
export async function getAvailableBags(): Promise<Bag[]> {
  try {
    const collection = await getBagsCollection()
    const bags = await collection.find({ stock: { $gt: 0 } }).toArray()
    return bags.map(mapBagDocument)
  } catch (error) {
    console.error("Error fetching available bags:", error)
    throw new Error("فشل في جلب الشنط المتوفرة")
  }
}

// جلب شنطة واحدة حسب المعرف
export async function getBagById(id: string): Promise<Bag | null> {
  try {
    const collection = await getBagsCollection()
    const bag = await collection.findOne({ _id: new ObjectId(id) })
    return bag ? mapBagDocument(bag) : null
  } catch (error) {
    console.error("Error fetching bag by id:", error)
    throw new Error("فشل في جلب الشنطة")
  }
}

// تحديث مخزون الشنطة
export async function updateBagStock(id: string, newStock: number): Promise<void> {
  try {
    const collection = await getBagsCollection()
    await collection.updateOne({ _id: new ObjectId(id) }, { $set: { stock: newStock } })
    revalidatePath("/")
  } catch (error) {
    console.error("Error updating bag stock:", error)
    throw new Error("فشل في تحديث مخزون الشنطة")
  }
}
