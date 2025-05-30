"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import SeasonalBanner from "../components/home/SeasonalBanner"
import CountdownTimer from "../components/home/CountdownTimer"
import PriceRangeSwiper from "../components/home/PriceRangeSwiper"
import GiftFinderSection from "../components/home/GiftFinderSection"
import { TrendingProductsSwiper, DiscountedProductsSwiper, NewProductsSwiper } from "../components/home/ProductSwiper"
import MainCategorySwiper from "../components/home/MainCategorySwiper"
import InspirationGallery from "../components/gift/inspiration-gallery"
import { useGetProductsQuery } from "../lib/redux/api/apiSlice"
import LoadingSpinner from "../components/ui/LoadingSpinner"
import type { Product } from "../types/product"
import {
  ShoppingBag,
  TrendingUp,
  Sparkles,
  Tag,
  Clock,
  ChevronRight,
  ChevronLeft,
  Star,
  Eye,
  Check,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, Autoplay } from "swiper/modules"
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import "swiper/css/effect-coverflow"
import { useRouter } from "next/navigation"

// أضف استيراد المكونات الجديدة في بداية الملف
import SectionDivider from "../components/home/SectionDivider"

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

// مكون زر التنقل المخصص للسويبر
const SwiperCustomButton = ({
  direction,
  onClick,
  color = "blue",
}: { direction: "next" | "prev"; onClick: () => void; color?: string }) => {
  const colorClasses = {
    blue: "bg-blue-500 hover:bg-blue-600 shadow-blue-200",
    amber: "bg-amber-500 hover:bg-amber-600 shadow-amber-200",
    rose: "bg-rose-500 hover:bg-rose-600 shadow-rose-200",
    emerald: "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200",
    violet: "bg-violet-500 hover:bg-violet-600 shadow-violet-200",
  }

  const buttonClass = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue

  return (
    <button
      onClick={onClick}
      className={`${buttonClass} text-white rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center shadow-lg z-10 transition-all duration-300 hover:scale-110 absolute top-1/2 transform -translate-y-1/2 ${direction === "next" ? "right-2 md:right-4" : "left-2 md:left-4"}`}
    >
      {direction === "next" ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
    </button>
  )
}

// مكون عنوان القسم المحسن
const SectionTitle = ({
  icon,
  title,
  subtitle,
  accentColor = "from-blue-500 to-indigo-600",
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  accentColor?: string
}) => {
  return (
    <div className="flex flex-col items-center mb-10">
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 100 }}
        className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${accentColor} text-white mb-4 shadow-lg`}
      >
        {icon}
      </motion.div>
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">{title}</h2>
      <div className={`w-20 h-1 bg-gradient-to-r ${accentColor} rounded-full mb-3`}></div>
      <p className="text-center text-gray-600 max-w-2xl">{subtitle}</p>
    </div>
  )
}

// تصميم جديد لبطاقة المنتج
const ProductCard = ({ product, accentColor = "blue" }: { product: Product; accentColor?: string }) => {
  const router = useRouter()

  const colorMap: Record<string, { bg: string; text: string; light: string; border: string }> = {
    blue: { bg: "from-blue-500 to-indigo-600", text: "text-blue-600", light: "bg-blue-50", border: "border-blue-100" },
    amber: {
      bg: "from-amber-500 to-orange-600",
      text: "text-amber-600",
      light: "bg-amber-50",
      border: "border-amber-100",
    },
    rose: { bg: "from-rose-500 to-pink-600", text: "text-rose-600", light: "bg-rose-50", border: "border-rose-100" },
    emerald: {
      bg: "from-emerald-500 to-teal-600",
      text: "text-emerald-600",
      light: "bg-emerald-50",
      border: "border-emerald-100",
    },
    violet: {
      bg: "from-violet-500 to-purple-600",
      text: "text-violet-600",
      light: "bg-violet-50",
      border: "border-violet-100",
    },
  }

  const colors = colorMap[accentColor] || colorMap.blue

  // فتح صفحة المنتج
  const handleViewProduct = (e: React.MouseEvent, productId: string) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/product/${productId}`)
  }

  return (
    <motion.div className="group relative" whileHover={{ y: -5 }} transition={{ duration: 0.3 }}>
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative overflow-hidden rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-300">
          {/* صورة المنتج */}
          <div className="relative aspect-square overflow-hidden">
            <Image
              src={product.image || "/placeholder.svg?height=200&width=200"}
              alt={product.name}
              fill
              className="object-cover transition-transform group-hover:scale-105 duration-500"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
            />

            {/* زر عرض المنتج */}
            <button
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors z-10"
              onClick={(e) => handleViewProduct(e, product.id.toString())}
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
            {product.rating && (
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
  )
}

const HomePage = () => {
  const [viewedProducts, setViewedProducts] = useState<Product[]>([])
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([])
  const [currentSeason] = useState(getCurrentSeason())
  const [nextSeason] = useState(getNextSeason())
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // مراجع للسويبرات للتحكم بها

  const viewedPrevRef = useRef<HTMLButtonElement>(null)
  const viewedNextRef = useRef<HTMLButtonElement>(null)

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

  // التحقق من حجم الشاشة
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

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
            // اختيا فئة عشوائية من الفئات المشاهدة
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
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // عرض حالة التحميل
  const isLoading = isTrendingLoading || isNewArrivalsLoading || isSaleLoading || !isPageLoaded

  // تأثيرات الحركة للعناصر
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  if (isLoading) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-xl text-purple-600">جاري التحميل...</div>
      </div>
    )
  }

  return (
    <div className="h-full bg-white">
      

      <main>
        {/* بانر الموسم الحالي */}
        <SeasonalBanner season={currentSeason} />


        {/* عداد تنازلي للموسم القادم */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="py-12 bg-gradient-to-b from-white to-gray-50"
        >
          <div className="container mx-auto px-4">
            <CountdownTimer
              targetDate={nextSeason.date}
              seasonName={nextSeason.arabicName}
              seasonColor={nextSeason.color}
              seasonEmoji={nextSeason.emoji}
            />
          </div>
        </motion.section>
        {/* أضف فواصل الأقسام بين الأقسام المختلفة */}
        <SectionDivider color="violet" />

        {/* معرض الهدايا الجاهزة للإلهام */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="py-6 bg-white"
        >
          <div className="container mx-auto px-4">
            <InspirationGallery />
          </div>
        </motion.section>
        {/* أضف فواصل الأقسام بين الأقسام المختلفة */}
        <SectionDivider color="amber" />

        {/* مساعد اختيار الهدايا */}
        <GiftFinderSection />
        {/* أضف فواصل الأقسام بين الأقسام المختلفة */}
        <SectionDivider color="amber" />

        {/* سويبر فئات الأسعار */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="py-12 bg-white"
        >
          <div className="container mx-auto px-4">
            <PriceRangeSwiper />
          </div>
        </motion.section>
        {/* أضف فواصل الأقسام بين الأقسام المختلفة */}
        <SectionDivider color="emerald" />

        {/* الأكثر رواجاً - سويبر محسن */}
        {trendingData?.data.length > 0 && (
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="py-16 bg-gradient-to-b from-white to-gray-50"
          >
            <div className="container mx-auto px-2 sm:px-4">
              <SectionTitle
                icon={<TrendingUp className="w-7 h-7" />}
                title="الأكثر رواجاً"
                subtitle="المنتجات الأكثر مبيعاً والأعلى تقييماً من عملائنا"
                accentColor="from-blue-400 to-indigo-600"
              />
              
              {/* استخدام المكون الجديد للمنتجات الرائجة */}
              <TrendingProductsSwiper products={trendingData.data} />

              <div className="text-center mt-10">
                <Link
                  href="/category/trending"
                  className="group inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-full font-medium transition-all duration-300 shadow-lg shadow-blue-200/30 hover:shadow-blue-300/50 hover:scale-105"
                >
                  <TrendingUp className="w-5 h-5" />
                  <span>عرض المزيد من المنتجات الرائجة</span>
                  <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </motion.section>
        )}
        {/* أضف فواصل الأقسام بين الأقسام المختلفة */}
        <SectionDivider color="rose" />

        {/* عروض خاصة - سويبر محسن */}
        {saleData?.data.length > 0 && (
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="py-16 bg-white"
          >
            <div className="container mx-auto px-2 sm:px-4">
              <SectionTitle
                icon={<Tag className="w-7 h-7" />}
                title="عروض خاصة"
                subtitle="خصومات حصرية لفترة محدودة على مجموعة مختارة من الهدايا المميزة"
                accentColor="from-rose-500 to-red-600"
              />
              
              {/* استخدام المكون الجديد للمنتجات المخفضة */}
              <DiscountedProductsSwiper products={saleData.data} />

              <div className="text-center mt-10">
                <Link
                  href="/category/sale"
                  className="group inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-red-600 text-white px-6 py-3 rounded-full font-medium transition-all duration-300 shadow-lg shadow-rose-200/30 hover:shadow-rose-300/50 hover:scale-105"
                >
                  <Tag className="w-5 h-5" />
                  <span>عرض جميع العروض</span>
                  <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </motion.section>
        )}
        {/* أضف فواصل الأقسام بين الأقسام المختلفة */}
        <SectionDivider color="blue" />

        {/* وصل حديثاً - سويبر محسن */}
        {newArrivalsData?.data.length > 0 && (
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="py-16 bg-gradient-to-b from-white to-gray-50"
          >
            <div className="container mx-auto px-2 sm:px-4">
              <SectionTitle
                icon={<Sparkles className="w-7 h-7" />}
                title="وصل حديثاً"
                subtitle="اكتشف أحدث الهدايا في متجرنا التي وصلت للتو من أفضل الماركات العالمية"
                accentColor="from-emerald-400 to-teal-600"
              />
              
              {/* استخدام المكون الجديد للمنتجات الجديدة */}
              <NewProductsSwiper products={newArrivalsData.data} />

              <div className="text-center mt-10">
                <Link
                  href="/category/new-arrivals"
                  className="group inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-full font-medium transition-all duration-300 shadow-lg shadow-emerald-200/30 hover:shadow-emerald-300/50 hover:scale-105"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>عرض جميع المنتجات الجديدة</span>
                  <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </motion.section>
        )}
        {/* أضف فواصل الأقسام بين الأقسام المختلفة */}
        <SectionDivider color="violet" />
        
        {/* سويبر الفئات الرئيسية والفرعية */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="py-16 bg-white"
        >
          <div className="container mx-auto px-2 sm:px-4">
            <SectionTitle
              icon={<ShoppingBag className="w-7 h-7" />}
              title="تسوق حسب الفئة"
              subtitle="تصفح منتجاتنا حسب الفئات الرئيسية والفرعية لتجد ما تبحث عنه بسهولة"
              accentColor="from-purple-400 to-indigo-600"
            />
            
            <MainCategorySwiper />
          </div>
        </motion.section>
        
        {/* أضف فواصل الأقسام بين الأقسام المختلفة */}
        <SectionDivider color="amber" />

        {/* المنتجات التي شاهدتها مؤخراً - سويبر محسن */}
        {viewedProducts.length > 0 && (
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="py-16 bg-white"
          >
            <div className="container mx-auto px-2 sm:px-4">
              <SectionTitle
                icon={<Clock className="w-7 h-7" />}
                title="شاهدت مؤخراً"
                subtitle="المنتجات التي استعرضتها سابقاً وقد ترغب في العودة إليها"
                accentColor="from-blue-400 to-indigo-600"
              />

              <div className="relative">
                <Swiper
                  modules={[Navigation, Pagination, Autoplay]}
                  spaceBetween={16}
                  slidesPerView={1.2}
                  centeredSlides={isMobile}
                  loop={viewedProducts.length > 5}
                  autoplay={{
                    delay: 5500,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                  }}
                  pagination={{
                    clickable: true,
                    dynamicBullets: true,
                  }}
                  navigation={{
                    prevEl: viewedPrevRef.current,
                    nextEl: viewedNextRef.current,
                  }}
                  onBeforeInit={(swiper) => {
                    // @ts-expect-error Navigation is not typed correctly
                    swiper.params.navigation.prevEl = viewedPrevRef.current
                    // @ts-expect-error Navigation is not typed correctly
                    swiper.params.navigation.nextEl = viewedNextRef.current
                  }}
                  breakpoints={{
                    320: { slidesPerView: 1.5, spaceBetween: 8, centeredSlides: true },
                    480: { slidesPerView: 2, spaceBetween: 10, centeredSlides: false },
                    640: { slidesPerView: 2.5, spaceBetween: 12, centeredSlides: false },
                    768: { slidesPerView: 3, spaceBetween: 16, centeredSlides: false },
                    1024: { slidesPerView: 4, centeredSlides: false },
                    1280: { slidesPerView: 5, centeredSlides: false },
                  }}
                  className="py-10 px-2"
                >
                  {viewedProducts.slice(0, 10).map((product) => (
                    <SwiperSlide key={`viewed-${product.id}`}>
                      <ProductCard product={product} accentColor="blue" />
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* أزرار التنقل المخصصة */}
                <SwiperCustomButton direction="prev" onClick={() => viewedPrevRef.current?.click()} color="blue" />
                <SwiperCustomButton direction="next" onClick={() => viewedNextRef.current?.click()} color="blue" />

                {/* أزرار التنقل الخفية للسويبر */}
                <button ref={viewedPrevRef} className="sr-only">
                  السابق
                </button>
                <button ref={viewedNextRef} className="sr-only">
                  التالي
                </button>
              </div>
            </div>
          </motion.section>
        )}
        

        {/* المنتجات المقترحة لك - سويبر */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="py-16 bg-gradient-to-b from-white to-gray-50"
        >
          <div className="container mx-auto px-2 sm:px-4">
            <SectionTitle
              icon={<Sparkles className="w-7 h-7" />}
              title="مقترحة لك"
              subtitle="منتجات مختارة خصيصاً بناءً على اهتماماتك وتفضيلاتك"
              accentColor="from-violet-500 to-purple-600"
            />

            {recommendedProducts && recommendedProducts.length > 0 ? (
              <div className="relative">
                <Swiper
                  modules={[Navigation, Pagination, Autoplay]}
                  spaceBetween={12}
                  slidesPerView={1.5}
                  centeredSlides={isMobile}
                  loop={recommendedProducts.length > 5}
                  autoplay={{
                    delay: 5000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                  }}
                  pagination={{
                    clickable: true,
                    dynamicBullets: true,
                  }}
                  breakpoints={{
                    320: { slidesPerView: 1.5, spaceBetween: 8, centeredSlides: true },
                    480: { slidesPerView: 2, spaceBetween: 10, centeredSlides: false },
                    640: { slidesPerView: 2.5, spaceBetween: 12, centeredSlides: false },
                    768: { slidesPerView: 3, spaceBetween: 16, centeredSlides: false },
                    1024: { slidesPerView: 5, centeredSlides: false },
                    1280: { slidesPerView: 6, centeredSlides: false },
                  }}
                  className="py-8 px-2"
                >
                  {recommendedProducts.map((product) => (
                    <SwiperSlide key={`recommended-${product.id}`}>
                      <ProductCard product={product} accentColor="violet" />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                <p>استمر في تصفح المنتجات للحصول على توصيات مخصصة لك</p>
              </div>
            )}
          </div>
        </motion.section>
      </main>

      
    </div>
  )
}

export default HomePage