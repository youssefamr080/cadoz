"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import SeasonalBanner from "../components/home/SeasonalBanner";

import ProductCollection from "../components/home/ProductCollection";
import CountdownTimer from "../components/home/CountdownTimer";
import GiftFinderSection from "../components/home/GiftFinderSection";
import WhatsappHelper from "../components/home/WhatsappHelper";

import Newsletter from "../components/home/Newsletter";
import { products, Product } from "../data/products";

// استرجاع المنتجات المشاهدة من Local Storage
const getViewedProducts = (): number[] => {
  if (typeof window !== 'undefined') {
    const viewed = localStorage.getItem('viewedProducts');
    return viewed ? JSON.parse(viewed) : [];
  }
  return [];
};

// حفظ المنتج المشاهد في Local Storage

// تحديد الموسم الحالي
const getCurrentSeason = () => {
  const now = new Date();
  const month = now.getMonth() + 1; // getMonth() يبدأ من 0
  const day = now.getDate();

  // رمضان 2025 (من 1 مارس إلى 30 مارس)
  if ((month === 3 && day >= 1) || (month === 3 && day <= 30)) {
    return {
      name: "Ramadan",
      arabicName: "رمضان",
      emoji: "🌙",
      color: "from-indigo-600 to-purple-900",
      endDate: new Date(2025, 2, 30), // 30 مارس 2025
      banner: "/images/image_fx_ (35).webp"
    };
  }

  // عيد الفطر 2025 (من 31 مارس إلى 2 أبريل)
  if ((month === 3 && day === 31) || (month === 4 && day <= 2)) {
    return {
      name: "Eid Al-Fitr",
      arabicName: "عيد الفطر",
      emoji: "🎉",
      color: "from-amber-500 to-yellow-600",
      endDate: new Date(2025, 3, 2), // 2 أبريل 2025
      banner: "/images/image_fx_ (35).webp"
    };
  }

  // الفالنتاين (14 فبراير)
  if (month === 2 && day <= 14) {
    return {
      name: "Valentine's Day",
      arabicName: "عيد الحب",
      emoji: "❤️",
      color: "from-pink-500 to-rose-600",
      endDate: new Date(2025, 1, 14), // 14 فبراير 2025
      banner: "/images/image_fx_ (35).webp"
    };
  }

  // عيد الأم في العالم العربي (21 مارس)
  if (month === 3 && day === 21) {
    return {
      name: "Mother's Day",
      arabicName: "عيد الأم",
      emoji: "💐",
      color: "from-pink-400 to-purple-500",
      endDate: new Date(2025, 2, 21), // 21 مارس 2025
      banner: "/images/image_fx_ (35).webp"
    };
  }

  // موسم الكريسماس (من 1 ديسمبر إلى 25 ديسمبر)
  if (month === 12 && day <= 25) {
    return {
      name: "Christmas",
      arabicName: "الكريسماس",
      emoji: "🎄",
      color: "from-red-600 to-green-700",
      endDate: new Date(2024, 11, 25), // 25 ديسمبر 2024
      banner: "/images/image_fx_ (35).webp"
    };
  }

  // موسم الصيف (من 1 يونيو إلى 31 أغسطس)
  if (month >= 6 && month <= 8) {
    return {
      name: "Summer Collection",
      arabicName: "تشكيلة الصيف",
      emoji: "☀️",
      color: "from-yellow-500 to-orange-600",
      endDate: new Date(2025, 7, 31), // 31 أغسطس 2025
      banner: "/images/image_fx_ (35).webp"
    };
  }

  // موسم افتراضي في حال لم ينطبق أي موسم
  return {
    name: "Special Gifts",
    arabicName: "هدايا مميزة",
    emoji: "🎁",
    color: "from-blue-600 to-indigo-700",
    endDate: new Date(2025, 11, 31), // 31 ديسمبر 2025
    banner: "/images/image_fx_ (35).webp"
  };
};


// تحديد الموسم القادم
const getNextSeason = () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  
  // نحدد الموسم القادم بناءً على التاريخ الحالي
  if (month === 1 || (month === 2 && day < 14)) {
    return {
      name: "Valentine's Day",
      arabicName: "عيد الحب",
      date: new Date(2025, 1, 14) // 14 فبراير 2025
    };
  } else if ((month === 2 && day >= 14) || (month === 3 && day < 15)) {
    return {
      name: "Mother's Day",
      arabicName: "عيد الأم",
      date: new Date(2025, 2, 21) // 21 مارس 2025
    };
  } else if ((month === 3 && day >= 15) || (month === 4 && day < 20)) {
    return {
      name: "Ramadan",
      arabicName: "رمضان",
      date: new Date(2025, 2, 20) // تاريخ تقريبي لبداية رمضان 2025
    };
  } else if (month <= 11) {
    return {
      name: "New Year",
      arabicName: "رأس السنة",
      date: new Date(2025, 11, 31)
    };
  } else {
    return {
      name: "Valentine's Day",
      arabicName: "عيد الحب",
      date: new Date(2026, 1, 14)
    };
  }
};

const HomePage = () => {
  const [, setViewedProducts] = useState<Product[]>([]);
  const [, setRecommendedProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  const [currentSeason] = useState(getCurrentSeason());
  const [nextSeason] = useState(getNextSeason());
  const [isLoading, setIsLoading] = useState(true);

  // المناسبات الشائعة للهدايا

  useEffect(() => {
    // محاكاة تحميل البيانات
    setTimeout(() => {
      const viewedProductIds = getViewedProducts();
      const viewed = products.filter((product) => viewedProductIds.includes(product.id));
      setViewedProducts(viewed);

      // المنتجات الأكثر مبيعًا
      const bestSellers = products
        .filter(product => product.best_seller === true)
        .slice(0, 8);
      setTrendingProducts(bestSellers);

      // المنتجات الجديدة
      const newProducts = products
        .filter(product => product.new_arrival === true)
        .slice(0, 8);
      setNewArrivals(newProducts);

      // المنتجات المخفضة
      const onSale = products
        .filter(product => product.sale === true && product.old_price)
        .sort((a, b) => ((b.old_price || 0) - b.price) - ((a.old_price || 0) - a.price))
        .slice(0, 8);
      setSaleProducts(onSale);

      // المنتجات المقترحة (منتجات عشوائية من نفس فئات المنتجات التي شاهدها المستخدم)
      if (viewed.length > 0) {
        const viewedCategories = new Set(viewed.map(p => p.category));
        const recommended = products
          .filter(p => 
            viewedCategories.has(p.category) && 
            !viewedProductIds.includes(p.id) &&
            (p.rating || 0) >= 4.0
          )
          .sort(() => 0.5 - Math.random())
          .slice(0, 8);
        
        setRecommendedProducts(recommended);
      } else {
        // إذا لم يشاهد المستخدم أي منتجات بعد، نعرض منتجات عشوائية بتقييم عالٍ
        setRecommendedProducts(
          products
            .filter(p => (p.rating || 0) >= 4.0)
            .sort(() => 0.5 - Math.random())
            .slice(0, 8)
        );
      }

      setIsLoading(false);
    }, 800);
  }, []);

  // التأثير الحركي للعناصر عند ظهورها
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل المتجر...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="pb-12">
        {/* بانر الموسم الحالي */}
        <SeasonalBanner season={currentSeason} />

        {/* مساعدة الواتساب (ثابتة في أسفل اليمين) */}
        <WhatsappHelper phoneNumber="+201026972523" />
        
        {/* عداد تنازلي للموسم القادم */}
        <div className="container mx-auto px-4 my-8">
          <CountdownTimer 
            targetDate={nextSeason.date}
            seasonName={nextSeason.arabicName}
          />
        </div>
        


        {/* مساعد اختيار الهدايا */}
        <GiftFinderSection />

        {/* المنتجات الرائجة */}
        {trendingProducts.length > 0 && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="container mx-auto px-4 py-12"
          >
            <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">
              <span className="text-primary">📈</span> الأكثر مبيعاً
            </h2>
            <p className="text-center text-gray-600 mb-8">اكتشف الهدايا المفضلة لدى متسوقينا</p>
            <ProductCollection products={trendingProducts} />
          </motion.div>
        )}

        {/* عروض خاصة */}
        {saleProducts.length > 0 && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="bg-gray-50 py-12"
          >
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">
                <span className="text-red-500">🔥</span> عروض خاصة
              </h2>
              <p className="text-center text-gray-600 mb-8">خصومات حصرية لفترة محدودة</p>
              <ProductCollection products={saleProducts} />
            </div>
          </motion.div>
        )}



        {/* وصل حديثاً */}
        {newArrivals.length > 0 && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="container mx-auto px-4 py-12"
          >
            <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">
              <span className="text-green-500">✨</span> وصل حديثاً
            </h2>
            <p className="text-center text-gray-600 mb-8">اكتشف أحدث الهدايا في متجرنا</p>
            <ProductCollection products={newArrivals} />
          </motion.div>
        )}





        {/* النشرة البريدية */}
        <Newsletter />
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;