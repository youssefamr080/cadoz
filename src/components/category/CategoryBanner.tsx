"use client"
import Image from "next/image"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Pagination, EffectFade } from "swiper/modules"
import "swiper/css"
import "swiper/css/pagination"
import "swiper/css/effect-fade"
import "swiper/css/autoplay"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"

const banners = {
  "رجالي": [
    {
      image: "/images/image_fx_ (38).webp",
      title: "مجموعة رجال 2025",
    },
    {
      image: "/images/image_fx_ (37).webp",
      
      title: "عروض و خصومات",
    },
    {
      image: "/images/image_fx_ (35).webp",
      
      title: "عمل هدايا رائعه",
    },
    {
      image: "/images/image_fx_ (36).webp",
      
      title: "عمل بورتريه",
    },
    {
      image: "/images/image_fx_ (33).webp",
      
      title: "طباعه علي المجات",
    },
    {
      image: "/images/image_fx_ (34).webp",
      
      title: "وضع صور في السلاسل",
    },
    {
      image: "/images/image_fx_ (32).webp",
      
      title: "حفر علي المحافظ",
    },
  ],
  "نسائي": [
    {
      image: "/images/image_fx_ (39).webp",
      title: "مجموعة نساء 2025",
    },
    {
      image: "/images/image_fx_ (37).webp",
      
      title: "عروض و خصومات",
    },
    {
      image: "/images/image_fx_ (35).webp",
      
      title: "عمل هدايا رائعه",
    },
    {
      image: "/images/image_fx_ (36).webp",
      
      title: "عمل بورتريه",
    },
    {
      image: "/images/image_fx_ (33).webp",
      
      title: "طباعه علي المجات",
    },
    {
      image: "/images/image_fx_ (34).webp",
      
      title: "وضع صور في السلاسل",
    },
    {
      image: "/images/image_fx_ (32).webp",
      
      title: "حفر علي المحافظ",
    },
  ],
  "أطفال": [
    {
      image: "/images/image_fx_ (40).webp",
      
      title: "مجموعة اطفال 2025",
    },
    {
      image: "/images/image_fx_ (37).webp",
      
      title: "عروض و خصومات",
    },
    {
      image: "/images/image_fx_ (35).webp",
      
      title: "عمل هدايا رائعه",
    },
    {
      image: "/images/image_fx_ (36).webp",
      
      title: "عمل بورتريه",
    },
    {
      image: "/images/image_fx_ (33).webp",
      
      title: "طباعه علي المجات",
    },
    {
      image: "/images/image_fx_ (34).webp",
      
      title: "وضع صور في السلاسل",
    },
    {
      image: "/images/image_fx_ (32).webp",
      
      title: "حفر علي المحافظ",
    },
  ],
  // الاحتفاظ بالقيم الإنجليزية للتوافق مع النظام القديم
  men: [
    {
      image: "/images/image_fx_ (38).webp",
      title: "مجموعة رجال 2025",
    },
    {
      image: "/images/image_fx_ (37).webp",
      
      title: "عروض و خصومات",
    },
    {
      image: "/images/image_fx_ (35).webp",
      
      title: "عمل هدايا رائعه",
    },
    {
      image: "/images/image_fx_ (36).webp",
      
      title: "عمل بورتريه",
    },
    {
      image: "/images/image_fx_ (33).webp",
      
      title: "طباعه علي المجات",
    },
    {
      image: "/images/image_fx_ (34).webp",
      
      title: "وضع صور في السلاسل",
    },
    {
      image: "/images/image_fx_ (32).webp",
      
      title: "حفر علي المحافظ",
    },
  ],
  women: [
    {
      image: "/images/image_fx_ (39).webp",
      title: "مجموعة نساء 2025",
    },
    {
      image: "/images/image_fx_ (37).webp",
      
      title: "عروض و خصومات",
    },
    {
      image: "/images/image_fx_ (35).webp",
      
      title: "عمل هدايا رائعه",
    },
    {
      image: "/images/image_fx_ (36).webp",
      
      title: "عمل بورتريه",
    },
    {
      image: "/images/image_fx_ (33).webp",
      
      title: "طباعه علي المجات",
    },
    {
      image: "/images/image_fx_ (34).webp",
      
      title: "وضع صور في السلاسل",
    },
    {
      image: "/images/image_fx_ (32).webp",
      
      title: "حفر علي المحافظ",
    },
  ],
  kids: [
    {
      image: "/images/image_fx_ (40).webp",
      
      title: "مجموعة اطفال 2025",
    },
    {
      image: "/images/image_fx_ (37).webp",
      
      title: "عروض و خصومات",
    },
    {
      image: "/images/image_fx_ (35).webp",
      
      title: "عمل هدايا رائعه",
    },
    {
      image: "/images/image_fx_ (36).webp",
      
      title: "عمل بورتريه",
    },
    {
      image: "/images/image_fx_ (33).webp",
      
      title: "طباعه علي المجات",
    },
    {
      image: "/images/image_fx_ (34).webp",
      
      title: "وضع صور في السلاسل",
    },
    {
      image: "/images/image_fx_ (32).webp",
      
      title: "حفر علي المحافظ",
    },
  ],
}

const CategoryBanner = ({ category }: { category: string }) => {
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const currentBanners = banners[category as keyof typeof banners] || [
    {
      image: "/images/image_fx_ (38).webp",
      title: "المجموعة المميزة",
    },
  ]

  if (!isMounted) {
    return (
      <div className="w-full h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px] bg-gradient-to-r from-purple-100 to-indigo-100 animate-pulse" />
    )
  }

  return (
    <div className="w-full relative overflow-hidden h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px] group">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        pagination={{
          clickable: true,
          bulletClass: "swiper-pagination-bullet !bg-white/50 !opacity-100",
          bulletActiveClass: "!bg-white",
        }}
        effect="fade"
        loop={currentBanners.length > 1}
        speed={800}
        className="h-full relative"
      >
        {currentBanners.map((banner, index) => (
          <SwiperSlide key={index} className="relative h-full">
            <div className="relative w-full h-full">
              <Image
                src={banner.image || "/placeholder.svg"}
                alt={banner.title}
                fill
                priority={index === 0}
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 text-white">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 text-shadow-lg">
                      {banner.title}
                    </h3>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="flex items-center gap-2"
                  >
                    <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-xs sm:text-sm md:text-base hover:bg-white/30 transition-colors duration-300 cursor-pointer">
                      اكتشف المزيد
                      <ArrowLeft className="w-4 h-4 mr-2" />
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom pagination styling */}
      <style jsx global>{`
        .swiper-pagination {
          bottom: 15px !important;
        }
        
        .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          margin: 0 4px;
          opacity: 0.7;
          transition: all 0.3s ease;
        }
        
        .swiper-pagination-bullet-active {
          opacity: 1;
          transform: scale(1.2);
          background: white !important;
        }

        .text-shadow-lg {
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  )
}

export default CategoryBanner
