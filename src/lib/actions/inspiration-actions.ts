"use server"

// Reemplazar la importación de clientPromise
import { getInspirationsCollection } from "@/lib/gift-db-helpers"
import type { Inspiration, InspirationDocument } from "@/types/database"
import { ObjectId } from "mongodb"

// تحويل كائن المستند من MongoDB إلى النوع المستخدم في الواجهة
function mapInspirationDocument(doc: InspirationDocument): Inspiration {
  return {
    id: doc._id.toString(),
    name: doc.name,
    description: doc.description,
    image: doc.image,
    rating: doc.rating,
    reviews: doc.reviews,
    box: {
      ...doc.box,
      id: doc.box.id,
    },
    products: doc.products.map((p) => ({
      ...p,
      id: p.id,
    })),
    decorations: doc.decorations.map((d) => ({
      ...d,
      id: d.id,
    })),
    bag: {
      ...doc.bag,
      id: doc.bag.id,
    },
  }
}

// جلب جميع هدايا الإلهام
export async function getAllInspirations(): Promise<Inspiration[]> {
  try {
    const collection = await getInspirationsCollection()
    const inspirations = await collection.find({}).toArray()
    return inspirations.map(mapInspirationDocument)
  } catch (error) {
    console.error("Error fetching inspirations:", error)
    throw new Error("فشل في جلب هدايا الإلهام")
  }
}

// جلب هدية إلهام واحدة حسب المعرف
export async function getInspirationById(id: string): Promise<Inspiration | null> {
  try {
    const collection = await getInspirationsCollection()
    const inspiration = await collection.findOne({ _id: new ObjectId(id) })
    return inspiration ? mapInspirationDocument(inspiration) : null
  } catch (error) {
    console.error("Error fetching inspiration by id:", error)
    throw new Error("فشل في جلب هدية الإلهام")
  }
}

// جلب الهدايا الأكثر شعبية
export async function getPopularInspirations(limit = 4): Promise<Inspiration[]> {
  try {
    const collection = await getInspirationsCollection()
    const inspirations = await collection.find({}).sort({ rating: -1, reviews: -1 }).limit(limit).toArray()
    return inspirations.map(mapInspirationDocument)
  } catch (error) {
    console.error("Error fetching popular inspirations:", error)
    throw new Error("فشل في جلب هدايا الإلهام الشائعة")
  }
}
