"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"
import { getPopularInspirations } from "@/lib/actions/inspiration-actions"
import type { Inspiration, LegacyInspiration } from "@/types/inspiration"
// Import types as needed
import Image from "next/image"
import Link from "next/link"
// Import Swiper components and modules
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, FreeMode, Autoplay } from "swiper/modules"
// Import Swiper styles
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import "swiper/css/free-mode"
import AddToCartButton from "@/app/inspiration/[id]/AddToCartButton"

// Helper function to convert Inspiration to LegacyInspiration format
const convertToLegacyInspiration = (inspiration: Inspiration): LegacyInspiration => {
  return {
    ...inspiration,
    box: "",
    products: [],
    sweets: [],
    bag: "",
    productQuantities: {},
    sweetQuantities: {},
    comments: [],
    updatedAt: inspiration.updatedAt?.toISOString?.() || 
                (inspiration.updatedAt instanceof Date ? inspiration.updatedAt.toISOString() : 
                 new Date().toISOString())
  };
};

export default function InspirationGallery() {
  const [inspirationGifts, setInspirationGifts] = useState<Inspiration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
  // عدد المنتجات التي سيتم جلبها
  const maxInspirationCount = 10 // عرض 10 منتجات

  // Calculate discount percentage dynamically
  const calculateDiscountPercentage = (price?: number, oldPrice?: number): number => {
    if (price && oldPrice && oldPrice > price) {
      return Math.floor(((oldPrice - price) / oldPrice) * 100);
    }
    return 0;
  };

  // Toggle description visibility for a gift
  const toggleDescription = (giftId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [giftId]: !prev[giftId]
    }))
  }

  // Fetch inspiration gifts with limit and log results for debugging
  useEffect(() => {
    const fetchInspirations = async () => {
      try {
        setIsLoading(true)
        // جلب المنتجات مع تحديد العدد الأقصى 10
        console.log(`جلب المنتجات بحد أقصى: ${maxInspirationCount}`)
          // جلب البيانات من الخادم
        const data = await getPopularInspirations()
        console.log(`تم استلام عدد المنتجات: ${data.length}`, data)
        
        // تكرار البيانات إذا كان عددها أقل من 10 لضمان وجود ما يكفي للعرض
        const processedData = [...data]
        if (data.length < maxInspirationCount && data.length > 0) {
          while (processedData.length < maxInspirationCount) {
            // إضافة نسخة من البيانات الموجودة مع تعديل المعرف لتجنب التكرار
            const clonedItem = {
              ...data[processedData.length % data.length],
              id: `${data[processedData.length % data.length].id}_clone_${processedData.length}`
            }
            processedData.push(clonedItem)
          }
        }
        
        setInspirationGifts(processedData)
        console.log(`عدد المنتجات النهائي: ${processedData.length}`)
        setError(null)
      } catch (err) {
        console.error("Error loading inspirations:", err)
        setError("حدث خطأ أثناء تحميل هدايا الإلهام. يرجى المحاولة مرة أخرى.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchInspirations()
  }, [maxInspirationCount])

  // Calculate slides per view based on screen size
  const getSlidesPerView = () => {
    if (typeof window !== "undefined") {
      if (window.innerWidth < 480) return 2.1  // عرض بطاقتين في الشاشات الصغيرة
      if (window.innerWidth < 640) return 2.3
      if (window.innerWidth < 1024) return 3.2
      return 4.1
    }
    return 3
  }

  return (
    <div className="mb-0 sm:mb-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">هدايا جاهزة للإلهام</h2>
        <Link 
          href="/inspirations" 
          className="flex items-center text-purple-600 hover:text-purple-800 transition-colors text-xs sm:text-sm font-medium"
        >
          عرض الكل
          <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
        </Link>
      </div>
      <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">اختر من هذه الهدايا الجاهزة أو استخدمها كنقطة بداية لهديتك الخاصة</p>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[180px]">
          <div className="w-8 h-8 sm:w-10 sm:h-10 border-3 sm:border-4 border-gray-200 border-t-purple-500 rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="text-center p-6 text-red-500 text-sm">{error}</div>
      ) : (
        <div className="relative gift-inspiration-swiper">
          <Swiper
            modules={[Navigation, Pagination, FreeMode, Autoplay]}
            spaceBetween={6}
            slidesPerView={getSlidesPerView()}
            navigation={{
              nextEl: '.swiper-button-next',
              prevEl: '.swiper-button-prev',
            }}
            pagination={{
              clickable: true,
              el: '.swiper-pagination',
              bulletActiveClass: 'swiper-pagination-bullet-active bg-purple-600',
              bulletClass: 'swiper-pagination-bullet bg-gray-300 opacity-70 mx-1',
            }}
            freeMode={{
              enabled: true,
              sticky: true,
              momentumBounce: false,
            }}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            dir="rtl"
            className="rounded-xl pb-8"
          >
            {inspirationGifts.map((gift) => (
              <SwiperSlide key={gift.id} className="pb-2">
                <motion.div
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-xl border border-purple-100/60 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col"
                >
                  {/* صورة قابلة للضغط */}
                  <Link href={`/inspiration/${gift.id}`} className="block">
                    <div className="relative aspect-square bg-gray-50 overflow-hidden group">
                      <Image 
                        src={gift.image || "/placeholder.svg"} 
                        alt={gift.name} 
                        fill 
                        sizes="(max-width: 480px) 50vw, (max-width: 640px) 33vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105" 
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      {calculateDiscountPercentage(gift.price, gift.oldPrice) > 0 && (
                        <div className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md">
                          -{calculateDiscountPercentage(gift.price, gift.oldPrice)}%
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="p-2 flex-1 flex flex-col">
                    {/* السعر والتقييم */}
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="bg-white/80 backdrop-blur-sm rounded-full px-1.5 py-0.5 flex items-center">
                        <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                        <span className="text-[10px] font-medium mr-0.5">{gift.rating}</span>
                      </div>

                      {gift.price && (
                        <div className="flex flex-col items-end">
                          {calculateDiscountPercentage(gift.price, gift.oldPrice) > 0 && gift.oldPrice && (
                            <div className="flex items-center gap-1 text-[10px]">
                              <span className="text-gray-500 line-through">{Math.floor(gift.oldPrice).toLocaleString()} ج.م</span>
                            </div>
                          )}
                          <div className="text-xs font-bold text-green-600">
                            {Math.floor(gift.price).toLocaleString()} ج.م
                          </div>
                        </div>
                      )}
                    </div>

                    {/* الاسم والوصف */}
                    <div 
                      className="flex justify-between items-center cursor-pointer py-0.5"
                      onClick={() => toggleDescription(gift.id)}
                    >
                      <h3 className="font-medium text-gray-900 truncate text-xs">{gift.name}</h3>
                      <motion.div
                        animate={{ rotate: expandedItems[gift.id] ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                      </motion.div>
                    </div>

                    <AnimatePresence>
                      {expandedItems[gift.id] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <p className="text-[10px] text-gray-600 my-1 line-clamp-2">{gift.description}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* زر إضافة للسلة في الأسفل */}
                    <div className="mt-auto -mx-2 -mb-2">
                      <div className="rounded-b-xl overflow-hidden">
                        <AddToCartButton inspiration={convertToLegacyInspiration(gift)} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
            
            {/* أزرار التنقل */}
            <button className="swiper-button-next !hidden sm:!flex absolute top-1/2 left-0.5 -translate-y-1/2 z-10 rounded-full bg-white/90 backdrop-blur shadow-lg w-7 h-7 sm:w-8 sm:h-8 border border-purple-100 items-center justify-center hover:bg-purple-50">
              <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600" />
            </button>
            
            <button className="swiper-button-prev !hidden sm:!flex absolute top-1/2 right-0.5 -translate-y-1/2 z-10 rounded-full bg-white/90 backdrop-blur shadow-lg w-7 h-7 sm:w-8 sm:h-8 border border-purple-100 items-center justify-center hover:bg-purple-50">
              <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600" />
            </button>
          </Swiper>
          
          <div className="swiper-pagination flex justify-center mt-1"></div>
        </div>
      )}
    </div>
  )
}