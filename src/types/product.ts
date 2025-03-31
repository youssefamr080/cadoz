export interface Product {
    id: number
    name: string
    image: string
    images?: string[]
    description: string
    price: number
    old_price?: number
    stock: number
    category?: string
    subCategory?: string
    brand?: string
    tags?: string[]
    colors?: string[]
    rating?: number
    trending?: boolean
    sale?: boolean
    best_seller?: boolean
    new_arrival?: boolean
    isGift?: boolean
    occasion?: string[]
    season?: string[]
    discount_percentage?: number
    video?: string
}
  
  