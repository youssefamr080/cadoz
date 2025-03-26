"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Header from "../components/layout/Header"
import Footer from "../components/layout/Footer"
import SeasonalBanner from "../components/home/SeasonalBanner"
import ProductCollection from "../components/home/ProductCollection"
import CountdownTimer from "../components/home/CountdownTimer"
import PriceRangeSwiper from "../components/home/PriceRangeSwiper"
import GiftFinderSection from "../components/home/GiftFinderSection"
import { useGetProductsQuery } from "../lib/redux/api/apiSlice"
import LoadingSpinner from "../components/ui/LoadingSpinner"
import type { Product } from "../types/product"
import { Swiper, SwiperSlide } from "swiper/react"
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import "swiper/css/effect-fade"
import { Navigation, Pagination, Autoplay } from "swiper/modules"
import Image from "next/image"
import Link from "next/link"
import RecommendationEngine from "../components/home/RecommendationEngine"
import { ShoppingBag, TrendingUp, Sparkles, Tag, Eye, ChevronRight } from "lucide-react"

// تحديد الموسم الحالي
const getCurrentSeason = () => {
  const now = new Date()
  const month = now.getMonth() + 1 // getMonth() يبدأ من 0
  const day = now.getDate()

// رمضان 2025 (من 1 مارس إلى 30 مارس)
if (month === 3 && day >= 1 && day <= 30) {
  return {
    name: "Ramadan",
    arabicName: "رمضان",
    emoji: "🌙",
    color: "from-violet-700 to-indigo-900",
    endDate: new Date(2025, 2, 30), // 30 مارس 2025
    banner: "/images/image_fx_ (35).webp",
  }
}

// عيد الفطر 2025 (من 31 مارس إلى 2 أبريل)
if ((month === 3 && day === 30) || (month === 4 && day <= 3)) {
  return {
    name: "Eid Al-Fitr",
    arabicName: "عيد الفطر",
    emoji: "🎉",
    color: "from-amber-500 to-orange-700",
    endDate: new Date(2025, 4, 4), // 2 أبريل 2025
    banner: "/images/image_fx_ (35).webp",
  }
}

// عيد الأضحى 2025 (من 7 يونيو إلى 10 يونيو)
if (month === 6 && day >= 7 && day <= 10) {
  return {
    name: "Eid Al-Adha",
    arabicName: "عيد الأضحى",
    emoji: "🐑",
    color: "from-emerald-600 to-green-800",
    endDate: new Date(2025, 5, 10), // 10 يونيو 2025
    banner: "/images/image_fx_ (35).webp",
  }
}

// المولد النبوي 2025 (6 سبتمبر)
if (month === 9 && day === 6) {
  return {
    name: "Mawlid",
    arabicName: "المولد النبوي",
    emoji: "🕌",
    color: "from-blue-600 to-indigo-800",
    endDate: new Date(2025, 8, 6), // 6 سبتمبر 2025
    banner: "/images/image_fx_ (35).webp",
  }
}

// شم النسيم 2025 (21 أبريل)
if (month === 4 && day === 21) {
  return {
    name: "Sham El-Nessim",
    arabicName: "شم النسيم",
    emoji: "🌸",
    color: "from-yellow-400 to-amber-600",
    endDate: new Date(2025, 3, 21), // 21 أبريل 2025
    banner: "/images/image_fx_ (35).webp",
  }
}

// عيد الحب 2025 (14 فبراير)
if (month === 2 && day === 14) {
  return {
    name: "Valentine's Day",
    arabicName: "عيد الحب",
    emoji: "❤️",
    color: "from-rose-600 to-pink-900",
    endDate: new Date(2025, 1, 14), // 14 فبراير 2025
    banner: "/images/image_fx_ (35).webp",
  }
}

// عيد الأم 2025 (21 مارس)
if (month === 3 && day === 21) {
  return {
    name: "Mother's Day",
    arabicName: "عيد الأم",
    emoji: "💐",
    color: "from-fuchsia-600 to-purple-800",
    endDate: new Date(2025, 2, 21), // 21 مارس 2025
    banner: "/images/image_fx_ (35).webp",
  }
}

// رأس السنة الميلادية 2025 (1 يناير)
if (month === 1 && day === 1) {
  return {
    name: "New Year's Day",
    arabicName: "رأس السنة الميلادية",
    emoji: "🎆",
    color: "from-gray-700 to-gray-900",
    endDate: new Date(2025, 0, 1), // 1 يناير 2025
    banner: "/images/image_fx_ (35).webp",
  }
}

// عيد الميلاد (للمسيحيين) 2025 (7 يناير)
if (month === 1 && day === 7) {
  return {
    name: "Christmas (Orthodox)",
    arabicName: "عيد الميلاد",
    emoji: "🎄",
    color: "from-green-700 to-emerald-900",
    endDate: new Date(2025, 0, 7), // 7 يناير 2025
    banner: "/images/image_fx_ (35).webp",
  }
}

  // موسم افتراضي في حال لم ينطبق أي موسم
  return {
    name: "Special Gifts",
    arabicName: "هدايا مميزة",
    emoji: "🎁",
    color: "from-sky-600 to-blue-900",
    endDate: new Date(2025, 11, 31), // 31 ديسمبر 2025
    banner: "/images/image_fx_ (35).webp",
  }
}

// تحديد الموسم القادم
const getNextSeason = () => {
  const now = new Date()
  const month = now.getMonth() + 1
  const day = now.getDate()

  // نحدد الموسم القادم بناءً على التاريخ الحالي
  if (month === 1 || (month === 2 && day < 14)) {
    return {
      name: "Valentine's Day",
      arabicName: "عيد الحب",
      date: new Date(2025, 1, 14), // 14 فبراير 2025
      color: "rose",
      emoji: "❤️",
    }
  } else if ((month === 2 && day >= 14) || (month === 3 && day < 15)) {
    return {
      name: "Mother's Day",
      arabicName: "عيد الأم",
      date: new Date(2025, 2, 21), // 21 مارس 2025
      color: "fuchsia",
      emoji: "💐",
    }
  } else if ((month === 3 && day >= 15) || (month === 4 && day < 20)) {
    return {
      name: "Ramadan",
      arabicName: "رمضان",
      date: new Date(2025, 2, 20), // تاريخ تقريبي لبداية رمضان 2025
      color: "violet",
      emoji: "🌙",
    }
  } else if (month <= 11) {
    return {
      name: "New Year",
      arabicName: "رأس السنة",
      date: new Date(2025, 11, 31),
      color: "cyan",
      emoji: "✨",
    }
  } else {
    return {
      name: "Valentine's Day",
      arabicName: "عيد الحب",
      date: new Date(2026, 1, 14),
      color: "rose",
      emoji: "❤️",
    }
  }
}

const HomePage = () => {
  const [viewedProducts, setViewedProducts] = useState<Product[]>([])
  const [, setRecommendedProducts] = useState<Product[]>([])
  const [currentSeason] = useState(getCurrentSeason())
  const [nextSeason] = useState(getNextSeason())
  const [isPageLoaded, setIsPageLoaded] = useState(false)

  // استخدام RTK Query لجلب المنتجات
  const { data: trendingData, isLoading: isTrendingLoading } = useGetProductsQuery({
    best_seller: true,
    limit: 12,
  })

  const { data: newArrivalsData, isLoading: isNewArrivalsLoading } = useGetProductsQuery({
    new_arrival: true,
    limit: 12,
  })

  const { data: saleData, isLoading: isSaleLoading } = useGetProductsQuery({
    sale: true,
    discount: true,
    limit: 12,
    sort: "discount",
  })

  // استرجاع المنتجات المشاهدة من Local Storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const viewedProductsData = localStorage.getItem("viewedProducts")
        if (viewedProductsData) {
          const parsed = JSON.parse(viewedProductsData)
          setViewedProducts(parsed)

          // استخراج الفئات والعلامات من المنتجات المشاهدة لاقتراح منتجات مشابهة
          const viewedCategories = new Set(parsed.map((p: Product) => p.category).filter(Boolean))
          const viewedTags = new Set(parsed.flatMap((p: Product) => p.tags || []).filter(Boolean))

          if (viewedCategories.size > 0 || viewedTags.size > 0) {
            // اختيار فئة عشوائية من الفئات المشاهدة
            const categoriesArray = Array.from(viewedCategories)
            const randomCategory = categoriesArray[Math.floor(Math.random() * categoriesArray.length)]

            // اختيار علامة عشوائية من العلامات المشاهدة
            const tagsArray = Array.from(viewedTags)
            const randomTags = tagsArray
              .sort(() => 0.5 - Math.random())
              .slice(0, 3)
              .join(",")

            // جلب منتجات مقترحة بناءً على سلوك المستخدم
            fetch(`/api/products?category=${randomCategory}&tags=${randomTags}&limit=8`)
              .then((res) => res.json())
              .then((data) => {
                if (data.success && data.data.length > 0) {
                  // استبعاد المنتجات التي شاهدها المستخدم بالفعل
                  const viewedIds = new Set(parsed.map((p: Product) => p.id))
                  const filteredRecommendations = data.data.filter((p: Product) => !viewedIds.has(p.id))

                  setRecommendedProducts(filteredRecommendations.length > 0 ? filteredRecommendations : data.data)
                }
              })
              .catch((err) => console.error("Error fetching recommendations:", err))
          }
        }
      } catch (error) {
        console.error("Error parsing viewed products:", error)
      }
    }

    // تأخير تحميل الصفحة لإظهار تأثير التحميل
    const timer = setTimeout(() => {
      setIsPageLoaded(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // التأثير الحركي للعناصر عند ظهورها
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
  }

  // عرض حالة التحميل
  const isLoading = isTrendingLoading || isNewArrivalsLoading || isSaleLoading || !isPageLoaded

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <LoadingSpinner message="جاري تحميل المتجر..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="pb-16">
        {/* بانر الموسم الحالي */}
        <SeasonalBanner season={currentSeason} />

        {/* عداد تنازلي للموسم القادم */}
        <div className="container mx-auto px-4 my-8">
          <CountdownTimer
            targetDate={nextSeason.date}
            seasonName={nextSeason.arabicName}
            seasonColor={nextSeason.color}
            seasonEmoji={nextSeason.emoji}
          />
        </div>

        {/* سويبر فئات الأسعار */}
        <div className="container mx-auto px-4">
          <PriceRangeSwiper />
        </div>

        {/* مساعد اختيار الهدايا */}
        <GiftFinderSection />

        {/* المنتجات الرائجة */}
        {trendingData?.data.length > 0 && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeInUp}
            className="container mx-auto px-4 py-10 md:py-12"
          >
            <div className="flex flex-col items-center mb-6 md:mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 text-white mb-3 transform -rotate-3">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-center text-slate-800 mb-1">الأكثر مبيعاً</h2>
              <div className="w-16 h-1 bg-gradient-to-r from-amber-400 to-orange-600 rounded-full mb-2"></div>
              <p className="text-center text-slate-600 text-sm max-w-2xl">
                اكتشف الهدايا المفضلة لدى متسوقينا والتي حازت على إعجاب الكثيرين
              </p>
            </div>

            <ProductCollection products={trendingData.data} accentColor="amber" compact={true} />

            <div className="text-center mt-6 md:mt-8">
              <Link
                href="/category/best-sellers"
                className="group inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-orange-600 text-white px-5 py-2.5 rounded-full font-medium transition-all duration-300 shadow-md shadow-amber-200 hover:shadow-amber-300/50 hover:scale-105 text-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>عرض جميع المنتجات الرائجة</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>
        )}

        {/* عروض خاصة */}
        {saleData?.data.length > 0 && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeInUp}
            className="py-10 md:py-12 bg-gradient-to-br from-slate-100 to-slate-50"
          >
            <div className="container mx-auto px-4">
              <div className="flex flex-col items-center mb-6 md:mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-rose-500 to-red-700 text-white mb-3 transform rotate-3">
                  <Tag className="w-6 h-6" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-center text-slate-800 mb-1">عروض خاصة</h2>
                <div className="w-16 h-1 bg-gradient-to-r from-rose-500 to-red-700 rounded-full mb-2"></div>
                <p className="text-center text-slate-600 text-sm max-w-2xl">
                  خصومات حصرية لفترة محدودة على مجموعة مختارة من الهدايا المميزة
                </p>
              </div>

              <ProductCollection products={saleData.data} accentColor="rose" compact={true} />

              <div className="text-center mt-6 md:mt-8">
                <Link
                  href="/category/sale"
                  className="group inline-flex items-center gap-1.5 bg-gradient-to-r from-rose-500 to-red-700 text-white px-5 py-2.5 rounded-full font-medium transition-all duration-300 shadow-md shadow-rose-200 hover:shadow-rose-300/50 hover:scale-105 text-sm"
                >
                  <Tag className="w-4 h-4" />
                  <span>عرض جميع العروض</span>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* وصل حديثاً */}
        {newArrivalsData?.data.length > 0 && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeInUp}
            className="container mx-auto px-4 py-10 md:py-12"
          >
            <div className="flex flex-col items-center mb-6 md:mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white mb-3 transform -rotate-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-center text-slate-800 mb-1">وصل حديثاً</h2>
              <div className="w-16 h-1 bg-gradient-to-r from-emerald-400 to-teal-600 rounded-full mb-2"></div>
              <p className="text-center text-slate-600 text-sm max-w-2xl">
                اكتشف أحدث الهدايا في متجرنا التي وصلت للتو من أفضل الماركات العالمية
              </p>
            </div>

            <ProductCollection products={newArrivalsData.data} accentColor="emerald" compact={true} />

            <div className="text-center mt-6 md:mt-8">
              <Link
                href="/category/new-arrivals"
                className="group inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-400 to-teal-600 text-white px-5 py-2.5 rounded-full font-medium transition-all duration-300 shadow-md shadow-emerald-200 hover:shadow-emerald-300/50 hover:scale-105 text-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>عرض جميع المنتجات الجديدة</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>
        )}

        {/* المنتجات التي شاهدتها مؤخراً */}
        {viewedProducts.length > 0 && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeInUp}
            className="py-10 md:py-12 bg-gradient-to-br from-slate-100 to-slate-50"
          >
            <div className="container mx-auto px-4">
              <div className="flex flex-col items-center mb-6 md:mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 text-white mb-3 transform rotate-3">
                  <Eye className="w-6 h-6" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-center text-slate-800 mb-1">شاهدت مؤخراً</h2>
                <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-indigo-600 rounded-full mb-2"></div>
                <p className="text-center text-slate-600 text-sm max-w-2xl">
                  المنتجات التي استعرضتها سابقاً وقد ترغب في العودة إليها
                </p>
              </div>

              <div className="relative">
                <Swiper
                  spaceBetween={12}
                  slidesPerView={3}
                  navigation
                  pagination={{ clickable: true, dynamicBullets: true }}
                  autoplay={{ delay: 5000, disableOnInteraction: false }}
                  breakpoints={{
                    320: { slidesPerView: 2.5, spaceBetween: 8 },
                    480: { slidesPerView: 3.5, spaceBetween: 10 },
                    640: { slidesPerView: 4.5, spaceBetween: 12 },
                    768: { slidesPerView: 5.5, spaceBetween: 12 },
                    1024: { slidesPerView: 6.5, spaceBetween: 16 },
                  }}
                  className="py-4 px-2"
                  modules={[Navigation, Pagination, Autoplay]}
                >
                  {viewedProducts.slice(0, 10).map((product) => (
                    <SwiperSlide key={`viewed-${product.id}`}>
                      <Link
                        href={`/product/${product.id}`}
                        className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col h-full border border-slate-200"
                      >
                        <div className="relative pt-[100%] overflow-hidden bg-slate-100">
                          <Image
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform group-hover:scale-110 duration-700"
                            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 16vw"
                          />
                          {product.old_price && (
                            <div className="absolute top-2 left-2 bg-gradient-to-r from-rose-500 to-red-700 text-white py-0.5 px-1.5 text-[10px] font-semibold rounded-full shadow-sm">
                              {Math.round(((product.old_price - product.price) / product.old_price) * 100)}%
                            </div>
                          )}
                        </div>
                        <div className="p-2 flex-1 flex flex-col">
                          <h3 className="font-medium text-xs line-clamp-2 mb-1 flex-1 group-hover:text-blue-600 transition-colors">
                            {product.name}
                          </h3>
                          <div className="flex items-center justify-between mt-auto">
                            <p className="text-slate-900 font-bold text-sm">
                              {product.price} <span className="text-[10px]">ج.م</span>
                            </p>
                            {product.old_price && (
                              <p className="text-slate-500 line-through text-[10px]">{product.old_price}</p>
                            )}
                          </div>
                        </div>
                      </Link>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          </motion.div>
        )}

        {/* المنتجات المقترحة لك - نظام توصيات ذكي */}
        <RecommendationEngine title="مقترحة لك" subtitle="منتجات مختارة خصيصاً بناءً على اهتماماتك وتفضيلاتك" />


      </main>

      <Footer />
    </div>
  )
}

export default HomePage

