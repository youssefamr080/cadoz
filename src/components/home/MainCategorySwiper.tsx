"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Swiper, SwiperSlide } from "swiper/react"
import type { Swiper as SwiperType } from 'swiper'
import { Navigation, Pagination, Autoplay } from "swiper/modules"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"

// Importar estilos de Swiper
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"

// Definir tipos para las categorías
type CategoryType = "men" | "women" | "kids"

// Interfaz para subcategorías
interface SubCategory {
  name: string
  englishName: string
  image: string
}

// Datos de categorías principales
const MAIN_CATEGORIES: { type: CategoryType; name: string; image: string }[] = [
  { 
    type: "men", 
    name: "رجال", 
    image: "/images/image_fx_ (38).webp"
  },
  { 
    type: "women", 
    name: "نساء", 
    image: "/images/image_fx_ (39).webp"
  },
  { 
    type: "kids", 
    name: "أطفال", 
    image: "/images/image_fx_ (40).webp"
  }
]

// Datos de subcategorías
const SUB_CATEGORIES: Record<CategoryType, SubCategory[]> = {
  men: [
    { name: "ساعات", englishName: "watches", image: "/images/watch section.png" },
    { name: "محافظ", englishName: "wallets", image: "/images/men wallet.png" },
    { name: "عطور", englishName: "perfumes", image: "/images/men perfum section.png" },
    { name: "شنط يد", englishName: "handbags", image: "/images/hand bag.png" },
    { name: "نظارات شمسية", englishName: "sunglasses", image: "/images/men sunglasses.png" },
    { name: "سبراي", englishName: "spray", image: "/images/image_fx_ (41).webp" },
  ],
  women: [
    { name: "ساعات", englishName: "watches", image: "/images/women watch.png" },
    { name: "محافظ", englishName: "wallets", image: "/images/walet-women.webp" },
    { name: "عطور", englishName: "perfumes", image: "/images/women perfume.png" },
    { name: "إكسسوارات", englishName: "accessories", image: "/images/women Accessories.png" },
    { name: "نظارات شمسية", englishName: "sunglasses", image: "/images/women sunglasses.png" },
    { name: "سبراي", englishName: "spray", image: "/images/image_fx_ (42).webp" },
  ],
  kids: [
    { name: "العاب اطفال", englishName: "toys", image: "/images/kids toys.png" },
    { name: "دباديب", englishName: "teddy-bears", image: "/images/kids fur.png" },
    { name: "ساعات اطفال", englishName: "watches", image: "/images/kids watch.png" },
  ],
}

// Componente para mostrar una subcategoría
const SubCategoryItem = ({ sub, category }: { sub: SubCategory; category: CategoryType }) => {
  const getCategoryColor = (cat: CategoryType) => {
    switch (cat) {
      case "men": return "border-blue-500 group-hover:border-blue-600 text-blue-600"
      case "women": return "border-pink-500 group-hover:border-pink-600 text-pink-600"
      case "kids": return "border-amber-500 group-hover:border-amber-600 text-amber-600"
      default: return "border-gray-300 group-hover:border-gray-400 text-gray-600"
    }
  }

  const colorClass = getCategoryColor(category)

  return (
    <Link 
      href={`/category/${category}#${sub.englishName}`}
      className="group flex flex-col items-center"
    >
      <motion.div
        whileHover={{ y: -5 }}
        whileTap={{ scale: 0.95 }}
        className="transition-all duration-300"
      >
        <div className={`relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 ${colorClass} shadow-sm group-hover:shadow-md`}>
          <Image
            src={sub.image}
            alt={sub.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 768px) 64px, 80px"
          />
        </div>
        <p className={`mt-2 text-xs md:text-sm font-medium text-center ${colorClass.split(" ").pop()}`}>
          {sub.name}
        </p>
      </motion.div>
    </Link>
  )
}

// Componente principal para cada categoría con su swiper de subcategorías
const CategorySection = ({ category }: { category: typeof MAIN_CATEGORIES[0] }) => {
  const [swiperRef, setSwiperRef] = useState<SwiperType | null>(null)
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mb-10"
    >
      {/* Banner de la categoría principal */}
      <motion.div 
        className="relative h-40 md:h-56 lg:h-64 mb-4 rounded-2xl overflow-hidden group"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.3 }}
      >
        <Image
          src={category.image}
          alt={category.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 1200px"
          priority
        />
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300 group-hover:bg-black/10"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <motion.h2 
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-xl"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {category.name}
          </motion.h2>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link 
              href={`/category/${category.type}`}
              className="bg-white/90 hover:bg-white text-gray-900 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 hover:px-8 hover:shadow-lg"
            >
              عرض الكل
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Swiper de subcategorías */}
      <div className="relative px-8">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={16}
          slidesPerView={3.5}
          autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
          loop={SUB_CATEGORIES[category.type].length > 5}
          grabCursor={true}
          breakpoints={{
            640: { slidesPerView: 4.5, spaceBetween: 16 },
            768: { slidesPerView: 5.5, spaceBetween: 20 },
            1024: { slidesPerView: 6.5, spaceBetween: 24 },
          }}
          onSwiper={setSwiperRef}
          className="py-4"
        >
          {SUB_CATEGORIES[category.type].map((sub) => (
            <SwiperSlide key={`${category.type}-${sub.englishName}`}>
              <SubCategoryItem sub={sub} category={category.type} />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Botones de navegación personalizados */}
        <button
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-1.5 hover:bg-gray-50 transition-colors"
          onClick={() => swiperRef?.slidePrev()}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-1.5 hover:bg-gray-50 transition-colors"
          onClick={() => swiperRef?.slideNext()}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  )
}

// Componente principal que muestra todas las categorías
const MainCategorySwiper = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">
        تسوق حسب الفئة
      </h2>
      
      {MAIN_CATEGORIES.map((category) => (
        <CategorySection key={category.type} category={category} />
      ))}
    </div>
  )
}

export default MainCategorySwiper
