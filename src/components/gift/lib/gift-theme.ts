// ملف موحد للألوان والمتغيرات المشتركة لضمان اتساق التصميم

export const giftTheme = {
  colors: {
    primary: "#8B5CF6",
    secondary: "#6366F1",
    accent: "#EC4899",
    background: "#F9FAFB",
    text: {
      primary: "#1F2937",
      secondary: "#4B5563",
      light: "#9CA3AF",
    },
  },
  gradients: {
    primary: "bg-gradient-to-r from-purple-500 to-indigo-500",
    secondary: "bg-gradient-to-r from-indigo-500 to-pink-500",
    accent: "bg-gradient-to-r from-pink-500 to-rose-500",
    light: "bg-gradient-to-b from-white to-gray-50",
  },
  shadows: {
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
  },
  borderRadius: {
    sm: "0.25rem",
    md: "0.5rem",
    lg: "1rem",
    xl: "1.5rem",
  },
  transitions: {
    fast: "duration-200",
    normal: "duration-300",
    slow: "duration-500",
  },
} as const

// أنماط موحدة للـ Swiper
export const swiperStyles = `
/* أنماط لجميع Swiper Components */
.swiper-button-next:after,
.swiper-button-prev:after {
  display: none !important; /* إخفاء الأيقونات الافتراضية */
}

.swiper-pagination {
  position: relative !important;
  bottom: 0 !important;
  margin-top: 12px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.swiper-pagination-bullet {
  width: 6px !important;
  height: 6px !important;
  background: #e0e7ff !important;
  opacity: 1 !important;
  border: 1px solid #6366f1 !important;
  margin: 0 3px !important;
  transition: all 0.3s ease !important;
}

.swiper-pagination-bullet-active {
  background: #6366f1 !important;
  transform: scale(1.5) !important;
  width: 8px !important;
  height: 8px !important;
}

.swiper-button-disabled {
  opacity: 0.35 !important;
  cursor: not-allowed !important;
}

.swiper-slide-shadow-left,
.swiper-slide-shadow-right {
  border-radius: 12px !important;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* أنماط خاصة بـ Gift Swiper */
.gift-swiper .swiper-pagination {
  position: relative;
  bottom: 0;
  margin-top: 12px;
}

.gift-swiper .swiper-pagination-bullet {
  width: 6px;
  height: 6px;
  background: #e0e7ff;
  opacity: 1;
  border: 1px solid #6366f1;
}

.gift-swiper .swiper-pagination-bullet-active {
  background: #6366f1;
  transform: scale(1.2);
}

.gift-swiper .swiper-button-next,
.gift-swiper .swiper-button-prev {
  color: #6366f1;
  background-color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.gift-swiper .swiper-button-next:after,
.gift-swiper .swiper-button-prev:after {
  font-size: 12px;
  font-weight: bold;
}

.gift-swiper .swiper-button-disabled {
  opacity: 0.35;
}

@media (max-width: 640px) {
  .gift-swiper .swiper-button-next,
  .gift-swiper .swiper-button-prev {
    display: none;
  }
}

/* أنماط خاصة بـ Inspiration Swiper */
.gift-inspiration-swiper .swiper-wrapper,
.category-inspiration-swiper .swiper-wrapper {
  padding-top: 5px; /* إضافة مساحة للظلال العلوية */
  padding-bottom: 15px; /* إضافة مساحة للظلال السفلية */
  margin-bottom: 10px; /* إضافة مساحة قبل pagination */
}

.gift-inspiration-swiper .swiper-slide,
.category-inspiration-swiper .swiper-slide {
  height: auto !important; /* ضمان أن كل سلايد يأخذ الارتفاع المناسب له */
  transition: transform 0.3s ease;
}

.gift-inspiration-swiper .swiper-button-next,
.gift-inspiration-swiper .swiper-button-prev,
.category-inspiration-swiper .swiper-button-next,
.category-inspiration-swiper .swiper-button-prev {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

/* Hide default pagination styles for a cleaner look */
.gift-inspiration-swiper .swiper-pagination-bullets,
.category-inspiration-swiper .swiper-pagination-bullets {
  justify-content: center !important;
  gap: 6px !important;
}

@media (max-width: 640px) {
  .gift-inspiration-swiper .swiper-button-next,
  .gift-inspiration-swiper .swiper-button-prev,
  .category-inspiration-swiper .swiper-button-next,
  .category-inspiration-swiper .swiper-button-prev {
    width: 30px !important;
    height: 30px !important;
  }
}

/* Cart items swiper styles */
.cart-items-swiper {
  padding: 4px 2px 20px 2px;
  margin: -4px -2px;
}

.cart-items-swiper .swiper-slide {
  height: auto;
  transition: transform 0.3s ease;
}

.cart-items-swiper .swiper-slide:hover {
  transform: translateY(-2px);
}

@media (max-width: 640px) {
  .cart-items-swiper {
    padding-left: 0;
    padding-right: 0;
  }
  
  .cart-items-swiper .swiper-slide {
    width: 160px !important;
  }
}
`
