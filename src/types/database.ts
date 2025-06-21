import type { ObjectId } from "mongodb"

// إضافة تعريف PersonalMessage
export interface PersonalMessage {
  message: string
  recipient: string
  sender: string
}

// الأنواع الأساسية
export interface MongoDocument {
  _id: ObjectId
}

// نوع Box
export interface BoxDocument extends MongoDocument {
  name: string
  price: number
  dimensions: string
  description: string
  image: string
  category: string
  stock: number
}

// نوع Product (renamed to GiftProduct)
export interface GiftProductDocument extends MongoDocument {
  name: string
  price: number
  image: string
  category: string
  stock: number
  popular: boolean
  occasion?: string
}

// نوع Decoration
export interface DecorationDocument extends MongoDocument {
  name: string
  price: number
  image: string
  stock: number
}

// نوع Bag
export interface BagDocument extends MongoDocument {
  name: string
  price: number
  image: string
  description: string
  color: string
  stock: number
}
// نوع MainProduct
export interface MainProductDocument extends MongoDocument {
  name: string
  price: number
  image: string
  description: string
  category: string
}

// نوع Inspiration
export interface InspirationDocument extends MongoDocument {
  name: string
  description: string
  image: string
  rating: number
  reviews: number
  likes: number
  dislikes: number
  likedBy: string[]
  dislikedBy: string[]
  price: number
  oldPrice?: number
  discount_percentage?: number
  ratings: Array<{
    userId: string
    rating: number
  }>
  comments: Array<{
    _id: string | ObjectId
    userId: string
    userName: string
    comment: string
    createdAt: string | Date
  }>
  box: {
    id: string
    name: string
    price: number
    dimensions: string
    description: string
    image: string
    category: string
    stock: number
  }
  Mainproducts: Array<{
    id: string
    name: string
    price: number
    image: string
    category: string
    stock: number
  }>
  products: Array<{
    id: string
    name: string
    price: number
    image: string
    quantity: number
    category: string
    stock: number
    popular: boolean
  }>
  decorations: Array<{
    id: string
    name: string
    price: number
    image: string
    stock: number
  }>
  bag: {
    id: string
    name: string
    price: number
    image: string
    description: string
    color: string
    stock: number
  }
  category?: string // Added category field for filtering inspirations by category (men, women, kids)
  updatedAt?: Date // Added updatedAt field for tracking when the inspiration was last updated
}

// نوع CustomGift
export interface CustomGiftDocument extends MongoDocument {
  name: string
  description: string
  price: number
  image: string
  category: string
}

// نوع SavedItem
export interface SavedItemDocument extends MongoDocument {
  userId: string
  items: Array<{
    id: string
    name: string
    price: number
    image: string
    type: "box" | "product" | "decoration" | "bag"
  }>
}

// أنواع للأجزاء المستخدمة في الواجهة
export interface Box {
  id: string
  name: string
  price: number
  dimensions: string
  description: string
  image: string
  category: string
  stock: number
  texture?: string
  hasRibbon?: boolean
}

export interface GiftProduct {
  id: string
  name: string
  price: number
  image: string
  category: string
  stock: number
  popular: boolean
  flavor?: string
  occasion?: string
  quantity?: number
}

export interface Decoration {
  id: string
  name: string
  price: number
  image: string
  stock: number
}

export interface Bag {
  id: string
  name: string
  price: number
  image: string
  description: string
  color: string
  stock: number
  pattern?: string
}

export interface Inspiration {
  id: string
  name: string
  description: string
  image: string
  rating: number
  reviews: number
  box: Box
  products: Array<GiftProduct & { quantity: number }>
  decorations: Decoration[]
  bag: Bag
}

export interface CustomGift {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
}

export interface SavedItem {
  id: string
  name: string
  price: number
  image: string
  type: "box" | "product" | "decoration" | "bag"
}

// تعريف واجهة بيانات الهدية للتكامل مع نظام السلة
export interface GiftItem {
  id: string
  name: string
  quantity: number
  image: string
  price: number
}

export interface GiftBox {
  name: string
  image: string
  price: number
}

export interface GiftWrap {
  name: string
  image: string
  price: number
}

export interface GiftData {
  items: GiftItem[]
  box: GiftBox | null
  wrap: GiftWrap | null
  message?: string
  recipient?: string
  createdAt?: string
  totalPrice?: number
}

// واجهة عنصر السلة المتوافقة مع نظام السلة الحالي
export interface CartItem {
  id: number
  name: string
  image: string
  price: number
  quantity: number
  category?: string
  variant?: string
  color?: string
  discount?: number
  originalPrice?: number
  stock?: number
  giftDetails?: string
  giftData?: GiftData
}

export interface Order {
  id: string
  customerId?: string
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  items: OrderItem[]
  shipping: {
    governorate: string
    address?: string
    phone?: string
    notes?: string
  }
  payment: {
    method: "cash_on_delivery" | "credit_card" | "bank_transfer"
    status: "pending" | "paid" | "failed" | "refunded"
    transactionId?: string
  }
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  totals: {
    subtotal: number
    shippingFees: number
    discount: number
    tax: number
    total: number
  }
  promoCode?: {
    code: string
    discountPercentage: number
  }
  createdAt: Date
  updatedAt: Date
  shippedAt?: Date
  deliveredAt?: Date
  cancelledAt?: Date
  trackingNumber?: string
  notes?: string
  source: "website" | "whatsapp" | "phone" | "instagram"
}

export interface OrderItem {
  id: number
  name: string
  image: string
  price: number
  quantity: number
  variant?: string
  discount?: number
  originalPrice?: number
  giftDetails?: string
  giftData?: {
    items: Array<{
      name: string
      quantity: number
      image: string
      price: number
    }>
    box: {
      name: string
      image: string
      price: number
    } | null
    wrap: {
      name: string
      image: string
      price: number
    } | null
    message?: string
    recipient?: string
  }
}

export interface OrderDocument {
  _id?: ObjectId
  userId: string | undefined
  box: { id: string; name: string; price: number }
  products: Array<{ id: string; name: string; price: number; quantity: number }>
  decorations: Array<{ id: string; name: string; price: number }>
  bag?: { id: string; name: string; price: number }
  personalMessage?: PersonalMessage
  totalPrice: number
  status: string
  createdAt: Date
}

export type Product = GiftProduct

// تعريف أنواع إضافية للتعامل مع الأخطاء المذكورة
export interface GiftOption {
  id: string; // تغيير من number إلى string
  name: string;
  price: number;
  image: string;
}

export interface GiftDecoration extends GiftOption {
  stock: number;
}

export interface GiftWrapOption extends GiftOption {
  stock: number;
}

// تعريف نوع GiftAction للتعامل مع أخطاء gift-customizer.tsx
export type GiftAction = 
  | "UPDATE_GIFT_COLOR" 
  | "UPDATE_GIFT_MESSAGE" 
  | "ADD_ITEM" 
  | "REMOVE_ITEM";

// تعريف نوع GiftState للتعامل مع أخطاء gift-customizer.tsx
export interface GiftState {
  color?: string;
  message?: string;
  items?: GiftItem[];
  // أضف أي خصائص أخرى مطلوبة
}

// تعريف نوع Category بناءً على API
export interface Category {
  id: string;
  name: string;
  nameAr: string;
  icon?: string;
  image?: string;
  description?: string;
  slug: string;
  parentId?: string;
  children?: Category[];
  productCount?: number;
}

// تعريف نوع Notification بناءً على API
export interface Notification {
  _id?: string;
  userId: string;
  productId: number;
  productName: string;
  phone: string;
  name: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  status: string;
  ip?: string;
  userAgent?: string;
  requestCount?: number;
  source?: string;
  requestedProducts?: Array<{
    productId: number;
    productName: string;
    requestedAt: string | Date;
  }>;
}

// تعريف نوع Customer بناءً على API
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  createdAt?: string | Date;
  lastLoginAt?: string | Date;
  isActive?: boolean;
  orderCount?: number;
  image?: string;
}
