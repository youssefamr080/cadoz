"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, ShoppingCart } from "lucide-react";
import { Product } from "../../data/products";

// تعريف props للمكون
interface ProductCollectionProps {
  products: Product[];
}

const ProductCollection: React.FC<ProductCollectionProps> = ({ products }) => {
  // تأثيرات الحركة للبطاقات
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
    }),
    hover: {
      scale: 1.03,
      boxShadow: "0 12px 24px rgba(0, 0, 0, 0.15)",
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product, index) => (
        <Link href={`/product/${product.id}`} key={product.id}>
          <motion.div
            custom={index}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            className="relative bg-white rounded-xl shadow-md overflow-hidden group"
          >
            {/* الصورة */}
            <div className="relative w-full h-56">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                quality={80}
              />
              {/* علامة الخصم إذا كان هناك تخفيض */}
              {product.sale && product.old_price && (
                <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {Math.round(((product.old_price - product.price) / product.old_price) * 100)}% خصم
                </span>
              )}
              {/* زر الإضافة إلى السلة عند التحويم */}
              <motion.button
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute top-2 right-2 bg-primary text-white p-2 rounded-full shadow-md hover:bg-primary-dark transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  console.log(`Added ${product.name} to cart`);
                }}
              >
                <ShoppingCart className="w-5 h-5" />
              </motion.button>
            </div>

            {/* تفاصيل المنتج */}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h3>
              <p className="text-sm text-gray-500">{product.brand}</p>

              {/* السعر */}
              <div className="mt-2 flex items-center gap-2">
                {product.sale && product.old_price ? (
                  <>
                    <span className="text-red-600 font-bold">{product.price} جنيه</span>
                    <span className="text-gray-400 line-through text-sm">{product.old_price} جنيه</span>
                  </>
                ) : (
                  <span className="text-primary font-bold">{product.price} جنيه</span>
                )}
              </div>

              {/* التقييم */}
              {product.rating && (
                <div className="mt-2 flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600">{product.rating.toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* مؤشر التوفر */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200">
              <div
                className={`h-full ${product.stock > 0 ? "bg-green-500" : "bg-red-500"}`}
                style={{ width: `${Math.min((product.stock / 10) * 100, 100)}%` }}
              />
            </div>
          </motion.div>
        </Link>
      ))}
    </div>
  );
};

export default ProductCollection;