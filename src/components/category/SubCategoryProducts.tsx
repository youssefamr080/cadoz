"use client"

import { useMemo } from "react"
import BrandSwiper from "../product/BrandSwiper"
import { useGetProductsQuery } from "../../lib/redux/api/apiSlice"
import LoadingSpinner from "../ui/LoadingSpinner"
import { motion } from "framer-motion"
import { ShoppingBag } from "lucide-react"
import Image from "next/image"

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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-3"
            >
              <div className="aspect-square relative rounded-md overflow-hidden mb-3">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <h3 className="font-medium text-sm line-clamp-1">{product.name}</h3>
              <div className="flex justify-between items-center mt-2">
                <span className="text-purple-700 font-bold">{product.price} ج.م</span>
                {product.rating && (
                  <div className="flex items-center">
                    <span className="text-amber-500">★</span>
                    <span className="text-xs text-gray-600 ml-1">{product.rating}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SubCategoryProducts
