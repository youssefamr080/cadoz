"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

type Season = {
  name: string;
  arabicName: string;
  emoji: string;
  color: string;
  endDate: Date;
  banner: string;
};

interface SeasonalBannerProps {
  season: Season;
}

const SeasonalBanner: React.FC<SeasonalBannerProps> = ({ season }) => {
  const [isVisible, setIsVisible] = useState(true);

  // تحديد الوقت المتبقي لنهاية الموسم
  const calculateTimeLeft = React.useCallback(() => {
    const now = new Date();
    const difference = season.endDate.getTime() - now.getTime();
    if (difference <= 0) return "انتهى الموسم!";

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    return `${days} أيام و ${hours} ساعات`;
  }, [season.endDate]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000 * 60 * 60);
    return () => clearInterval(timer);
  }, [season.endDate, calculateTimeLeft]); // أضفنا calculateTimeLeft

  // تأثيرات الحركة
  const bannerVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
    exit: { opacity: 0, y: -50, transition: { duration: 0.5 } },
  };

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.6 } },
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.section
          variants={bannerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={`relative w-full h-[70vh] min-h-[400px] bg-gradient-to-r ${season.color} overflow-hidden`}
        >
          {/* صورة الخلفية مع تحسين الأداء */}
          <Image
            src={season.banner}
            alt={`${season.arabicName} banner`}
            fill
            className="object-cover opacity-60 mix-blend-overlay"
            priority
            quality={85}
          />

          {/* طبقة التعتيم الديناميكية */}
          <div className="absolute inset-0 bg-black/40" />

          {/* المحتوى */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4">
            <motion.div variants={textVariants} className="text-center">
              <h1 className="text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">
                {season.arabicName} {season.emoji}
              </h1>
              <p className="text-lg md:text-2xl mb-6 drop-shadow-md max-w-2xl">
                استمتع بتجربة تسوق فريدة مع عروض {season.arabicName} المميزة! باقي {timeLeft}
              </p>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-gray-900 px-8 py-3 rounded-full font-semibold text-lg shadow-lg hover:bg-gray-100 transition-all"
              >
                تسوق الآن
              </motion.button>
            </motion.div>
          </div>

          {/* زر التمرير لأسفل */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 10, 0] }}
            transition={{ delay: 1, duration: 1.5, repeat: Infinity }}
            className="absolute bottom-6 left-1/2 transform -translate-x-1/2"
          >
            <ChevronDown className="w-8 h-8 text-white" />
          </motion.div>

          {/* زر الإغلاق */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </motion.section>
      )}
    </AnimatePresence>
  );
};

export default SeasonalBanner;