"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const banners = {
  men: [
    {
      image: "/images/image_fx_ (38).webp",
      url: "/men-collection",
      title: "مجموعة رجال 2025"
    },
     {
      image: "/images/image_fx_ (37).webp",
      url: "/wallets",
      title: "عروض و خصومات"
    },
    {
      image: "/images/image_fx_ (35).webp",
      url: "/wallets",
      title: "عمل هدايا رائعه"
    },
    {
      image: "/images/image_fx_ (36).webp",
      url: "/wallets",
      title: "عمل بورتريه"
    },
    {
      image: "/images/image_fx_ (33).webp",
      url: "/wallets",
      title: "طباعه علي المجات"
    },
    {
      image: "/images/image_fx_ (34).webp",
      url: "/wallets",
      title: "وضع صور في السلاسل"
    },
    {
      image: "/images/image_fx_ (32).webp",
      url: "/wallets",
      title: "حفر علي المحافظ"
    },
    // ... أضف بقية الصور مع روابطها
  ],
  women: [
    {
      image: "/images/image_fx_ (39).webp",
      url: "/men-collection",
      title: "مجموعة نساء 2025"
    },
     {
      image: "/images/image_fx_ (37).webp",
      url: "/wallets",
      title: "عروض و خصومات"
    },
    {
      image: "/images/image_fx_ (35).webp",
      url: "/wallets",
      title: "عمل هدايا رائعه"
    },
    {
      image: "/images/image_fx_ (36).webp",
      url: "/wallets",
      title: "عمل بورتريه"
    },
    {
      image: "/images/image_fx_ (33).webp",
      url: "/wallets",
      title: "طباعه علي المجات"
    },
    {
      image: "/images/image_fx_ (34).webp",
      url: "/wallets",
      title: "وضع صور في السلاسل"
    },
    {
      image: "/images/image_fx_ (32).webp",
      url: "/wallets",
      title: "حفر علي المحافظ"
    },
    // ... أضف بقية الصور مع روابطها
  ],
  kids: [
    {
      image: "/images/image_fx_ (40).webp",
      url: "/men-collection",
      title: "مجموعة اطفال 2025"
    },
     {
      image: "/images/image_fx_ (37).webp",
      url: "/wallets",
      title: "عروض و خصومات"
    },
    {
      image: "/images/image_fx_ (35).webp",
      url: "/wallets",
      title: "عمل هدايا رائعه"
    },
    {
      image: "/images/image_fx_ (36).webp",
      url: "/wallets",
      title: "عمل بورتريه"
    },
    {
      image: "/images/image_fx_ (33).webp",
      url: "/wallets",
      title: "طباعه علي المجات"
    },
    {
      image: "/images/image_fx_ (34).webp",
      url: "/wallets",
      title: "وضع صور في السلاسل"
    },
    {
      image: "/images/image_fx_ (32).webp",
      url: "/wallets",
      title: "حفر علي المحافظ"
    },
    // ... أضف بقية الصور مع روابطها
  ],
};

const CategoryBanner = ({ category }: { category: string }) => {
  const currentBanners = banners[category as keyof typeof banners] || [{
    image: "/images/default-banner.jpg",
    url: "/",
    title: "المجموعة المميزة"
  }];

  return (
    <div className="w-full relative rounded-lg overflow-hidden shadow-md">
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        pagination={{ 
          clickable: true,
          bulletClass: 'swiper-pagination-bullet !bg-gray-300 !opacity-100',
          bulletActiveClass: '!bg-rose-600'
        }}
        loop={true}
        speed={500}
        className="h-[250px] md:h-[350px]"
      >
        {currentBanners.map((banner, index) => (
          <SwiperSlide key={index}>
            <Link href={banner.url} className="block relative h-full w-full">
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                priority={index === 0}
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 80vw"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 p-4">
                <h3 className="text-white text-lg font-semibold">
                  {banner.title}
                </h3>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default CategoryBanner;