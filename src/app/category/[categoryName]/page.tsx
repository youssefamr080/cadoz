"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Header from "../../../components/layout/Header"
import Footer from "../../../components/layout/Footer"
import CategoryBanner from "../../../components/category/CategoryBanner"
import SubCategorySwiper from "../../../components/category/SubCategorySwiper"
import SubCategoryProducts from "../../../components/category/SubCategoryProducts"
import FeaturedGiftsSwiper from "../../../components/category/FeaturedGiftsSwiper"

type CategoryType = "men" | "women" | "kids"

// القيم الافتراضية للفئات الفرعية
const defaultSubCategories: Record<CategoryType, string> = {
  men: "ساعات",
  women: "ساعات",
  kids: "دباديب",
}

const CategoryPage = () => {
  const params = useParams()
  const categoryName = params?.categoryName as CategoryType

  // إدارة حالة القسم الفرعي
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("")

  // التحقق من صحة الفئة
  const isValidCategory = (category: string): category is CategoryType => {
    return ["men", "women", "kids"].includes(category)
  }

  // تهيئة القسم الفرعي
  useEffect(() => {
    if (isValidCategory(categoryName)) {
      setSelectedSubCategory(defaultSubCategories[categoryName])
    }
  }, [categoryName])

  // التحقق من وجود فئة صالحة
  if (!isValidCategory(categoryName)) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-semibold">
        ⚠️ خطأ: هذا القسم غير موجود!
      </div>
    )
  }

  // ترجمة اسم الفئة للعربية
  const getCategoryArabicName = (category: CategoryType): string => {
    const names = {
      men: "رجالي",
      women: "نسائي",
      kids: "أطفال",
    }
    return names[category]
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main>
        {/* بانر القسم */}
        <CategoryBanner category={categoryName} />

        {/* سويبر الهدايا المميزة */}
        <div className="py-6 bg-white shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">هدايا جاهزة - {getCategoryArabicName(categoryName)}</h2>

            </div>
            <FeaturedGiftsSwiper category={categoryName} />
          </div>
        </div>

        {/* سويبر الفئات الفرعية */}
        <div className="sticky top-0 z-20 bg-white shadow-sm">
          <div className="container mx-auto px-4">
            <SubCategorySwiper
              category={categoryName}
              onSelectSubCategory={setSelectedSubCategory}
              initialSubCategory={selectedSubCategory}
            />
          </div>
        </div>

        {/* منتجات القسم الفرعي */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">{selectedSubCategory}</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">ترتيب حسب:</span>
              <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white">

                <option>السعر: من الأقل للأعلى</option>
                <option>السعر: من الأعلى للأقل</option>

              </select>
            </div>
          </div>

          <SubCategoryProducts category={categoryName} subCategory={selectedSubCategory} />
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default CategoryPage
