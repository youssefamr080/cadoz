// قاعدة البيانات للهدايا والمنتجات المخصصة
import type { 
  Product as PrismaProduct, 
  Box as PrismaBox, 
  Decoration as PrismaDecoration, 
  InspirationBag,
  InspirationDecoration
} from "../../prisma/generated/client"

// استخدام أنواع Prisma مباشرة
export type Box = PrismaBox
export type Decoration = PrismaDecoration

// نوع الحقيبة الموحد (يطابق نوع Box و Decoration)
export interface Bag {
  id: string
  name: string
  description?: string
  price: number
  image?: string
  stock: number
  createdAt: Date
  updatedAt: Date
}

// تحويل InspirationBag إلى Bag موحد
export function convertInspirationBagToBag(inspirationBag: InspirationBag): Bag {
  return {
    id: inspirationBag.id,
    name: inspirationBag.name,
    description: inspirationBag.description,
    price: inspirationBag.price,
    image: inspirationBag.image,
    stock: inspirationBag.stock,
    createdAt: new Date(), // إضافة تاريخ افتراضي
    updatedAt: new Date(), // إضافة تاريخ افتراضي
  }
}

// تحويل InspirationDecoration إلى Decoration موحد
export function convertInspirationDecorationToDecoration(inspirationDecoration: InspirationDecoration): Decoration {
  return {
    id: inspirationDecoration.id,
    name: inspirationDecoration.name,
    price: inspirationDecoration.price,
    image: inspirationDecoration.image,
    stock: inspirationDecoration.stock,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

// نوع منتج الهدية المبسط (شوكولاتة، شيبسي، حلويات، إلخ)
// يحتوي على البيانات الأساسية فقط: الاسم، الفئة، الصورة، السعر، والمخزون
export interface GiftProduct {
  id: string
  name: string          // اسم المنتج (مثل: "شوكولاتة كادبوري")
  category: string      // الفئة (مثل: "شوكولاتة", "شيبسي", "حلويات")
  image: string         // صورة المنتج
  price: number         // السعر الحالي
  old_price?: number    // السعر القديم (اختياري للعروض)
  stock: number         // كمية المخزون المتاحة
  
  // للعربة والكمية
  quantity?: number     // الكمية المطلوبة (افتراضي 1)
}

// نوع العنصر المحفوظ (يجب أن يطابق Prisma model)
export interface SavedItem {
  id: string
  userId: string
  productId: string
  type: string // "product", "gift", "decoration", etc.
  name: string
  price: number
  image?: string
  createdAt: Date
  updatedAt: Date
}

// نوع الرسالة الشخصية
export interface PersonalMessage {
  to: string
  from: string
  message: string
  font?: string
  color?: string
}

// تحويل منتج Prisma إلى منتج هدية مبسط
export function convertToGiftProduct(product: PrismaProduct): GiftProduct {
  return {
    id: product.id,
    name: product.name,
    category: product.category || "منتجات متنوعة",
    image: product.image || "/placeholder.svg",
    price: product.price,
    old_price: product.old_price || undefined,
    stock: product.stock,
    quantity: 1,
  }
}