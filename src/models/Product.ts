// models/Product.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  id: number;
  name: string;
  brand: string;
  category: string;
  subCategory: string;
  price: number;
  old_price?: number;
  stock: number;
  best_seller: boolean;
  new_arrival: boolean;
  rating?: number;
  image: string;
  images?: string[];
  tags?: string[];
  description?: string;
  colors?: string[];
  trending: boolean;
  sale: boolean;
  isGift: boolean;
  occasion?: string[];
  season?: string[];
  createdAt: Date;
  views?: number;
  discount_percentage?: number;
}

// التحقق من وجود النموذج مسبقاً لتجنب إعادة التعريف
const ProductSchema = new Schema<IProduct>(
  {
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    price: { type: Number, required: true },
    old_price: { type: Number },
    stock: { type: Number, default: 0 },
    best_seller: { type: Boolean, default: false },
    new_arrival: { type: Boolean, default: false },
    rating: { type: Number },
    image: { type: String, required: true },
    images: { type: [String] },
    tags: { type: [String] },
    description: { type: String },
    colors: { type: [String] },
    trending: { type: Boolean, default: false },
    sale: { type: Boolean, default: false },
    isGift: { type: Boolean, default: false },
    occasion: { type: [String] },
    season: { type: [String], default: ['الكل'] },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// إضافة طريقة لحساب نسبة الخصم تلقائياً
ProductSchema.virtual('discount_percentage').get(function() {
  if (this.old_price && this.price) {
    return Math.round(((this.old_price - this.price) / this.old_price) * 100);
  }
  return null;
});

// تضمين الخصائص الافتراضية
ProductSchema.set('toJSON', { virtuals: true });
ProductSchema.set('toObject', { virtuals: true });

// إنشاء وتصدير النموذج
export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);