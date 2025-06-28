// قاعدة البيانات للهدايا والمنتجات المخصصة
import type { 
  Product as PrismaProduct, 
  Box as PrismaBox, 
  Bag as PrismaBag
} from "../../prisma/generated/client"

export type Product = PrismaProduct

// أنواع مخصصة للصناديق والأكياس مع تواريخ كـ strings
export interface Box {
  id: string
  name: string
  description?: string | null
  price: number
  image?: string | null
  color?: string | null
  size?: string | null
  material?: string | null
  stock: number
  dimensions?: string | null
  createdAt: string
  updatedAt: string
}

export interface Bag {
  id: string
  name: string
  description?: string | null
  price: number
  image?: string | null
  color?: string | null
  size?: string | null
  material?: string | null
  stock: number
  createdAt: string
  updatedAt: string
}

// نوع الحلويات المخصص مع دعم الكمية
export interface Sweet {
  id: string
  name: string
  price: number
  image?: string
  stock: number
  createdAt: string  // تم تغييره من Date إلى string لتجنب مشاكل serialization
  updatedAt: string  // تم تغييره من Date إلى string لتجنب مشاكل serialization
  quantity?: number  // للعربة والكمية المختارة
}

// تحويل Prisma Sweet إلى النوع المخصص
export function convertPrismaSweetToSweet(prismaSweet: {
  id: string
  name: string
  price: number
  image?: string | null
  stock: number
  createdAt: Date
  updatedAt: Date
}): Sweet {
  return {
    id: prismaSweet.id,
    name: prismaSweet.name,
    price: prismaSweet.price,
    image: prismaSweet.image || '',
    stock: prismaSweet.stock,
    createdAt: prismaSweet.createdAt.toISOString(),  // تحويل إلى string
    updatedAt: prismaSweet.updatedAt.toISOString(),  // تحويل إلى string
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
  quantity?: number     // الكمية المطلوبة (افتراضي 1)
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
    quantity: 1, // الكمية الافتراضية عند إضافة المنتج للعربة
  }
}

// دوال تحويل من Prisma types إلى الأنواع المخصصة
export function convertPrismaBoxToBox(prismaBox: PrismaBox): Box {
  return {
    id: prismaBox.id,
    name: prismaBox.name,
    description: prismaBox.description,
    price: prismaBox.price,
    image: prismaBox.image,
    color: prismaBox.color,
    size: prismaBox.size,
    material: prismaBox.material,
    stock: prismaBox.stock,
    dimensions: prismaBox.dimensions,
    createdAt: prismaBox.createdAt.toISOString(),
    updatedAt: prismaBox.updatedAt.toISOString(),
  }
}

export function convertPrismaBagToBag(prismaBag: PrismaBag): Bag {
  return {
    id: prismaBag.id,
    name: prismaBag.name,
    description: prismaBag.description,
    price: prismaBag.price,
    image: prismaBag.image,
    color: prismaBag.color,
    size: prismaBag.size,
    material: prismaBag.material,
    stock: prismaBag.stock,
    createdAt: prismaBag.createdAt.toISOString(),
    updatedAt: prismaBag.updatedAt.toISOString(),
  }
}