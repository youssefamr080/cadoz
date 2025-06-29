/**
 * مساعدات Swiper لتجنب التحذيرات وتحسين الأداء
 */

export interface SwiperConfig {
  slidesPerView: number | 'auto';
  spaceBetween?: number;
  centeredSlides?: boolean;
  freeMode?: boolean;
  loop?: boolean; // إضافة loop للواجهة
  autoplay?: {
    delay: number;
    disableOnInteraction: boolean;
    pauseOnMouseEnter?: boolean;
  } | false;
  navigation?: boolean;
  pagination?: {
    clickable: boolean;
  };
  breakpoints?: Record<number, Partial<SwiperConfig>>;
}

/**
 * تحدد ما إذا كان يجب تفعيل loop mode أم لا
 * @param itemsCount عدد العناصر
 * @param slidesPerView عدد الشرائح المرئية
 * @returns true إذا كان يجب تفعيل loop
 */
export const shouldEnableLoop = (itemsCount: number, slidesPerView: number | 'auto'): boolean => {
  if (slidesPerView === 'auto') return itemsCount > 3;
  
  // تفعيل loop فقط إذا كان عدد العناصر أكبر من ضعف عدد الشرائح المرئية
  const threshold = typeof slidesPerView === 'number' ? slidesPerView * 2 : 6;
  return itemsCount >= threshold;
};

/**
 * تحدد ما إذا كان يجب تفعيل autoplay أم لا
 * @param itemsCount عدد العناصر
 * @param minItems الحد الأدنى للعناصر لتفعيل autoplay
 * @returns كائن autoplay أو false
 */
export const getAutoplayConfig = (
  itemsCount: number, 
  minItems: number = 2,
  delay: number = 4000
) => {
  if (itemsCount < minItems) return false;
  
  return {
    delay,
    disableOnInteraction: false,
    pauseOnMouseEnter: true,
  };
};

/**
 * إنشاء إعدادات Swiper محسّنة لتجنب التحذيرات
 * @param itemsCount عدد العناصر
 * @param config الإعدادات الأساسية
 * @returns إعدادات Swiper محسّنة
 */
export const createOptimizedSwiperConfig = (itemsCount: number, config: SwiperConfig) => {
  const optimizedConfig = { ...config };
  
  // تحديد loop بناءً على عدد العناصر
  if (typeof optimizedConfig.slidesPerView === 'number') {
    optimizedConfig.loop = shouldEnableLoop(itemsCount, optimizedConfig.slidesPerView);
  }
  
  // تحديد autoplay بناءً على عدد العناصر
  if (optimizedConfig.autoplay !== false) {
    const delay = typeof optimizedConfig.autoplay === 'object' ? optimizedConfig.autoplay.delay : 4000;
    optimizedConfig.autoplay = getAutoplayConfig(itemsCount, 2, delay);
  }
  
  // إزالة navigation إذا لم تكن هناك عناصر كافية
  if (itemsCount <= 1) {
    optimizedConfig.navigation = false;
    optimizedConfig.pagination = undefined;
  }
  
  return optimizedConfig;
};

/**
 * إعدادات breakpoints شائعة لمختلف أنواع Swiper
 */
export const commonBreakpoints = {
  mobile: {
    320: { slidesPerView: 1.2, spaceBetween: 8 },
    480: { slidesPerView: 1.5, spaceBetween: 12 },
  },
  product: {
    320: { slidesPerView: 2.2, spaceBetween: 12 },
    480: { slidesPerView: 2.5, spaceBetween: 12 },
    640: { slidesPerView: 3.5, spaceBetween: 16 },
    768: { slidesPerView: 4, spaceBetween: 16 },
    1024: { slidesPerView: 5, spaceBetween: 16 },
    1280: { slidesPerView: 6, spaceBetween: 16 },
  },
  category: {
    320: { slidesPerView: 2.5, spaceBetween: 8 },
    480: { slidesPerView: 3.5, spaceBetween: 12 },
    640: { slidesPerView: 4.5, spaceBetween: 16 },
    768: { slidesPerView: 5.5, spaceBetween: 20 },
    1024: { slidesPerView: 6.5, spaceBetween: 24 },
  }
};

/**
 * تقمع تحذيرات Swiper في وضع التطوير
 */
export const suppressSwiperWarnings = () => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    const originalWarn = console.warn;
    console.warn = (...args) => {
      if (args[0]?.includes?.('Swiper Loop Warning')) {
        return; // تجاهل تحذيرات Swiper Loop
      }
      originalWarn.apply(console, args);
    };
  }
};
