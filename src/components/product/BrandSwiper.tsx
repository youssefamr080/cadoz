"use client"
import { Swiper, SwiperSlide } from "swiper/react"
import "swiper/css"
import "swiper/css/free-mode"
import { FreeMode } from "swiper/modules"
import Image from "next/image"
import Link from "next/link"
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline"
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid"
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
                className="!w-32 !h-48 sm:!w-40 sm:!h-56 md:!w-48 md:!h-64 lg:!w-56 lg:!h-72"
              >
                {/* بطاقة المنتج */}
                <Link
                  href={`/product/${product.id}`}
                  className="block bg-white rounded-xl shadow hover:shadow-lg transition flex flex-col h-full group"
                >
                  {/* غلاف المنتج */}
                  <div className="relative w-full h-2/3">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-t-xl group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-2 flex-grow flex flex-col items-center justify-center">
                    {/* اسم المنتج + تفاصيل */}
                    <h3 className="text-sm font-medium text-gray-900 truncate text-center">{product.name}</h3>
                    <div className="flex items-center justify-between w-full">
                      <p className={`text-primary font-semibold ${product.old_price ? "" : "mx-auto"}`}>
                        {product.price} ج.م
                      </p>
                      {product.old_price && (
                        <p className="text-gray-500 line-through text-xs">{product.old_price} ج.م</p>
                      )}
                    </div>
                  </div>
                </Link>

                {/* زر القلب للمفضلة */}
                <button
                  className="absolute top-2 right-2 z-10 p-2 bg-white rounded-full shadow-md transition-all hover:scale-110"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleWishlistToggle(product)
                  }}
                >
                  {wishlist.some((item) => item.id === product.id) ? (
                    <HeartSolid className="w-6 h-6 text-red-600" />
                  ) : (
                    <HeartOutline className="w-6 h-6 text-gray-400 hover:text-red-500 transition" />
                  )}
                </button>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </div>
  )
}

export default BrandSwiper
