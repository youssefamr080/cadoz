"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Clock, Calendar, Gift, Sparkles, ShoppingBag } from "lucide-react"

interface Season {
  name: string
  startDate: Date
  endDate: Date
  color: string
  emoji: string
  slug: string
  discountPercentage?: number
}

interface CountdownTimerProps {
  seasons?: Season[]
  customText?: {
    title?: string
    buttonText?: string
    expiredText?: string
    comingSoonText?: string
    
  };
  targetDate?: Date; // إضافة هذه الخصائص
  seasonName?: string;
  seasonColor?: string;
  seasonEmoji?: string;
  seasonSlug?: string;
}

const defaultSeasons: Season[] = [
  {
    name: "رمضان",
    startDate: new Date("2025-03-01"), // تحديث هذا التاريخ بالتاريخ الفعلي لرمضان 2025
    endDate: new Date("2025-03-30"),
    color: "violet",
    emoji: "🌙",
    slug: "ramadan",
    discountPercentage: 30,
  },
  {
    name: "عيد الفطر",
    startDate: new Date("2025-03-31"), // تحديث هذا التاريخ بالتاريخ الفعلي لعيد الفطر 2025
    endDate: new Date("2025-04-03"),
    color: "emerald",
    emoji: "🎉",
    slug: "eid-al-fitr",
    discountPercentage: 25,
  },
  {
    name: "عيد الأضحى",
    startDate: new Date("2025-06-07"), // تحديث هذا التاريخ بالتاريخ الفعلي لعيد الأضحى 2025
    endDate: new Date("2025-06-10"),
    color: "green",
    emoji: "🐑",
    slug: "eid-al-adha",
    discountPercentage: 20,
  },
  {
    name: "المولد النبوي",
    startDate: new Date("2025-09-06"), // تحديث هذا التاريخ بالتاريخ الفعلي للمولد النبوي 2025
    endDate: new Date("2025-09-07"),
    color: "blue",
    emoji: "🕌",
    slug: "mawlid",
    discountPercentage: 15,
  },
  {
    name: "شم النسيم",
    startDate: new Date("2025-04-21"), // تحديث هذا التاريخ بالتاريخ الفعلي لشم النسيم 2025
    endDate: new Date("2025-04-21"),
    color: "yellow",
    emoji: "🌸",
    slug: "sham-el-nessim",
    discountPercentage: 10,
  },
  {
    name: "عيد الحب",
    startDate: new Date("2025-02-14"),
    endDate: new Date("2025-02-14"),
    color: "red",
    emoji: "❤️",
    slug: "valentine",
    discountPercentage: 20,
  },
  {
    name: "عيد الأم",
    startDate: new Date("2025-03-21"),
    endDate: new Date("2025-03-21"),
    color: "pink",
    emoji: "🌹",
    slug: "mothers-day",
    discountPercentage: 15,
  },
  {
    name: "رأس السنة الميلادية",
    startDate: new Date("2025-01-01"),
    endDate: new Date("2025-01-01"),
    color: "gold",
    emoji: "🎆",
    slug: "new-year",
    discountPercentage: 10,
  },
  {
    name: "عيد الميلاد (للمسيحيين)",
    startDate: new Date("2025-01-07"),
    endDate: new Date("2025-01-07"),
    color: "white",
    emoji: "🎄",
    slug: "christmas",
    discountPercentage: 15,
  },
]

// دالة للبحث عن المناسبة الحالية والقادمة
const findCurrentAndNextSeason = (seasons: Season[]) => {
  const now = new Date()

  // ترتيب المواسم حسب تاريخ البداية
  const sortedSeasons = [...seasons].sort((a, b) => a.startDate.getTime() - b.startDate.getTime())

  let currentSeason: Season | null = null
  let nextSeason: Season | null = null

  // البحث عن الموسم الحالي (نحن فيه الآن)
  currentSeason = sortedSeasons.find((season) => now >= season.startDate && now <= season.endDate) || null

  // البحث عن الموسم القادم (الذي لم يبدأ بعد)
  nextSeason = sortedSeasons.find((season) => now < season.startDate) || null

  // إذا لم نجد موسمًا قادمًا، نأخذ أول موسم في السنة القادمة
  if (!nextSeason && sortedSeasons.length > 0) {
    // نسخة من أول موسم لكن للسنة القادمة
    const firstSeasonNextYear = {
      ...sortedSeasons[0],
      startDate: new Date(
        sortedSeasons[0].startDate.getFullYear() + 1,
        sortedSeasons[0].startDate.getMonth(),
        sortedSeasons[0].startDate.getDate(),
      ),
      endDate: new Date(
        sortedSeasons[0].endDate.getFullYear() + 1,
        sortedSeasons[0].endDate.getMonth(),
        sortedSeasons[0].endDate.getDate(),
      ),
    }
    nextSeason = firstSeasonNextYear
  }

  return { currentSeason, nextSeason }
}

// دالة لحساب الوقت المتبقي حتى التاريخ المحدد
const calculateTimeLeft = (targetDate: Date) => {
  const now = new Date()
  const difference = targetDate.getTime() - now.getTime()

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    expired: false,
    totalDays: Math.ceil(difference / (1000 * 60 * 60 * 24)), // إجمالي الأيام بما فيها الكسور
  }
}

// دالة لتنسيق التاريخ بالعربية
const formatDateArabic = (date: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  }

  return date.toLocaleDateString("ar-SA", options)
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ seasons = defaultSeasons, customText = {} }) => {
  const { currentSeason, nextSeason } = findCurrentAndNextSeason(seasons)

  // إذا لم نجد موسمًا قادمًا، نستخدم الموسم الحالي أو الموسم الأول
  const targetSeason = nextSeason || currentSeason || seasons[0]

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetSeason.startDate))
  const [, setIsHovered] = useState(false)
  const [animateNumber, setAnimateNumber] = useState(false)

  // استخدام النص المخصص إذا وجد، وإلا استخدام النص الافتراضي
  const texts = {
    title: customText.title || "الوقت المتبقي حتى",
    buttonText: customText.buttonText || "تسوق الآن واستعد",
    expiredText: customText.expiredText || "لقد انتهى الموسم! تابعونا للمزيد من العروض قريبًا",
    comingSoonText: customText.comingSoonText || "استعد للعروض الخاصة",
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetSeason.startDate))
      // تنشيط تأثير الرقم كل دقيقة
      if (new Date().getSeconds() === 0) {
        setAnimateNumber(true)
        setTimeout(() => setAnimateNumber(false), 1000)
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [targetSeason])

  // تحديد الألوان بناءً على الموسم
  const getColorClasses = () => {
    const colorMap: Record<
      string,
      {
        bg: string
        text: string
        shadow: string
        border: string
        light: string
        gradient: string
        hover: string
        glow: string
      }
    > = {
      violet: {
        bg: "from-violet-500 to-indigo-600",
        text: "text-violet-600",
        shadow: "shadow-violet-200",
        border: "border-violet-200",
        light: "bg-violet-50",
        gradient: "from-violet-600 via-indigo-500 to-purple-600",
        hover: "hover:bg-violet-100",
        glow: "shadow-violet-500/20",
      },
      rose: {
        bg: "from-rose-500 to-pink-600",
        text: "text-rose-600",
        shadow: "shadow-rose-200",
        border: "border-rose-200",
        light: "bg-rose-50",
        gradient: "from-rose-600 via-pink-500 to-red-500",
        hover: "hover:bg-rose-100",
        glow: "shadow-rose-500/20",
      },
      amber: {
        bg: "from-amber-500 to-orange-600",
        text: "text-amber-600",
        shadow: "shadow-amber-200",
        border: "border-amber-200",
        light: "bg-amber-50",
        gradient: "from-amber-500 via-orange-500 to-yellow-500",
        hover: "hover:bg-amber-100",
        glow: "shadow-amber-500/20",
      },
      emerald: {
        bg: "from-emerald-500 to-teal-600",
        text: "text-emerald-600",
        shadow: "shadow-emerald-200",
        border: "border-emerald-200",
        light: "bg-emerald-50",
        gradient: "from-emerald-500 via-teal-500 to-green-500",
        hover: "hover:bg-emerald-100",
        glow: "shadow-emerald-500/20",
      },
      cyan: {
        bg: "from-cyan-500 to-blue-600",
        text: "text-cyan-600",
        shadow: "shadow-cyan-200",
        border: "border-cyan-200",
        light: "bg-cyan-50",
        gradient: "from-cyan-500 via-blue-500 to-sky-500",
        hover: "hover:bg-cyan-100",
        glow: "shadow-cyan-500/20",
      },
      fuchsia: {
        bg: "from-fuchsia-500 to-purple-600",
        text: "text-fuchsia-600",
        shadow: "shadow-fuchsia-200",
        border: "border-fuchsia-200",
        light: "bg-fuchsia-50",
        gradient: "from-fuchsia-500 via-purple-500 to-pink-500",
        hover: "hover:bg-fuchsia-100",
        glow: "shadow-fuchsia-500/20",
      },
      red: {
        bg: "from-red-500 to-rose-600",
        text: "text-red-600",
        shadow: "shadow-red-200",
        border: "border-red-200",
        light: "bg-red-50",
        gradient: "from-red-600 via-rose-500 to-pink-500",
        hover: "hover:bg-red-100",
        glow: "shadow-red-500/20",
      },
      green: {
        bg: "from-green-500 to-emerald-600",
        text: "text-green-600",
        shadow: "shadow-green-200",
        border: "border-green-200",
        light: "bg-green-50",
        gradient: "from-green-600 via-emerald-500 to-teal-500",
        hover: "hover:bg-green-100",
        glow: "shadow-green-500/20",
      },
      blue: {
        bg: "from-blue-500 to-indigo-600",
        text: "text-blue-600",
        shadow: "shadow-blue-200",
        border: "border-blue-200",
        light: "bg-blue-50",
        gradient: "from-blue-600 via-indigo-500 to-violet-500",
        hover: "hover:bg-blue-100",
        glow: "shadow-blue-500/20",
      },
      yellow: {
        bg: "from-yellow-400 to-amber-500",
        text: "text-yellow-600",
        shadow: "shadow-yellow-200",
        border: "border-yellow-200",
        light: "bg-yellow-50",
        gradient: "from-yellow-500 via-amber-400 to-orange-400",
        hover: "hover:bg-yellow-100",
        glow: "shadow-yellow-500/20",
      },
      pink: {
        bg: "from-pink-500 to-rose-600",
        text: "text-pink-600",
        shadow: "shadow-pink-200",
        border: "border-pink-200",
        light: "bg-pink-50",
        gradient: "from-pink-600 via-rose-500 to-fuchsia-500",
        hover: "hover:bg-pink-100",
        glow: "shadow-pink-500/20",
      },
      gold: {
        bg: "from-amber-400 to-yellow-500",
        text: "text-amber-600",
        shadow: "shadow-amber-200",
        border: "border-amber-200",
        light: "bg-amber-50",
        gradient: "from-amber-500 via-yellow-400 to-orange-400",
        hover: "hover:bg-amber-100",
        glow: "shadow-amber-500/20",
      },
      white: {
        bg: "from-slate-100 to-gray-200",
        text: "text-slate-700",
        shadow: "shadow-slate-200",
        border: "border-slate-200",
        light: "bg-slate-50",
        gradient: "from-slate-200 via-gray-100 to-white",
        hover: "hover:bg-slate-100",
        glow: "shadow-slate-500/20",
      },
    }

    return colorMap[targetSeason.color] || colorMap.violet
  }

  const colors = getColorClasses()

  // تأثيرات الحركة
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.08,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.4, type: "spring", stiffness: 100 },
    },
  }

  const numberVariants = {
    initial: { opacity: 0.9, scale: 1 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3 },
    },
    pulse: {
      scale: [1, 1.1, 1],
      opacity: [1, 0.8, 1],
      transition: { duration: 0.5 },
    },
  }

  const buttonVariants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.03,
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
      transition: { duration: 0.3 },
    },
    tap: { scale: 0.97 },
  }

  const isCurrentlyActive = currentSeason?.name === targetSeason.name

  // تأثير الشرارة
  const sparkVariants = {
    initial: { opacity: 0, scale: 0 },
    animate: {
      opacity: [0, 1, 0],
      scale: [0.5, 1.2, 0.5],
      transition: { duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 },
    },
  }

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={`py-6 md:py-8 rounded-xl overflow-hidden relative bg-gradient-to-b from-white to-slate-50 border ${colors.border} shadow-lg`}
    >
      {/* خلفية زخرفية محسنة */}
      <div className="absolute inset-0 overflow-hidden">
        {/* نمط الخلفية المحسن */}
        <div className="absolute inset-0 opacity-[0.03]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="smallGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
              </pattern>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <rect width="50" height="50" fill="url(#smallGrid)" />
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" className={colors.text} />
          </svg>
        </div>

        {/* تأثير الضوء المتوهج */}
        <div
          className={`absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br ${colors.bg} opacity-10 blur-3xl transform translate-x-1/4 -translate-y-1/4`}
        ></div>
        <div
          className={`absolute bottom-0 left-0 w-32 h-32 rounded-full bg-gradient-to-br ${colors.bg} opacity-10 blur-3xl transform -translate-x-1/4 translate-y-1/4`}
        ></div>

        {/* أشكال زخرفية */}
        <div className="absolute inset-0 opacity-[0.04]">
          <div className="absolute top-5 left-5 w-20 h-20 rounded-full border border-current"></div>
          <div className="absolute bottom-10 right-10 w-16 h-16 rounded-full border border-current"></div>
          <div className="absolute top-1/2 left-1/4 w-12 h-12 rounded-full border border-current transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
      </div>

      <div className="container mx-auto px-3 text-center relative z-10">
        {/* تصميم محسن للعنوان والأيقونة */}
        <div className="flex items-center justify-center gap-4 mb-4">
          {/* الأيقونة */}
          <motion.div variants={itemVariants} className="relative">
            <div
              className={`w-16 h-16 rounded-xl bg-gradient-to-br ${colors.bg} text-white flex items-center justify-center shadow-lg ${colors.glow}`}
            >
              <span className="text-2xl">{targetSeason.emoji}</span>
            </div>

            {/* تأثير الشرارة */}
            <motion.div
              variants={sparkVariants}
              initial="initial"
              animate="animate"
              className="absolute -top-1 -right-1"
            >
              <Sparkles className={`w-6 h-6 ${colors.text}`} />
            </motion.div>
          </motion.div>

          {/* العنوان */}
          <motion.div variants={itemVariants} className="flex flex-col items-start">
            {isCurrentlyActive ? (
              <div className="flex flex-col items-start text-right">
                <div className="mb-1 px-3 py-1 rounded-full bg-green-100 text-green-600 text-sm font-bold inline-flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  جارٍ الآن
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-slate-800">
                  <span className={colors.text}>{targetSeason.name}</span>
                </h3>
              </div>
            ) : (
              <h3 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
                {texts.title} <span className={colors.text}>{targetSeason.name}</span>
              </h3>
            )}

            {/* نسبة الخصم إذا وجدت */}
            {targetSeason.discountPercentage && (
              <div className="bg-red-100 text-red-600 font-bold text-sm px-3 py-1 rounded-full flex items-center gap-2 mt-1">
                <Gift className="w-4 h-4" />
                <span>خصم {targetSeason.discountPercentage}%</span>
              </div>
            )}
          </motion.div>
        </div>

        {/* معلومات الموسم */}
        <motion.p variants={itemVariants} className="text-sm md:text-base text-slate-500 mb-4">
          {isCurrentlyActive
            ? `ينتهي في ${formatDateArabic(targetSeason.endDate)}`
            : `يبدأ في ${formatDateArabic(targetSeason.startDate)}`}
        </motion.p>

        {/* العداد */}
        {timeLeft.expired ? (
          <motion.div
            variants={itemVariants}
            className={`${colors.light} rounded-lg p-3 max-w-md mx-auto border border-slate-100`}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <Calendar className={`w-4 h-4 ${colors.text}`} />
              <p className={`text-sm ${colors.text} font-semibold`}>
                {isCurrentlyActive ? "الموسم مستمر حالياً!" : texts.comingSoonText}
              </p>
            </div>
            <p className="text-xs text-slate-500">
              {isCurrentlyActive
                ? `استمتع بعروض ${targetSeason.name} حتى ${formatDateArabic(targetSeason.endDate)}`
                : `ترقبوا بدء موسم ${targetSeason.name} قريباً`}
            </p>
          </motion.div>
        ) : (
          <div>
            {/* تصميم محسن للعداد */}
            <motion.div variants={itemVariants} className="flex justify-center gap-2 md:gap-4">
              {[
                { value: timeLeft.days, label: "يوم" },
                { value: timeLeft.hours, label: "ساعة" },
                { value: timeLeft.minutes, label: "دقيقة" },
                { value: timeLeft.seconds, label: "ثانية" },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  variants={numberVariants}
                  animate={animateNumber && index === 3 ? "pulse" : "animate"}
                  className={`flex flex-col items-center p-2 md:p-3 rounded-lg ${colors.light} shadow-md border border-slate-100 w-[4.5rem] md:w-[5.5rem] ${colors.hover} transition-colors duration-300`}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={item.value}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2 }}
                      className="relative"
                    >
                      <span className={`text-2xl md:text-3xl font-black ${colors.text}`}>
                        {item.value.toString().padStart(2, "0")}
                      </span>
                    </motion.div>
                  </AnimatePresence>
                  <span className="text-xs md:text-sm text-slate-500 font-medium mt-1">{item.label}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* عرض نص إضافي للتشجيع */}
            <motion.div variants={itemVariants} className="mt-3 mb-4 text-sm md:text-base text-slate-600">
              {timeLeft.totalDays && timeLeft.totalDays <= 7 ? (
                <p className="text-red-500 font-medium inline-flex items-center gap-2 justify-center">
                  <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  عجّل بالتسوق! متبقي أقل من أسبوع
                  {isCurrentlyActive ? " حتى نهاية العروض" : " للبدء"}
                </p>
              ) : timeLeft.totalDays && timeLeft.totalDays <= 30 ? (
                <p className="text-amber-600 inline-flex items-center gap-2 justify-center">
                  <Clock className="w-4 h-4" />
                  فرصة مثالية للتسوق والاستعداد! متبقي أقل من شهر
                </p>
              ) : null}
            </motion.div>
          </div>
        )}

        {/* زر الدعوة للتسوق */}
        <motion.div variants={itemVariants} className="mt-3">
          <Link href={`/category/seasonal/${targetSeason.slug}`}>
            <motion.button
              variants={buttonVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className={`relative overflow-hidden bg-gradient-to-r ${colors.gradient} text-white px-6 py-3 rounded-full font-bold text-sm md:text-base shadow-lg ${colors.glow} group`}
            >
              <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative z-10 flex items-center gap-2">
                {isCurrentlyActive ? (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    تسوق الآن قبل انتهاء العروض
                  </>
                ) : timeLeft.expired ? (
                  <>
                    <Calendar className="w-5 h-5" />
                    {texts.buttonText}
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    تسوق واستعد للموسم القادم
                  </>
                )}
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </span>
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </motion.section>
  )
}

export default CountdownTimer

