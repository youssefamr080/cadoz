"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useGift } from "@/context/gift-context"
import { Button } from "@/components/ui/button"
import { Star, ChevronLeft, ChevronRight, Eye, ChevronDown, Heart, Edit } from "lucide-react"
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
import AddToCartButton from "@/app/inspiration/[id]/AddToCartButton"

export default function InspirationGallery() {
  const { loadInspiration } = useGift()
  const [inspirationGifts, setInspirationGifts] = useState<Inspiration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({})
  // عدد المنتجات التي سيتم جلبها
  const maxInspirationCount = 10 // عرض 10 منتجات

  // Toggle like state for a gift
  const toggleLike = (giftId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedItems(prev => ({
      ...prev,
      [giftId]: !prev[giftId]
    }))
  }

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
        const data = await getPopularInspirations(maxInspirationCount)
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
      if (window.innerWidth < 480) return 1.2
      if (window.innerWidth < 640) return 1.8
      if (window.innerWidth < 1024) return 2.5
      return 3.2
    }
    return 3 // Default fallback
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
          {/* استخدام مكتبة Swiper.js بدلاً من التنفيذ اليدوي */}
          <Swiper
            modules={[Navigation, Pagination, FreeMode, Autoplay]}
            spaceBetween={12}
            slidesPerView={getSlidesPerView()}
            navigation={{
              nextEl: '.swiper-button-next',
              prevEl: '.swiper-button-prev',
            }}
            pagination={{
              clickable: true,
              el: '.swiper-pagination',
              bulletActiveClass: 'swiper-pagination-bullet-active',
              bulletClass: 'swiper-pagination-bullet',
            }}
            freeMode={{
              enabled: true,
              sticky: true,
              momentumBounce: false,
            }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: true,
              pauseOnMouseEnter: true,
            }}
            dir="rtl"
            className="rounded-xl pb-10"
          >
            {inspirationGifts.map((gift) => (
              <SwiperSlide key={gift.id} className="pb-4">
                <motion.div
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl border border-purple-100 overflow-hidden shadow-md h-full hover:shadow-xl transition-shadow duration-300"
                >
                  {/* Image with improved aspect ratio */}
                  <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden group">
                    <Image 
                      src={gift.image || "/placeholder.svg"} 
                      alt={gift.name} 
                      fill 
                      sizes="(max-width: 480px) 100vw, (max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-700 hover:scale-110" 
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <button 
                      onClick={(e) => toggleLike(gift.id, e)}
                      className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md z-10 transition-transform duration-300 hover:scale-110"
                    >
                      <Heart 
                        className={`w-3.5 h-3.5 ${likedItems[gift.id] ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} 
                      />
                    </button>
                    <div className="absolute top-2 left-2 bg-white bg-opacity-90 rounded-full px-2 py-1 flex items-center shadow-sm z-10">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs font-medium ml-1">{gift.rating}</span>
                    </div>
                    
                    {/* Quick action button - Changed to "تعديل الهدية" (Edit Gift) */}
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      onClick={() => loadInspiration(gift)}
                      className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-full text-xs font-medium shadow-lg flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <Edit className="w-3 h-3" />
                      تخصيص الهدية
                    </motion.button>
                  </div>

                  <div className="p-3">
                    {/* Name with expandable arrow */}
                    <div 
                      className="flex justify-between items-center cursor-pointer py-1"
                      onClick={() => toggleDescription(gift.id)}
                    >
                      <h3 className="font-medium text-gray-900 truncate text-sm">{gift.name}</h3>
                      <motion.div
                        animate={{ rotate: expandedItems[gift.id] ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      </motion.div>
                    </div>

                    {/* Expandable description */}
                    <AnimatePresence>
                      {expandedItems[gift.id] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <p className="text-xs text-gray-600 my-2 line-clamp-3">{gift.description}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Action buttons */}
                    <div className="flex justify-between mt-3 gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="text-xs flex-1 h-8 rounded-xl"
                      >
                        <Link href={`/inspiration/${gift.id}`}>
                          <Eye className="w-3 h-3 mr-1" />
                          عرض
                        </Link>
                      </Button>

                      <AddToCartButton inspiration={gift} />
                    </div>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}

            {/* Custom navigation buttons */}
            <button className="swiper-button-next absolute top-1/2 left-1 -translate-y-1/2 z-10 rounded-full bg-white shadow-lg w-8 h-8 sm:w-10 sm:h-10 border border-purple-200 flex items-center justify-center hover:bg-purple-50 cursor-pointer">
              <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600" />
            </button>
            
            <button className="swiper-button-prev absolute top-1/2 right-1 -translate-y-1/2 z-10 rounded-full bg-white shadow-lg w-8 h-8 sm:w-10 sm:h-10 border border-purple-200 flex items-center justify-center hover:bg-purple-50 cursor-pointer">
              <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600" />
            </button>
          </Swiper>
          
          {/* Custom pagination */}
          <div className="swiper-pagination flex justify-center mt-3"></div>
        </div>
      )}
    </div>
  )
}