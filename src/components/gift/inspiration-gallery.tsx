"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useGift } from "@/context/gift-context"
import { Button } from "@/components/ui/button"
import { Star, Copy, ChevronLeft, ChevronRight, Eye, ChevronDown } from "lucide-react"
import { getPopularInspirations } from "@/lib/actions/inspiration-actions"
import type { Inspiration } from "@/types/inspiration"
import Image from "next/image"
import Link from "next/link"

export default function InspirationGallery() {
  const { loadInspiration } = useGift()
  const [currentIndex, setCurrentIndex] = useState(0)
  const swiperRef = useRef<HTMLDivElement>(null)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const [visibleItems, setVisibleItems] = useState(3)
  const [inspirationGifts, setInspirationGifts] = useState<Inspiration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
  // عدد المنتجات التي سيتم جلبها
  const maxInspirationCount = 10 // عرض 10 منتجات

  // Toggle description visibility for a gift
  const toggleDescription = (giftId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [giftId]: !prev[giftId]
    }))
  }

  // Update visible items based on screen size with improved responsiveness
  useEffect(() => {
    const handleResize = () => {
      // تحسين عرض العناصر على الهاتف
      if (window.innerWidth < 480) {
        setVisibleItems(1.5) // عرض منتج ونصف على الهواتف الصغيرة
      } else if (window.innerWidth < 640) {
        setVisibleItems(1.8) // عرض منتج ونصف مع جزء أكبر من المنتج التالي
      } else if (window.innerWidth < 1024) {
        setVisibleItems(2.5) // عرض منتجين ونصف على الأجهزة اللوحية
      } else {
        setVisibleItems(3.8) // عرض 3 منتجات مع جزء كبير من المنتج التالي
      }
    }

    handleResize()
    
    // استخدام ResizeObserver للحصول على أداء أفضل
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(handleResize);
      if (swiperRef.current) {
        resizeObserver.observe(swiperRef.current);
      }
    } else {
      // الطريقة القديمة كاحتياطي
      window.addEventListener("resize", handleResize);
    }
    
    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener("resize", handleResize);
      }
    };
  }, [])

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
        let processedData = [...data]
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

  const nextSlide = () => {
    if (currentIndex < inspirationGifts.length - visibleItems) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setCurrentIndex(0) // Loop back to the beginning
    }
  }

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    } else {
      setCurrentIndex(inspirationGifts.length - visibleItems) // Loop to the end
    }
  }

  // Touch handlers for mobile swiping with improved sensitivity and prevention of scroll conflicts
  const handleTouchStart = (e: React.TouchEvent) => {
    // تخزين نقطة البداية للمس
    setTouchStart(e.targetTouches[0].clientX)
    setIsSwiping(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isSwiping) {
      // تخزين النقطة الحالية للمس
      setTouchEnd(e.targetTouches[0].clientX)
      
      // منع التمرير العمودي إذا كان المستخدم يقوم بالسويب الأفقي
      const diffX = Math.abs(e.targetTouches[0].clientX - touchStart);
      if (diffX > 10) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
  }

  const handleTouchEnd = () => {
    if (!isSwiping) return; // تجنب المعالجة إذا لم يكن هناك سويب
    
    setIsSwiping(false)
    // تحسين حساسية السويب مع عتبة أقل
    if (touchStart - touchEnd > 40) {  // سويب لليسار
      nextSlide()
    } else if (touchStart - touchEnd < -40) {  // سويب لليمين
      prevSlide()
    }
  }

  // Calculate translateX with smoother transition and fix empty space issue
  const calculateTranslateX = () => {
    // منع التمرير إلى ما بعد العناصر المتاحة
    const maxIndex = Math.max(0, inspirationGifts.length - visibleItems)
    const safeIndex = Math.min(currentIndex, maxIndex)
    const basePercentage = -(safeIndex * (100 / visibleItems))
    return `${basePercentage}%`
  }

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">هدايا جاهزة للإلهام</h2>
        <Link 
          href="/inspirations" 
          className="flex items-center text-purple-600 hover:text-purple-800 transition-colors text-sm font-medium"
        >
          عرض كل الهدايا الجاهزة
          <ChevronLeft className="h-4 w-4 mr-1" />
        </Link>
      </div>
      <p className="text-gray-600 mb-6">اختر من هذه الهدايا المخصصة الشائعة أو استخدمها كنقطة بداية</p>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-purple-500 rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="text-center p-8 text-red-500">{error}</div>
      ) : (
        <div className="relative">
          {/* Navigation arrows - made larger and more visible for mobile */}
          <div className="absolute top-1/2 right-1 -translate-y-1/2 z-10">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full bg-white shadow-lg w-10 h-10 border-purple-200 hover:bg-purple-50" 
              onClick={prevSlide}
            >
              <ChevronRight className="h-6 w-6 text-purple-600" />
            </Button>
          </div>

          <div className="absolute top-1/2 left-1 -translate-y-1/2 z-10">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full bg-white shadow-lg w-10 h-10 border-purple-200 hover:bg-purple-50" 
              onClick={nextSlide}
            >
              <ChevronLeft className="h-6 w-6 text-purple-600" />
            </Button>
          </div>

          {/* Swiper container with improved touch handling */}
          <div
            ref={swiperRef}
            className="overflow-hidden rounded-xl relative"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ touchAction: 'pan-y' }} // السماح بالتمرير العمودي فقط
          >
            {/* مؤشر التحميل أثناء السويب */}
            {isSwiping && (
              <div className="absolute inset-0 bg-white bg-opacity-20 flex items-center justify-center z-10 pointer-events-none">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-purple-500 rounded-full animate-spin"></div>
              </div>
            )}
            <div
              className="flex transition-transform duration-300 ease-out will-change-transform"
              style={{ transform: `translateX(${calculateTranslateX()})` }}
            >
              {inspirationGifts.map((gift) => (
                <div key={gift.id} className="flex-shrink-0 px-2 pb-4" style={{ width: `${100 / visibleItems}%` }}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-2xl border overflow-hidden shadow-md h-full"
                  >
                    {/* Image with improved aspect ratio */}
                    <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
                      <Image 
                        src={gift.image || "/placeholder.svg"} 
                        alt={gift.name} 
                        fill 
                        sizes="(max-width: 480px) 100vw, (max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        priority={currentIndex === 0 && gift.id === inspirationGifts[0]?.id} // إعطاء الأولوية للصورة الرئيسية فقط
                        className="object-cover transition-transform duration-700 hover:scale-110" 
                        loading={currentIndex === 0 && gift.id === inspirationGifts[0]?.id ? "eager" : "lazy"}
                      />
                      <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-full px-2 py-1 flex items-center shadow-sm">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-medium ml-1">{gift.rating}</span>
                      </div>
                    </div>

                    <div className="p-3">
                      {/* Name with expandable arrow */}
                      <div 
                        className="flex justify-between items-center cursor-pointer py-1"
                        onClick={() => toggleDescription(gift.id)}
                      >
                        <h3 className="font-medium text-gray-900 truncate">{gift.name}</h3>
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
                            <p className="text-sm text-gray-600 my-2 line-clamp-3">{gift.description}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Action buttons */}
                      <div className="flex justify-between mt-3 gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="text-xs flex-1"
                        >
                          <Link href={`/inspiration/${gift.id}`}>
                            <Eye className="w-3 h-3 mr-1" />
                            عرض
                          </Link>
                        </Button>

                        <Button
                          size="sm"
                          className="text-xs bg-purple-600 hover:bg-purple-700 flex-1"
                          onClick={() => loadInspiration(gift)}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          استخدام
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          {/* Improved pagination dots with active indicator */}
          <div className="flex justify-center mt-6">
            {Array.from({ length: Math.ceil(inspirationGifts.length / visibleItems) }).map((_, index) => (
              <button
                key={index}
                className={`mx-1 transition-all duration-300 ${
                  Math.floor(currentIndex / visibleItems) === index 
                    ? "w-6 h-2 bg-purple-600 rounded-full" 
                    : "w-2 h-2 bg-gray-300 rounded-full"
                }`}
                onClick={() => setCurrentIndex(index * visibleItems)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}