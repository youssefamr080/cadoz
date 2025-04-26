"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useParams } from "next/navigation"
import { useGetProductsQuery } from "../../../../lib/redux/api/apiSlice"
import LoadingSpinner from "../../../../components/ui/LoadingSpinner"
import Image from "next/image"
import Link from "next/link"
import { Tag, SlidersHorizontal, Check, Calendar, Gift, ShoppingBag } from "lucide-react"
import { Button } from "../../../../components/ui/button"

import { useSortOptions } from "../../../../lib/hooks/use-sort-options"

// تعريف أنواع المواسم
interface Season {
  name: string
  slug: string
  title: string
  description: string
  color: string
  gradientFrom: string
  gradientTo: string
  icon: React.ReactNode
  emoji: string
}

// قائمة المواسم المدعومة
const seasons: Record<string, Season> = {
  ramadan: {
    name: "رمضان",
    slug: "ramadan",
    title: "تشكيلة رمضان",
    description: "اكتشف تشكيلتنا الخاصة بشهر رمضان المبارك مع منتجات مميزة تناسب احتياجاتك الرمضانية",
    color: "violet",
    gradientFrom: "from-violet-500",
    gradientTo: "to-indigo-600",
    icon: <Calendar className="w-8 h-8" />,
    emoji: "🌙",
  },
  "eid-al-fitr": {
    name: "عيد الفطر",
    slug: "eid-al-fitr",
    title: "تشكيلة عيد الفطر",
    description: "اكتشف تشكيلتنا الخاصة بعيد الفطر المبارك مع منتجات مميزة تناسب احتفالاتك",
    color: "emerald",
    gradientFrom: "from-emerald-500",
    gradientTo: "to-teal-600",
    icon: <Gift className="w-8 h-8" />,
    emoji: "🎉",
  },
  "eid-al-adha": {
    name: "عيد الأضحى",
    slug: "eid-al-adha",
    title: "تشكيلة عيد الأضحى",
    description: "اكتشف تشكيلتنا الخاصة بعيد الأضحى المبارك مع منتجات مميزة تناسب احتفالاتك",
    color: "green",
    gradientFrom: "from-green-500",
    gradientTo: "to-emerald-600",
    icon: <Gift className="w-8 h-8" />,
    emoji: "🐑",
  },
  mawlid: {
    name: "المولد النبوي",
    slug: "mawlid",
    title: "تشكيلة المولد النبوي",
    description: "اكتشف تشكيلتنا الخاصة بالمولد النبوي الشريف مع منتجات مميزة تناسب هذه المناسبة",
    color: "blue",
    gradientFrom: "from-blue-500",
    gradientTo: "to-indigo-600",
    icon: <Calendar className="w-8 h-8" />,
    emoji: "🕌",
  },
  "sham-el-nessim": {
    name: "شم النسيم",
    slug: "sham-el-nessim",
    title: "تشكيلة شم النسيم",
    description: "اكتشف تشكيلتنا الخاصة بشم النسيم مع منتجات مميزة تناسب احتفالاتك الربيعية",
    color: "yellow",
    gradientFrom: "from-yellow-400",
    gradientTo: "to-amber-500",
    icon: <Calendar className="w-8 h-8" />,
    emoji: "🌸",
  },
  valentine: {
    name: "عيد الحب",
    slug: "valentine",
    title: "تشكيلة عيد الحب",
    description: "اكتشف تشكيلتنا الخاصة بعيد الحب مع هدايا مميزة لمن تحب",
    color: "red",
    gradientFrom: "from-red-500",
    gradientTo: "to-rose-600",
    icon: <Gift className="w-8 h-8" />,
    emoji: "❤️",
  },
  "mothers-day": {
    name: "عيد الأم",
    slug: "mothers-day",
    title: "تشكيلة عيد الأم",
    description: "اكتشف تشكيلتنا الخاصة بعيد الأم مع هدايا مميزة تعبر عن حبك وتقديرك",
    color: "pink",
    gradientFrom: "from-pink-500",
    gradientTo: "to-rose-600",
    icon: <Gift className="w-8 h-8" />,
    emoji: "🌹",
  },
  "new-year": {
    name: "رأس السنة الميلادية",
    slug: "new-year",
    title: "تشكيلة رأس السنة",
    description: "اكتشف تشكيلتنا الخاصة برأس السنة الميلادية مع منتجات مميزة للاحتفال بالعام الجديد",
    color: "gold",
    gradientFrom: "from-amber-400",
    gradientTo: "to-yellow-500",
    icon: <Calendar className="w-8 h-8" />,
    emoji: "🎆",
  },
  christmas: {
    name: "عيد الميلاد",
    slug: "christmas",
    title: "تشكيلة عيد الميلاد",
    description: "اكتشف تشكيلتنا الخاصة بعيد الميلاد مع هدايا وزينة مميزة للاحتفال",
    color: "white",
    gradientFrom: "from-slate-100",
    gradientTo: "to-gray-200",
    icon: <Gift className="w-8 h-8" />,
    emoji: "🎄",
  },
}

const SeasonalPage = () => {
  const params = useParams()
  const slug = params?.slug as string
  const [isPageLoaded, setIsPageLoaded] = useState(false)

  // التحقق من وجود الموسم
  const currentSeason = seasons[slug] || {
    name: "المواسم",
    slug: "seasonal",
    title: "تشكيلة المواسم",
    description: "اكتشف تشكيلتنا الخاصة بمختلف المواسم والمناسبات",
    color: "blue",
    gradientFrom: "from-blue-500",
    gradientTo: "to-indigo-600",
    icon: <Calendar className="w-8 h-8" />,
    emoji: "🗓️",
  }

  // استخدام خيارات الترتيب
  const { sortOption, showSortOptions, setShowSortOptions, handleSortChange } = useSortOptions("newest")

  // معلمات الاستعلام للحصول على المنتجات
  const queryParams = {
    season: slug, // استخدام الـ slug للموسم للتصفية
    limit: 50,
    sort: sortOption,
  }

  // استعلام المنتجات
  const {
    data: productsResponse,
    isLoading: isProductsLoading,
    refetch,
    isFetching,
    isError,
  } = useGetProductsQuery(queryParams)

  // إعادة تحميل البيانات عند تغيير خيار الترتيب
  useEffect(() => {
    refetch()
  }, [sortOption, refetch])

  // تأثير لمحاكاة التحميل
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // إغلاق قائمة الترتيب عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = () => {
      if (showSortOptions) {
        setShowSortOptions(false)
      }
    }

    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [showSortOptions, setShowSortOptions])

  // تأثيرات الحركة
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  // حالة التحميل
  const isLoading = isProductsLoading || !isPageLoaded || isFetching

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <LoadingSpinner message={`جاري تحميل تشكيلة ${currentSeason.name}...`} />
      </div>
    )
  }

  // المنتجات
  const products = productsResponse?.data || []

  // تحديد ألوان الخلفية بناءً على الموسم
  const getBgGradient = () => {
    return `bg-gradient-to-r ${currentSeason.gradientFrom} ${currentSeason.gradientTo}`
  }

  return (
    <div className="min-h-screen bg-slate-50">
     

      <main className="pb-16">
        {/* بانر الصفحة */}
        <div className={`relative h-48 md:h-64 lg:h-80 ${getBgGradient()} overflow-hidden`}>
          <div className="absolute inset-0 bg-pattern opacity-10"></div>
          <div className="container mx-auto px-4 h-full flex flex-col justify-center items-center text-white relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4">
                {currentSeason.icon}
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">{currentSeason.title}</h1>
              <p className="text-white/80 max-w-xl mx-auto">{currentSeason.description}</p>
            </motion.div>
          </div>

          {/* زخارف موسمية */}
          <div className="absolute inset-0 overflow-hidden">
            {currentSeason.slug === "ramadan" && (
              <>
                <div className="absolute -top-10 right-10 text-6xl opacity-20 rotate-12">🌙</div>
                <div className="absolute bottom-10 left-10 text-6xl opacity-20 rotate-12">✨</div>
              </>
            )}
            {currentSeason.slug === "eid-al-fitr" && (
              <>
                <div className="absolute -top-10 right-10 text-6xl opacity-20 rotate-12">🎉</div>
                <div className="absolute bottom-10 left-10 text-6xl opacity-20 rotate-12">🎊</div>
              </>
            )}
            {currentSeason.slug === "valentine" && (
              <>
                <div className="absolute -top-10 right-10 text-6xl opacity-20 rotate-12">❤️</div>
                <div className="absolute bottom-10 left-10 text-6xl opacity-20 rotate-12">💝</div>
              </>
            )}
          </div>
        </div>

        {/* قسم المنتجات */}
        <div className="container mx-auto px-4 py-6">
          {/* خيارات الترتيب */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-lg font-medium text-slate-700 flex items-center gap-2">
              <span className="text-xl">{currentSeason.emoji}</span>
              <span>منتجات {currentSeason.name}</span>
            </div>

            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowSortOptions(!showSortOptions)
                }}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>ترتيب حسب</span>
              </Button>

              {/* قائمة خيارات الترتيب */}
              {showSortOptions && (
                <div
                  className="absolute top-full right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-slate-200 z-50 overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="py-1">
                    <button
                      className={`w-full text-right px-4 py-2 text-sm ${
                        sortOption === "discount" ? "bg-slate-100 text-rose-600" : "text-slate-700 hover:bg-slate-50"
                      }`}
                      onClick={() => handleSortChange("discount")}
                    >
                      <div className="flex items-center justify-between">
                        <span>نسبة الخصم</span>
                        {sortOption === "discount" && <Check className="w-4 h-4" />}
                      </div>
                    </button>
                    <button
                      className={`w-full text-right px-4 py-2 text-sm ${
                        sortOption === "price_asc" ? "bg-slate-100 text-rose-600" : "text-slate-700 hover:bg-slate-50"
                      }`}
                      onClick={() => handleSortChange("price_asc")}
                    >
                      <div className="flex items-center justify-between">
                        <span>السعر: من الأقل للأعلى</span>
                        {sortOption === "price_asc" && <Check className="w-4 h-4" />}
                      </div>
                    </button>
                    <button
                      className={`w-full text-right px-4 py-2 text-sm ${
                        sortOption === "price_desc" ? "bg-slate-100 text-rose-600" : "text-slate-700 hover:bg-slate-50"
                      }`}
                      onClick={() => handleSortChange("price_desc")}
                    >
                      <div className="flex items-center justify-between">
                        <span>السعر: من الأعلى للأقل</span>
                        {sortOption === "price_desc" && <Check className="w-4 h-4" />}
                      </div>
                    </button>
                    <button
                      className={`w-full text-right px-4 py-2 text-sm ${
                        sortOption === "newest" ? "bg-slate-100 text-rose-600" : "text-slate-700 hover:bg-slate-50"
                      }`}
                      onClick={() => handleSortChange("newest")}
                    >
                      <div className="flex items-center justify-between">
                        <span>الأحدث</span>
                        {sortOption === "newest" && <Check className="w-4 h-4" />}
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* عرض المنتجات */}
          {isError ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                <Tag className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-medium text-slate-700 mb-2">حدث خطأ أثناء تحميل المنتجات</h3>
              <p className="text-slate-500 max-w-md mx-auto">يرجى المحاولة مرة أخرى لاحقاً أو الاتصال بالدعم الفني.</p>
              <button
                onClick={() => refetch()}
                className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition-colors"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : products.length > 0 ? (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
            >
              {products.map((product) => (
                <motion.div key={product.id} variants={fadeInUp}>
                  <Link
                    href={`/product/${product.id}`}
                    className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col h-full border border-slate-200"
                  >
                    <div className="relative pt-[100%] overflow-hidden bg-slate-100">
                      <Image
                        src={product.image || "/placeholder.svg?height=300&width=300"}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-110 duration-700"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      />
                      {product.old_price && (
                        <div
                          className={`absolute top-2 left-2 ${getBgGradient()} text-white py-0.5 px-2 text-xs font-semibold rounded-full shadow-sm`}
                        >
                          {Math.round(((product.old_price - product.price) / product.old_price) * 100)}%
                        </div>
                      )}

                      {/* شارة الموسم */}
                      <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm text-xs py-0.5 px-2 rounded-full shadow-sm flex items-center gap-1">
                        <span>{currentSeason.emoji}</span>
                        <span className="font-medium">{currentSeason.name}</span>
                      </div>
                    </div>
                    <div className="p-3 flex-1 flex flex-col">
                      <h3 className="font-medium text-sm line-clamp-2 mb-1 flex-1 group-hover:text-rose-600 transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between mt-auto">
                        <p className="text-slate-900 font-bold text-base">
                          {product.price} <span className="text-xs">ج.م</span>
                        </p>
                        {product.old_price && (
                          <p className="text-slate-500 line-through text-xs">{product.old_price} ج.م</p>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                <ShoppingBag className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-medium text-slate-700 mb-2">لا توجد منتجات متاحة</h3>
              <p className="text-slate-500 max-w-md mx-auto">
                لم نتمكن من العثور على منتجات في تشكيلة {currentSeason.name}. يرجى زيارتنا مرة أخرى قريباً.
              </p>
              <Link href="/">
                <Button className="mt-4">العودة للصفحة الرئيسية</Button>
              </Link>
            </div>
          )}
        </div>
      </main>


      
    </div>
  )
}

export default SeasonalPage