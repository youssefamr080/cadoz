import mongoose, { Schema, Document } from 'mongoose';

export interface IGiftOption extends Document {
  name: string;
  category: "boxes" | "packets" | "chocolates" | "candies" | "decoration";
  price: number;
  stock: number;
  image: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const GiftOptionSchema: Schema = new Schema({
  name: { type: String, required: true },
  category: { 
    type: String, 
    enum: ["boxes", "packets", "chocolates", "candies", "decoration"],
    required: true 
  },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  image: { type: String, required: true },
  tags: [{ type: String }]
}, { timestamps: true });

export default mongoose.models.GiftOption || mongoose.model<IGiftOption>('GiftOption', GiftOptionSchema);