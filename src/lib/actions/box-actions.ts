"use server"

import { getBoxesCollection } from "@/lib/gift-db-helpers"
import type { Box, BoxDocument } from "@/types/database"
import { ObjectId } from "mongodb"
import { revalidatePath } from "next/cache"

// تحويل كائن المستند من MongoDB إلى النوع المستخدم في الواجهة
function mapBoxDocument(doc: BoxDocument): Box {
  return {
    id: doc._id.toString(),
    name: doc.name,
    price: doc.price,
    dimensions: doc.dimensions,
    description: doc.description,
    image: doc.image,
    category: doc.category,
    stock: doc.stock,
  }
}

// جلب جميع الصناديق
export async function getAllBoxes(): Promise<Box[]> {
  try {
    const collection = await getBoxesCollection()
    const boxes = await collection.find({}).toArray()
    return boxes.map(mapBoxDocument)
  } catch (error) {
    console.error("Error fetching boxes:", error)
    throw new Error("فشل في جلب الصناديق")
  }
}

// جلب الصناديق حسب الفئة
export async function getBoxesByCategory(category: string): Promise<Box[]> {
  try {
    const collection = await getBoxesCollection()
    const boxes = await collection.find({ category }).toArray()
    return boxes.map(mapBoxDocument)
  } catch (error) {
    console.error("Error fetching boxes by category:", error)
    throw new Error("فشل في جلب الصناديق حسب الفئة")
  }
}

// جلب صندوق واحد حسب المعرف
export async function getBoxById(id: string): Promise<Box | null> {
  try {
    const collection = await getBoxesCollection()
    const box = await collection.findOne({ _id: new ObjectId(id) })
    return box ? mapBoxDocument(box) : null
  } catch (error) {
    console.error("Error fetching box by id:", error)
    throw new Error("فشل في جلب الصندوق")
  }
}

// تحديث مخزون الصندوق
export async function updateBoxStock(id: string, newStock: number): Promise<void> {
  try {
    const collection = await getBoxesCollection()
    await collection.updateOne({ _id: new ObjectId(id) }, { $set: { stock: newStock } })
    revalidatePath("/") // إعادة التحقق من البيانات في الصفحات التي تستخدم هذه البيانات
  } catch (error) {
    console.error("Error updating box stock:", error)
    throw new Error("فشل في تحديث مخزون الصندوق")
  }
}
