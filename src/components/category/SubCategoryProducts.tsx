"use client"

import { useMemo } from "react"
import BrandSwiper from "../product/BrandSwiper"
import { useGetProductsQuery } from "../../lib/redux/api/apiSlice"
import LoadingSpinner from "../ui/LoadingSpinner"

const SubCategoryProducts = ({
  category,
  subCategory,
}: {
  category: string
  subCategory: string
}) => {
  // ✅ استخدام RTK Query لجلب المنتجات من API
  const { data, error, isLoading } = useGetProductsQuery({
    category,
    subCategory,
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
      <div className="container mx-auto my-6">
        <p className="text-center text-gray-500 text-lg">⚠️ لا توجد منتجات متاحة لهذا القسم حاليًا</p>
      </div>
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
        <p className="text-center text-gray-500 text-lg">⚠️ لا توجد براندات متاحة لهذا القسم</p>
      )}
    </div>
  )
}

export default SubCategoryProducts

