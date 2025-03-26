"use client"

import type React from "react"

import { useMemo, useCallback, useState, useEffect, useRef } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, Virtual, EffectCards } from "swiper/modules"
import type { Swiper as SwiperType } from "swiper"
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import "swiper/css/effect-cards"
import { giftOptions } from "../../data/products"
import { useGift } from "../../context/GiftContext"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, CheckCircle, Info, ChevronDown, Loader2 } from "lucide-react"
import { giftTheme, swiperStyles } from "../gift/lib/gift-theme"
import GiftSectionHeader from "./gift-section-header"
import GiftSelectionCard from "./gift-selection-card"

// Optimized chunk array function with memoization
const chunkArray = (array, chunkSize = 10) => {
  const chunks = []
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize))
  }
  return chunks
}

const GiftStepWrap = () => {
  const { state, dispatch } = useGift()
  const [isLoading, setIsLoading] = useState(true)
  const [activeChunk, setActiveChunk] = useState(0)
  const swiperInstancesRef = useRef<(SwiperType | null)[]>([])

  // Simulate loading state for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  // Filter and sort wraps - memoized for performance
  const wraps = useMemo(
    () => giftOptions.filter((item) => item.category === "packets").sort((a, b) => a.price - b.price),
    [],
  )

  // Chunk wraps into groups - memoized for performance
  const wrapChunks = useMemo(() => chunkArray(wraps, 10), [wraps])

  // Optimized wrap selection handler with useCallback
  const handleSelectWrap = useCallback(
    (wrap) => {
      // Add haptic feedback if available
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(50)
      }

      dispatch({
        type: "SELECT_WRAP",
        payload: state.selectedWrap?.id === wrap.id ? null : wrap,
      })
    },
    [state.selectedWrap?.id, dispatch],
  )

  // Handle keyboard navigation within the swiper
  const handleKeyDown = useCallback((e: React.KeyboardEvent, chunkIndex: number) => {
    const swiper = swiperInstancesRef.current[chunkIndex]
    if (!swiper) return

    if (e.key === "ArrowRight") {
      swiper.slidePrev()
    } else if (e.key === "ArrowLeft") {
      swiper.slideNext()
    }
  }, [])

  // Preload images for smoother experience
  useEffect(() => {
    if (!isLoading && wraps.length > 0) {
      // Preload first few images
      wraps.slice(0, 5).forEach((wrap) => {
        if (wrap.image) {
          const img = new Image()
          img.src = wrap.image
        }
      })
    }
  }, [isLoading, wraps])

  // Empty state with animation
  if (wraps.length === 0) {
    return (
      <motion.div
        className={`${giftTheme.gradients.light} p-8 ${giftTheme.rounded.lg} ${giftTheme.shadows.lg} flex flex-col items-center justify-center min-h-[300px] border border-indigo-100`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-pink-500 mb-6 text-6xl">🎀</div>
        <h3 className="text-2xl font-bold text-indigo-800 mb-3">لا توجد خيارات تغليف متاحة حالياً</h3>
        <p className="text-indigo-600 text-center max-w-md">
          سيتم إضافة خيارات تغليف جديدة قريباً، يرجى زيارتنا مرة أخرى
        </p>
      </motion.div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <motion.div
        className={`${giftTheme.gradients.light} p-8 ${giftTheme.rounded.lg} ${giftTheme.shadows.lg} flex flex-col items-center justify-center min-h-[300px] border border-indigo-100`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Loader2 className={`w-10 h-10 ${giftTheme.colors.accent.text} animate-spin mb-4`} />
        <p className="text-pink-600">جاري تحميل خيارات التغليف...</p>
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
      <GiftSectionHeader title="اختر تغليف الهدية" icon={<Sparkles className="w-6 h-6" />} variant="accent" />

      {/* معلومات إضافية - Enhanced with better contrast */}
      <div className="bg-white/80 p-3 sm:p-4 rounded-xl mb-5 backdrop-blur-sm border border-indigo-100 shadow-sm">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-pink-500 mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-sm text-indigo-800">
            التغليف يضيف لمسة جمالية مميزة لهديتك. اختر التغليف المناسب للمناسبة والشخص الذي ستقدم له الهدية.
          </p>
        </div>
      </div>

      {/* عرض الخيارات - Enhanced with smaller cards and improved Swiper */}
      {wrapChunks.map((chunk, chunkIndex) => (
        <div
          key={`wrap-chunk-${chunkIndex}`}
          className="mb-6"
          onKeyDown={(e) => handleKeyDown(e, chunkIndex)}
          tabIndex={chunkIndex === activeChunk ? 0 : -1}
          role="region"
          aria-label={`مجموعة التغليفات ${chunkIndex + 1}`}
        >
          {chunkIndex > 0 && (
            <motion.div
              className="flex items-center justify-center mb-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="h-px w-16 bg-indigo-200"></div>
              <div className="mx-2 text-xs text-indigo-400 flex items-center">
                <span>المزيد من التغليفات</span>
                <ChevronDown className="w-3 h-3 ml-1" />
              </div>
              <div className="h-px w-16 bg-indigo-200"></div>
            </motion.div>
          )}

          <Swiper
            modules={[Navigation, Pagination, Virtual, EffectCards]}
            spaceBetween={12}
            slidesPerView="auto"
            pagination={{
              clickable: true,
              dynamicBullets: true,
              bulletActiveClass: "swiper-pagination-bullet-active bg-pink-500",
            }}
            navigation={{
              nextEl: ".swiper-button-next",
              prevEl: ".swiper-button-prev",
            }}
            virtual
            onSwiper={(swiper) => {
              swiperInstancesRef.current[chunkIndex] = swiper
            }}
            onSlideChange={() => setActiveChunk(chunkIndex)}
            breakpoints={{
              320: { slidesPerView: 2.2, spaceBetween: 8, centeredSlides: false },
              480: { slidesPerView: 2.5, spaceBetween: 10, centeredSlides: false },
              640: { slidesPerView: 3.2, spaceBetween: 12, centeredSlides: false },
              768: { slidesPerView: 4, spaceBetween: 14 },
              1024: { slidesPerView: 5, spaceBetween: 16 },
              1280: { slidesPerView: 6, spaceBetween: 18 },
            }}
            className="gift-swiper-improved mb-4 py-3 px-1"
            a11y={{
              enabled: true,
              prevSlideMessage: "التغليف السابق",
              nextSlideMessage: "التغليف التالي",
              firstSlideMessage: "هذا أول تغليف",
              lastSlideMessage: "هذا آخر تغليف",
            }}
          >
            {chunk.map((wrap, wrapIndex) => {
              const isSelected = state.selectedWrap?.id === wrap.id
              const virtualIndex = chunkIndex * 10 + wrapIndex

              return (
                <SwiperSlide key={wrap.id} virtualIndex={virtualIndex} className="!h-auto">
                  <div className="transform transition-transform duration-200 hover:scale-105">
                    <GiftSelectionCard
                      item={wrap}
                      isSelected={isSelected}
                      onClick={() => handleSelectWrap(wrap)}
                      onRemove={() => dispatch({ type: "SELECT_WRAP", payload: null })}
                      variant="accent"
                      compact={true} // Add compact prop to make cards smaller
                    />
                  </div>
                </SwiperSlide>
              )
            })}
            <div className="swiper-button-next !w-8 !h-8 !bg-white !rounded-full !shadow-md !text-pink-500 after:!text-[10px]"></div>
            <div className="swiper-button-prev !w-8 !h-8 !bg-white !rounded-full !shadow-md !text-pink-500 after:!text-[10px]"></div>
          </Swiper>
        </div>
      ))}

      {/* قسم المعلومات أو النصائح - Enhanced animation */}
      <AnimatePresence mode="wait">
        {state.selectedWrap && (
          <motion.div
            className="mt-4 p-4 bg-white rounded-xl text-sm text-indigo-800 border border-indigo-200 shadow-md"
            initial={{ opacity: 0, height: 0, y: 20 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{
              duration: 0.3,
              type: "spring",
              stiffness: 500,
              damping: 30,
            }}
          >
            <div className="flex items-start">
              <div className="bg-pink-100 p-2 rounded-full mr-3">
                <CheckCircle className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <h4 className="font-bold text-pink-700 mb-1">تم اختيار التغليف بنجاح</h4>
                <p className="text-pink-600">
                  {`لقد اخترت تغليف "${state.selectedWrap.name}" بسعر ${state.selectedWrap.price.toLocaleString()} ج.م. يمكنك الآن متابعة اختيار باقي العناصر.`}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        ${swiperStyles}
        
        .gift-swiper-improved .swiper-slide {
          height: auto;
          transition: transform 0.3s ease;
        }
        
        .gift-swiper-improved .swiper-pagination {
          bottom: -5px !important;
        }
        
        .gift-swiper-improved .swiper-pagination-bullet {
          width: 6px;
          height: 6px;
          background: #d1d5db;
          opacity: 0.7;
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
        }
        
        .gift-swiper-improved .swiper-button-next:hover,
        .gift-swiper-improved .swiper-button-prev:hover {
          opacity: 1;
          transform: translateY(-50%) scale(1.1);
        }
        
        .gift-swiper-improved .swiper-button-disabled {
          opacity: 0.3 !important;
        }
      `}</style>
    </motion.div>
  )
}

export default GiftStepWrap

