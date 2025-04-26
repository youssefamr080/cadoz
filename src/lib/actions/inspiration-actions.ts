"use server"

// Reemplazar la importación de clientPromise
import { getInspirationsCollection } from "@/lib/gift-db-helpers"
import type { Inspiration } from "@/types/inspiration"
import type { InspirationDocument } from "@/types/database"
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
    // Pass the MongoDB _id of the box instead of the nested id field
    box: typeof doc.box === 'string' ? doc.box : doc.box.id.toString(),
    products: doc.products.map((p: { id: string } | string) => typeof p === 'string' ? p : p.id),
    decorations: doc.decorations.map((d: { id: string } | string) => typeof d === 'string' ? d : d.id),
    bag: typeof doc.bag === 'string' ? doc.bag : doc.bag.id,
    likes: doc.likes ?? 0,
    dislikes: doc.dislikes ?? 0,
    comments: (doc.comments ?? []).map((c) => ({
      _id: typeof c._id === "string" ? c._id : c._id?.toString?.() ?? "",
      userId: c.userId,
      userName: c.userName,
      comment: c.comment,
      createdAt: typeof c.createdAt === "string" ? c.createdAt : (c.createdAt instanceof Date ? c.createdAt.toISOString() : "")
    })),
    likedBy: doc.likedBy ?? [],
    dislikedBy: doc.dislikedBy ?? [],
    ratings: doc.ratings ?? []
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

// إضافة تعليق على إلهام
export async function addInspirationComment(inspirationId: string, userId: string, comment: string, userName?: string) {
  const collection = await getInspirationsCollection();
  const commentObj = {
    _id: new ObjectId(),
    userId,
    userName: userName || "مستخدم مجهول",
    comment,
    createdAt: new Date(),
  };
  await collection.updateOne(
    { _id: new ObjectId(inspirationId) },
    { $push: { comments: commentObj } }
  );
  // Return with string _id and createdAt for client compatibility
  return {
    ...commentObj,
    _id: commentObj._id.toString(),
    createdAt: commentObj.createdAt.toISOString(),
  };
}

// لايك للإلهام
export async function likeInspiration(inspirationId: string, userId: string) {
  const collection = await getInspirationsCollection();
  await collection.updateOne(
    { _id: new ObjectId(inspirationId) },
    {
      $addToSet: { likedBy: userId },
      $pull: { dislikedBy: userId },
      $inc: { likes: 1 },
      $set: { updatedAt: new Date() },
    }
  );
}

// ديسلايك للإلهام
export async function dislikeInspiration(inspirationId: string, userId: string) {
  const collection = await getInspirationsCollection();
  await collection.updateOne(
    { _id: new ObjectId(inspirationId) },
    {
      $addToSet: { dislikedBy: userId },
      $pull: { likedBy: userId },
      $inc: { dislikes: 1 },
      $set: { updatedAt: new Date() },
    }
  );
}

// تقييم إلهام
export async function rateInspiration(inspirationId: string, userId: string, rating: number) {
  const collection = await getInspirationsCollection();
  // كل مستخدم يمكنه تقييم مرة واحدة فقط (يمكنك تحسين المنطق لاحقًا)
  const doc = await collection.findOne({ _id: new ObjectId(inspirationId) });
  if (!doc) throw new Error("إلهام غير موجود");
  let ratings: { userId: string; rating: number }[] = doc.ratings || [];
  const existing = ratings.find(r => r.userId === userId);
  if (existing) {
    // إذا كان المستخدم قد قيّم من قبل، حدث تقييمه
    ratings = ratings.map(r => r.userId === userId ? { ...r, rating } : r);
  } else {
    ratings.push({ userId, rating });
  }
  // احسب المتوسط وعدد التقييمات
  const avg = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0;
  await collection.updateOne(
    { _id: new ObjectId(inspirationId) },
    {
      $set: {
        ratings,
        rating: avg,
        reviews: ratings.length,
        updatedAt: new Date(),
      },
    }
  );
  return { rating: avg, reviews: ratings.length };
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
