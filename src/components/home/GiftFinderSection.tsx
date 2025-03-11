"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Gift } from "lucide-react";

const GiftFinderSection: React.FC = () => {
  // تأثيرات الحركة
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: 0.3, duration: 0.6 },
    },
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0 10px 20px rgba(0, 0, 0, 0.15)",
      transition: { duration: 0.3 },
    },
    tap: { scale: 0.95 },
  };

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="relative py-16 bg-gradient-to-r from-primary to-primary-dark text-white overflow-hidden"
    >
      {/* خلفية زخرفية */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" fill="none" viewBox="0 0 100 100">
          <circle cx="10" cy="10" r="5" fill="white" />
          <circle cx="90" cy="90" r="8" fill="white" />
          <path d="M20 80 Q 50 50, 80 20" stroke="white" strokeWidth="2" />
        </svg>
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        {/* الأيقونة */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="mb-6"
        >
          <Gift className="w-16 h-16 mx-auto text-white" />
        </motion.div>

        {/* العنوان */}
        <motion.h2
          variants={textVariants}
          className="text-3xl md:text-4xl font-extrabold mb-4 drop-shadow-lg"
        >
          ابحث عن الهدية المثالية
        </motion.h2>

        {/* الوصف */}
        <motion.p
          variants={textVariants}
          className="text-lg md:text-xl mb-8 max-w-2xl mx-auto drop-shadow-md"
        >
          أجب عن بضعة أسئلة بسيطة وسنرشدك إلى أفضل الهدايا التي تناسب ذوقك واحتياجاتك!
        </motion.p>

        {/* زر الدعوة للعمل */}
        <Link href="/gift-results">
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            className="bg-white text-primary px-8 py-3 rounded-full font-semibold text-lg shadow-lg hover:bg-gray-100 transition-all"
          >
            ابدأ الآن
          </motion.button>
        </Link>
      </div>

      {/* تأثير الجزيئات المتحركة */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 1 }}
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full"
            initial={{
              x: Math.random() * 100 + "%",
              y: Math.random() * 100 + "%",
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </motion.div>
    </motion.section>
  );
};

export default GiftFinderSection;