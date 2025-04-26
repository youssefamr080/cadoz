"use client"

import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Star, Eye, Tag, Check } from "lucide-react"
import type { Product } from "../../types/product"
import { useRouter } from "next/navigation"

interface ProductCollectionProps {
  products: Product[]
  accentColor?: string
  compact?: boolean
}

const ProductCollection: React.FC<ProductCollectionProps> = ({ products, accentColor = "blue", compact = false }) => {
  const router = useRouter()

  // تحديد الألوان بناءً على اللون الرئيسي
  const getColorClasses = () => {
    const colorMap: Record<
      string,
      { bg: string; text: string; hover: string; shadow: string; light: string; border: string }
    > = {
      blue: {
        bg: "from-blue-500 to-indigo-600",
        text: "text-blue-600",
        hover: "group-hover:text-blue-600",
        shadow: "shadow-blue-200",
        light: "bg-blue-50",
        border: "border-blue-100",
      },
      amber: {
        bg: "from-amber-500 to-orange-600",
        text: "text-amber-600",
        hover: "group-hover:text-amber-600",
        shadow: "shadow-amber-200",
        light: "bg-amber-50",
        border: "border-amber-100",
      },
      emerald: {
        bg: "from-emerald-500 to-teal-600",
        text: "text-emerald-600",
        hover: "group-hover:text-emerald-600",
        shadow: "shadow-emerald-200",
        light: "bg-emerald-50",
        border: "border-emerald-100",
      },
      rose: {
        bg: "from-rose-500 to-pink-600",
        text: "text-rose-600",
        hover: "group-hover:text-rose-600",
        shadow: "shadow-rose-200",
        light: "bg-rose-50",
        border: "border-rose-100",
      },
      violet: {
        bg: "from-violet-500 to-purple-600",
        text: "text-violet-600",
        hover: "group-hover:text-violet-600",
        shadow: "shadow-violet-200",
        light: "bg-violet-50",
        border: "border-violet-100",
      },
      cyan: {
        bg: "from-cyan-500 to-blue-600",
        text: "text-cyan-600",
        hover: "group-hover:text-cyan-600",
        shadow: "shadow-cyan-200",
        light: "bg-cyan-50",
        border: "border-cyan-100",
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

  // فتح صفحة المنتج
  const handleViewProduct = (productId: string) => {
    router.push(`/product/${productId}`)
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`grid ${
        compact
          ? "grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 xs:gap-4 md:gap-5"
          : "grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 xs:gap-4 md:gap-5"
      }`}
    >
      {products.map((product) => (
        <motion.div key={product.id} variants={itemVariants} className="group relative">
          <Link href={`/product/${product.id}`} className="block">
            <div className="relative overflow-hidden rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-300">
              {/* صورة المنتج */}
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105 duration-500"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                />

                {/* زر عرض المنتج */}
                <button
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors z-10"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleViewProduct(product.id.toString())
                  }}
                >
                  <Eye className="w-4 h-4 text-gray-600 hover:text-blue-500 transition-colors" />
                </button>

                {/* شارة الخصم */}
                {product.old_price && (
                  <div
                    className={`absolute top-2 left-2 ${colors.light} ${colors.text} py-1 px-2 text-xs font-bold rounded-lg shadow-sm flex items-center gap-1 ${colors.border} border`}
                  >
                    <Tag className="w-3 h-3" />
                    <span>-{Math.round(((product.old_price - product.price) / product.old_price) * 100)}%</span>
                  </div>
                )}

                {/* شارة المنتج الجديد */}
                {product.new_arrival && !product.old_price && (
                  <div className="absolute top-2 left-2 bg-emerald-50 text-emerald-600 py-1 px-2 text-xs font-bold rounded-lg shadow-sm border border-emerald-100">
                    جديد
                  </div>
                )}

                {/* حالة المخزون */}
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                    <span className="bg-red-600 text-white py-1 px-3 text-sm font-bold rounded-lg shadow-md">نفذ</span>
                  </div>
                )}
              </div>

              {/* معلومات المنتج */}
              <div className="p-3">
                {/* التقييم */}
                {product.rating && !compact && (
                  <div className="flex items-center mb-1.5">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < Math.floor(product.rating || 0) ? "text-amber-400 fill-amber-400" : "text-slate-300"}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-slate-500 mr-1">({product.rating})</span>
                  </div>
                )}

                {/* اسم المنتج */}
                <h3 className="font-medium text-sm sm:text-base line-clamp-2 mb-2 text-slate-800 min-h-[2.5rem]">
                  {product.name}
                </h3>

                {/* السعر */}
                <div className="flex items-center justify-between">
                  <div className={`text-base font-bold ${colors.text}`}>
                    {product.price} <span className="text-xs">ج.م</span>
                  </div>

                  {product.old_price ? (
                    <div className="text-slate-500 line-through text-xs">{product.old_price} ج.م</div>
                  ) : product.stock > 0 ? (
                    <div className="text-xs text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 border border-emerald-100">
                      <Check className="w-3 h-3" />
                      <span>متوفر</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  )
}

export default ProductCollection
