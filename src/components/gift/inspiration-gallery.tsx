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

  // Toggle description visibility for a gift
  const toggleDescription = (giftId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [giftId]: !prev[giftId]
    }))
  }

  // Update visible items based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleItems(2) // Show 2 items on mobile
      } else if (window.innerWidth < 1024) {
        setVisibleItems(2) // Show 2 items on tablets
      } else {
        setVisibleItems(3) // Show 3 items on desktop
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Fetch inspiration gifts
  useEffect(() => {
    const fetchInspirations = async () => {
      try {
        setIsLoading(true)
        const data = await getPopularInspirations()
        setInspirationGifts(data)
        setError(null)
      } catch (err) {
        console.error("Error loading inspirations:", err)
        setError("حدث خطأ أثناء تحميل هدايا الإلهام. يرجى المحاولة مرة أخرى.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchInspirations()
  }, [])

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

  // Touch handlers for mobile swiping with improved sensitivity
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
    setIsSwiping(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isSwiping) {
      setTouchEnd(e.targetTouches[0].clientX)
    }
  }

  const handleTouchEnd = () => {
    setIsSwiping(false)
    if (touchStart - touchEnd > 50) {  // Reduced threshold for better responsiveness
      // Swipe left
      nextSlide()
    } else if (touchStart - touchEnd < -50) {  // Reduced threshold for better responsiveness
      // Swipe right
      prevSlide()
    }
  }

  // Calculate translateX with smoother transition
  const calculateTranslateX = () => {
    const basePercentage = -(currentIndex * (100 / visibleItems))
    return `${basePercentage}%`
  }

  return (
    <div className="mb-8">
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
            className="overflow-hidden rounded-xl"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="flex transition-transform duration-500 ease-out"
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
                        className="object-cover transition-transform duration-700 hover:scale-110" 
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