"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Star, ChevronLeft } from "lucide-react"
import { getPopularInspirations } from "@/lib/actions/inspiration-actions"
import type { Inspiration } from "@/types/inspiration"
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

export default function InspirationGallery() {
  const [inspirationGifts, setInspirationGifts] = useState<Inspiration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // عدد المنتجات التي سيتم جلبها
  const maxInspirationCount = 10 // عرض 10 منتجات

  // Calculate discount percentage dynamically
  const calculateDiscountPercentage = (price?: number, oldPrice?: number): number => {
    if (price && oldPrice && oldPrice > price) {
      return Math.floor(((oldPrice - price) / oldPrice) * 100);
    }
    return 0;
  };

  // Add useEffect to add custom CSS for swiper styling
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      .inspiration-swiper {
        padding: 10px 5px 30px;
      }
      .inspiration-swiper .swiper-button-next,
      .inspiration-swiper .swiper-button-prev {
        color: #6b7280;
        background: rgba(255, 255, 255, 0.9);
        width: 32px;
        height: 32px;
        border-radius: 50%;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        transition: all 0.2s ease;
      }
      .inspiration-swiper .swiper-button-next:hover,
      .inspiration-swiper .swiper-button-prev:hover {
        background: white;
        color: #9333ea;
      }
      .inspiration-swiper .swiper-button-next:after,
      .inspiration-swiper .swiper-button-prev:after {
        font-size: 14px;
        font-weight: bold;
      }
      .inspiration-swiper .swiper-pagination {
        bottom: 0;
      }
      .inspiration-swiper .swiper-pagination-bullet {
        width: 6px;
        height: 6px;
        background: #d1d5db;
        opacity: 1;
      }
      .inspiration-swiper .swiper-pagination-bullet-active {
        background: #9333ea;
      }
      @media (max-width: 640px) {
        .inspiration-swiper .swiper-button-next,
        .inspiration-swiper .swiper-button-prev {
          display: none;
        }
      }
    `
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [])

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
            spaceBetween={16}
            slidesPerView={getSlidesPerView()}
            loop={inspirationGifts.length > 4} // تجنب loop إذا كان عدد الهدايا قليل
            navigation={true}
            pagination={{ clickable: true }}
            grabCursor={true}
            allowTouchMove={true}
            simulateTouch={true}
            touchStartPreventDefault={false}
            freeMode={{
              enabled: true,
              sticky: false,
              momentumRatio: 0.25,
              momentumVelocityRatio: 0.25
            }}
            autoplay={inspirationGifts.length > 1 ? {
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            } : false}
            speed={600}
            className="inspiration-swiper pb-10"
          >
            {inspirationGifts.map((gift) => (
              <SwiperSlide key={gift.id} className="h-auto pb-10">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                  className="group relative h-full"
                >
                  <Link href={`/inspiration/${gift.id}`} className="block h-full">
                    <div className="relative h-full overflow-hidden rounded-lg bg-white shadow-sm transition-all duration-300 hover:shadow-md">
                      {/* صورة المنتج */}
                      <div className="relative aspect-square overflow-hidden">
                        <Image 
                          src={gift.image || "/placeholder.svg"} 
                          alt={gift.name} 
                          fill 
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105" 
                          priority
                        />
                        
                        {/* شارة الخصم */}
                        {calculateDiscountPercentage(gift.price, gift.oldPrice) > 0 && (
                          <div className="absolute left-0 top-0 bg-rose-500 px-2 py-1 text-xs font-medium text-white">
                            {calculateDiscountPercentage(gift.price, gift.oldPrice)}% خصم
                          </div>
                        )}
                      </div>

                      {/* معلومات المنتج */}
                      <div className="p-3">
                        {/* اسم المنتج */}
                        <h3 className="mb-1 line-clamp-1 text-sm font-medium text-gray-700 group-hover:text-purple-600 transition-colors duration-300">
                          {gift.name}
                        </h3>

                        {/* السعر */}
                        <div className="flex items-center justify-between">
                          <div className="text-base font-bold text-gray-900">
                            {Math.floor(gift.price).toLocaleString()} <span className="text-xs">ج.م</span>
                          </div>

                          {calculateDiscountPercentage(gift.price, gift.oldPrice) > 0 && gift.oldPrice && (
                            <div className="text-xs text-gray-500 line-through">
                              {Math.floor(gift.oldPrice).toLocaleString()}
                            </div>
                          )}
                        </div>
                        
                        {/* التقييم */}
                        {gift.rating && (
                          <div className="mt-1 flex items-center">
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${i < Math.floor(gift.rating || 0) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
                                />
                              ))}
                            </div>
                            <span className="mr-1 text-xs text-gray-500">({gift.rating})</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </div>
  )
}