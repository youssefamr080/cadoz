"use client"

import { useMemo, useEffect, useState } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay } from "swiper/modules"
import Image from "next/image"
import type { SwiperOptions } from "swiper/types"

type CategoryType = "men" | "women" | "kids"

interface SubCategory {
  name: string
  englishName: string
  image: string
}

interface SubCategorySwiperProps {
  category: CategoryType
  initialSubCategory: string // This will now be the English name
  onSelectSubCategory: (subCategory: string) => void // This will now pass the English name
}

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
  loop: true,
  modules: [Autoplay],
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
  <div
    role="button"
    tabIndex={0}
    aria-label={`اختر تصنيف ${sub.name}`}
    onClick={onClick}
    onKeyDown={(e) => e.key === "Enter" && onClick()}
    className={`group flex flex-col items-center cursor-pointer transition-all ${
      isActive ? "scale-105" : "hover:scale-105"
    } active:scale-95`}
  >
    <div
      className={`relative w-20 h-20 rounded-full shadow-lg border-2 overflow-hidden transition-all duration-300 ${
        isActive
          ? "border-primary-500 shadow-xl"
          : "border-gray-100 group-hover:border-primary-500 group-hover:shadow-xl"
      }`}
    >
      <Image
        src={sub.image || "/placeholder.svg"}
        alt={sub.name}
        width={96}
        height={96}
        className="object-cover w-full h-full"
        loading="lazy"
        quality={85}
        sizes="(max-width: 768px) 96px, 128px"
      />
    </div>
    <p
      className={`mt-3 text-sm font-medium text-center leading-tight transition-colors ${
        isActive ? "text-primary-600 font-bold" : "text-gray-800 hover:text-primary-600"
      }`}
    >
      {sub.name}
    </p>
  </div>
)

const SubCategorySwiper = ({ category, initialSubCategory, onSelectSubCategory }: SubCategorySwiperProps) => {
  const [selectedSubCategory, setSelectedSubCategory] = useState("")

  const categories = useMemo(() => SUB_CATEGORIES[category] || [], [category])

  // Find subcategory by English name or use first one
  useEffect(() => {
    const foundSubCategory = categories.find((sub) => sub.englishName === initialSubCategory)
    if (foundSubCategory) {
      setSelectedSubCategory(foundSubCategory.englishName)
      onSelectSubCategory(foundSubCategory.englishName)
    } else if (categories.length > 0) {
      setSelectedSubCategory(categories[0].englishName)
      onSelectSubCategory(categories[0].englishName)
    }
  }, [category, initialSubCategory, categories, onSelectSubCategory])

  const handleSubCategoryClick = (subCategory: SubCategory) => {
    setSelectedSubCategory(subCategory.englishName)
    onSelectSubCategory(subCategory.englishName)
  }

  if (!categories.length) return null

  return (
    <section className="container mx-auto px-4 py-8">
      <Swiper {...swiperConfig} className="!pb-2">
        {categories.map((sub) => (
          <SwiperSlide key={`${category}-${sub.englishName}`}>
            <SubCategoryItem
              sub={sub}
              isActive={sub.englishName === selectedSubCategory}
              onClick={() => handleSubCategoryClick(sub)}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  )
}

export default SubCategorySwiper
