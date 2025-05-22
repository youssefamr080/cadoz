// تعريف نوع Inspiration المستخدم في مكونات الإلهام

// Interface for product with quantity
export interface ProductWithQuantity {
  id: string;
  quantity: number;
}

export interface Inspiration {
  id: string;
  _id?: { $oid: string }; // MongoDB ObjectId format
  name: string;
  description: string;
  image: string;
  rating: number;
  reviews: number;
  box: string; // box ID only
  products: ProductWithQuantity[] | string[]; // Can be either array of objects with id and quantity or just string IDs
  productQuantities?: Record<string, number>; // Legacy field - كميات المنتجات مرتبطة بمعرفات المنتجات
  decorations: string[]; // decoration IDs only
  bag: string; // bag ID only
  Mainproducts?: string[]; // main product IDs only
  likes?: number;
  dislikes?: number;
  price?: number; // Added price field
  oldPrice?: number; // Added old price field for discounts
  discount_percentage?: number; // Added discount percentage field
  comments?: Array<{
    _id: { $oid: string } | string;
    userId: string;
    userName: string;
    comment: string;
    createdAt: { $date: { $numberLong: string } } | string;
  }>;
  likedBy?: string[];
  dislikedBy?: string[];
  ratings?: Array<{ 
    userId: string; 
    rating: number | { $numberInt: string } 
  }>;
  category?: string; // Category field
  occasions?: string[]; // Occasions this gift is suitable for
  tags?: string[]; // Tags for the gift
  updatedAt?: { $date: { $numberLong: string } } | string;
}
