"use client"

import type React from "react"


import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { Star } from "lucide-react"

// تعريف نوع موحد للعناصر التي يمكن عرضها في البطاقة
interface CardItem {
  id: number | string
  name?: string
  image: string
  price: number
  oldPrice?: number | null
  stars?: number
}

interface BotCardProps {
  type: "products" | "gifts" | null
  item: CardItem // منتج واحد بدلاً من قائمة
}

// أضف هذه الدالة المساعدة لمعالجة مسارات الصور
const getImageUrl = (imageUrl: string, type: string): string => {
  console.log("🖼️ Processing image URL:", imageUrl, "for type:", type)

  // إذا كان المسار كاملاً (يبدأ بـ http)، استخدمه كما هو
  if (imageUrl.startsWith("http")) {
    return imageUrl
  }

  // إذا كان المسار نسبيًا، أضف المسار الأساسي حسب النوع
  if (type === "products") {
    // تأكد من أن المسار يبدأ بـ /
    return imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`
  } else if (type === "gifts") {
    // تأكد من أن المسار يبدأ بـ /
    return imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`
  }

  // إذا لم يكن هناك مسار محدد، استخدم الصورة الافتراضية
  return "/placeholder.svg?height=120&width=120"
}

export default function BotCard({ type, item }: BotCardProps) {
  const [, setIsMobile] = useState(false)
  const [, setIsSlowDevice] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4
    const cores = navigator.hardwareConcurrency || 2
    setIsSlowDevice(memory < 4 || cores < 4)
  }, [])

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true)
  }, [])

  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement
    target.src = "/placeholder.svg?height=120&width=120"
  }, [])

  // حساب نسبة الخصم
  const calculateDiscountPercentage = (price: number, oldPrice?: number | null): number => {
    if (!oldPrice || oldPrice <= price) return 0
    return Math.round(((oldPrice - price) / oldPrice) * 100)
  }

  if (!item) {
    return null
  }

  const itemId = item.id.toString()
  const itemLink = type === "gifts" ? `/inspiration/${itemId}` : `/product/${itemId}`
  const discountPercentage = calculateDiscountPercentage(item.price, item.oldPrice)

  // استخدام النجوم الحقيقية من البيانات أو القيمة الافتراضية 5
  const starRating = item.stars !== undefined ? item.stars : 5

  return (
    <div className="w-full mt-3">
      <div className="bg-gradient-to-r from-purple-50/50 to-blue-50/50 rounded-xl p-3 border border-purple-100/30">
        <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100">
          <Link href={itemLink} className="block">
            <div className="flex">
              {/* صورة المنتج */}
              <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden">
                <Image
                  src={getImageUrl(item.image, type) || "/placeholder.svg"}
                  alt={item.name || "صورة المنتج"}
                  fill
                  className={`object-cover transition-opacity duration-300 ${
                    imageLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  sizes="96px"
                  loading="lazy"
                  quality={75}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />

                {discountPercentage > 0 && (
                  <div className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {discountPercentage}%-
                  </div>
                )}
              </div>

              {/* تفاصيل المنتج */}
              <div className="flex-1 p-3 flex flex-col justify-between">
                {/* اسم المنتج */}
                {item.name && (
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 leading-tight">{item.name}</h3>
                )}

                {/* التقييم */}
                <div className="flex items-center mb-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < starRating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 fill-gray-300"
                        }`}
                      />
                    ))}
                    <span className="text-xs text-gray-500 mr-1">({starRating}.0)</span>
                  </div>
                </div>

                {/* السعر والزر */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">{item.price} ج.م</span>
                      {item.oldPrice && <span className="text-sm text-gray-500 line-through">{item.oldPrice} ج.م</span>}
                    </div>
                    {discountPercentage > 0 && (
                      <span className="text-xs text-green-600 font-medium">وفر {item.oldPrice! - item.price} ج.م</span>
                    )}
                  </div>

                  <div className="px-3 py-1.5 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">
                    <span className="text-xs font-medium text-white">عرض</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
