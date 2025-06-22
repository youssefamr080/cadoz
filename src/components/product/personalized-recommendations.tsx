"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Swiper, SwiperSlide } from "swiper/react"
import { FreeMode, Navigation } from "swiper/modules"
import { Skeleton } from "../ui/skeleton"
import ProductRating from "./product-rating"
import { useAuth } from "../../providers/AuthProvider"
import { Sparkles } from "lucide-react"

interface Product {
  id: string
  name: string
  image: string
  price: number
  old_price?: number
  stock: number
  discount_percentage?: number
  category?: string
  tags?: string[]
}

interface PersonalizedRecommendationsProps {
  title?: string
  subtitle?: string
  limit?: number
}

export default function PersonalizedRecommendations({
  title = "توصيات مخصصة لك",
  subtitle = "منتجات قد تعجبك بناءً على اهتماماتك",
  limit = 12,
}: PersonalizedRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true)

        // Safely parse cart data
        let cartItems = [];
        try {
          const cartData = localStorage.getItem("cart");
          if (cartData) {
            const parsedCart = JSON.parse(cartData);
            cartItems = Array.isArray(parsedCart) ? parsedCart : [];
          }
        } catch (e) {
          console.error("Error parsing cart data:", e);
        }

        const viewedProducts = JSON.parse(localStorage.getItem("viewedProducts") || "[]");
        const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
        const interestedProducts = JSON.parse(localStorage.getItem("interestedProducts") || "[]");

        const allInteracted = [...viewedProducts, ...wishlist, ...cartItems, ...interestedProducts];
        const excludeIds = [...new Set(allInteracted.map((p: Product) => p.id))].join(",");
        
        const categories = allInteracted.map((p) => p.category).filter(Boolean);
        const tags = allInteracted.flatMap((p) => p.tags || []).filter(Boolean);
        const mostCommonCategory = categories.sort((a, b) =>
          categories.filter(v => v === a).length - categories.filter(v => v === b).length
        ).pop();
        const mostCommonTags = [...new Set(tags)].slice(0, 3);
        
        const params = new URLSearchParams({
          excludeIds,
          limit: limit.toString(),
          personalized: "true",
        });
        if (mostCommonCategory) params.append("category", mostCommonCategory);
        if (mostCommonTags.length) params.append("tags", mostCommonTags.join(","));
        if (user?.id) {
          params.append("userId", user.id);
        }

        const CacheService = (await import("@/lib/services/cache-service")).default;
        const cacheKey = `personalized_recommendations_${params.toString()}`;
        const cached = await CacheService.getItem<Product[]>(cacheKey);
        if (cached && Array.isArray(cached) && cached.length > 0) {
          setRecommendations(cached);
          setLoading(false);
          return;
        }
        
        const response = await fetch(`/api/recommendations?${params.toString()}`)
        const data = await response.json()

        if (data.success) {
          setRecommendations(data.data)
          await CacheService.setItem(cacheKey, data.data, 30);
        }
      } catch (error) {
        console.error("Error fetching personalized recommendations:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [user, limit])

  // تسجيل مشاهدة المنتج
  const recordProductView = async (productId: string) => {
    try {
      await fetch("/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id || "anonymous",
          productId,
          action: "view",
        }),
      })
    } catch (error) {
      console.error("Error recording product view:", error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-24" />
        </div>
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 relative pr-3 rtl:pl-3 rtl:pr-0 before:absolute before:right-0 rtl:before:left-0 rtl:before:right-auto before:top-0 before:h-full before:w-1 before:bg-gradient-to-b before:from-purple-500 before:to-pink-500 before:rounded-full flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            {title}
          </h2>
          {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
        </div>
      </div>

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
      >
        {recommendations.map((product) => (
          <SwiperSlide key={product.id} className="h-auto">
            <Link
              href={`/product/${product.id}`}
              className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-all h-full border border-gray-100 overflow-hidden"
              onClick={() => recordProductView(product.id)}
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
                  <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-pink-500 text-white py-1 px-2 text-xs font-semibold rounded-full">
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
