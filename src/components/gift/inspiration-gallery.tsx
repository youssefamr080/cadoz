"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { useGift } from "@/context/gift-context"
import { Button } from "@/components/ui/button"
import { Star, Copy, ChevronLeft, ChevronRight, Eye } from "lucide-react"
import { getPopularInspirations } from "@/lib/actions/inspiration-actions"
import type { Inspiration } from "@/types/inspiration"
import Image from "next/image"

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

  // Update visible items based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleItems(1)
      } else if (window.innerWidth < 1024) {
        setVisibleItems(2)
      } else {
        setVisibleItems(3)
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

  const handleUseInspiration = (gift: Inspiration) => {
    loadInspiration(gift)
  }

  // Removed unused handleShare function to fix lint error

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

  // Touch handlers for mobile swiping
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
    if (touchStart - touchEnd > 75) {
      // Swipe left
      nextSlide()
    } else if (touchStart - touchEnd < -75) {
      // Swipe right
      prevSlide()
    }
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">استلهم من هدايا أخرى</h2>
      <p className="text-gray-600 mb-6">اختر من هذه الهدايا المخصصة الشائعة أو استخدمها كنقطة بداية</p>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-purple-500 rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="text-center p-8 text-red-500">{error}</div>
      ) : (
        <div className="relative">
          <div className="absolute top-1/2 right-0 -translate-y-1/2 z-10">
            <Button variant="outline" size="icon" className="rounded-full bg-white shadow-md" onClick={prevSlide}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          <div
            ref={swiperRef}
            className="overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(${currentIndex * (100 / visibleItems)}%)` }}
            >
              {inspirationGifts.map((gift) => (
                <div key={gift.id} className={`flex-shrink-0 px-2`} style={{ width: `${100 / visibleItems}%` }}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-lg border overflow-hidden shadow-sm h-full"
                  >
                    <div className="relative aspect-square bg-gray-100">
                      <Image src={gift.image || "/placeholder.svg"} alt={gift.name} fill className="object-cover" />
                    </div>

                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900">{gift.name}</h3>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-medium ml-1">{gift.rating}</span>
                          <span className="text-xs text-gray-500 ml-1">({gift.reviews})</span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-4">{gift.description}</p>

                      <div className="flex justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="text-xs"
                        >
                          <a href={`/inspiration/${gift.id}`}>
                            <Eye className="w-3 h-3 mr-1" />
                            عرض الهدية
                          </a>
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => handleUseInspiration(gift)}
                          className="text-xs bg-purple-600 hover:bg-purple-700"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          استخدام هذه الهدية
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute top-1/2 left-0 -translate-y-1/2 z-10">
            <Button variant="outline" size="icon" className="rounded-full bg-white shadow-md" onClick={nextSlide}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>

          {/* Pagination dots */}
          <div className="flex justify-center mt-4">
            {Array.from({ length: Math.ceil(inspirationGifts.length / visibleItems) }).map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 mx-1 rounded-full ${
                  Math.floor(currentIndex / visibleItems) === index ? "bg-purple-600" : "bg-gray-300"
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
