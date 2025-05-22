"use client"
import { Swiper, SwiperSlide } from "swiper/react"
import "swiper/css"
import "swiper/css/free-mode"
import { FreeMode } from "swiper/modules"
import Image from "next/image"
import Link from "next/link"
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline"
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid"
import { Star } from "lucide-react"
import { useWishlist } from "../../context/WishlistContext"
import type { Product } from "../../types/product"

const BrandSwiper = ({ brand, products }: { brand: string; products: Product[] }) => {
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist()

  const handleWishlistToggle = (product: Product) => {
    if (wishlist.some((item) => item.id === product.id)) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        productId: product.id
      })
    }
  }

  return (
    <div className="space-y-6">
      {products.length > 0 && (
        <div>
          {/* عنوان البراند */}
          <h2 className="text-xl font-bold text-gray-800 mb-4">{brand}</h2>

          {/* سويبر المنتجات الخاصة بالبراند */}
          <Swiper modules={[FreeMode]} spaceBetween={15} slidesPerView="auto" freeMode className="rounded-xl">
            {products.map((product) => (
              <SwiperSlide
                key={product.id}
                className="!w-40 sm:!w-48 md:!w-56 lg:!w-64"
              >
                {/* بطاقة المنتج */}
                <div className="group relative h-full">
                  <Link
                    href={`/product/${product.id}`}
                    className="block h-full"
                  >
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
                        
                        {/* Discount Badge */}
                        {product.old_price && product.old_price > product.price && (
                          <div className="absolute left-0 top-0 bg-rose-500 px-2 py-1 text-xs font-medium text-white">
                            {Math.round(((product.old_price - product.price) / product.old_price) * 100)}% خصم
                          </div>
                        )}

                        {/* New Badge */}
                        {product.new_arrival && !product.old_price && (
                          <div className="absolute left-0 top-0 bg-emerald-500 px-2 py-1 text-xs font-medium text-white">
                            جديد
                          </div>
                        )}
                        
                        {/* Trending Badge */}
                        {product.trending && !product.old_price && !product.new_arrival && (
                          <div className="absolute left-0 top-0 bg-blue-500 px-2 py-1 text-xs font-medium text-white">
                            رائج
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
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

                          {product.old_price && product.old_price > product.price && (
                            <div className="text-xs text-gray-500 line-through">
                              {product.old_price}
                            </div>
                          )}
                        </div>
                        
                        {/* Rating */}
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
                    onClick={(e) => {
                      e.stopPropagation()
                      handleWishlistToggle(product)
                    }}
                  >
                    {wishlist.some((item) => item.id === product.id) ? (
                      <HeartSolid className="w-4 h-4 text-red-600" />
                    ) : (
                      <HeartOutline className="w-4 h-4 text-gray-400 hover:text-red-500 transition" />
                    )}
                  </button>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </div>
  )
}

export default BrandSwiper