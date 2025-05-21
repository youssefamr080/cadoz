export interface GiftProduct {
  id: string
  quantity: number
}

export interface GiftInspiration {
  _id: string
  name: string
  description: string
  image: string
  box: string
  bag: string
  products: GiftProduct[] | string[]
  decorations: string[]
  category: "men" | "women" | "kids"
  Mainproducts: string[]
  occasions: string[]
  tags: string[]
  rating: number
  reviews: number
  likes: number
  dislikes: number
  updatedAt: Date
  likedBy: string[]
  dislikedBy: string[]
  comments: {
    _id: string;
    userId: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
  }[]
  ratings: {
    _id: string;
    userId: string;
    rating: number;
    createdAt: Date;
  }[]
  price?: number
  oldPrice?: number
  discount_percentage?: number
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  subCategory?: string;
  brand?: string;
  tags?: string[];
  colors?: string[];
  sizes?: string[];
  rating?: number;
  reviews_count?: number;
  stock?: number;
  inStock?: boolean;
  discount_percentage?: number;
  is_new?: boolean;
  is_trending?: boolean;
  is_gift?: boolean;
  trending?: boolean;
  sale?: boolean;
  best_seller?: boolean;
  new_arrival?: boolean;
  occasion?: string[];
  season?: string[];
  type: 'product';
  id: string;
  url: string;
  matches?: Array<{
    indices: readonly [number, number][];
    key?: string;
  }>;
  relevanceScore?: number;
}

export interface GiftWithDetails extends GiftInspiration {
  mainProducts: Product[]
  productDetails: Product[]
  productQuantities: { quantity: number }[]
  decorationDetails: {
    _id: string;
    name: string;
    description: string;
    image: string;
    price: number;
  }[]
  boxDetails: {
    _id: string;
    name: string;
    description: string;
    image: string;
    price: number;
  }
  bagDetails: {
    _id: string;
    name: string;
    description: string;
    image: string;
    price: number;
  }
}

export interface Message {
  role: "user" | "assistant" | "system"
  content: string
}

export interface ChatSession {
  messages: Message[]
  lastUpdated: Date
  context?: {
    recipientGender?: "men" | "women" | "kids"
    recipientAge?: number
    occasion?: string
    budget?: number
    interests?: string[]
    previousGifts?: string[]
  }
}

export interface Inspiration {
  _id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  occasions: string[];
  tags: string[];
  type: 'inspiration';
  id: string;
  url: string;
  matches?: Array<{
    indices: readonly [number, number][];
    key?: string;
  }>;
  relevanceScore?: number;
}
