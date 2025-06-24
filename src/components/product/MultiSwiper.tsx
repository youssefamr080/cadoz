"use client";

import React from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import Link from "next/link";
import { Product } from "../../../prisma/generated/client";

interface Props {
  title: string;
  products: Product[];
}

const MultiSwiper: React.FC<Props> = ({ title, products }) => {
  if (products.length === 0) return null;

  const productChunks = [];
  for (let i = 0; i < Math.min(products.length, 20); i += 10) {
    productChunks.push(products.slice(i, i + 10));
  }

  return (
    <div className="my-6">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      {productChunks.map((chunk, index) => (
        <Swiper
          key={index}
          slidesPerView={2.5} // عرض أكثر من منتج في نفس الوقت
          spaceBetween={15}
          grabCursor={true}
          breakpoints={{
            640: { slidesPerView: 3.5 },
            768: { slidesPerView: 4.5 },
            1024: { slidesPerView: 5.5 },
          }}
        >
          {chunk.map((product) => (
            <SwiperSlide key={product.id} className="w-48">
              <Link href={`/product/${product.id}`}>
                <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition">
                  <Image src={product.image} alt={product.name} width={300} height={200} className="w-full h-32 object-cover rounded-lg" />
                  <h3 className="text-sm font-semibold mt-2">{product.name}</h3>
                  <div className="text-gray-600 text-sm">
                    {product.sale ? (
                      <>
                        <span className="line-through text-red-500 mr-2">{product.old_price} EGP</span>
                        <span className="font-bold">{product.price} ج.م</span>
                      </>
                    ) : (
                      <span className="font-bold">{product.price} [ج.م]</span>
                    )}
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      ))}
    </div>
  );
};

export default MultiSwiper;