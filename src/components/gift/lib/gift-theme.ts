// ملف موحد للألوان والمتغيرات المشتركة لضمان اتساق التصميم

export const giftTheme = {
  // الألوان الرئيسية
  colors: {
    primary: {
      light: "bg-indigo-50",
      medium: "bg-indigo-100",
      default: "bg-indigo-500",
      dark: "bg-indigo-600",
      text: "text-indigo-600",
      border: "border-indigo-500",
      hover: "hover:bg-indigo-600",
    },
    secondary: {
      light: "bg-purple-50",
      medium: "bg-purple-100",
      default: "bg-purple-500",
      dark: "bg-purple-600",
      text: "text-purple-600",
      border: "border-purple-500",
      hover: "hover:bg-purple-600",
    },
    accent: {
      light: "bg-pink-50",
      medium: "bg-pink-100",
      default: "bg-pink-500",
      dark: "bg-pink-600",
      text: "text-pink-600",
      border: "border-pink-500",
      hover: "hover:bg-pink-600",
    },
    neutral: {
      light: "bg-gray-50",
      medium: "bg-gray-100",
      default: "bg-gray-500",
      dark: "bg-gray-600",
      text: "text-gray-600",
      border: "border-gray-200",
    },
  },

  // التدرجات اللونية
  gradients: {
    primary: "bg-gradient-to-r from-indigo-500 to-purple-500",
    secondary: "bg-gradient-to-r from-purple-500 to-pink-500",
    light: "bg-gradient-to-r from-indigo-50 to-purple-50",
  },

  // الظلال
  shadows: {
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
  },

  // الحواف المستديرة
  rounded: {
    sm: "rounded-md",
    md: "rounded-lg",
    lg: "rounded-xl",
    full: "rounded-full",
  },

  // التحولات
  transitions: {
    default: "transition-all duration-300",
    fast: "transition-all duration-200",
    slow: "transition-all duration-500",
  },

  // أنماط الأزرار
  buttons: {
    primary:
      "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 shadow-md",
    secondary: "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm",
    accent: "bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 shadow-md",
  },

  // أنماط البطاقات
  cards: {
    default: "bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg",
    selected: "ring-2 ring-indigo-500 ring-offset-2",
  },
}

// أنماط موحدة للـ Swiper
export const swiperStyles = `
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
.swiper-slide-shadow-left,
.swiper-slide-shadow-right {
  border-radius: 12px;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
`

