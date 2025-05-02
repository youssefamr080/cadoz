"use server"

import { getGiftProductsCollection } from "@/lib/gift-db-helpers"
import type { GiftProduct, GiftProductDocument } from "@/types/database"
import { ObjectId } from "mongodb"
import { revalidatePath } from "next/cache"

// تحويل كائن المستند من MongoDB إلى النوع المستخدم في الواجهة
function mapGiftProductDocument(doc: GiftProductDocument): GiftProduct {
  return {
    id: doc._id.toString(),
    name: doc.name,
    price: doc.price,
    image: doc.image,
    category: doc.category,
    stock: doc.stock,
    popular: doc.popular,
    occasion: doc.occasion,
  }
}

// جلب جميع المنتجات
export async function getAllProducts(): Promise<GiftProduct[]> {
  try {
    const collection = await getGiftProductsCollection()
    const products = await collection.find({}).toArray()
    return products.map(mapGiftProductDocument)
  } catch (error) {
    console.error("Error fetching products:", error)
    throw new Error("فشل في جلب المنتجات")
  }
}

// جلب المنتجات حسب الفئة
export async function getProductsByCategory(category: string): Promise<GiftProduct[]> {
  try {
    const collection = await getGiftProductsCollection()
    const products = await collection.find({ category }).toArray()
    return products.map(mapGiftProductDocument)
  } catch (error) {
    console.error("Error fetching products by category:", error)
    throw new Error("فشل في جلب المنتجات حسب الفئة")
  }
}

// جلب المنتجات الشائعة
export async function getPopularProducts(): Promise<GiftProduct[]> {
  try {
    const collection = await getGiftProductsCollection()
    const products = await collection.find({ popular: true }).toArray()
    return products.map(mapGiftProductDocument)
  } catch (error) {
    console.error("Error fetching popular products:", error)
    throw new Error("فشل في جلب المنتجات الشائعة")
  }
}

// جلب منتج واحد حسب المعرف
export async function getProductById(id: string): Promise<GiftProduct | null> {
  try {
    const collection = await getGiftProductsCollection()
    const product = await collection.findOne({ _id: new ObjectId(id) })
    return product ? mapGiftProductDocument(product) : null
  } catch (error) {
    console.error("Error fetching product by id:", error)
    throw new Error("فشل في جلب المنتج")
  }
}

// جلب عدة منتجات حسب قائمة المعرفات
export async function getGiftProductsByIds(ids: string[]): Promise<GiftProduct[]> {
  try {
    if (!ids || ids.length === 0) return [];
    const objectIds = ids.map((id) => new ObjectId(id));
    const collection = await getGiftProductsCollection();
    const products = await collection.find({ _id: { $in: objectIds } }).toArray();
    return products.map(mapGiftProductDocument);
  } catch (error) {
    console.error("Error fetching products by ids:", error);
    throw new Error("فشل في جلب المنتجات حسب المعرفات");
  }
}

// تحديث مخزون المنتج
export async function updateProductStock(id: string, newStock: number): Promise<void> {
  try {
    const collection = await getGiftProductsCollection()
    await collection.updateOne({ _id: new ObjectId(id) }, { $set: { stock: newStock } })
    revalidatePath("/")
  } catch (error) {
    console.error("Error updating product stock:", error)
    throw new Error("فشل في تحديث مخزون المنتج")
  }
}

// البحث عن المنتجات
export async function searchProducts(searchTerm: string): Promise<GiftProduct[]> {
  try {
    const collection = await getGiftProductsCollection()
    const products = await collection
      .find({
        name: { $regex: searchTerm, $options: "i" },
      })
      .toArray()
    return products.map(mapGiftProductDocument)
  } catch (error) {
    console.error("Error searching products:", error)
    throw new Error("فشل في البحث عن المنتجات")
  }
}

// فلترة المنتجات حسب النكهة والمناسبة
export async function filterProducts(filters: {
  category?: string
  flavor?: string[]
  occasion?: string
  inStock?: boolean
}): Promise<GiftProduct[]> {
  try {
    const collection = await getGiftProductsCollection()

    const query: {
      category?: string
      flavor?: { $in: string[] }
      occasion?: string
      stock?: { $gt: number }
    } = {}

    if (filters.category && filters.category !== "الكل") {
      query.category = filters.category
    }

    if (filters.flavor && filters.flavor.length > 0) {
      query.flavor = { $in: filters.flavor }
    }

    if (filters.occasion && filters.occasion !== "all") {
      query.occasion = filters.occasion
    }

    if (filters.inStock) {
      query.stock = { $gt: 0 }
    }

    const products = await collection.find(query).toArray()
    return products.map(mapGiftProductDocument)
  } catch (error) {
    console.error("Error filtering products:", error)
    throw new Error("فشل في فلترة المنتجات")
  }
}
