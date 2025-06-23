"use server"

import { prisma } from "@/lib/prisma"
import type { Inspiration } from "../../../prisma/generated/client"

// جلب جميع هدايا الإلهام
export async function getAllInspirations(): Promise<Inspiration[]> {
  try {
    const inspirations = await prisma.inspiration.findMany({
      include: {
        ratings: true,
        comments: true,
        box: true,
        mainProducts: true,
        products: true,
        decorations: true,
        bag: true
      }
    })
    return inspirations
  } catch (error) {
    console.error("Error fetching inspirations:", error)
    throw new Error("فشل في جلب هدايا الإلهام")
  }
}

// جلب هدية إلهام واحدة حسب المعرف
export async function getInspirationById(id: string) {
  try {
    const inspiration = await prisma.inspiration.findUnique({
      where: { id },
      include: {
        ratings: true,
        comments: true,
        box: true,
        mainProducts: true,
        products: true,
        decorations: true,
        bag: true
      }
    })
    return inspiration
  } catch (error) {
    console.error("Error fetching inspiration by id:", error)
    throw new Error("فشل في جلب هدية الإلهام")
  }
}

// إضافة تعليق على إلهام
export async function addInspirationComment(inspirationId: string, userId: string, comment: string, userName?: string) {
  try {
    await prisma.inspirationComment.create({
      data: {
        inspirationId,
        userId,
        userName: userName || "مستخدم مجهول",
        comment
      }
    })
  } catch (error) {
    console.error("Error adding inspiration comment:", error)
    throw new Error("فشل في إضافة التعليق")
  }
}

// إضافة تقييم لإلهام
export async function addInspirationRating(inspirationId: string, userId: string, rating: number) {
  try {
    // تحقق من وجود تقييم سابق
    const existingRating = await prisma.inspirationRating.findFirst({
      where: { inspirationId, userId }
    })

    if (existingRating) {
      // تحديث التقييم الموجود
      await prisma.inspirationRating.update({
        where: { id: existingRating.id },
        data: { rating }
      })
    } else {
      // إنشاء تقييم جديد
      await prisma.inspirationRating.create({
        data: {
          inspirationId,
          userId,
          rating
        }
      })
    }
  } catch (error) {
    console.error("Error adding inspiration rating:", error)
    throw new Error("فشل في إضافة التقييم")
  }
}

// جلب الإلهامات حسب الفئة
export async function getInspirationsByCategory(category: string): Promise<Inspiration[]> {
  try {
    const inspirations = await prisma.inspiration.findMany({
      where: { category },
      include: {
        ratings: true,
        comments: true,
        box: true,
        mainProducts: true,
        products: true,
        decorations: true,
        bag: true
      }
    })
    return inspirations
  } catch (error) {
    console.error("Error fetching inspirations by category:", error)
    throw new Error("فشل في جلب الإلهامات حسب الفئة")
  }
}

// البحث في الإلهامات
export async function searchInspirations(searchTerm: string): Promise<Inspiration[]> {
  try {
    const inspirations = await prisma.inspiration.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } }
        ]
      },
      include: {
        ratings: true,
        comments: true,
        box: true,
        mainProducts: true,
        products: true,
        decorations: true,
        bag: true
      }
    })
    return inspirations
  } catch (error) {
    console.error("Error searching inspirations:", error)
    throw new Error("فشل في البحث عن الإلهامات")
  }
}

// إضافة أو إزالة لايك للإلهام
export async function toggleInspirationLike(inspirationId: string, userId: string) {
  try {
    const inspiration = await prisma.inspiration.findUnique({
      where: { id: inspirationId }
    })

    if (!inspiration) {
      throw new Error("الإلهام غير موجود")
    }

    const likedBy = inspiration.likedBy || []
    const dislikedBy = inspiration.dislikedBy || []
    const isLiked = likedBy.includes(userId)

    if (isLiked) {
      // إزالة اللايك
      await prisma.inspiration.update({
        where: { id: inspirationId },
        data: {
          likedBy: likedBy.filter(id => id !== userId),
          likes: Math.max(0, inspiration.likes - 1)
        }
      })
    } else {
      // إضافة لايك وإزالة ديسلايك إذا كان موجوداً
      const newLikedBy = [...likedBy, userId]
      const newDislikedBy = dislikedBy.filter(id => id !== userId)
      const wasDisliked = dislikedBy.includes(userId)

      await prisma.inspiration.update({
        where: { id: inspirationId },
        data: {
          likedBy: newLikedBy,
          dislikedBy: newDislikedBy,
          likes: inspiration.likes + 1,
          dislikes: wasDisliked ? Math.max(0, inspiration.dislikes - 1) : inspiration.dislikes
        }
      })
    }
  } catch (error) {
    console.error("Error toggling inspiration like:", error)
    throw new Error("فشل في تبديل الإعجاب")
  }
}

// إضافة أو إزالة ديسلايك للإلهام
export async function toggleInspirationDislike(inspirationId: string, userId: string) {
  try {
    const inspiration = await prisma.inspiration.findUnique({
      where: { id: inspirationId }
    })

    if (!inspiration) {
      throw new Error("الإلهام غير موجود")
    }

    const likedBy = inspiration.likedBy || []
    const dislikedBy = inspiration.dislikedBy || []
    const isDisliked = dislikedBy.includes(userId)

    if (isDisliked) {
      // إزالة الديسلايك
      await prisma.inspiration.update({
        where: { id: inspirationId },
        data: {
          dislikedBy: dislikedBy.filter(id => id !== userId),
          dislikes: Math.max(0, inspiration.dislikes - 1)
        }
      })
    } else {
      // إضافة ديسلايك وإزالة لايك إذا كان موجوداً
      const newDislikedBy = [...dislikedBy, userId]
      const newLikedBy = likedBy.filter(id => id !== userId)
      const wasLiked = likedBy.includes(userId)

      await prisma.inspiration.update({
        where: { id: inspirationId },
        data: {
          dislikedBy: newDislikedBy,
          likedBy: newLikedBy,
          dislikes: inspiration.dislikes + 1,
          likes: wasLiked ? Math.max(0, inspiration.likes - 1) : inspiration.likes
        }
      })
    }
  } catch (error) {
    console.error("Error toggling inspiration dislike:", error)
    throw new Error("فشل في تبديل عدم الإعجاب")
  }
}

// للتوافق مع الكود الموجود - هذه functions اسمها القديم
export const likeInspiration = toggleInspirationLike
export const dislikeInspiration = toggleInspirationDislike
export const rateInspiration = addInspirationRating

// جلب الإلهامات الشائعة
export async function getPopularInspirations(): Promise<Inspiration[]> {
  try {
    const inspirations = await prisma.inspiration.findMany({
      where: {
        likes: { gte: 5 } // الإلهامات التي لديها 5 لايكات أو أكثر
      },
      orderBy: [
        { likes: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 10, // أحدث 10 إلهامات شائعة
      include: {
        ratings: true,
        comments: true,
        box: true,
        mainProducts: true,
        products: true,
        decorations: true,
        bag: true
      }
    })
    return inspirations
  } catch (error) {
    console.error("Error fetching popular inspirations:", error)
    throw new Error("فشل في جلب الإلهامات الشائعة")
  }
}
