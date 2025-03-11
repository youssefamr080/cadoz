'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useGift } from '../../context/GiftContext';
import { XMarkIcon, PlusIcon, MinusIcon, GiftIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, A11y } from 'swiper/modules';
import Image from 'next/image';

// Import required Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// Animation variants for clean, reusable animations
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  },
  hover: { 
    scale: 0.98,
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    transition: { duration: 0.2 }
  },
  tap: { scale: 0.95 }
};

const badgeVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: { 
      type: 'spring',
      stiffness: 500,
      damping: 15
    }
  }
};

const GiftContainer = () => {
  const { state, dispatch } = useGift();
  const [isClient, setIsClient] = useState(false);
  const [, setIsEmptyAnimationComplete] = useState(false);

  // Derived values with memoization for performance
  const cart = useMemo(() => state?.cart || [], [state?.cart]);
  const uniqueItemsCount = useMemo(() => cart.length, [cart]);
  const hasItems = useMemo(() => cart.length > 0, [cart]);
  
  // Hydration safety - avoid rendering until client-side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle item removal with memoized callback
  const handleRemoveItem = useCallback((itemId: string, itemName: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: itemId });
    toast.success(`تم حذف ${itemName} بنجاح!`, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  }, [dispatch]);

  // Handle quantity updates with memoized callback and validation
  const handleUpdateQuantity = useCallback((itemId: string, newQuantity: number, itemName: string) => {
    if (newQuantity <= 0) return;
    
    // Limit maximum quantity to prevent abuse
    const safeQuantity = Math.min(newQuantity, 99);
    
    dispatch({ 
      type: 'UPDATE_QUANTITY', 
      payload: { id: itemId, quantity: safeQuantity } 
    });
    
    // Only show toast for significant changes to avoid spam
    if (Math.abs(newQuantity - cart.find(item => item.id === itemId)?.quantity || 0) > 1) {
      toast.info(`تم تحديث كمية ${itemName} إلى ${safeQuantity}`, {
        position: "bottom-right",
        autoClose: 1500,
        hideProgressBar: true,
      });
    }
  }, [dispatch, cart]);

  // Early return during SSR to prevent hydration errors
  if (!isClient) return null;

  return (
    <motion.div
      className="relative bg-white p-4 rounded-2xl shadow-xl border-2 border-rose-100 min-h-[320px]"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      role="region"
      aria-label="صندوق الهدايا"
    >
      {/* Item count badge with animation */}
      <motion.div
        className="absolute -top-3 -right-3 bg-rose-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg z-10"
        variants={badgeVariants}
        initial="initial"
        animate="animate"
        key={uniqueItemsCount}
        aria-label={`عدد العناصر: ${uniqueItemsCount}`}
      >
        <span className="text-sm font-bold">{uniqueItemsCount}</span>
      </motion.div>

      {/* Main content section */}
      <div className="pt-8">
        <h2 className="text-center text-rose-700 font-bold text-xl mb-6">
          صندوق الهدايا
          <span className="block w-16 h-1 bg-rose-300 mx-auto mt-2 rounded-full" />
        </h2>

        <AnimatePresence mode="wait">
          {!hasItems ? (
            <motion.div 
              className="text-center py-8 flex flex-col items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onAnimationComplete={() => setIsEmptyAnimationComplete(true)}
            >
              <p className="text-rose-500/80 text-sm mb-4">لا توجد عناصر في الصندوق</p>
              <motion.div 
                className="p-5 bg-rose-50 rounded-full mb-4"
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 5, 0, -5, 0],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <GiftIcon className="w-14 h-14 text-rose-400" />
              </motion.div>
              <p className="text-gray-500 text-xs max-w-[200px]">
                أضف بعض العناصر لإنشاء هديتك المميزة
              </p>
            </motion.div>
          ) : (
            <Swiper
              modules={[Pagination, Navigation, A11y]}
              spaceBetween={20}
              slidesPerView={'auto'}
              pagination={{ 
                clickable: true,
                dynamicBullets: true,
              }}
              grabCursor={true}
              mousewheel={{ forceToAxis: true }}
              className="!pb-10"
              a11y={{
                prevSlideMessage: 'العنصر السابق',
                nextSlideMessage: 'العنصر التالي',
              }}
            >
              {cart.map((item) => (
                <SwiperSlide 
                  key={item.id} 
                  className="!w-[190px] !h-[230px]"
                >
                  <motion.div
                    className="relative h-full bg-white rounded-xl shadow-md p-3 border border-rose-50 flex flex-col"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <button
                      onClick={() => handleRemoveItem(item.id, item.data.name)}
                      className="absolute top-2 right-2 z-10 p-1.5 bg-rose-100/90 rounded-full backdrop-blur-sm hover:bg-rose-200 transition-colors duration-200"
                      aria-label={`إزالة ${item.data.name}`}
                    >
                      <XMarkIcon className="w-4 h-4 text-rose-600" />
                    </button>

                    <div className="flex-1 mb-3 relative flex items-center justify-center">
                      {item.data?.image && (
                        <div className="relative w-full h-[110px]">
                          <Image
                            src={item.data.image}
                            alt={item.data.name}
                            fill
                            className="object-contain"
                            sizes="180px"
                            loading="lazy"
                            placeholder="blur"
                            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgwIiBoZWlnaHQ9IjExMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmRlNGU4Ii8+PC9zdmc+"
                          />
                        </div>
                      )}
                    </div>

                    <div className="text-center mb-2">
                      <h3 className="text-sm font-semibold text-rose-900 mb-1 truncate">
                        {item.data.name}
                      </h3>
                      <p className="text-xs text-rose-500 font-medium">
                        {item.data.price.toLocaleString()} ج.م
                      </p>
                    </div>

                    <div className="flex items-center justify-center gap-3 mt-auto">
                      <motion.button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1, item.data.name)}
                        disabled={item.quantity <= 1}
                        className={`p-1.5 rounded-full ${
                          item.quantity > 1
                            ? 'bg-rose-100 text-rose-600 hover:bg-rose-200'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        } transition-colors duration-200`}
                        whileTap={{ scale: 0.9 }}
                        aria-label="تقليل الكمية"
                      >
                        <MinusIcon className="w-3.5 h-3.5" />
                      </motion.button>
                      <span className="text-sm font-bold text-rose-600 w-6 text-center">
                        {item.quantity}
                      </span>
                      <motion.button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1, item.data.name)}
                        className="p-1.5 bg-rose-100 text-rose-600 rounded-full hover:bg-rose-200 transition-colors duration-200"
                        whileTap={{ scale: 0.9 }}
                        aria-label="زيادة الكمية"
                      >
                        <PlusIcon className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default React.memo(GiftContainer);