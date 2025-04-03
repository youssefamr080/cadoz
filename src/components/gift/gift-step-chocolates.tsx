"use client"

import type React from "react"
import { useCallback, useMemo, useState, useEffect } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination, Navigation, A11y } from "swiper/modules"
import "swiper/css"
import "swiper/css/pagination"
import "swiper/css/navigation"
import { giftOptions, type GiftOption } from "../../data/products"
import { useGift } from "../../context/GiftContext"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import { Heart, ChevronDown, Search, Filter, Loader2 } from "lucide-react"
import { giftTheme } from "../../components/gift/lib/gift-theme"
import GiftProductCard from "../../components/gift/gift-product-card"
import GiftSectionHeader from "../../components/gift/gift-section-header"
import { chunkArray } from "../../components/gift/lib/array-helpers"
import { useInView } from "react-intersection-observer"

// تعريف نوع للمجموعات المقسمة
type GroupedChunks = {
  [key: string]: GiftOption[][]
}

const GiftStepChocolates: React.FC = () => {
  const { dispatch, state } = useGift()
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const { ref: loadingRef, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  // تحسين أداء التحميل باستخدام Intersection Observer
  useEffect(() => {
    if (inView) {
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [inView])

  // تصفية وترتيب الشوكولاتة - مع تحسين الأداء باستخدام useMemo
  const chocolates = useMemo(
    () =>
      giftOptions.filter((item) => item.category === "chocolates").sort((a, b) => a.tags[0].localeCompare(b.tags[0])),
    [],
  )

  // تطبيق البحث والتصفية
  const filteredChocolates = useMemo(() => {
    let filtered = chocolates

    // تطبيق البحث
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase()
      filtered = filtered.filter(
        (item) => item.name.toLowerCase().includes(term) || item.tags.some((tag) => tag.toLowerCase().includes(term)),
      )
    }

    // تطبيق التصفية
    if (activeFilter) {
      filtered = filtered.filter((item) => item.tags.includes(activeFilter))
    }

    return filtered
  }, [chocolates, searchTerm, activeFilter])

  // استخراج الفلاتر الفريدة
  const availableFilters = useMemo(() => {
    const filters = new Set<string>()
    chocolates.forEach((item) => {
      item.tags.forEach((tag) => filters.add(tag))
    })
    return Array.from(filters).sort()
  }, [chocolates])

  // تجميع الشوكولاتة حسب النوع
  const chocolateGroups = useMemo<GroupedChunks>(() => {
    const groups: { [key: string]: GiftOption[] } = filteredChocolates.reduce(
      (acc, chocolate) => {
        const group = chocolate.tags[0]
        if (!acc[group]) acc[group] = []
        acc[group].push(chocolate)
        return acc
      },
      {} as { [key: string]: GiftOption[] },
    )

    // تقسيم كل مجموعة إلى مجموعات فرعية من 10 عناصر
    const groupsWithChunks: GroupedChunks = {}
    Object.entries(groups).forEach(([groupName, items]) => {
      groupsWithChunks[groupName] = chunkArray(items, 10)
    })

    return groupsWithChunks
  }, [filteredChocolates])

  // إضافة إلى السلة
  const addToCart = useCallback(
    (chocolate: GiftOption) => {
      const isAlreadyInCart = state.cart.some((item) => item.id === String(chocolate.id))

      dispatch({ type: "ADD_TO_CART", payload: chocolate })

      toast.success(
        isAlreadyInCart ? `تمت زيادة كمية ${chocolate.name} في هديتك!` : `${chocolate.name} أضيفت إلى هديتك!`,
        {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "light",
          icon: () => (
            <span role="img" aria-label="chocolate">
              🍫
            </span>
          ),
        },
      )

      // تتبع حدث إضافة منتج (يمكن استخدامه مع أدوات التحليلات)
      if (typeof window !== "undefined" && "gtag" in window) {
        const gtag = window.gtag
        gtag("event", "add_to_cart", {
          item_id: chocolate.id,
          item_name: chocolate.name,
          item_category: chocolate.category,
          price: chocolate.price,
        })
      }
    },
    [dispatch, state.cart],
  )

  // تحميل الصور مسبقًا لتجربة أكثر سلاسة
  useEffect(() => {
    if (!isLoading && chocolates.length > 0) {
      // تحميل أول 5 صور مسبقًا
      chocolates.slice(0, 5).forEach((chocolate) => {
        if (chocolate.image) {
          const img = new Image()
          img.src = chocolate.image
        }
      })
    }
  }, [isLoading, chocolates])

  // حالة فارغة مع تحريك
  if (chocolates.length === 0) {
    return (
      <motion.div
        className={`${giftTheme.gradients.light} p-8 ${giftTheme.rounded.lg} ${giftTheme.shadows.lg} flex flex-col items-center justify-center min-h-[300px] border border-indigo-100`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-pink-500 mb-6 text-6xl" aria-hidden="true">
          🍫
        </div>
        <h3 className="text-2xl font-bold text-indigo-800 mb-3">لا توجد شوكولاتة متاحة حالياً</h3>
        <p className="text-indigo-600 text-center max-w-md">سيتم إضافة منتجات جديدة قريباً، يرجى زيارتنا مرة أخرى</p>
      </motion.div>
    )
  }

  // حالة التحميل
  if (isLoading) {
    return (
      <motion.div
        ref={loadingRef}
        className={`${giftTheme.gradients.light} p-8 ${giftTheme.rounded.lg} ${giftTheme.shadows.lg} flex flex-col items-center justify-center min-h-[300px] border border-indigo-100`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Loader2 className={`w-10 h-10 ${giftTheme.colors.accent.text} animate-spin mb-4`} aria-hidden="true" />
        <p className="text-pink-600">جاري تحميل الشوكولاتة...</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      className={`${giftTheme.gradients.light} p-4 sm:p-6 ${giftTheme.rounded.lg} ${giftTheme.shadows.lg} border border-indigo-100`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <GiftSectionHeader
        title="اختر الشوكولاتة المفضلة"
        icon={<Heart className="w-6 h-6" aria-hidden="true" />}
        variant="accent"
      />

      {/* شريط البحث والتصفية */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="ابحث عن الشوكولاتة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            aria-label="البحث عن الشوكولاتة"
          />
        </div>
        <div className="relative">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => setActiveFilter(null)}
            aria-expanded="false"
            aria-haspopup="true"
          >
            <Filter className="w-5 h-5 text-gray-500" aria-hidden="true" />
            <span>{activeFilter || "جميع الأنواع"}</span>
          </button>
          <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-48 max-h-60 overflow-y-auto hidden group-focus-within:block">
            <button
              className={`w-full text-right px-4 py-2 hover:bg-gray-50 ${!activeFilter ? "bg-pink-50 text-pink-600" : ""}`}
              onClick={() => setActiveFilter(null)}
            >
              جميع الأنواع
            </button>
            {availableFilters.map((filter) => (
              <button
                key={filter}
                className={`w-full text-right px-4 py-2 hover:bg-gray-50 ${activeFilter === filter ? "bg-pink-50 text-pink-600" : ""}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* عرض نتائج البحث */}
      {searchTerm && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {filteredChocolates.length === 0
              ? "لا توجد نتائج مطابقة للبحث"
              : `تم العثور على ${filteredChocolates.length} منتج`}
          </p>
        </div>
      )}

      {/* عرض المجموعات */}
      {Object.entries(chocolateGroups).length === 0 ? (
        <motion.div
          className="bg-white p-8 rounded-xl text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-gray-500">لا توجد منتجات مطابقة للبحث أو التصفية</p>
        </motion.div>
      ) : (
        Object.entries(chocolateGroups).map(([groupName, chunkedItems]) => (
          <div key={groupName} className="mb-8">
            <div className="flex items-center mb-4">
              <div className="h-8 w-1 bg-gradient-to-b from-pink-400 to-rose-500 rounded-full mr-3"></div>
              <h4 className="text-lg font-bold text-indigo-800">{groupName}</h4>
            </div>

            {chunkedItems.map((chunk, chunkIndex) => (
              <div key={`${groupName}-chunk-${chunkIndex}`} className="mb-6">
                {chunkIndex > 0 && (
                  <div className="flex items-center justify-center mb-3">
                    <div className="h-px w-16 bg-indigo-200"></div>
                    <div className="mx-2 text-xs text-indigo-400 flex items-center">
                      <span>المزيد من {groupName}</span>
                      <ChevronDown className="w-3 h-3 mr-1" aria-hidden="true" />
                    </div>
                    <div className="h-px w-16 bg-indigo-200"></div>
                  </div>
                )}

                <Swiper
                  modules={[Pagination, Navigation, A11y]}
                  spaceBetween={12}
                  slidesPerView="auto"
                  pagination={{
                    clickable: true,
                    dynamicBullets: true,
                    renderBullet: (index, className) => {
                      return `<span class="${className}" aria-label="صفحة ${index + 1}" role="button"></span>`
                    },
                  }}
                  navigation={{
                    nextEl: `.swiper-button-next-${groupName}-${chunkIndex}`,
                    prevEl: `.swiper-button-prev-${groupName}-${chunkIndex}`,
                  }}
                  a11y={{
                    enabled: true,
                    prevSlideMessage: "المنتج السابق",
                    nextSlideMessage: "المنتج التالي",
                    firstSlideMessage: "هذا أول منتج",
                    lastSlideMessage: "هذا آخر منتج",
                    paginationBulletMessage: "الانتقال إلى المنتج {{index}}",
                  }}
                  breakpoints={{
                    320: { slidesPerView: 2.2, spaceBetween: 10 },
                    480: { slidesPerView: 2.5, spaceBetween: 12 },
                    640: { slidesPerView: 3, spaceBetween: 14 },
                    768: { slidesPerView: 3.5, spaceBetween: 16 },
                    1024: { slidesPerView: 4, spaceBetween: 18 },
                    1280: { slidesPerView: 5, spaceBetween: 20 },
                    1536: { slidesPerView: 6, spaceBetween: 22 }, // إضافة دعم للشاشات الكبيرة جدًا
                  }}
                  className="gift-swiper-improved mb-4"
                  watchSlidesProgress={true}
                  observer={true}
                  observeParents={true}
                >
                  {chunk.map((chocolate) => {
                    const isInCart = state.cart.some((item) => item.id === String(chocolate.id))
                    const quantity = state.cart.find((item) => item.id === String(chocolate.id))?.quantity || 0

                    return (
                      <SwiperSlide key={chocolate.id}>
                        <GiftProductCard
                          product={{ ...chocolate, id: String(chocolate.id) }}
                          isInCart={isInCart}
                          quantity={quantity}
                          onClick={() => addToCart(chocolate)}
                          variant="accent"
                          aria-label={`شوكولاتة ${chocolate.name} بسعر ${chocolate.price} جنيه ${isInCart ? `(${quantity} في السلة)` : ""}`}
                        />
                      </SwiperSlide>
                    )
                  })}
                  <div
                    className={`swiper-button-next swiper-button-next-${groupName}-${chunkIndex} !w-8 !h-8 !bg-white !rounded-full !shadow-md !text-pink-500 after:!text-[10px]`}
                    aria-label="المنتج التالي"
                  ></div>
                  <div
                    className={`swiper-button-prev swiper-button-prev-${groupName}-${chunkIndex} !w-8 !h-8 !bg-white !rounded-full !shadow-md !text-pink-500 after:!text-[10px]`}
                    aria-label="المنتج السابق"
                  ></div>
                </Swiper>
              </div>
            ))}
          </div>
        ))
      )}

      <style jsx global>{`
        /* تحسين أنماط Swiper */
        .gift-swiper-improved .swiper-slide {
          height: auto;
          transition: transform 0.3s ease, opacity 0.3s ease;
          opacity: 0.85;
        }
        
        .gift-swiper-improved .swiper-slide-active,
        .gift-swiper-improved .swiper-slide-next,
        .gift-swiper-improved .swiper-slide-prev {
          opacity: 1;
        }
        
        .gift-swiper-improved .swiper-pagination {
          bottom: -5px !important;
        }
        
        .gift-swiper-improved .swiper-pagination-bullet {
          width: 6px;
          height: 6px;
          background: #d1d5db;
          opacity: 0.7;
          transition: all 0.3s ease;
        }
        
        .gift-swiper-improved .swiper-pagination-bullet-active {
          opacity: 1;
          background: #ec4899;
          transform: scale(1.2);
        }
        
        .gift-swiper-improved .swiper-button-next,
        .gift-swiper-improved .swiper-button-prev {
          color: #ec4899;
          transform: translateY(-50%);
          opacity: 0.8;
          transition: all 0.2s ease;
          outline: none;
        }
        
        .gift-swiper-improved .swiper-button-next:hover,
        .gift-swiper-improved .swiper-button-prev:hover {
          opacity: 1;
          transform: translateY(-50%) scale(1.1);
        }
        
        .gift-swiper-improved .swiper-button-next:focus-visible,
        .gift-swiper-improved .swiper-button-prev:focus-visible {
          box-shadow: 0 0 0 2px #ec4899;
        }
        
        .gift-swiper-improved .swiper-button-disabled {
          opacity: 0.3 !important;
        }
        
        /* تحسين الوصولية للتركيز */
        .gift-swiper-improved .swiper-slide:focus-within {
          outline: 2px solid #ec4899;
          outline-offset: 2px;
          border-radius: 0.75rem;
        }
        
        /* تحسين أداء الرسوم المتحركة */
        @media (prefers-reduced-motion: reduce) {
          .gift-swiper-improved .swiper-slide,
          .gift-swiper-improved .swiper-button-next,
          .gift-swiper-improved .swiper-button-prev,
          .gift-swiper-improved .swiper-pagination-bullet {
            transition: none !important;
          }
        }
        
        /* تحسين الأداء على الأجهزة المحمولة */
        @media (max-width: 640px) {
          .gift-swiper-improved .swiper-button-next,
          .gift-swiper-improved .swiper-button-prev {
            width: 30px !important;
            height: 30px !important;
          }
          
          .gift-swiper-improved .swiper-button-next:after,
          .gift-swiper-improved .swiper-button-prev:after {
            font-size: 12px !important;
          }
        }
      `}</style>
    </motion.div>
  )
}

export default GiftStepChocolates
