"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Send } from "lucide-react";

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // هنا يمكنك إضافة منطق لإرسال البريد إلى API أو خدمة مثل Mailchimp
    console.log("Subscribed with email:", email);
    setIsSubmitted(true);
    setEmail("");
    setTimeout(() => setIsSubmitted(false), 3000); // إعادة تعيين بعد 3 ثوانٍ
  };

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
    hover: { scale: 1.05, boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)" },
    tap: { scale: 0.95 },
  };

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="py-16 bg-gradient-to-r from-gray-800 to-gray-900 text-white relative overflow-hidden"
    >
      {/* خلفية زخرفية */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" fill="none" viewBox="0 0 100 100">
          <circle cx="20" cy="20" r="10" stroke="white" strokeWidth="2" />
          <path d="M10 90 Q 50 50, 90 10" stroke="white" strokeWidth="2" />
        </svg>
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        {/* الأيقونة */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-6"
        >
          <Mail className="w-12 h-12 mx-auto text-primary" />
        </motion.div>

        {/* العنوان */}
        <motion.h2
          variants={textVariants}
          className="text-3xl md:text-4xl font-extrabold mb-4 drop-shadow-lg"
        >
          اشترك في النشرة الإخبارية
        </motion.h2>

        {/* الوصف */}
        <motion.p
          variants={textVariants}
          className="text-lg md:text-xl mb-8 max-w-2xl mx-auto drop-shadow-md"
        >
          كن أول من يعلم بآخر العروض والمنتجات الحصرية مباشرة في بريدك الإلكتروني!
        </motion.p>

        {/* النموذج */}
        {isSubmitted ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-green-400 text-lg font-semibold"
          >
            تم الاشتراك بنجاح! شكرًا لك 🎉
          </motion.p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="max-w-md mx-auto flex items-center gap-4"
          >
            <motion.input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="أدخل بريدك الإلكتروني"
              required
              className="flex-1 p-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary shadow-md"
              whileFocus={{ scale: 1.02 }}
            />
            <motion.button
              type="submit"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              className="bg-primary text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-md hover:bg-primary-dark transition-all"
            >
              <Send className="w-5 h-5" />
              اشترك
            </motion.button>
          </form>
        )}
      </div>

      {/* تأثير الجزيئات */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ duration: 1 }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full"
            initial={{ x: Math.random() * 100 + "%", y: Math.random() * 100 + "%" }}
            animate={{ y: [0, -30, 0], opacity: [0, 1, 0] }}
            transition={{
              duration: Math.random() * 4 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </motion.div>
    </motion.section>
  );
};

export default Newsletter;