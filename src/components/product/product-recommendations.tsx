"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Swiper, SwiperSlide } from "swiper/react"
import { FreeMode, Navigation } from "swiper/modules"
import { Skeleton } from "../ui/skeleton"
import ProductRating from "./product-rating"
import { useAuth } from "../../context/AuthContext"

interface Product {
  id: number
  name: string
  image: string
  price: number
  old_price?: number
  stock: number
  discount_percentage?: number
  score?: number
  reason?: string
}

interface ProductRecommendationsProps {
  productId: number
  category?: string
  tags?: string[]
}

export default function ProductRecommendations({ productId, category, tags }: ProductRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const [sessionId] = useState(
    () => localStorage.getItem("sessionId") || `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
  )

  useEffect(() => {
    // تخزين معرف الجلسة في localStorage إذا لم يكن موجودًا
    if (!localStorage.getItem("sessionId")) {
      localStorage.setItem("sessionId", sessionId)
    }

    const fetchRecommendations = async () => {
      try {
        // Get viewed products from localStorage
        const viewedProducts = JSON.parse(localStorage.getItem("viewedProducts") || "[]")
        const excludeIds = [...viewedProducts.map((p: Product) => p.id), productId].join(",")

        // Build query params
        const params = new URLSearchParams({
          excludeIds,
          limit: "12",
          sessionId,
        })

        if (category) params.append("category", category)
        if (tags?.length) params.append("tags", tags.join(","))

        // إضافة معرف المستخدم إذا كان مسجل الدخول
        if (user?.id) {
          params.append("userId", user.id)
          params.append("personalized", "true")
        }

        const response = await fetch(`/api/recommendations?${params.toString()}`)
        const data = await response.json()

        if (data.success) {
          setRecommendations(data.data)
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error)
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchRecommendations()
    }
  }, [productId, category, tags, user, sessionId])

  // تسجيل النقر على توصية
  const handleRecommendationClick = async (clickedProduct: Product) => {
    try {
      await fetch("/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id || "anonymous",
          productId: clickedProduct.id,
          action: "recommendation_click",
          sessionId,
          context: {
            sourceProductId: productId,
            sourceCategory: category,
            reason: clickedProduct.reason || "algorithm",
            score: clickedProduct.score,
          },
        }),
      })
    } catch (error) {
      console.error("Error recording recommendation click:", error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-40 w-full rounded-lg" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 relative pr-3 rtl:pl-3 rtl:pr-0 before:absolute before:right-0 rtl:before:left-0 rtl:before:right-auto before:top-0 before:h-full before:w-1 before:bg-amber-500 before:rounded-full">
        منتجات موصى بها لك
      </h2>

      <Swiper
        modules={[FreeMode, Navigation]}
        spaceBetween={16}
        slidesPerView={6}
        freeMode={true}
        navigation={{
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        }}
        breakpoints={{
          320: { slidesPerView: 2.2, spaceBetween: 12 },
          480: { slidesPerView: 2.5, spaceBetween: 12 },
          640: { slidesPerView: 3.5, spaceBetween: 16 },
          768: { slidesPerView: 4, spaceBetween: 16 },
          1024: { slidesPerView: 5, spaceBetween: 16 },
          1280: { slidesPerView: 6, spaceBetween: 16 },
        }}
        className="py-4 px-2"
        onInit={() => {
          // تسجيل عرض التوصيات
          if (user?.id) {
            fetch("/api/recommendations", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userId: user.id,
                productId: productId,
                action: "recommendations_shown",
                sessionId,
                context: {
                  count: recommendations.length,
                  sourceProductId: productId,
                  sourceCategory: category,
                },
              }),
            }).catch((error) => console.error("Error recording recommendations shown:", error))
          }
        }}
      >
        {recommendations.map((product) => (
          <SwiperSlide key={product.id} className="h-auto">
            <Link
              href={`/product/${product.id}`}
              className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-all h-full border border-gray-100 overflow-hidden"
              onClick={() => handleRecommendationClick(product)}
            >
              <div className="relative pt-[100%]">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="rounded-t-xl object-cover transition-transform hover:scale-105 duration-300"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                />
                {product.discount_percentage > 0 && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white py-1 px-2 text-xs font-semibold rounded-full">
                    خصم {product.discount_percentage}%
                  </div>
                )}
                {product.stock === 0 && (
                  <div className="absolute bottom-2 right-2 bg-red-500 text-white py-1 px-2 text-xs font-semibold rounded-full">
                    غير متوفر
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-medium text-sm line-clamp-2 h-10 mb-1">{product.name}</h3>
                <ProductRating productId={product.id} showCount={false} size="sm" />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-gray-900 font-bold text-sm">
                    {product.price} <span className="text-xs">ج.م</span>
                  </p>
                  {product.old_price && <p className="text-gray-500 line-through text-xs">{product.old_price}</p>}
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
        <div className="swiper-button-next !w-10 !h-10 !rounded-full bg-white shadow-md after:!text-lg"></div>
        <div className="swiper-button-prev !w-10 !h-10 !rounded-full bg-white shadow-md after:!text-lg"></div>
      </Swiper>
    </div>
  )
}

