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
