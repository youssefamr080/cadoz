import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  id: number;
  name: string;
  brand: string;
  category: "men" | "women" | "kids";
  subCategory: string;
  price: number;
  old_price?: number;
  stock: number;
  best_seller?: boolean;
  new_arrival?: boolean;
  rating?: number;
  image: string;
  images: string[];
  tags: string[];
  description: string;
  colors: string[];
  trending?: boolean;
  sale?: boolean;
  isGift?: boolean;
  occasion?: string[];
  season?: string[];
}

const ProductSchema: Schema = new Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  brand: { type: String, required: true },
  category: { 
    type: String, 
    enum: ["men", "women", "kids"],
    required: true 
  },
  subCategory: { type: String, required: true },
  price: { type: Number, required: true },
  old_price: { type: Number },
  stock: { type: Number, required: true },
  best_seller: { type: Boolean },
  new_arrival: { type: Boolean },
  rating: { type: Number, min: 0, max: 5 },
  image: { type: String, required: true },
  images: [{ type: String }],
  tags: [{ type: String }],
  description: { type: String, required: true },
  colors: [{ type: String }],
  trending: { type: Boolean },
  sale: { type: Boolean },
  isGift: { type: Boolean },
  occasion: [{ type: String }],
  season: [{ type: String }]
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);