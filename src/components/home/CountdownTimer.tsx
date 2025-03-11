"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface CountdownTimerProps {
  targetDate: Date;
  seasonName: string;
}

// دالة مساعدة لحساب الوقت المتبقي
const calculateTimeLeft = (targetDate: Date) => {
  const now = new Date();
  const difference = targetDate.getTime() - now.getTime();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    expired: false,
  };
};

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate, seasonName }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000); // تحديث كل ثانية لدقة عالية
    return () => clearInterval(timer);
  }, [targetDate]);

  // تأثيرات الحركة للأرقام
  const numberVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section className="py-8 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl shadow-lg">
      <div className="container mx-auto px-4 text-center">
        {/* العنوان */}
        <motion.h3
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-2xl md:text-3xl font-bold text-gray-800 mb-6"
        >
          الوقت المتبقي حتى {seasonName}
        </motion.h3>

        {/* العداد */}
        {timeLeft.expired ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl text-red-600 font-semibold"
          >
            لقد انتهى الموسم! تابعونا للمزيد من العروض قريبًا
          </motion.p>
        ) : (
          <div className="flex justify-center gap-4 md:gap-8">
            {[
              { value: timeLeft.days, label: "أيام" },
              { value: timeLeft.hours, label: "ساعات" },
              { value: timeLeft.minutes, label: "دقائق" },
              { value: timeLeft.seconds, label: "ثواني" },
            ].map((item) => (
              <motion.div
                key={item.label}
                className="flex flex-col items-center bg-white p-4 md:p-6 rounded-xl shadow-md w-20 md:w-24"
                initial="initial"
                animate="animate"
                variants={numberVariants}
              >
                <span className="text-3xl md:text-4xl font-extrabold text-primary">
                  {item.value.toString().padStart(2, "0")}
                </span>
                <span className="text-sm md:text-base text-gray-600 mt-2">{item.label}</span>
              </motion.div>
            ))}
          </div>
        )}

        {/* زر دعوة للتسوق إذا لم ينته الموسم */}
        {!timeLeft.expired && (
            <motion.button
            onClick={() => window.location.href = '/category/women'}
            whileHover={{ scale: 1.05, boxShadow: "0 8px 16px rgba(0,0,0,0.1)" }}
            whileTap={{ scale: 0.95 }}
            className="mt-8 bg-primary text-white px-6 py-3 rounded-full font-semibold text-lg shadow-md hover:bg-primary-dark transition-all"
            >
            تسوق الآن!
            </motion.button>
        )}
      </div>
    </section>
  );
};

export default CountdownTimer;