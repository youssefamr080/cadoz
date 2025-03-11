'use client';
import React, { useMemo, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { giftOptions } from '../../data/products';
import { useGift } from '../../context/GiftContext';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/solid';

const GiftStepBox = () => {
  const { state, dispatch } = useGift();

  // تحسين الأداء باستخدام useMemo لمنع إعادة التصفية في كل عملية رندر
  const boxes = useMemo(() => 
    giftOptions.filter(item => item.category === 'boxes')
    .sort((a, b) => a.price - b.price), // ترتيب حسب السعر
    []
  );

  // استخدام useCallback لمنع إعادة إنشاء الدالة في كل رندر
  const handleSelectBox = useCallback((box) => {
    dispatch({ 
      type: 'SELECT_BOX', 
      payload: state.selectedBox?.id === box.id ? null : box 
    });
  }, [state.selectedBox?.id, dispatch]);

  // تحقق من وجود عناصر
  if (boxes.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md text-center">
        <h3 className="text-xl font-bold text-blue-600 mb-4">
          اختر صندوق الهدية 🎁
        </h3>
        <div className="py-8 text-gray-500">
          لا توجد صناديق متاحة حالياً. يرجى التحقق لاحقاً.
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="bg-white p-5 rounded-xl shadow-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* العنوان مع أنيميشن */}
      <motion.h3 
        className="text-xl md:text-2xl font-bold text-blue-600 mb-6 text-center"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        اختر صندوق الهدية 🎁
      </motion.h3>

      {/* معلومات إضافية */}
      <p className="text-sm text-gray-600 mb-4 text-center">
        اختر صندوقًا مناسبًا لهديتك من مجموعتنا المميزة
      </p>

      {/* عرض الخيارات باستخدام Swiper مع التحسينات */}
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={20}
        slidesPerView="auto"
        pagination={{ clickable: true }}
        navigation
        breakpoints={{
          320: { slidesPerView: 2.2, spaceBetween: 10 },
          640: { slidesPerView: 3.2, spaceBetween: 15 },
          1024: { slidesPerView: 4.5, spaceBetween: 20 },
          1280: { slidesPerView: 5, spaceBetween: 25 },
        }}
        className="mb-6 p-2"
      >
        {boxes.map((box) => {
          const isSelected = state.selectedBox?.id === box.id;
          
          return (
            <SwiperSlide key={box.id}>
              <motion.div
                onClick={() => handleSelectBox(box)}
                className={`relative bg-blue-50 p-4 rounded-lg cursor-pointer transition-all duration-300 border-2 h-full flex flex-col ${
                  isSelected
                    ? 'border-blue-600 shadow-lg'
                    : 'border-transparent hover:border-blue-300'
                }`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {/* مؤشر التحديد المحسن */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div 
                      className="absolute top-2 right-2 z-10"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex">
                        <span className="bg-blue-600 text-white text-xs rounded-l-full px-2 py-1 flex items-center">
                          <CheckIcon className="h-3 w-3 mr-1" />
                          تم الاختيار
                        </span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch({ type: 'SELECT_BOX', payload: null });
                          }}
                          className="bg-white rounded-r-full p-1 shadow-md"
                        >
                          <XMarkIcon className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* صورة الصندوق مع تأثيرات */}
                <div className="relative mb-3 flex-grow flex items-center justify-center">
                  <motion.img
                    src={box.image}
                    alt={box.name}
                    className="w-full h-28 object-contain"
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ scale: 1.05 }}
                  />
                  {isSelected && (
                    <motion.div 
                      className="absolute inset-0 bg-blue-600 mix-blend-overlay rounded-md opacity-20"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.2 }}
                    />
                  )}
                </div>

                {/* تفاصيل الصندوق */}
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm truncate mb-1">
                    {box.name}
                  </h4>
                  <p className="text-blue-600 font-bold text-sm">
                    {box.price.toLocaleString()} ج.م
                  </p>
                </div>

                {/* شارة الاختيار */}
                {isSelected && (
                  <div className="absolute bottom-2 left-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <CheckIcon className="h-3 w-3 mr-1" />
                      مختار
                    </span>
                  </div>
                )}
              </motion.div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* قسم المعلومات أو النصائح */}
      {state.selectedBox && (
        <motion.div 
          className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800 border border-blue-200"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          <p className="flex items-center">
            <span className="ml-2">✓</span>
            {`تم اختيار صندوق "${state.selectedBox.name}" بنجاح. يمكنك الآن متابعة اختيار باقي العناصر.`}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default GiftStepBox;