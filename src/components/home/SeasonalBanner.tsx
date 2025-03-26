"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { ChevronDown, X, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { Gift } from "lucide-react"

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
  const [, setIsHovered] = useState(false)
  const [currentTextIndex, setCurrentTextIndex] = useState(0)

  // تحديد الوقت المتبقي لنهاية الموسم
  const calculateTimeLeft = React.useCallback(() => {
    const now = new Date()
    const difference = season.endDate.getTime() - now.getTime()
    if (difference <= 0) return "انتهى الموسم!"

    const days = Math.floor(difference / (1000 * 60 * 60 * 24))
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
    return `${days} أيام و ${hours} ساعات`
  }, [season.endDate])

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

  // نصوص متغيرة للعرض
  const alternatingTexts = [
    `استمتع بتجربة تسوق فريدة مع عروض ${season.arabicName} المميزة!`,
    `باقي ${timeLeft} على انتهاء العروض`,
    "اطلب الآن للحصول على توصيل سريع",
  ]

  useEffect(() => {
    const timer = setInterval(
      () => {
        setTimeLeft(calculateTimeLeft())
      },
      1000 * 60 * 60,
    )

    // تغيير النص كل 4 ثواني
    const textTimer = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % alternatingTexts.length)
    }, 4000)

    return () => {
      clearInterval(timer)
      clearInterval(textTimer)
    }
  }, [season.endDate, calculateTimeLeft, alternatingTexts.length])

  // تأثيرات الحركة
  const bannerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8, ease: "easeOut" } },
    exit: { opacity: 0, transition: { duration: 0.5 } },
  }

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  }

  const buttonVariants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.05,
      boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
      transition: { duration: 0.3 },
    },
    tap: { scale: 0.95 },
  }

  const emojiVariants = {
    initial: { scale: 0, rotate: 0 },
    animate: {
      scale: 1,
      rotate: [0, -10, 10, -5, 5, 0],
      transition: {
        scale: { duration: 0.5, type: "spring", stiffness: 200 },
        rotate: { duration: 1.5, delay: 0.5, ease: "easeInOut" },
      },
    },
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.section
          variants={bannerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full h-[80vh] min-h-[550px] overflow-hidden"
        >
          {/* خلفية متحركة */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-black/60 z-10" />

          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={season.banner || "/placeholder.svg"}
              alt={`${season.arabicName} banner`}
              fill
              className="object-cover scale-110 animate-slow-zoom"
              priority
              quality={90}
            />

            {/* طبقة التدرج اللوني */}
            <div className={`absolute inset-0 bg-gradient-to-br ${season.color} opacity-60 mix-blend-overlay`} />

           
          </div>

          {/* تأثير الجزيئات المتحركة */}
          <div className="absolute inset-0 z-20 pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.span
                key={i}
                className="absolute w-1 h-1 md:w-2 md:h-2 bg-white rounded-full"
                initial={{
                  x: Math.random() * 100 + "%",
                  y: Math.random() * 100 + "%",
                  opacity: 0,
                }}
                animate={{
                  y: [0, -50, 0],
                  opacity: [0, 0.8, 0],
                  scale: [0, 1.2, 0],
                }}
                transition={{
                  duration: Math.random() * 5 + 5,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: Math.random() * 3,
                }}
              />
            ))}
          </div>

          {/* المحتوى */}
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center text-white px-4">
            <div className="text-center max-w-4xl mx-auto">
              <motion.div
                variants={emojiVariants}
                initial="initial"
                animate="animate"
                className="inline-block mb-6 text-7xl md:text-8xl"
              >
                {season.emoji}
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 drop-shadow-lg bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80"
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
                  className="text-lg md:text-2xl mb-10 drop-shadow-md max-w-2xl mx-auto font-medium"
                >
                  {alternatingTexts[currentTextIndex]}
                </motion.p>
              </AnimatePresence>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link href="/category/seasonal">
                  <motion.button
                    variants={buttonVariants}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className="relative overflow-hidden bg-white text-slate-900 px-8 py-4 rounded-full font-bold text-lg shadow-xl group"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/80 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%]"></span>
                    <span className="relative z-10 flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5" />
                      تسوق الآن
                    </span>
                  </motion.button>
                </Link>

                <Link href="/gift-results">
                  <motion.button
                    variants={buttonVariants}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap"
                    className="relative overflow-hidden bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg group"
                  >
                    <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="relative z-10 flex items-center gap-2">
                      <Gift className="w-5 h-5" />
                      مساعد الهدايا
                    </span>
                  </motion.button>
                </Link>
              </motion.div>
            </div>
          </div>

          {/* زر التمرير لأسفل */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 10, 0] }}
            transition={{ delay: 1.5, duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer z-30"
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
          >
            <div className="flex flex-col items-center">
              <span className="text-white text-sm mb-2 opacity-80">اكتشف المزيد</span>
              <ChevronDown className="w-8 h-8 text-white" />
            </div>
          </motion.div>

          {/* زر الإغلاق */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors bg-black/30 p-2 rounded-full z-40"
          >
            <X className="w-6 h-6" />
          </button>
        </motion.section>
      )}
    </AnimatePresence>
  )
}

export default SeasonalBanner

