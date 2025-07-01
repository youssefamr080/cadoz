"use client"

import { useMemo, useEffect, useState, useRef } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Navigation } from "swiper/modules"
import Image from "next/image"
import type { SwiperOptions, Swiper as SwiperType } from "swiper/types"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"

type CategoryType = "رجالي" | "نسائي" | "أطفال"

interface SubCategory {
  name: string
  arabicName: string
  image: string
}

interface SubCategorySwiperProps {
  category: CategoryType
  initialSubCategory: string // This will now be the Arabic name
  onSelectSubCategory: (subCategory: string) => void // This will now pass the Arabic name
}

const SUB_CATEGORIES: Record<CategoryType, SubCategory[]> = {
  "رجالي": [
    { name: "ساعات", arabicName: "ساعات", image: "/images/watch section.png" },
    { name: "محافظ", arabicName: "محافظ", image: "/images/men wallet.png" },
    { name: "عطور", arabicName: "عطور", image: "/images/men perfum section.png" },
    { name: "شنط يد", arabicName: "شنط يد", image: "/images/hand bag.png" },
    { name: "نظارات شمسية", arabicName: "نظارات شمسية", image: "/images/men sunglasses.png" },
    { name: "سبراي", arabicName: "سبراي", image: "/images/image_fx_ (41).webp" },
  ],
  "نسائي": [
    { name: "ساعات", arabicName: "ساعات", image: "/images/women watch.png" },
    { name: "محافظ", arabicName: "محافظ", image: "/images/walet-women.webp" },
    { name: "عطور", arabicName: "عطور", image: "/images/women perfume.png" },
    { name: "إكسسوارات", arabicName: "إكسسوارات", image: "/images/women Accessories.png" },
    { name: "نظارات شمسية", arabicName: "نظارات شمسية", image: "/images/women sunglasses.png" },
    { name: "سبراي", arabicName: "سبراي", image: "/images/image_fx_ (42).webp" },
  ],
  "أطفال": [
    { name: "العاب اطفال", arabicName: "العاب اطفال", image: "/images/kids toys.png" },
    { name: "دباديب", arabicName: "دباديب", image: "/images/kids fur.png" },
    { name: "ساعات اطفال", arabicName: "ساعات اطفال", image: "/images/kids watch.png" },
  ],
}

const swiperConfig: SwiperOptions = {
  spaceBetween: 16,
  slidesPerView: 4,
  autoplay: {
    delay: 6000,
    disableOnInteraction: false,
    pauseOnMouseEnter: true,
  },
  breakpoints: {
    320: { slidesPerView: 3.5 },
    640: { slidesPerView: 4.5 },
    768: { slidesPerView: 5.5 },
    1024: { slidesPerView: 6, spaceBetween: 24 },
  },
  loop: false,
  modules: [Autoplay, Navigation],
}

const SubCategoryItem = ({
  sub,
  isActive,
  onClick,
}: {
  sub: SubCategory
  isActive: boolean
  onClick: () => void
}) => (
  <motion.div
    role="button"
    tabIndex={0}
    aria-label={`اختر تصنيف ${sub.name}`}
    onClick={onClick}
    onKeyDown={(e) => e.key === "Enter" && onClick()}
    className={`group flex flex-col items-center cursor-pointer transition-all ${
      isActive ? "scale-105" : "hover:scale-105"
    } active:scale-95`}
    whileHover={{ y: -5 }}
    whileTap={{ scale: 0.95 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div
      className={`relative w-20 h-20 rounded-full shadow-lg border-2 overflow-hidden transition-all duration-300 ${
        isActive ? "border-purple-500 shadow-xl" : "border-gray-100 group-hover:border-purple-300 group-hover:shadow-xl"
      }`}
    >
      <Image
        src={sub.image || "/placeholder.svg"}
        alt={sub.name}
        width={96}
        height={96}
        className={`object-cover w-full h-full transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}
        loading="lazy"
        quality={85}
        sizes="(max-width: 768px) 96px, 128px"
      />
      {isActive && (
        <motion.div
          className="absolute inset-0 bg-purple-500/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </div>
    <p
      className={`mt-3 text-sm font-medium text-center leading-tight transition-colors ${
        isActive ? "text-purple-600 font-bold" : "text-gray-800 group-hover:text-purple-600"
      }`}
    >
      {sub.name}
    </p>
  </motion.div>
)

const SubCategorySwiper = ({ category, initialSubCategory, onSelectSubCategory }: SubCategorySwiperProps) => {
  const categories = useMemo(() => SUB_CATEGORIES[category] || [], [category])
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null)
  const didInitialSlideRef = useRef(false)

  // تعيين القسم الفرعي عند النقر
  const handleSubCategoryClick = (subCategory: SubCategory) => {
    console.log("SubCategory clicked:", subCategory.arabicName)
    onSelectSubCategory(subCategory.arabicName)
  }

  // التمرير إلى القسم الفرعي المحدد عندما يتغير
  useEffect(() => {
    if (!swiperInstance || !initialSubCategory || categories.length === 0) return

    const index = categories.findIndex((cat) => cat.arabicName === initialSubCategory)
    if (index !== -1) {
      console.log("Sliding to subcategory index:", index, initialSubCategory)
      swiperInstance.slideTo(index)
      didInitialSlideRef.current = true
    }
  }, [initialSubCategory, categories, swiperInstance])

  if (!categories.length) return null

  return (
    <section className="container mx-auto px-4 py-4 relative">
      <Swiper {...swiperConfig} className="!pb-2 !px-6" onSwiper={setSwiperInstance}>
        {categories.map((sub) => (
          <SwiperSlide key={`${category}-${sub.arabicName}`}>
            <SubCategoryItem
              sub={sub}
              isActive={sub.arabicName === initialSubCategory}
              onClick={() => handleSubCategoryClick(sub)}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom navigation buttons */}
      <button
        className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-1.5 text-purple-600 hover:text-purple-800 transition-colors"
        onClick={() => swiperInstance?.slidePrev()}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-1.5 text-purple-600 hover:text-purple-800 transition-colors"
        onClick={() => swiperInstance?.slideNext()}
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </section>
  )
}

export default SubCategorySwiper
