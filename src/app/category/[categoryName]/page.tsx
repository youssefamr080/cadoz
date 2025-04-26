"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import CategoryBanner from "../../../components/category/CategoryBanner"
import SubCategorySwiper from "../../../components/category/SubCategorySwiper"
import SubCategoryProducts from "../../../components/category/SubCategoryProducts"
import FeaturedGiftsSwiper from "../../../components/category/FeaturedGiftsSwiper"
import { FilterIcon, SlidersHorizontal } from "lucide-react"
import { motion } from "framer-motion"

type CategoryType = "men" | "women" | "kids"

// القيم الافتراضية للفئات الفرعية
const defaultSubCategories: Record<CategoryType, string> = {
  men: "watches",
  women: "watches",
  kids: "teddy-bears",
}

// ترجمة أسماء الفئات الفرعية من الإنجليزية للعربية
const subCategoryTranslations: Record<string, string> = {
  watches: "ساعات",
  wallets: "محافظ",
  perfumes: "عطور",
  handbags: "شنط يد",
  sunglasses: "نظارات شمسية",
  spray: "سبراي",
  accessories: "إكسسوارات",
  toys: "العاب اطفال",
  "teddy-bears": "دباديب",
}

const CategoryPage = () => {
  const params = useParams()
  const categoryName = params?.categoryName as CategoryType

  // إدارة حالة القسم الفرعي
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("")
  const [sortOrder, setSortOrder] = useState<string>("popularity")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const hasInitialized = useRef(false)

  // التحقق من صحة الفئة
  const isValidCategory = (category: string): category is CategoryType => {
    return ["men", "women", "kids"].includes(category)
  }

  // استخراج الفئة الفرعية من الهاش في الرابط عند تحميل الصفحة
  useEffect(() => {
    if (typeof window === "undefined" || !isValidCategory(categoryName)) return

    // هذه الوظيفة تقرأ الهاش وتعين القسم الفرعي المناسب
    const setSubCategoryFromHash = () => {
      const hash = window.location.hash.replace("#", "")
      console.log("Reading hash from URL:", hash)

      if (hash) {
        console.log("Setting subcategory from hash:", hash)
        setSelectedSubCategory(hash)
      } else if (!hasInitialized.current) {
        // استخدام القيمة الافتراضية فقط في المرة الأولى
        const defaultSubCategory = defaultSubCategories[categoryName]
        console.log("No hash found, using default subcategory:", defaultSubCategory)
        setSelectedSubCategory(defaultSubCategory)

        // تحديث الهاش في الرابط بالقيمة الافتراضية
        window.history.replaceState(null, "", `#${defaultSubCategory}`)
      }
    }

    // قراءة الهاش عند تحميل المكون
    setSubCategoryFromHash()
    hasInitialized.current = true

    // إضافة مستمع لتغييرات الهاش
    window.addEventListener("hashchange", setSubCategoryFromHash)

    // إزالة المستمع عند تفكيك المكون
    return () => {
      window.removeEventListener("hashchange", setSubCategoryFromHash)
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

  // تغيير الفئة الفرعية وتحديث الهاش
  const handleSubCategoryChange = (subCategory: string) => {
    console.log("Subcategory changed to:", subCategory)
    setSelectedSubCategory(subCategory)

    // تحديث الهاش في الرابط بدون إعادة تحميل الصفحة
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", `#${subCategory}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="space-y-6">
        {/* بانر القسم */}
        <div className="w-full">
          <CategoryBanner category={categoryName} />
        </div>

        {/* سويبر الهدايا المميزة */}
        <div className="py-6 bg-white shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">هدايا جاهزة - {getCategoryArabicName(categoryName)}</h2>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-purple-50 text-purple-700 text-sm px-3 py-1 rounded-full font-medium"
              >
                هدايا مميزة
              </motion.div>
            </div>
            <FeaturedGiftsSwiper category={categoryName} />
          </div>
        </div>

        {/* سويبر الفئات الفرعية */}
        <div className="sticky top-16 z-20 bg-white shadow-sm border-b border-gray-100">
          <div className="container mx-auto px-4">
            <SubCategorySwiper
              category={categoryName}
              onSelectSubCategory={handleSubCategoryChange}
              initialSubCategory={selectedSubCategory}
            />
          </div>
        </div>

        {/* منتجات القسم الفرعي */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div className="flex items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                {subCategoryTranslations[selectedSubCategory] || selectedSubCategory}
              </h2>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
                className="mr-3 bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full"
              >
                قسم {getCategoryArabicName(categoryName)}
              </motion.div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-1.5 text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white hover:bg-gray-50 transition-colors"
              >
                <FilterIcon className="w-4 h-4 text-gray-500" />
                <span>فلترة</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 hidden md:inline">ترتيب حسب:</span>
                <select
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="popularity">الأكثر شعبية</option>
                  <option value="price_asc">السعر: من الأقل للأعلى</option>
                  <option value="price_desc">السعر: من الأعلى للأقل</option>
                  <option value="newest">الأحدث</option>
                </select>
              </div>
            </div>
          </div>

          {/* قسم الفلترة */}
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: isFilterOpen ? "auto" : 0, opacity: isFilterOpen ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden mb-6"
          >
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-800 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-purple-500" />
                  خيارات التصفية
                </h3>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="text-sm text-purple-600 hover:text-purple-800"
                >
                  إغلاق
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">السعر</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="من"
                      className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                      type="number"
                      placeholder="إلى"
                      className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الماركة</label>
                  <select className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm">
                    <option value="">جميع الماركات</option>
                    <option value="brand1">ماركة 1</option>
                    <option value="brand2">ماركة 2</option>
                    <option value="brand3">ماركة 3</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">التقييم</label>
                  <select className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm">
                    <option value="">جميع التقييمات</option>
                    <option value="4">4 نجوم وأعلى</option>
                    <option value="3">3 نجوم وأعلى</option>
                    <option value="2">2 نجوم وأعلى</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-lg text-sm transition-colors">
                  تطبيق الفلترة
                </button>
              </div>
            </div>
          </motion.div>

          <SubCategoryProducts category={categoryName} subCategory={selectedSubCategory} sortOrder={sortOrder} />
        </div>
      </main>
    </div>
  )
}

export default CategoryPage
