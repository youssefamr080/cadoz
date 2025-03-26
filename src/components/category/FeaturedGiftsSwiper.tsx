"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, Autoplay } from "swiper/modules"
import { Heart, ShoppingCart, Star, Gift } from "lucide-react"
import { useGetProductsQuery } from "../../lib/redux/api/apiSlice"
import { useWishlist } from "../../context/WishlistContext"
import { useCart } from "../../context/CartContext"
import { toast } from "react-toastify"

// استيراد ستايلات Swiper
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"

interface FeaturedGiftsSwiperProps {
  category: string
}

// Define proper types for products
interface Product {
  id: number
  name: string
  image: string
  price: number
  old_price?: number
  description: string
  rating?: number
}

// Define cart item type
interface CartItem {
  id: number
  name: string
  image: string
  price: number
  quantity: number
}

// Define wishlist item type
interface WishlistItem {
  id: number
  name: string
  image: string
  price: number
}

const FeaturedGiftsSwiper: React.FC<FeaturedGiftsSwiperProps> = ({ category }) => {
  const { data, isLoading, error } = useGetProductsQuery({
    category,
    isGift: true,
    limit: 10,
    sort: "popularity", // ترتيب حسب الشعبية
  })

  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()

  const isFavorite = (productId: number) => {
    return wishlist.some((item) => item.id === productId)
  }

  const handleToggleWishlist = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    if (isFavorite(product.id)) {
      removeFromWishlist(product.id)
      toast.info("تمت الإزالة من المفضلة")
    } else {
      const wishlistItem: WishlistItem = {
        id: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
      }
      addToWishlist(wishlistItem)
      toast.success("تمت الإضافة إلى المفضلة")
    }
  }

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity: 1,
    }
    
    addToCart(cartItem)

    toast.success(
      <div className="flex items-center justify-between w-full">
        <span>✅ تمت الإضافة للسلة</span>
        <Link href="/cart" className="text-blue-600 underline mr-2 font-medium">
          عرض السلة
        </Link>
      </div>,
      { position: "bottom-center", autoClose: 3000 },
    )
  }

  // تحديد عدد الشرائح المعروضة حسب حجم الشاشة
  const [slidesPerView, setSlidesPerView] = useState(4)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setSlidesPerView(1.5)
      } else if (window.innerWidth < 768) {
        setSlidesPerView(2.5)
      } else if (window.innerWidth < 1024) {
        setSlidesPerView(3)
      } else {
        setSlidesPerView(4)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error || !data || data.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Gift size={40} className="text-purple-300 mb-2" />
        <p className="text-gray-500">لا توجد هدايا مميزة متاحة حالياً</p>
      </div>
    )
  }

  const products = data.data as Product[]

  return (
    <div className="relative gift-swiper-container">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={16}
        slidesPerView={slidesPerView}
        navigation={{
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        }}
        pagination={{
          clickable: true,
          el: ".swiper-pagination",
        }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        dir="rtl"
        className="py-4"
      >
        {products.map((product) => (
          <SwiperSlide key={product.id}>
            <Link href={`/product/${product.id}`}>
              <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col">
                <div className="relative">
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    <Image
                      src={product.image || "/placeholder.svg?height=300&width=300"}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      style={{ objectFit: "cover" }}
                      className="transition-transform duration-300 hover:scale-105"
                    />
                  </div>

                  {/* أيقونة المفضلة */}
                  <button
                    onClick={(e) => handleToggleWishlist(product, e)}
                    className={`absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm ${
                      isFavorite(product.id) ? "bg-red-500 text-white" : "bg-white/80 text-gray-600"
                    }`}
                    aria-label={isFavorite(product.id) ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
                  >
                    <Heart size={16} fill={isFavorite(product.id) ? "#fff" : "none"} />
                  </button>

                  {/* علامة الهدية */}
                  <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full flex items-center">
                    <Gift size={12} className="ml-1" />
                    هدية
                  </div>

                  {/* السعر */}
                  <div className="absolute bottom-2 right-2 bg-white/90 text-purple-600 text-xs font-bold px-2 py-1 rounded-lg shadow-sm">
                    {product.price} ج.م
                  </div>

                  {/* الخصم */}
                  {product.old_price && (
                    <div className="absolute bottom-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-lg">
                      خصم {Math.round(((product.old_price - product.price) / product.old_price) * 100)}%
                    </div>
                  )}
                </div>

                <div className="p-3 flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-gray-800 text-sm line-clamp-1">{product.name}</h3>
                    <div className="flex items-center text-amber-500">
                      <Star size={12} fill="#F59E0B" />
                      <span className="text-xs font-medium text-gray-700 mr-1">{product.rating || 0}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-xs mb-2 line-clamp-2 flex-grow">{product.description}</p>

                  <button
                    onClick={(e) => handleAddToCart(product, e)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-1.5 px-3 rounded-lg text-xs font-medium transition-colors flex items-center justify-center"
                    aria-label="إضافة إلى السلة"
                  >
                    <ShoppingCart size={14} className="ml-1" />
                    إضافة للسلة
                  </button>
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* أزرار التنقل */}
      <div className="swiper-button-prev !w-8 !h-8 !bg-white !shadow-md !rounded-full !text-purple-600 !opacity-90 hover:!opacity-100 after:!text-sm" aria-label="السابق"></div>
      <div className="swiper-button-next !w-8 !h-8 !bg-white !shadow-md !rounded-full !text-purple-600 !opacity-90 hover:!opacity-100 after:!text-sm" aria-label="التالي"></div>

      {/* نقاط التنقل */}
      <div className="swiper-pagination !bottom-0 !mt-4"></div>

      <style jsx global>{`
        .gift-swiper-container .swiper-button-prev:after,
        .gift-swiper-container .swiper-button-next:after {
          font-size: 14px;
          font-weight: bold;
        }
        
        .gift-swiper-container .swiper-pagination-bullet {
          background-color: #9333ea;
        }
        
        .gift-swiper-container .swiper {
          padding-bottom: 40px;
        }
        
        @media (max-width: 640px) {
          .gift-swiper-container .swiper-button-prev,
          .gift-swiper-container .swiper-button-next {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}

export default FeaturedGiftsSwiper