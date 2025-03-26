"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Send, CheckCircle, Bell, Gift, Tag } from 'lucide-react';

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // محاكاة عملية الإرسال
    setIsLoading(true);
    
    setTimeout(() => {
      // هنا يمكنك إضافة منطق لإرسال البريد إلى API أو خدمة مثل Mailchimp
      console.log("Subscribed with email:", email);
      setIsSubmitted(true);
      setEmail("");
      setIsLoading(false);
      
      // إعادة تعيين بعد فترة
      setTimeout(() => setIsSubmitted(false), 5000);
    }, 1500);
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
      viewport={{ once: true, margin: "-100px" }}
      className="py-20 bg-gradient-to-r from-gray-900 to-gray-800 text-white relative overflow-hidden"
    >
      {/* خلفية زخرفية */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <svg className="w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <radialGradient id="radialGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="white" stopOpacity="0.3" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="0" cy="0" r="20" fill="url(#radialGradient)" />
            <circle cx="100" cy="100" r="20" fill="url(#radialGradient)" />
            <circle cx="50" cy="50" r="30" fill="url(#radialGradient)" />
            <circle cx="80" cy="20" r="15" fill="url(#radialGradient)" />
            <circle cx="20" cy="80" r="15" fill="url(#radialGradient)" />
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        {/* الأيقونة */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-6"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto transform rotate-12">
            <Mail className="w-10 h-10 text-white" />
          </div>
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
        <div className="max-w-md mx-auto">
          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-500/20 text-emerald-300 p-6 rounded-2xl flex items-center justify-center gap-3"
            >
              <CheckCircle className="w-6 h-6" />
              <span className="text-lg font-medium">تم الاشتراك بنجاح! شكرًا لك</span>
            </motion.div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-4 flex-col sm:flex-row"
            >
              <motion.input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="أدخل بريدك الإلكتروني"
                required
                className="flex-1 p-4 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-300 shadow-md w-full"
                whileFocus={{ scale: 1.02 }}
              />
              <motion.button
                type="submit"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                disabled={isLoading}
                className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white px-6 py-4 rounded-xl font-semibold flex items-center gap-2 shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send className="w-5 h-5" />
                )}
                اشترك الآن
              </motion.button>
            </form>
          )}
        </div>

        {/* المزايا */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl hover:bg-white/15 transition-colors">
            <div className="w-12 h-12 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Tag className="w-6 h-6 text-teal-300" />
            </div>
            <h3 className="font-bold text-xl mb-2">عروض حصرية</h3>
            <p className="text-gray-300 text-sm">احصل على عروض خاصة بالمشتركين فقط وخصومات إضافية</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl hover:bg-white/15 transition-colors">
            <div className="w-12 h-12 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-6 h-6 text-teal-300" />
            </div>
            <h3 className="font-bold text-xl mb-2">إشعارات المنتجات الجديدة</h3>
            <p className="text-gray-300 text-sm">كن أول من يعلم بوصول منتجات جديدة ومجموعات حصرية</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl hover:bg-white/15 transition-colors">
            <div className="w-12 h-12 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="w-6 h-6 text-teal-300" />
            </div>
            <h3 className="font-bold text-xl mb-2">نصائح واقتراحات</h3>
            <p className="text-gray-300 text-sm">احصل على أفكار مميزة لاختيار الهدايا المناسبة لكل مناسبة</p>
          </div>
        </div>
      </div>

      {/* تأثير الجزيئات */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ duration: 1 }}
      >
        {Array.from({ length: 12 }).map((_, i) => (
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
