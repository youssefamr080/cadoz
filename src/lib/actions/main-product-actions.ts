"use server"

import { getMainProductsCollection } from "@/lib/gift-db-helpers"
import type { MainProductDocument } from "@/types/database"
import { ObjectId } from "mongodb"

// تحويل كائن المستند من MongoDB إلى النوع المستخدم في الواجهة
function mapMainProductDocument(doc: MainProductDocument) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    price: doc.price,
    image: doc.image,
    description: doc.description,
    category: doc.category
  }
}

// جلب جميع المنتجات الأساسية
export async function getAllMainProducts() {
  try {
    const collection = await getMainProductsCollection()
    const products = await collection.find({}).toArray()
    return products.map(mapMainProductDocument)
  } catch (error) {
    console.error("Error fetching main products:", error)
    throw new Error("فشل في جلب المنتجات الأساسية")
  }
}

// جلب المنتجات الأساسية حسب الفئة
export async function getMainProductsByCategory(category: string) {
  try {
    const collection = await getMainProductsCollection()
    const products = await collection.find({ category }).toArray()
    return products.map(mapMainProductDocument)
  } catch (error) {
    console.error("Error fetching main products by category:", error)
    throw new Error("فشل في جلب المنتجات الأساسية حسب الفئة")
  }
}

// جلب منتج أساسي واحد حسب المعرف
export async function getMainProductById(id: string) {
  try {
    const collection = await getMainProductsCollection()
    const product = await collection.findOne({ _id: new ObjectId(id) })
    if (!product) return null
    return mapMainProductDocument(product)
  } catch (error) {
    console.error("Error fetching main product:", error)
    throw new Error("فشل في جلب المنتج الأساسي")
  }
}

// جلب عدة منتجات أساسية حسب قائمة المعرفات
export async function getMainProductsByIds(ids: string[]) {
  try {
    if (!ids || ids.length === 0) return []
    
    const collection = await getMainProductsCollection()
    const objectIds = ids.map(id => new ObjectId(id))
    const products = await collection.find({ _id: { $in: objectIds } }).toArray()
    
    return products.map(mapMainProductDocument)
  } catch (error) {
    console.error("Error fetching main products by ids:", error)
    throw new Error("فشل في جلب المنتجات الأساسية حسب المعرفات")
  }
}

// البحث عن المنتجات الأساسية
export async function searchMainProducts(searchTerm: string) {
  try {
    const collection = await getMainProductsCollection()
    const products = await collection.find({
      $or: [
        { name: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
        { category: { $regex: searchTerm, $options: "i" } }
      ]
    }).toArray()
    return products.map(mapMainProductDocument)
  } catch (error) {
    console.error("Error searching main products:", error)
    throw new Error("فشل في البحث عن المنتجات الأساسية")
  }
}
