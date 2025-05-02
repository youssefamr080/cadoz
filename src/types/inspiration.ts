// تعريف نوع Inspiration المستخدم في مكونات الإلهام


export interface Inspiration {
  id: string
  name: string
  description: string
  image: string
  rating: number
  reviews: number
  box: string // box ID only
  products: string[] // product IDs only
  productQuantities: Record<string, number> // كميات المنتجات مرتبطة بمعرفات المنتجات
  decorations: string[] // decoration IDs only
  bag: string // bag ID only
  Mainproducts?: string[] // main product IDs only
  likes?: number
  dislikes?: number;
  comments?: Array<{
    _id: string;
    userId: string;
    userName: string;
    comment: string;
    createdAt: string;
  }>;
  likedBy?: string[];
  dislikedBy?: string[];
  ratings?: Array<{ userId: string; rating: number }>;
  category?: string; // Added category field
}
