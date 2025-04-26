"use client";

import React from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";
import { Product } from "../../types/database";

interface Props {
  products: Product[];
}

const ProductSwiper: React.FC<Props> = ({ products }) => {
  return (
    <Swiper
      modules={[Navigation, Pagination]}
      spaceBetween={20}
      slidesPerView={2}
      navigation
      pagination={{ clickable: true }}
      breakpoints={{
        640: { slidesPerView: 2 },
        768: { slidesPerView: 3 },
        1024: { slidesPerView: 4 },
      }}
      className="w-full"
    >
      {products.map((product) => (
        <SwiperSlide key={product.id} className="p-2">
          <div className="border rounded-lg p-4 bg-white shadow-lg">
            <Image src={product.image} alt={product.name} className="w-full h-40 object-cover mb-2 rounded" width={160} height={160} />
            <h3 className="text-sm font-semibold">{product.name}</h3>
            <p className="text-gray-500 text-xs">{product.price} ج.م</p>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default ProductSwiper;