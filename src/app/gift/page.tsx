'use client';

import React from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import GiftContainer from '../../components/gift/GiftContainer';
import GiftStepSwitcher from '../../components/gift/GiftStepSwitcher';
import { GiftProvider } from '../../context/GiftContext';
import { motion } from 'framer-motion';

const GiftPage = () => {
  // إعدادات الحركة للصفحة بأكملها
  const pageVariants = {
    initial: { opacity: 0, y: 50 },
    animate: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: 'easeOut', staggerChildren: 0.2 } 
    },
    exit: { opacity: 0, y: -50, transition: { duration: 0.5 } }
  };

  // إعدادات الحركة للأقسام الفرعية
  const sectionVariants = {
    initial: { opacity: 0, y: 30 },
    animate: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: 'easeOut' } 
    }
  };

  return (
    <GiftProvider>
      <motion.div
        className="min-h-screen flex flex-col bg-gray-50 overflow-hidden"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {/* الهيدر */}
        <Header />

        {/* المحتوى الرئيسي */}
        <main className="flex-grow bg-gradient-to-b from-rose-50 via-white to-pink-50 py-6 md:py-10 lg:py-14">
            <div className="w-full mx-auto px-6 sm:px-8 lg:px-10">
            {/* العنوان */}
            <motion.h1
              className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-rose-800 text-center mb-6 md:mb-10 tracking-tight"
              variants={sectionVariants}
            >
              اصنع هديتك المميزة 🎁
            </motion.h1>

            {/* صندوق الهدايا */}
            <motion.section
              className="mb-6 md:mb-10 lg:mb-12"
              variants={sectionVariants}
            >
              <GiftContainer />
            </motion.section>

            {/* خطوات الاختيار */}
            <motion.section
              className="bg-white rounded-3xl shadow-xl p-4 sm:p-6 md:p-8"
              variants={sectionVariants}
            >
              <GiftStepSwitcher />
            </motion.section>
          </div>
        </main>

        {/* الفوتر */}
        <Footer />
      </motion.div>
    </GiftProvider>
  );
};

export default GiftPage;