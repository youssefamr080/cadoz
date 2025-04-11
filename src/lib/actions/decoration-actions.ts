"use server"

import { getDecorationsCollection } from "@/lib/gift-db-helpers"
import type { Decoration, DecorationDocument } from "@/types/database"
import { ObjectId } from "mongodb"
import { revalidatePath } from "next/cache"

// تحويل كائن المستند من MongoDB إلى النوع المستخدم في الواجهة
function mapDecorationDocument(doc: DecorationDocument): Decoration {
  return {
    id: doc._id.toString(),
    name: doc.name,
    price: doc.price,
    image: doc.image,
    stock: doc.stock,
  }
}

// جلب جميع الزينة
export async function getAllDecorations(): Promise<Decoration[]> {
  try {
    const collection = await getDecorationsCollection()
    const decorations = await collection.find({}).toArray()
    return decorations.map(mapDecorationDocument)
  } catch (error) {
    console.error("Error fetching decorations:", error)
    throw new Error("فشل في جلب الزينة")
  }
}

// جلب الزينة المتوفرة في المخزون
export async function getAvailableDecorations(): Promise<Decoration[]> {
  try {
    const collection = await getDecorationsCollection()
    const decorations = await collection.find({ stock: { $gt: 0 } }).toArray()
    return decorations.map(mapDecorationDocument)
  } catch (error) {
    console.error("Error fetching available decorations:", error)
    throw new Error("فشل في جلب الزينة المتوفرة")
  }
}

// جلب زينة واحدة حسب المعرف
export async function getDecorationById(id: string): Promise<Decoration | null> {
  try {
    const collection = await getDecorationsCollection()
    const decoration = await collection.findOne({ _id: new ObjectId(id) })
    return decoration ? mapDecorationDocument(decoration) : null
  } catch (error) {
    console.error("Error fetching decoration by id:", error)
    throw new Error("فشل في جلب الزينة")
  }
}

// تحديث مخزون الزينة
export async function updateDecorationStock(id: string, newStock: number): Promise<void> {
  try {
    const collection = await getDecorationsCollection()
    await collection.updateOne({ _id: new ObjectId(id) }, { $set: { stock: newStock } })
    revalidatePath("/")
  } catch (error) {
    console.error("Error updating decoration stock:", error)
    throw new Error("فشل في تحديث مخزون الزينة")
  }
}
