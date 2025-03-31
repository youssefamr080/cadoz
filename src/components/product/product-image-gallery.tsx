"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Swiper, SwiperSlide } from "swiper/react"
import { FreeMode, Navigation, Pagination, Thumbs } from "swiper/modules"
import type { Swiper as SwiperType } from "swiper"
import { ZoomIn, ChevronLeft, ChevronRight } from "lucide-react"
import ProductZoom from "./product-zoom"

interface ProductImageGalleryProps {
  images: string[]
  alt: string
  aspectRatio?: "square" | "portrait" | "landscape"
}

export default function ProductImageGallery({ images, alt, aspectRatio = "square" }: ProductImageGalleryProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null)
  const [selectedImage, setSelectedImage] = useState("")
  const [zoomOpen, setZoomOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Set initial selected image
  useEffect(() => {
    if (images && images.length > 0) {
      setSelectedImage(images[0])
    }
  }, [images])

  // Aspect ratio classes
  const getAspectRatio = () => {
    switch (aspectRatio) {
      case "portrait":
        return "aspect-[3/4]"
      case "landscape":
        return "aspect-[4/3]"
      default:
        return "aspect-square"
    }
  }

  if (!images || images.length === 0) {
    return (
      <div className={`relative w-full ${getAspectRatio()} bg-gray-100 rounded-xl`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-400">لا توجد صور</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Main image slider */}
      <div className="relative">
        <Swiper
          slidesPerView={1}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          navigation={{
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          }}
          modules={[Navigation, Pagination, Thumbs]}
          thumbs={{ swiper: thumbsSwiper }}
          className="rounded-xl overflow-hidden product-main-swiper"
          onSlideChange={(swiper) => {
            if (images && images[swiper.activeIndex]) {
              setSelectedImage(images[swiper.activeIndex])
              setCurrentIndex(swiper.activeIndex)
            }
          }}
        >
          {images.map((img, index) => (
            <SwiperSlide key={index}>
              <div className={`relative w-full ${getAspectRatio()} bg-gray-100 rounded-xl overflow-hidden group`}>
                <Image
                  src={img || "/placeholder.svg"}
                  alt={`${alt} - صورة ${index + 1}`}
                  fill
                  priority={index === 0}
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <button
                  onClick={() => setZoomOpen(true)}
                  className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white"
                  aria-label="تكبير الصورة"
                >
                  <ZoomIn className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            </SwiperSlide>
          ))}

          {/* Custom navigation buttons */}
          <div className="swiper-button-prev !w-10 !h-10 !rounded-full bg-white/80 backdrop-blur-sm shadow-md after:!text-lg after:!text-gray-700 !opacity-0 hover:!opacity-100 transition-opacity">
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </div>
          <div className="swiper-button-next !w-10 !h-10 !rounded-full bg-white/80 backdrop-blur-sm shadow-md after:!text-lg after:!text-gray-700 !opacity-0 hover:!opacity-100 transition-opacity">
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </div>
        </Swiper>

        {/* Image counter */}
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full z-10">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <Swiper
          onSwiper={setThumbsSwiper}
          spaceBetween={8}
          slidesPerView={4.5}
          freeMode={true}
          watchSlidesProgress={true}
          modules={[FreeMode, Navigation, Thumbs]}
          className="thumbs-swiper"
          breakpoints={{
            320: { slidesPerView: 3.5 },
            480: { slidesPerView: 4.5 },
            640: { slidesPerView: 5.5 },
          }}
        >
          {images.map((img, index) => (
            <SwiperSlide key={index}>
              <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-md overflow-hidden cursor-pointer border-2 hover:border-blue-500 transition-all">
                <Image
                  src={img || "/placeholder.svg"}
                  alt={`صورة مصغرة ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {/* Zoom modal */}
      <ProductZoom src={selectedImage} alt={alt} isOpen={zoomOpen} onClose={() => setZoomOpen(false)} />
    </div>
  )
}

