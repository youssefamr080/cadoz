"use client"
import Image from "next/image"
import Link from "next/link"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Pagination, EffectFade } from "swiper/modules"
import "swiper/css"
import "swiper/css/pagination"
import "swiper/css/effect-fade"

const banners = {
  men: [
    {
      image: "/images/image_fx_ (38).webp",
      url: "/men-collection",
      title: "مجموعة رجال 2025",
    },
    {
      image: "/images/image_fx_ (37).webp",
      url: "/wallets",
      title: "عروض و خصومات",
    },
    {
      image: "/images/image_fx_ (35).webp",
      url: "/wallets",
      title: "عمل هدايا رائعه",
    },
    {
      image: "/images/image_fx_ (36).webp",
      url: "/wallets",
      title: "عمل بورتريه",
    },
    {
      image: "/images/image_fx_ (33).webp",
      url: "/wallets",
      title: "طباعه علي المجات",
    },
    {
      image: "/images/image_fx_ (34).webp",
      url: "/wallets",
      title: "وضع صور في السلاسل",
    },
    {
      image: "/images/image_fx_ (32).webp",
      url: "/wallets",
      title: "حفر علي المحافظ",
    },
  ],
  women: [
    {
      image: "/images/image_fx_ (39).webp",
      url: "/men-collection",
      title: "مجموعة نساء 2025",
    },
    {
      image: "/images/image_fx_ (37).webp",
      url: "/wallets",
      title: "عروض و خصومات",
    },
    {
      image: "/images/image_fx_ (35).webp",
      url: "/wallets",
      title: "عمل هدايا رائعه",
    },
    {
      image: "/images/image_fx_ (36).webp",
      url: "/wallets",
      title: "عمل بورتريه",
    },
    {
      image: "/images/image_fx_ (33).webp",
      url: "/wallets",
      title: "طباعه علي المجات",
    },
    {
      image: "/images/image_fx_ (34).webp",
      url: "/wallets",
      title: "وضع صور في السلاسل",
    },
    {
      image: "/images/image_fx_ (32).webp",
      url: "/wallets",
      title: "حفر علي المحافظ",
    },
  ],
  kids: [
    {
      image: "/images/image_fx_ (40).webp",
      url: "/men-collection",
      title: "مجموعة اطفال 2025",
    },
    {
      image: "/images/image_fx_ (37).webp",
      url: "/wallets",
      title: "عروض و خصومات",
    },
    {
      image: "/images/image_fx_ (35).webp",
      url: "/wallets",
      title: "عمل هدايا رائعه",
    },
    {
      image: "/images/image_fx_ (36).webp",
      url: "/wallets",
      title: "عمل بورتريه",
    },
    {
      image: "/images/image_fx_ (33).webp",
      url: "/wallets",
      title: "طباعه علي المجات",
    },
    {
      image: "/images/image_fx_ (34).webp",
      url: "/wallets",
      title: "وضع صور في السلاسل",
    },
    {
      image: "/images/image_fx_ (32).webp",
      url: "/wallets",
      title: "حفر علي المحافظ",
    },
  ],
}

const CategoryBanner = ({ category }: { category: string }) => {
  const currentBanners = banners[category as keyof typeof banners] || [
    {
      image: "/images/default-banner.jpg",
      url: "/",
      title: "المجموعة المميزة",
    },
  ]

  return (
    <div className="w-full relative overflow-hidden">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        pagination={{
          clickable: true,
          bulletClass: "swiper-pagination-bullet !bg-white/50 !opacity-100",
          bulletActiveClass: "!bg-white",
        }}
        effect="fade"
        loop={true}
        speed={800}
        className="h-[300px] md:h-[450px] lg:h-[550px]"
      >
        {currentBanners.map((banner, index) => (
          <SwiperSlide key={index}>
            <Link href={banner.url} className="block relative h-full w-full">
              <Image
                src={banner.image || "/placeholder.svg"}
                alt={banner.title}
                fill
                priority={index === 0}
                className="object-cover"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
                  <h3 className="text-2xl md:text-4xl font-bold mb-3">{banner.title}</h3>
                  <div className="inline-block bg-white/20 backdrop-blur-sm px-5 py-2.5 rounded-full text-sm md:text-base">
                    اكتشف المزيد
                  </div>
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom pagination styling */}
      <style jsx global>{`
        .swiper-pagination {
          bottom: 25px !important;
        }
        
        .swiper-pagination-bullet {
          width: 12px;
          height: 12px;
          margin: 0 6px;
          opacity: 0.7;
        }
        
        .swiper-pagination-bullet-active {
          opacity: 1;
          transform: scale(1.2);
        }
      `}</style>
    </div>
  )
}

export default CategoryBanner

