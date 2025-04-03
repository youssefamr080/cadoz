"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { ChevronDown, X, ShoppingBag, Gift } from "lucide-react"
import Link from "next/link"

// تعريف نوع البيانات للموسم
type Season = {
  name: string
  arabicName: string
  emoji: string
  color: string
  endDate: Date
  banner: string
}

interface SeasonalBannerProps {
  season: Season
}

const SeasonalBanner: React.FC<SeasonalBannerProps> = ({ season }) => {
  const [isVisible, setIsVisible] = useState(true)
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  // Eliminar la función calculateTimeLeft y el estado timeLeft

  // Modificar los textos alternantes para eliminar la referencia al tiempo restante
  const alternatingTexts = [
    `استمتع بتجربة تسوق فريدة مع عروض ${season.arabicName} المميزة!`,
    "اطلب الآن للحصول على توصيل سريع",
    "تسوق واستمتع بأفضل العروض الحصرية",
  ]

  useEffect(() => {
    // التحقق من حجم الشاشة
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    // Eliminar la actualización del tiempo restante

    // تغيير النص كل 4 ثواني
    const textTimer = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % alternatingTexts.length)
    }, 4000)

    return () => {
      clearInterval(textTimer)
      window.removeEventListener("resize", checkMobile)
    }
  }, [alternatingTexts.length])

  // تأثيرات الحركة
  const bannerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8, ease: "easeOut" } },
    exit: { opacity: 0, transition: { duration: 0.5 } },
  }

  const textVariants = {
    hidden: { opacity: 0, y: 20, x: -20 },
    visible: { opacity: 1, y: 0, x: 0, transition: { duration: 0.6 } },
    exit: { opacity: 0, y: -20, x: 20, transition: { duration: 0.3 } },
  }

  const buttonVariants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.05,
      transition: { duration: 0.3 },
    },
    tap: { scale: 0.95 },
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.section
          variants={bannerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full h-[40vh] xs:h-[45vh] sm:h-[50vh] min-h-[250px] max-h-[400px] overflow-hidden"
        >
          {/* خلفية متحركة */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-black/60 z-10" />

          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={season.banner || "/placeholder.svg?height=400&width=1200"}
              alt={`${season.arabicName} banner`}
              fill
              className="object-cover scale-110 animate-slow-zoom"
              priority
              quality={90}
            />

            {/* طبقة التدرج اللوني */}
            <div className={`absolute inset-0 bg-gradient-to-br ${season.color} opacity-60 mix-blend-overlay`} />
          </div>

          {/* المحتوى */}
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center text-white px-4">
            <div className="text-center max-w-4xl mx-auto">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                className="inline-block mb-3 text-4xl md:text-5xl"
              >
                {season.emoji}
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-xl xs:text-2xl md:text-4xl font-bold mb-2 xs:mb-3 drop-shadow-lg"
              >
                {season.arabicName}
              </motion.h1>

              <AnimatePresence mode="wait">
                <motion.p
                  key={currentTextIndex}
                  variants={textVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="text-sm md:text-base mb-5 drop-shadow-md max-w-md mx-auto"
                >
                  {alternatingTexts[currentTextIndex]}
                </motion.p>
              </AnimatePresence>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex gap-3 justify-center"
              >
                <Link href="/category/seasonal">
                  <motion.button
                    variants={buttonVariants}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap"
                    className="bg-white text-gray-900 px-4 py-2 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    تسوق الآن
                  </motion.button>
                </Link>

                <Link href="/gift-results">
                  <motion.button
                    variants={buttonVariants}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap"
                    className="bg-transparent border border-white text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    مساعد الهدايا
                  </motion.button>
                </Link>
              </motion.div>
            </div>
          </div>

          {/* زر التمرير لأسفل */}
          {!isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, y: [0, 10, 0] }}
              transition={{ delay: 1.5, duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 cursor-pointer z-30"
              onClick={() => window.scrollTo({ top: window.innerHeight / 2, behavior: "smooth" })}
            >
              <div className="flex flex-col items-center">
                <span className="text-white text-xs mb-1 opacity-80">اكتشف المزيد</span>
                <ChevronDown className="w-5 h-5 text-white" />
              </div>
            </motion.div>
          )}

          {/* زر الإغلاق */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-3 right-3 text-white hover:text-gray-300 transition-colors bg-black/30 p-1.5 rounded-full z-40"
            aria-label="إغلاق البانر"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.section>
      )}
    </AnimatePresence>
  )
}

export default SeasonalBanner

