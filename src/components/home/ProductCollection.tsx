"use client"

import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ShoppingCart, Heart, Star, Check } from "lucide-react"
import type { Product } from "../../types/product"

interface ProductCollectionProps {
  products: Product[]
  accentColor?: string
  compact?: boolean
}

const ProductCollection: React.FC<ProductCollectionProps> = ({ products, accentColor = "blue", compact = false }) => {
  // تحديد الألوان بناءً على اللون الرئيسي
  const getColorClasses = () => {
    const colorMap: Record<string, { bg: string; text: string; hover: string; shadow: string }> = {
      blue: {
        bg: "from-blue-500 to-indigo-600",
        text: "text-blue-600",
        hover: "group-hover:text-blue-600",
        shadow: "shadow-blue-200",
      },
      amber: {
        bg: "from-amber-500 to-orange-600",
        text: "text-amber-600",
        hover: "group-hover:text-amber-600",
        shadow: "shadow-amber-200",
      },
      emerald: {
        bg: "from-emerald-500 to-teal-600",
        text: "text-emerald-600",
        hover: "group-hover:text-emerald-600",
        shadow: "shadow-emerald-200",
      },
      rose: {
        bg: "from-rose-500 to-pink-600",
        text: "text-rose-600",
        hover: "group-hover:text-rose-600",
        shadow: "shadow-rose-200",
      },
      violet: {
        bg: "from-violet-500 to-purple-600",
        text: "text-violet-600",
        hover: "group-hover:text-violet-600",
        shadow: "shadow-violet-200",
      },
      cyan: {
        bg: "from-cyan-500 to-blue-600",
        text: "text-cyan-600",
        hover: "group-hover:text-cyan-600",
        shadow: "shadow-cyan-200",
      },
    }

    return colorMap[accentColor] || colorMap.blue
  }

  const colors = getColorClasses()

  // تأثيرات الحركة
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  // تصغير حجم بطاقات المنتجات
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`grid ${
        compact
          ? "grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 md:gap-3" // زيادة عدد الأعمدة وتقليل المسافات
          : "grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4" // زيادة عدد الأعمدة وتقليل المسافات
      }`}
    >
      {products.map((product) => (
        <motion.div
          key={product.id}
          variants={itemVariants}
          className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col h-full border border-slate-200" // تقليل الظل والتقريب
        >
          <Link href={`/product/${product.id}`} className="block relative">
            <div className="relative pt-[100%] overflow-hidden bg-slate-100">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover transition-transform group-hover:scale-105 duration-500" // تقليل تأثير التكبير
                sizes="(max-width: 640px) 25vw, (max-width: 768px) 20vw, 16vw" // تحسين أحجام الصور
              />

              {/* شارة الخصم */}
              {product.old_price && (
                <div
                  className={`absolute top-1 left-1 bg-gradient-to-r ${colors.bg} text-white py-0.5 px-1 text-[8px] font-bold rounded-full shadow-sm`} // تصغير الشارة
                >
                  {Math.round(((product.old_price - product.price) / product.old_price) * 100)}%
                </div>
              )}

              {/* شارة المنتج الجديد */}
              {product.new_arrival && !product.old_price && (
                <div className="absolute top-1 left-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-0.5 px-1 text-[8px] font-bold rounded-full shadow-sm">
                  جديد
                </div>
              )}

              {/* حالة المخزون */}
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                  <span className="bg-red-600 text-white py-0.5 px-1.5 text-[10px] font-bold rounded-full shadow-md">
                    نفذ
                  </span>
                </div>
              )}

              {/* طبقة التأثير عند التحويم */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-1">
                <span className="text-white text-[10px] font-medium">عرض التفاصيل</span>
              </div>

              {/* أزرار التفاعل - تظهر فقط على الشاشات الكبيرة */}
              <div className="absolute top-1 right-1 flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-5 group-hover:translate-x-0 hidden md:flex">
                <button className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-slate-50 transition-colors">
                  <Heart className="w-3 h-3 text-slate-600" />
                </button>
                <button className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-slate-50 transition-colors">
                  <ShoppingCart className="w-3 h-3 text-slate-600" />
                </button>
              </div>
            </div>
          </Link>

          <div className="p-1.5 flex-1 flex flex-col">
            <Link href={`/product/${product.id}`} className="block flex-1">
              <h3
                className={`font-medium text-[11px] line-clamp-2 mb-0.5 text-slate-800 ${colors.hover} transition-colors`}
              >
                {product.name}
              </h3>
            </Link>
            {/* التقييم - يظهر فقط في الوضع غير المضغوط */}
            {product.rating && !compact && (
              <div className="flex items-center mb-1">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-2.5 h-2.5 ${i < Math.floor(product.rating || 0) ? "text-amber-400 fill-amber-400" : "text-slate-300"}`}
                    />
                  ))}
                </div>
                <span className="text-[8px] text-slate-500 mr-1">({product.rating})</span>
              </div>
            )}
            <div className="flex items-center justify-between mt-auto">
              <div>
                <p className={`text-xs font-bold ${colors.text}`}>
                  {product.price} <span className="text-[8px]">ج.م</span>
                </p>
                {product.old_price && <p className="text-slate-500 line-through text-[8px]">{product.old_price} ج.م</p>}
              </div>

              {/* حالة المخزون - تظهر فقط في الوضع غير المضغوط */}
              {!compact && product.stock > 0 && (
                <span className="text-[8px] text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded-full flex items-center gap-0.5">
                  <Check className="w-2 h-2" />
                  متوفر
                </span>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}

export default ProductCollection

