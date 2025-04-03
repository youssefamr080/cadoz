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
import { Gift, Info, CheckCircle, ChevronDown, Loader2 } from "lucide-react"
import { giftTheme } from "../../components/gift/lib/gift-theme"
import GiftSectionHeader from "../../components/gift/gift-section-header"
import GiftSelectionCard from "../../components/gift/gift-selection-card"
import { chunkArray } from "../../components/gift/lib/array-helpers"
import { useInView } from "react-intersection-observer"

const GiftStepBox = () => {
  const { state, dispatch } = useGift()
  const [isLoading, setIsLoading] = useState(true)
  const [activeChunk, setActiveChunk] = useState(0)
  const swiperInstancesRef = useRef<(SwiperType | null)[]>([])
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

  // تصفية وترتيب الصناديق - مع تحسين الأداء باستخدام useMemo
  const boxes = useMemo(
    () => giftOptions.filter((item) => item.category === "boxes").sort((a, b) => a.price - b.price),
    [],
  )

  // تقسيم الصناديق إلى مجموعات - مع تحسين الأداء باستخدام useMemo
  const boxChunks = useMemo(() => chunkArray(boxes, 10), [boxes])

  // تحسين معالج اختيار الصندوق باستخدام useCallback
  const handleSelectBox = useCallback(
    (box) => {
      // إضافة تأثير اهتزاز إذا كان متاحًا
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(50)
      }

      dispatch({
        type: "SELECT_BOX",
        payload: state.selectedBox?.id === box.id ? null : box,
      })

      // تتبع حدث اختيار الصندوق (يمكن استخدامه مع أدوات التحليلات)
      if (typeof window !== "undefined" && "gtag" in window) {
        const gtag = window.gtag
        gtag("event", "select_box", {
          box_id: box.id,
          box_name: box.name,
          box_price: box.price,
        })
      }
    },
    [state.selectedBox?.id, dispatch],
  )

  // تحسين التنقل باستخدام لوحة المفاتيح
  const handleKeyDown = useCallback((e: React.KeyboardEvent, chunkIndex: number) => {
    const swiper = swiperInstancesRef.current[chunkIndex]
    if (!swiper) return

    if (e.key === "ArrowRight") {
      swiper.slidePrev()
    } else if (e.key === "ArrowLeft") {
      swiper.slideNext()
    } else if (e.key === "Enter" || e.key === " ") {
      // تنفيذ الإجراء على العنصر المحدد حاليًا
      const activeIndex = swiper.activeIndex
      const activeSlide = swiper.slides[activeIndex]
      if (activeSlide) {
        activeSlide.click()
      }
    }
  }, [])

  // تحميل الصور مسبقًا لتجربة أكثر سلاسة
  useEffect(() => {
    if (!isLoading && boxes.length > 0) {
      // تحميل أول 5 صور مسبقًا
      boxes.slice(0, 5).forEach((box) => {
        if (box.image) {
          const img = new window.Image()
          img.src = box.image
        }
      })
    }
  }, [isLoading, boxes])

  // حالة فارغة مع تحريك
  if (boxes.length === 0) {
    return (
      <motion.div
        className={`${giftTheme.gradients.light} p-8 ${giftTheme.rounded.lg} ${giftTheme.shadows.lg} flex flex-col items-center justify-center min-h-[300px] border border-indigo-100`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-indigo-500 mb-6 text-6xl" aria-hidden="true">
          🎁
        </div>
        <h3 className="text-2xl font-bold text-indigo-800 mb-3">لا توجد صناديق متاحة حالياً</h3>
        <p className="text-indigo-600 text-center max-w-md">سيتم إضافة صناديق جديدة قريباً، يرجى زيارتنا مرة أخرى</p>
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
        <Loader2 className={`w-10 h-10 ${giftTheme.colors.primary.text} animate-spin mb-4`} aria-hidden="true" />
        <p className="text-indigo-600">جاري تحميل الصناديق...</p>
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
        title="اختر صندوق الهدية"
        icon={<Gift className="w-6 h-6" aria-hidden="true" />}
        variant="primary"
      />

      {/* معلومات إضافية - تحسين التباين للقراءة */}
      <div className="bg-white/90 p-3 sm:p-4 rounded-xl mb-5 backdrop-blur-sm border border-indigo-100 shadow-sm">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-indigo-500 mt-0.5 mr-2 flex-shrink-0" aria-hidden="true" />
          <p className="text-sm text-indigo-800">
            اختر صندوقًا مناسبًا لهديتك من مجموعتنا المميزة. الصندوق هو أول ما سيراه من تهديه، لذا اختر ما يناسب ذوقه
            وشخصيته.
          </p>
        </div>
      </div>

      {/* عرض الخيارات - تحسين Swiper وإضافة دعم الوصولية */}
      {boxChunks.map((chunk, chunkIndex) => (
        <div
          key={`box-chunk-${chunkIndex}`}
          className="mb-6"
          onKeyDown={(e) => handleKeyDown(e, chunkIndex)}
          tabIndex={chunkIndex === activeChunk ? 0 : -1}
          role="region"
          aria-label={`مجموعة الصناديق ${chunkIndex + 1}`}
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
                <span>المزيد من الصناديق</span>
                <ChevronDown className="w-3 h-3 mr-1" aria-hidden="true" />
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
              bulletActiveClass: "swiper-pagination-bullet-active bg-indigo-500",
              renderBullet: (index, className) => {
                return `<span class="${className}" aria-label="صفحة ${index + 1}" role="button"></span>`
              },
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
              1536: { slidesPerView: 7, spaceBetween: 20 }, // إضافة دعم للشاشات الكبيرة جدًا
            }}
            className="gift-swiper-improved mb-4 py-3 px-1"
            a11y={{
              enabled: true,
              prevSlideMessage: "الصندوق السابق",
              nextSlideMessage: "الصندوق التالي",
              firstSlideMessage: "هذا أول صندوق",
              lastSlideMessage: "هذا آخر صندوق",
              paginationBulletMessage: "الانتقال إلى الصندوق {{index}}",
            }}
            watchSlidesProgress={true}
            observer={true}
            observeParents={true}
          >
            {chunk.map((box, boxIndex) => {
              const isSelected = state.selectedBox?.id === box.id
              const virtualIndex = chunkIndex * 10 + boxIndex

              return (
                <SwiperSlide key={box.id} virtualIndex={virtualIndex} className="!h-auto">
                  <div className="transform transition-transform duration-200 hover:scale-105">
                    <GiftSelectionCard
                      item={{
                        ...box,
                        id: String(box.id), // تحويل الـ id من رقم إلى نص
                      }}
                      isSelected={isSelected}
                      onClick={() => handleSelectBox(box)}
                      onRemove={() => dispatch({ type: "SELECT_BOX", payload: null })}
                      variant="primary"
                      compact={true}
                      aria-label={`صندوق ${box.name} بسعر ${box.price} جنيه ${isSelected ? "(مختار)" : ""}`}
                    />
                  </div>
                </SwiperSlide>
              )
            })}
            <div
              className="swiper-button-next !w-8 !h-8 !bg-white !rounded-full !shadow-md !text-indigo-500 after:!text-[10px]"
              aria-label="الصندوق التالي"
            ></div>
            <div
              className="swiper-button-prev !w-8 !h-8 !bg-white !rounded-full !shadow-md !text-indigo-500 after:!text-[10px]"
              aria-label="الصندوق السابق"
            ></div>
          </Swiper>
        </div>
      ))}

      {/* قسم المعلومات أو النصائح - تحسين الرسوم المتحركة */}
      <AnimatePresence mode="wait">
        {state.selectedBox && (
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
              <div className="bg-indigo-100 p-2 rounded-full mr-3">
                <CheckCircle className="w-5 h-5 text-indigo-600" aria-hidden="true" />
              </div>
              <div>
                <h4 className="font-bold text-indigo-700 mb-1">تم اختيار الصندوق بنجاح</h4>
                <p className="text-indigo-600">
                  {`لقد اخترت صندوق "${state.selectedBox.name}" بسعر ${state.selectedBox.price.toLocaleString()} ج.م. يمكنك الآن متابعة اختيار باقي العناصر.`}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
          background: #6366f1;
          transform: scale(1.2);
        }
        
        .gift-swiper-improved .swiper-button-next,
        .gift-swiper-improved .swiper-button-prev {
          color: #6366f1;
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
          box-shadow: 0 0 0 2px #6366f1;
        }
        
        .gift-swiper-improved .swiper-button-disabled {
          opacity: 0.3 !important;
        }
        
        /* تحسين الوصولية للتركيز */
        .gift-swiper-improved .swiper-slide:focus-within {
          outline: 2px solid #6366f1;
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

export default GiftStepBox
