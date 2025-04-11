import { connectToDatabase } from "@/lib/mongodb"
import type { Collection } from "mongodb"
import type {
  BoxDocument,
  GiftProductDocument,
  DecorationDocument,
  BagDocument,
  InspirationDocument,
  CustomGiftDocument,
  SavedItemDocument,
} from "@/types/database"

// وظائف للحصول على المجموعات

export async function getBoxesCollection(): Promise<Collection<BoxDocument>> {
  const { db } = await connectToDatabase()
  return db.collection("gift_boxes")
}

export async function getGiftProductsCollection(): Promise<Collection<GiftProductDocument>> {
  const { db } = await connectToDatabase()
  return db.collection("gift_products")
}

export async function getDecorationsCollection(): Promise<Collection<DecorationDocument>> {
  const { db } = await connectToDatabase()
  return db.collection("gift_decorations")
}

export async function getBagsCollection(): Promise<Collection<BagDocument>> {
  const { db } = await connectToDatabase()
  return db.collection("gift_bags")
}

export async function getInspirationsCollection(): Promise<Collection<InspirationDocument>> {
  const { db } = await connectToDatabase()
  return db.collection("gift_inspirations")
}

export async function getCustomGiftsCollection(): Promise<Collection<CustomGiftDocument>> {
  const { db } = await connectToDatabase()
  return db.collection("gift_custom")
}

export async function getSavedItemsCollection(): Promise<Collection<SavedItemDocument>> {
  const { db } = await connectToDatabase()
  return db.collection("gift_saved_items")
}

// إنشاء الفهارس للمجموعات
export async function ensureGiftCollectionsIndexes() {
  try {
    const boxesCollection = await getBoxesCollection()
    await boxesCollection.createIndex({ name: "text", description: "text" })

    const giftProductsCollection = await getGiftProductsCollection()
    await giftProductsCollection.createIndex({ name: "text", category: "text" })

    const decorationsCollection = await getDecorationsCollection()
    await decorationsCollection.createIndex({ name: "text" })

    const bagsCollection = await getBagsCollection()
    await bagsCollection.createIndex({ name: "text", description: "text" })

    const inspirationsCollection = await getInspirationsCollection()
    await inspirationsCollection.createIndex({ name: "text", description: "text" })

    const customGiftsCollection = await getCustomGiftsCollection()
    await customGiftsCollection.createIndex({ name: "text", description: "text" })



    console.log("✅ Gift collections indexes ensured")
  } catch (error) {
    console.error("❌ Error ensuring gift collections indexes:", error)
  }
}
