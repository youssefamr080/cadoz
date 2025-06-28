"use server"

import { prisma } from "@/lib/prisma"
import type { 
  Inspiration, 
  InspirationRating,
  InspirationComment,
  Sweet, 
  Box, 
  Bag, 
  Product 
} from "../../../prisma/generated/client"

// نوع الإلهام مع جميع العلاقات
export type FullInspiration = Inspiration & {
  ratings: InspirationRating[]
  comments: InspirationComment[]
  sweets: Array<{
    id: string
    quantity: number
    sweet: Sweet
  }>
  products: Array<{
    id: string
    quantity: number
    product: Product
  }>
  box: {
    id: string
    box: Box
  } | null
  bag: {
    id: string
    bag: Bag
  } | null
}

// جلب جميع هدايا الإلهام مع النماذج الجديدة
export async function getAllInspirations(): Promise<FullInspiration[]> {
  try {
    const inspirations = await prisma.inspiration.findMany({
      include: {
        ratings: true,
        comments: true,
        sweets: {
          include: {
            sweet: true
          }
        },
        products: {
          include: {
            product: true
          }
        },
        box: {
          include: {
            box: true
          }
        },
        bag: {
          include: {
            bag: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return inspirations as FullInspiration[]
  } catch (error) {
    console.error("Error fetching inspirations:", error)
    throw new Error("فشل في جلب هدايا الإلهام")
  }
}

// جلب هدية إلهام واحدة حسب المعرف مع النماذج الجديدة
export async function getInspirationById(id: string): Promise<FullInspiration | null> {
  try {
    const inspiration = await prisma.inspiration.findUnique({
      where: { id },
      include: {
        ratings: true,
        comments: true,
        sweets: {
          include: {
            sweet: true
          }
        },
        products: {
          include: {
            product: true
          }
        },
        box: {
          include: {
            box: true
          }
        },
        bag: {
          include: {
            bag: true
          }
        }
      }
    })
    return inspiration as FullInspiration | null
  } catch (error) {
    console.error("Error fetching inspiration by id:", error)
    throw new Error("فشل في جلب هدية الإلهام")
  }
}

// إضافة تعليق على إلهام
export async function addInspirationComment(
  inspirationId: string, 
  userId: string, 
  comment: string, 
  userName?: string
) {
  try {
    const newComment = await prisma.inspirationComment.create({
      data: {
        inspirationId,
        userId,
        comment,
        userName: userName || "مستخدم مجهول"
      }
    })
    return newComment
  } catch (error) {
    console.error("Error adding comment:", error)
    throw new Error("فشل في إضافة التعليق")
  }
}

// إضافة تقييم لإلهام
export async function addInspirationRating(inspirationId: string, userId: string, rating: number) {
  try {
    // التحقق من وجود تقييم سابق
    const existingRating = await prisma.inspirationRating.findFirst({
      where: {
        inspirationId,
        userId
      }
    })

    if (existingRating) {
      // تحديث التقييم الموجود
      const updatedRating = await prisma.inspirationRating.update({
        where: { id: existingRating.id },
        data: { rating }
      })
      
      // تحديث متوسط التقييم
      await updateInspirationAverageRating(inspirationId)
      return updatedRating
    } else {
      // إنشاء تقييم جديد
      const newRating = await prisma.inspirationRating.create({
        data: {
          inspirationId,
          userId,
          rating
        }
      })
      
      // تحديث متوسط التقييم
      await updateInspirationAverageRating(inspirationId)
      return newRating
    }
  } catch (error) {
    console.error("Error adding rating:", error)
    throw new Error("فشل في إضافة التقييم")
  }
}

// تحديث متوسط التقييم للإلهام
async function updateInspirationAverageRating(inspirationId: string) {
  try {
    const ratings = await prisma.inspirationRating.findMany({
      where: { inspirationId }
    })

    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
      : 0

    await prisma.inspiration.update({
      where: { id: inspirationId },
      data: { 
        rating: averageRating,
        reviews: ratings.length
      }
    })
  } catch (error) {
    console.error("Error updating average rating:", error)
  }
}

// إنشاء إلهام جديد مع العناصر
export async function createInspiration(data: {
  name: string
  description: string
  image: string
  price: number
  oldPrice?: number
  category?: string
  sweetIds?: Array<{ id: string; quantity: number }>
  productIds?: Array<{ id: string; quantity: number }>
  boxId?: string
  bagId?: string
}) {
  try {
    // إنشاء الإلهام الأساسي
    const inspiration = await prisma.inspiration.create({
      data: {
        name: data.name,
        description: data.description,
        image: data.image,
        price: data.price,
        oldPrice: data.oldPrice,
        category: data.category,
        rating: 0,
        reviews: 0,
        likes: 0,
        dislikes: 0,
        discountPercentage: data.oldPrice && data.oldPrice > data.price 
          ? Math.round(((data.oldPrice - data.price) / data.oldPrice) * 100)
          : undefined
      }
    })

    // ربط الحلويات
    if (data.sweetIds && data.sweetIds.length > 0) {
      await Promise.all(
        data.sweetIds.map(sweet =>
          prisma.inspirationSweet.create({
            data: {
              inspirationId: inspiration.id,
              sweetId: sweet.id,
              quantity: sweet.quantity
            }
          })
        )
      )
    }

    // ربط المنتجات
    if (data.productIds && data.productIds.length > 0) {
      await Promise.all(
        data.productIds.map(product =>
          prisma.inspirationProduct.create({
            data: {
              inspirationId: inspiration.id,
              productId: product.id,
              quantity: product.quantity
            }
          })
        )
      )
    }

    // ربط الصندوق
    if (data.boxId) {
      await prisma.inspirationBoxRelation.create({
        data: {
          inspirationId: inspiration.id,
          boxId: data.boxId
        }
      })
    }

    // ربط الشنطة
    if (data.bagId) {
      await prisma.inspirationBagRelation.create({
        data: {
          inspirationId: inspiration.id,
          bagId: data.bagId
        }
      })
    }

    return inspiration
  } catch (error) {
    console.error("Error creating inspiration:", error)
    throw new Error("فشل في إنشاء الإلهام")
  }
}

// جلب جميع الحلويات
export async function getAllSweets() {
  try {
    return await prisma.sweet.findMany({
      orderBy: { name: 'asc' }
    })
  } catch (error) {
    console.error("Error fetching sweets:", error)
    throw new Error("فشل في جلب الحلويات")
  }
}

// جلب جميع الصناديق
export async function getAllBoxes() {
  try {
    return await prisma.box.findMany({
      orderBy: { name: 'asc' }
    })
  } catch (error) {
    console.error("Error fetching boxes:", error)
    throw new Error("فشل في جلب الصناديق")
  }
}

// جلب جميع الشنط
export async function getAllBags() {
  try {
    return await prisma.bag.findMany({
      orderBy: { name: 'asc' }
    })
  } catch (error) {
    console.error("Error fetching bags:", error)
    throw new Error("فشل في جلب الشنط")
  }
}

// حذف إلهام
export async function deleteInspiration(id: string) {
  try {
    // حذف جميع العلاقات أولاً (Cascade يجب أن يتولى هذا تلقائياً)
    await prisma.inspiration.delete({
      where: { id }
    })
    
    return { success: true }
  } catch (error) {
    console.error("Error deleting inspiration:", error)
    throw new Error("فشل في حذف الإلهام")
  }
}

// تحديث إلهام
export async function updateInspiration(id: string, data: Partial<{
  name: string
  description: string
  image: string
  price: number
  oldPrice: number
  category: string
}>) {
  try {
    const inspiration = await prisma.inspiration.update({
      where: { id },
      data: {
        ...data,
        discountPercentage: data.oldPrice && data.price 
          ? Math.round(((data.oldPrice - data.price) / data.oldPrice) * 100)
          : undefined
      }
    })
    
    return inspiration
  } catch (error) {
    console.error("Error updating inspiration:", error)
    throw new Error("فشل في تحديث الإلهام")
  }
}
