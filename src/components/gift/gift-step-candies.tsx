"use client"

import type React from "react"
import { useCallback, useMemo } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination, Navigation, A11y } from "swiper/modules"
import "swiper/css"
import "swiper/css/pagination"
import "swiper/css/navigation"
import { giftOptions, GiftOption } from "../../data/products"
import { useGift } from "../../context/GiftContext"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import { Sparkles, ChevronDown } from 'lucide-react'
import { giftTheme, swiperStyles } from "../gift/lib/gift-theme"
import GiftProductCard from "./gift-product-card"
import GiftSectionHeader from "./gift-section-header"

// تقسيم المنتجات إلى مجموعات من 10 عناصر
const chunkArray = <T,>(array: T[], chunkSize = 10): T[][] => {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize))
  }
  return chunks
}

// تعريف نوع للمجموعات المقسمة
type GroupedChunks = {
  [key: string]: GiftOption[][]
}

const GiftStepCandies: React.FC = () => {
  const { dispatch, state } = useGift()

  // تصفية وترتيب الحلويات
  const candies = useMemo(
    () => giftOptions.filter((item) => item.category === "candies").sort((a, b) => a.tags[0].localeCompare(b.tags[0])),
    [],
  )

  // تجميع الحلويات حسب النوع
  const candyGroups = useMemo<GroupedChunks>(() => {
    const groups: { [key: string]: GiftOption[] } = candies.reduce((acc, candy) => {
      const group = candy.tags[0]
      if (!acc[group]) acc[group] = []
      acc[group].push(candy)
      return acc
    }, {} as { [key: string]: GiftOption[] })

    // تقسيم كل مجموعة إلى مجموعات فرعية من 10 عناصر
    const groupsWithChunks: GroupedChunks = {}
    Object.entries(groups).forEach(([groupName, items]) => {
      groupsWithChunks[groupName] = chunkArray(items, 10)
    })

    return groupsWithChunks
  }, [candies])

  // إضافة إلى السلة
  const addToCart = useCallback(
    (candy: GiftOption) => {
      const isAlreadyInCart = state.cart.some((item) => item.id === candy.id.toString())

      dispatch({ type: "ADD_TO_CART", payload: candy })

      toast.success(isAlreadyInCart ? `تمت زيادة كمية ${candy.name} في هديتك!` : `${candy.name} أضيفت إلى هديتك!`, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "light",
        icon: () => (
          <span role="img" aria-label="candy">
            🍬
          </span>
        ),
      })
    },
    [dispatch, state.cart],
  )

  if (candies.length === 0) {
    return (
      <motion.div
        className={`${giftTheme.gradients.light} p-8 ${giftTheme.rounded.lg} ${giftTheme.shadows.lg} flex flex-col items-center justify-center min-h-[300px] border border-indigo-100`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-emerald-500 mb-6 text-6xl">🍬</div>
        <h3 className="text-2xl font-bold text-indigo-800 mb-3">لا توجد حلويات متاحة حالياً</h3>
        <p className="text-indigo-600 text-center max-w-md">سيتم إضافة منتجات جديدة قريباً، يرجى زيارتنا مرة أخرى</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      className={`${giftTheme.gradients.light} p-4 sm:p-6 ${giftTheme.rounded.lg} ${giftTheme.shadows.lg} border border-indigo-100`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <GiftSectionHeader title="اختر الحلويات اللذيذة" icon={<Sparkles className="w-6 h-6" />} variant="secondary" />

      {Object.entries(candyGroups).map(([groupName, chunkedItems]) => (
        <div key={groupName} className="mb-8">
          <div className="flex items-center mb-4">
            <div className="h-8 w-1 bg-gradient-to-b from-indigo-400 to-purple-500 rounded-full mr-3"></div>
            <h4 className="text-lg font-bold text-indigo-800">{groupName}</h4>
          </div>

          {chunkedItems.map((chunk, chunkIndex) => (
            <div key={`${groupName}-chunk-${chunkIndex}`} className="mb-6">
              {chunkIndex > 0 && (
                <div className="flex items-center justify-center mb-3">
                  <div className="h-px w-16 bg-indigo-200"></div>
                  <div className="mx-2 text-xs text-indigo-400 flex items-center">
                    <span>المزيد من {groupName}</span>
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </div>
                  <div className="h-px w-16 bg-indigo-200"></div>
                </div>
              )}

              <Swiper
                modules={[Pagination, Navigation, A11y]}
                spaceBetween={12}
                slidesPerView="auto"
                pagination={{
                  clickable: true,
                  dynamicBullets: true,
                }}
                navigation
                a11y={{
                  prevSlideMessage: "الشريحة السابقة",
                  nextSlideMessage: "الشريحة التالية",
                }}
                breakpoints={{
                  320: { slidesPerView: 2.2, spaceBetween: 10 },
                  480: { slidesPerView: 2.5, spaceBetween: 12 },
                  640: { slidesPerView: 3, spaceBetween: 14 },
                  768: { slidesPerView: 3.5, spaceBetween: 16 },
                  1024: { slidesPerView: 4, spaceBetween: 18 },
                  1280: { slidesPerView: 5, spaceBetween: 20 },
                }}
                className="gift-swiper mb-4"
              >
                {chunk.map((candy) => {
                  const isInCart = state.cart.some((item) => item.id === candy.id.toString())
                  const quantity = state.cart.find((item) => item.id === candy.id.toString())?.quantity || 0

                  return (
                    <SwiperSlide key={candy.id}>
                      <GiftProductCard
                        product={{ ...candy, id: candy.id.toString() }}
                        isInCart={isInCart}
                        quantity={quantity}
                        onClick={() => addToCart(candy)}
                        variant="secondary"
                      />
                    </SwiperSlide>
                  )
                })}
              </Swiper>
            </div>
          ))}
        </div>
      ))}

      <style jsx global>
        {swiperStyles}
      </style>
    </motion.div>
  )
}

export default GiftStepCandies