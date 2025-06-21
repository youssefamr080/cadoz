"use client"

import { useMemo, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, Autoplay, FreeMode } from "swiper/modules"
import { motion } from "framer-motion"
import { Star } from "lucide-react"
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline"
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid"
import { useSelector, useDispatch } from "react-redux"
import { selectWishlist, addToWishlist, removeFromWishlist } from "@/lib/redux/slices/wishlistSlice"
import type { Product } from "@/types/product"

// Import Swiper styles
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import "swiper/css/free-mode"

// Common ProductCard component used by all swipers
const ProductCard = ({ product }: { product: Product }) => {
  const wishlist = useSelector(selectWishlist)
  const dispatch = useDispatch()

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (wishlist.some((item) => item.id === product.id)) {
      dispatch(removeFromWishlist(product.id))
    } else {
      dispatch(addToWishlist({
        id: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        productId: product.id
      }))
    }
  }
  
  // Calculate discount percentage if old price exists
  const discountPercentage = useMemo(() => {
    const oldPrice = product.old_price || product.oldPrice
    if (oldPrice && oldPrice > product.price) {
      return Math.round(((oldPrice - product.price) / oldPrice) * 100)
    }
    return 0
  }, [product])
  
  // Check if product is new (within last 30 days)
  const isNew = useMemo(() => {
    if (product.createdAt) {
      const createdDate = new Date(product.createdAt)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return createdDate > thirtyDaysAgo
    }
    return product.new_arrival || product.is_new
  }, [product])

  // We'll handle filtering at the swiper component level instead of here

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="group relative h-full"
    >
      <Link href={`/product/${product.id}`} className="block h-full">
        <div className="relative h-full overflow-hidden rounded-lg bg-white shadow-sm transition-all duration-300 hover:shadow-md">
          {/* Product Image */}
          <div className="relative aspect-square overflow-hidden">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
              priority
            />
            
            {/* Discount Badge - simplified */}
            {discountPercentage > 0 && (
              <div className="absolute left-0 top-0 bg-rose-500 px-2 py-1 text-xs font-medium text-white">
                {discountPercentage}% خصم
              </div>
            )}

            {/* New Badge - simplified */}
            {isNew && !discountPercentage && (
              <div className="absolute left-0 top-0 bg-emerald-500 px-2 py-1 text-xs font-medium text-white">
                جديد
              </div>
            )}
            
            {/* Trending Badge - simplified */}
            {(product.trending || product.is_trending) && !discountPercentage && !isNew && (
              <div className="absolute left-0 top-0 bg-blue-500 px-2 py-1 text-xs font-medium text-white">
                رائج
              </div>
            )}
          </div>

          {/* Product Info - simplified */}
          <div className="p-3">
            {/* Product Name */}
            <h3 className="mb-1 line-clamp-1 text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-300">
              {product.name}
            </h3>

            {/* Price */}
            <div className="flex items-center justify-between">
              <div className="text-base font-bold text-gray-900">
                {product.price} <span className="text-xs">ج.م</span>
              </div>

              {discountPercentage > 0 && (
                <div className="text-xs text-gray-500 line-through">
                  {product.old_price || product.oldPrice}
                </div>
              )}
            </div>
            
            {/* Rating - simplified */}
            {product.rating && (
              <div className="mt-1 flex items-center">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${i < Math.floor(product.rating || 0) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
                    />
                  ))}
                </div>
                <span className="mr-1 text-xs text-gray-500">({product.rating})</span>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* زر القلب للمفضلة */}
      <button
        className="absolute top-1.5 right-1.5 z-10 p-1 bg-white/90 backdrop-blur-sm rounded-full shadow-sm transition-all hover:scale-110"
        onClick={handleWishlistToggle}
      >
        {wishlist.some((item) => item.id === product.id) ? (
          <HeartSolid className="w-4 h-4 text-red-600" />
        ) : (
          <HeartOutline className="w-4 h-4 text-gray-400 hover:text-red-500 transition" />
        )}
      </button>
    </motion.div>
  )
}

// Trending Products Swiper (shows products tagged as trending)
interface TrendingProductsSwiperProps {
  products: Product[]
}

export const TrendingProductsSwiper = ({ products }: TrendingProductsSwiperProps) => {
  // Filter products that are marked as trending and in stock
  const trendingProducts = useMemo(() => {
    return products
      .filter(product => {
        // Check if product is in stock
        const isInStock = (product.stock === undefined || product.stock > 0) && product.inStock !== false
        // Only include products that are trending and in stock
        return (product.trending || product.is_trending) && isInStock
      })
      .slice(0, 20)
  }, [products])

  // Don't render the component if there are no products to show
  if (trendingProducts.length === 0) {
    return null
  }

  return (
    <div className="my-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 md:text-2xl">
          <span className="inline-flex items-center gap-2">
            
          </span>
        </h2>
      </div>
      
      <Swiper
        modules={[Navigation, Pagination, Autoplay, FreeMode]}
        spaceBetween={16}
        slidesPerView={2}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
        loop={trendingProducts.length > 5}
        speed={600}
        grabCursor={true}
        breakpoints={{
          640: { slidesPerView: 3, spaceBetween: 16 },
          768: { slidesPerView: 4, spaceBetween: 16 },
          1024: { slidesPerView: 5, spaceBetween: 20 },
          1280: { slidesPerView: 6, spaceBetween: 20 },
        }}
        className="product-swiper trending-swiper"
      >
        {trendingProducts.map((product) => (
          <SwiperSlide key={product.id} className="h-auto pb-10">
            <ProductCard product={product} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

// Discounted Products Swiper (shows products with highest discount)
interface DiscountedProductsSwiperProps {
  products: Product[]
}

export const DiscountedProductsSwiper = ({ products }: DiscountedProductsSwiperProps) => {
  // Filter and sort products by discount percentage
  const discountedProducts = useMemo(() => {
    return products
      .filter(product => {
        // Check if product is in stock
        const isInStock = (product.stock === undefined || product.stock > 0) && product.inStock !== false
        // Check if product has a discount
        const oldPrice = product.old_price || product.oldPrice
        // Only include products that have a discount and are in stock
        return oldPrice && oldPrice > product.price && isInStock
      })
      .sort((a, b) => {
        const discountA = ((a.old_price || a.oldPrice || 0) - a.price) / (a.old_price || a.oldPrice || 1) * 100
        const discountB = ((b.old_price || b.oldPrice || 0) - b.price) / (b.old_price || b.oldPrice || 1) * 100
        return discountB - discountA // Sort by highest discount first
      })
      .slice(0, 20)
  }, [products])

  // Don't render the component if there are no products to show
  if (discountedProducts.length === 0) {
    return null
  }

  return (
    <div className="my-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 md:text-2xl">
          <span className="inline-flex items-center gap-2">
            
          </span>
        </h2>
      </div>
      
      <Swiper
        modules={[Navigation, Pagination, Autoplay, FreeMode]}
        spaceBetween={16}
        slidesPerView={2}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 6000, disableOnInteraction: false, pauseOnMouseEnter: true }}
        loop={discountedProducts.length > 5}
        speed={600}
        grabCursor={true}
        breakpoints={{
          640: { slidesPerView: 3, spaceBetween: 16 },
          768: { slidesPerView: 4, spaceBetween: 16 },
          1024: { slidesPerView: 5, spaceBetween: 20 },
          1280: { slidesPerView: 6, spaceBetween: 20 },
        }}
        className="product-swiper discount-swiper"
      >
        {discountedProducts.map((product) => (
          <SwiperSlide key={product.id} className="h-auto pb-10">
            <ProductCard product={product} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

// New Products Swiper (shows newest products by createdAt date)
interface NewProductsSwiperProps {
  products: Product[]
}

export const NewProductsSwiper = ({ products }: NewProductsSwiperProps) => {
  // Filter and sort products by creation date
  const newProducts = useMemo(() => {
    return products
      .filter(product => {
        // Check if product is in stock
        const isInStock = (product.stock === undefined || product.stock > 0) && product.inStock !== false
        // Only include products that have a createdAt date and are in stock
        return product.createdAt && isInStock
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0)
        const dateB = new Date(b.createdAt || 0)
        return dateB.getTime() - dateA.getTime() // Sort by newest first
      })
      .slice(0, 20)
  }, [products])

  // Don't render the component if there are no products to show
  if (newProducts.length === 0) {
    return null
  }

  return (
    <div className="my-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 md:text-2xl">
          <span className="inline-flex items-center gap-2">
            
            
          </span>
        </h2>
      </div>
      
      <Swiper
        modules={[Navigation, Pagination, Autoplay, FreeMode]}
        spaceBetween={16}
        slidesPerView={2}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 7000, disableOnInteraction: false, pauseOnMouseEnter: true }}
        loop={newProducts.length > 5}
        speed={600}
        grabCursor={true}
        breakpoints={{
          640: { slidesPerView: 3, spaceBetween: 16 },
          768: { slidesPerView: 4, spaceBetween: 16 },
          1024: { slidesPerView: 5, spaceBetween: 20 },
          1280: { slidesPerView: 6, spaceBetween: 20 }
        }}
        className="product-swiper new-swiper"
      >
        {newProducts.map((product) => (
          <SwiperSlide key={product.id} className="h-auto pb-10">
            <ProductCard product={product} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

// Default export that combines all three swipers
interface ProductSwiperProps {
  products: Product[]
  showTrending?: boolean
  showDiscounted?: boolean
  showNew?: boolean

}

const ProductSwiper = ({
  products,
  showTrending = true,
  showDiscounted = true,
  showNew = true,
}: ProductSwiperProps) => {
  // Add a useEffect to add custom CSS for swiper animations
  useEffect(() => {
    // Add custom styles for enhanced swiper effects
    const style = document.createElement('style')
    style.textContent = `
      .product-swiper {
        padding: 10px 5px 30px;
      }
      .product-swiper .swiper-button-next,
      .product-swiper .swiper-button-prev {
        color: #6b7280;
        background: rgba(255, 255, 255, 0.9);
        width: 32px;
        height: 32px;
        border-radius: 50%;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        transition: all 0.2s ease;
      }
      .product-swiper .swiper-button-next:hover,
      .product-swiper .swiper-button-prev:hover {
        background: white;
        color: #3b82f6;
      }
      .product-swiper .swiper-button-next:after,
      .product-swiper .swiper-button-prev:after {
        font-size: 14px;
        font-weight: bold;
      }
      .product-swiper .swiper-pagination {
        bottom: 0;
      }
      .product-swiper .swiper-pagination-bullet {
        width: 6px;
        height: 6px;
        background: #d1d5db;
        opacity: 1;
      }
      .product-swiper .swiper-pagination-bullet-active {
        background: #6b7280;
      }
      .trending-swiper .swiper-pagination-bullet-active {
        background: #3b82f6;
      }
      .discount-swiper .swiper-pagination-bullet-active {
        background: #e11d48;
      }
      .new-swiper .swiper-pagination-bullet-active {
        background: #10b981;
      }
      @media (max-width: 640px) {
        .product-swiper .swiper-button-next,
        .product-swiper .swiper-button-prev {
          display: none;
        }
      }
    `
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [])
  
  if (!products || products.length === 0) {
    return null
  }

  return (
    <div className="space-y-12">
      {showTrending && <TrendingProductsSwiper products={products} />}
      {showDiscounted && <DiscountedProductsSwiper products={products} />}
      {showNew && <NewProductsSwiper products={products} />}
    </div>
  )
}

export default ProductSwiper