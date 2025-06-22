export interface Product {
  id: string
  _id?: string
  name: string
  description: string
  image: string
  images?: string[]
  price: number
  oldPrice?: number
  old_price?: number // للحفاظ على التوافق الرجعي
  category: string
  subCategory?: string
  brand?: string
  tags?: string[]
  colors?: string[]
  sizes?: string[]
  rating?: number
  reviews_count?: number
  stock?: number
  inStock?: boolean
  discount_percentage?: number
  attributes?: Record<string, string> // لدعم مقارنة المنتجات
  createdAt?: string // تاريخ إنشاء المنتج
  popularity?: number // لترتيب المنتجات حسب الشعبية
  is_new?: boolean
  is_trending?: boolean
  is_gift?: boolean
  trending?: boolean
  sale?: boolean
  best_seller?: boolean
  new_arrival?: boolean
  isGift?: boolean
  occasion?: string[]
  season?: string[]
  video?: string
  quantity?: number
}