// منتجات الهدايا الخاصة - مثل الشوكولاتة والحلويات
export interface GiftProduct {
  id: string
  name: string
  description?: string
  price: number
  old_price?: number
  image?: string
  images?: string[]
  category?: string
  subCategory?: string
  brand?: string
  tags?: string[]
  stock: number
  inStock?: boolean
  rating?: number
  views?: number
  best_seller?: boolean
  new_arrival?: boolean
  trending?: boolean
  sale?: boolean
  isGift?: boolean
  
  // خصائص خاصة بمنتجات الهدايا
  popular?: boolean
  flavor?: string
  occasion?: string | string[]
  season?: string[]
  colors?: string[]
  
  // للعربة والكمية
  quantity?: number
  
  video?: string
  discountPercentage?: number
  createdAt?: Date
  updatedAt?: Date
}

// نوع لتحويل منتج عادي إلى منتج هدية
export function convertToGiftProduct(product: any): GiftProduct {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    old_price: product.old_price,
    image: product.image,
    images: product.images || [],
    category: product.category,
    subCategory: product.subCategory,
    brand: product.brand,
    tags: product.tags || [],
    stock: product.stock,
    inStock: product.inStock,
    rating: product.rating,
    views: product.views || 0,
    best_seller: product.best_seller || false,
    new_arrival: product.new_arrival || false,
    trending: product.trending || false,
    sale: product.sale || false,
    isGift: product.isGift || true,
    
    // خصائص خاصة بمنتجات الهدايا
    popular: product.best_seller || product.trending || false,
    flavor: product.tags?.find((tag: string) => ['حلو', 'مر', 'فانيليا', 'شوكولاتة', 'فراولة'].includes(tag)),
    occasion: Array.isArray(product.occasion) ? product.occasion[0] : product.occasion,
    season: product.season || ['الكل'],
    colors: product.colors || [],
    
    quantity: product.quantity || 1,
    
    video: product.video,
    discountPercentage: product.discountPercentage,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }
}
