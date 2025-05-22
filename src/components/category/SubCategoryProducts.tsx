"use client"

import { useMemo } from "react"
import BrandSwiper from "../product/BrandSwiper"
import { useGetProductsQuery } from "../../lib/redux/api/apiSlice"
import LoadingSpinner from "../ui/LoadingSpinner"
import { motion } from "framer-motion"
import { ShoppingBag } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Star } from "lucide-react"

interface SubCategoryProductsProps {
  category: string
  subCategory: string
  sortOrder?: string
}

const SubCategoryProducts = ({ category, subCategory, sortOrder = "popularity" }: SubCategoryProductsProps) => {
  // ✅ استخدام RTK Query لجلب المنتجات من API
  const { data, error, isLoading } = useGetProductsQuery({
    category,
    subCategory,
    sort: sortOrder,
    limit: 100, // يمكن تعديل هذا حسب الحاجة
  })

  // ✅ حساب البراندات باستخدام useMemo
  const brands = useMemo(() => {
    if (!data?.data) return []

    return [...new Set(data.data.map((p) => p.brand).filter((b) => typeof b === "string" && b !== ""))]
  }, [data?.data]) // يعاد الحساب عند تغير المنتجات المفلترة

  // عرض حالة التحميل
  if (isLoading) {
    return <LoadingSpinner message="جاري تحميل المنتجات..." />
  }

  // عرض رسالة الخطأ
  if (error) {
    return (
      <div className="container mx-auto my-6 text-center text-red-500">
        <p>⚠️ حدث خطأ أثناء تحميل المنتجات</p>
      </div>
    )
  }

  // عرض رسالة إذا لم تكن هناك منتجات
  if (!data?.data || data.data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto my-12 py-12 flex flex-col items-center justify-center"
      >
        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4">
          <ShoppingBag className="w-10 h-10 text-purple-400" />
        </div>
        <p className="text-center text-gray-600 text-lg font-medium mb-2">لا توجد منتجات متاحة</p>
        <p className="text-center text-gray-500 text-sm max-w-md">
          لم نتمكن من العثور على منتجات في هذا القسم حالياً. يرجى تجربة قسم آخر أو العودة لاحقاً.
        </p>
      </motion.div>
    )
  }

  return (
    <div className="container mx-auto my-6">
      {brands.length > 0 ? (
        brands.map((brand) => {
          const brandProducts = data.data.filter((p) => p.brand === brand)
          return brandProducts.length > 0 ? <BrandSwiper key={brand} brand={brand} products={brandProducts} /> : null
        })
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {data.data.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
              className="group relative h-full"
            >
              <Link href={`/product/${product.id}`} className="block h-full">
                <div className="relative h-full overflow-hidden rounded-lg bg-white shadow-sm transition-all duration-300 hover:shadow-md">
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                      priority
                    />
                    
                    {/* Discount Badge */}
                    {product.old_price && product.old_price > product.price && (
                      <div className="absolute left-0 top-0 bg-rose-500 px-2 py-1 text-xs font-medium text-white">
                        {Math.round(((product.old_price - product.price) / product.old_price) * 100)}% خصم
                      </div>
                    )}

                    {/* New Badge */}
                    {product.new_arrival && !product.old_price && (
                      <div className="absolute left-0 top-0 bg-emerald-500 px-2 py-1 text-xs font-medium text-white">
                        جديد
                      </div>
                    )}
                    
                    {/* Trending Badge */}
                    {product.trending && !product.old_price && !product.new_arrival && (
                      <div className="absolute left-0 top-0 bg-blue-500 px-2 py-1 text-xs font-medium text-white">
                        رائج
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-3">
                    {/* Product Name */}
                    <h3 className="mb-1 line-clamp-1 text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-300">
                      {product.name}
                    </h3>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <div className="text-base font-bold text-gray-900">
                        {product.price} <span className="text-xs">ج.م</span>
                      </div>

                      {product.old_price && product.old_price > product.price && (
                        <div className="text-xs text-gray-500 line-through">
                          {product.old_price}
                        </div>
                      )}
                    </div>
                    
                    {/* Rating */}
                    {product.rating && (
                      <div className="mt-1 flex items-center">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${i < Math.floor(product.rating || 0) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
                            />
                          ))}
                        </div>
                        <span className="mr-1 text-xs text-gray-500">({product.rating})</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SubCategoryProducts
