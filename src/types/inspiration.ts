// تعريف نوع Inspiration المستخدم في مكونات الإلهام
// يمكن استخدام Prisma types مباشرة بدلاً من هذا الملف

export type { 
  Inspiration,
  InspirationRating,
  InspirationComment,
  InspirationBox,
  InspirationMainProduct,
  InspirationProduct,
  InspirationDecoration,
  InspirationBag
} from "../../prisma/generated/client"

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
  decorations: string[];
  bag: string;
  Mainproducts?: string[];
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
