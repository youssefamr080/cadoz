'use client';

import React, { useCallback, useMemo } from 'react';
import Image from 'next/image'; // Import Image from next/image
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { giftOptions } from '../../data/products';
import { useGift } from '../../context/GiftContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { ShoppingBag } from 'lucide-react';

const GiftStepCandies: React.FC = () => {
  const { dispatch, state } = useGift();

  // Move filtering and sorting to useMemo to prevent recalculation on re-renders
  const candies = useMemo(() => 
    giftOptions
      .filter(item => item.category === 'candies')
      .sort((a, b) => a.tags[0].localeCompare(b.tags[0])),
    []
  );

  // Group candies by brand or type for better organization
  const candyGroups = useMemo(() => {
    const groups = candies.reduce((acc, candy) => {
      const group = candy.tags[0];
      acc[group] = acc[group] || [];
      acc[group].push(candy);
      return acc;
    }, {});
    return Object.entries(groups);
  }, [candies]);

  // Create memoized handler for better performance
  const addToCart = useCallback((candy) => {
    const isAlreadyInCart = state.cart.some(item => item.id === candy.id);
    
    dispatch({ type: 'ADD_TO_CART', payload: candy });
    
    toast.success(
      isAlreadyInCart 
        ? `تمت زيادة كمية ${candy.name} في هديتك!` 
        : `${candy.name} أضيفت إلى هديتك!`,
      {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "light",
        icon: () => <span role="img" aria-label="candy">🍬</span>
      }
    );
  }, [dispatch, state.cart]);

  // Enhanced animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05,
        delayChildren: 0.2,
        duration: 0.5 
      }
    }
  };

  if (candies.length === 0) {
    return (
      <motion.div
        className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center min-h-[300px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-emerald-500 mb-4 text-5xl">🍬</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد حلويات متاحة حالياً</h3>
        <p className="text-gray-500 text-center">سيتم إضافة منتجات جديدة قريباً</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-white p-4 md:p-6 rounded-2xl shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      variants={containerVariants}
    >
      <h3 className="text-xl md:text-2xl font-bold text-emerald-600 mb-4 md:mb-6 text-center">
        اختر الحلويات اللذيذة 🍬
      </h3>

      <AnimatePresence>
        {candyGroups.map(([groupName, groupItems]) => (
          <div key={groupName} className="mb-8">
            <h4 className="text-md font-semibold text-gray-700 mb-3 pr-2 border-r-4 border-emerald-400">
              {groupName}
            </h4>
            
            <Swiper
              modules={[Pagination, Navigation, A11y]}
              spaceBetween={15}
              slidesPerView="auto"
              pagination={{ 
                clickable: true,
                dynamicBullets: true,
                dynamicMainBullets: 3
              }}
              navigation
              a11y={{
                prevSlideMessage: 'الشريحة السابقة',
                nextSlideMessage: 'الشريحة التالية'
              }}
              breakpoints={{
                320: { slidesPerView: 2.2 },
                640: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
                1280: { slidesPerView: 5 },
              }}
              className="candy-swiper mb-6"
            >
              {Array.isArray(groupItems) && groupItems.map((candy, index) => {
                const isInCart = state.cart.some(item => item.id === candy.id);
                
                return (
                  <SwiperSlide key={candy.id}>
                    <motion.div
                      className={`bg-emerald-50 p-3 md:p-4 rounded-lg hover:shadow-md transition-all duration-300 border-2 ${
                        isInCart ? 'border-emerald-400' : 'border-transparent'
                      }`}
                      whileHover={{ 
                        scale: 1.03, 
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" 
                      }}
                      whileTap={{ scale: 0.97 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ 
                        opacity: 1, 
                        y: 0,
                        transition: { delay: index * 0.05 } 
                      }}
                    >
                      <div className="relative">
                      <Image
                          src={candy.image}
                          alt={candy.name}
                          width={200}  // Set appropriate width
                          height={128} // Set appropriate height matching design
                          className="w-full h-24 md:h-32 object-contain mb-3"
                          loading="lazy"
                        />
                        {candy.isNew && (
                          <span className="absolute top-0 right-0 bg-emerald-500 text-white text-xs px-2 py-1 rounded-bl-lg rounded-tr-lg">
                            جديد
                          </span>
                        )}
                      </div>
                      
                      <h4 className="font-semibold text-gray-800 text-sm md:text-md truncate">
                        {candy.name}
                      </h4>
                      
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-emerald-600 font-medium text-xs md:text-sm">
                          {candy.price.toLocaleString()} ج.م
                        </p>
                        {candy.originalPrice && (
                          <p className="text-gray-400 text-xs line-through">
                            {candy.originalPrice.toLocaleString()} ج.م
                          </p>
                        )}
                      </div>
                      
                      <button
                        onClick={() => addToCart(candy)}
                        className="mt-2 w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors duration-300 text-xs md:text-sm flex items-center justify-center"
                        aria-label={`إضافة ${candy.name} إلى الهدية`}
                      >
                        <ShoppingBag className="w-4 h-4 ml-1" />
                        {isInCart ? 'إضافة المزيد' : 'إضافة إلى الهدية'}
                      </button>
                    </motion.div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        ))}
      </AnimatePresence>

      <style jsx global>{`
        .candy-swiper .swiper-pagination {
          position: relative;
          bottom: 0;
          margin-top: 15px;
        }
        .candy-swiper .swiper-pagination-bullet {
          background: #10b981;
          opacity: 0.5;
        }
        .candy-swiper .swiper-pagination-bullet-active {
          background: #10b981;
          opacity: 1;
        }
        .candy-swiper .swiper-button-next,
        .candy-swiper .swiper-button-prev {
          color: #10b981;
          transform: scale(0.7);
        }
        @media (max-width: 640px) {
          .candy-swiper .swiper-button-next,
          .candy-swiper .swiper-button-prev {
            display: none;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default GiftStepCandies;