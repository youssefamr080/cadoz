// تعريف أنواع قاعدة البيانات المحدثة
export type { 
  Inspiration,
  InspirationRating,
  InspirationComment,
  Sweet,
  InspirationSweet,
  InspirationProduct,
  InspirationBoxRelation,
  InspirationBagRelation,
  Box,
  Bag,
  Product,
  Order,
  OrderItem
} from "../../prisma/generated/client"

// أنواع العناصر في الطلبات
export type OrderItemType = "product" | "inspiration" | "custom_gift"

// بيانات الهدية المخصصة
export interface CustomGiftData {
  products?: Array<{
    id: string
    name: string
    quantity: number
    price: number
  }>
  sweets?: Array<{
    id: string
    name: string
    quantity: number
    price: number
  }>
  box?: {
    id: string
    name: string
    price: number
  } | null
  bag?: {
    id: string
    name: string
    price: number
  } | null
}

// Interface for product with quantity (للتوافق مع الكود الموجود)
export interface ProductWithQuantity {
  id: string;
  quantity: number;
}

// Legacy interface للتوافق مع الكود الموجود
export interface LegacyInspiration {
  id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  reviews: number;
  box: string;
  products: ProductWithQuantity[] | string[];
  productQuantities?: Record<string, number>;
  sweets?: ProductWithQuantity[] | string[];
  sweetQuantities?: Record<string, number>;
  bag: string;
  likes?: number;
  dislikes?: number;
  price?: number;
  oldPrice?: number;
  discount_percentage?: number;
  comments?: Array<{
    _id: string;
    userId: string;
    userName: string;
    comment: string;
    createdAt: string;
  }>;
  likedBy?: string[];
  dislikedBy?: string[];
  ratings?: Array<{ 
    userId: string; 
    rating: number;
  }>;
  category?: string;
  occasions?: string[];
  tags?: string[];
  updatedAt?: string;
}
