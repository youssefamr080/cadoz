"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, useAnimation, AnimatePresence } from "framer-motion"
import { Gift, Sparkles, Search, Heart, Star, Package, PartyPopper, Gem, ShoppingBag } from "lucide-react"

const GiftFinderSection = () => {
  const router = useRouter()
  const [isButtonHovered, setIsButtonHovered] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [activeCategory, setActiveCategory] = useState(0)
  const buttonRef = useRef(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const controls = useAnimation()

  // فئات الهدايا مع الوصف
  const categories = [
    {
      label: "هدايا رجالية",
      color: "bg-blue-500",
      icon: Gift,
      description: "هدايا مميزة للرجال تناسب جميع الأذواق والمناسبات",
    },
    {
      label: "هدايا نسائية",
      color: "bg-pink-500",
      icon: Heart,
      description: "هدايا فاخرة للنساء بلمسة خاصة تناسب كل الأوقات",
    },
    {
      label: "هدايا أطفال",
      color: "bg-yellow-500",
      icon: Star,
      description: "هدايا ممتعة وتعليمية للأطفال من جميع الأعمار",
    },
    {
      label: "أعياد ميلاد",
      color: "bg-purple-500",
      icon: PartyPopper,
      description: "هدايا مبتكرة لأعياد الميلاد تجعل المناسبة لا تُنسى",
    },
    {
      label: "هدايا فاخرة",
      color: "bg-emerald-500",
      icon: Gem,
      description: "هدايا استثنائية فاخرة للمناسبات الخاصة والشخصيات المميزة",
    },
    {
      label: "مناسبات خاصة",
      color: "bg-indigo-500",
      icon: ShoppingBag,
      description: "هدايا مخصصة للمناسبات الخاصة والاحتفالات المميزة",
    },
  ]

  // التحقق من حجم الشاشة
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // تتبع حركة الماوس للتأثيرات التفاعلية
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e
      const { innerWidth, innerHeight } = window

      // تحويل الإحداثيات إلى نسب مئوية
      const x = clientX / innerWidth
      const y = clientY / innerHeight

      setMousePosition({ x, y })
    }

    if (!isMobile) {
      window.addEventListener("mousemove", handleMouseMove)
      return () => window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [isMobile])

  // تحريك الخلفية بناءً على حركة الماوس
  useEffect(() => {
    if (!isMobile) {
      controls.start({
        backgroundPosition: `${mousePosition.x * 10}% ${mousePosition.y * 10}%`,
        transition: { duration: 0.5 },
      })
    }
  }, [mousePosition, controls, isMobile])

  // تغيير الفئة النشطة كل 3 ثوانٍ
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCategory((prev) => (prev + 1) % categories.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [categories.length])

  // التوجه إلى صفحة نتائج الهدايا
  const navigateToResults = () => {
    router.push("/chat-bot")
  }

  // تحديد فئة معينة عند النقر عليها
  const handleCategoryClick = (index: number) => {
    setActiveCategory(index)
  }

  // أيقونات الهدايا المتنوعة للخلفية
  const giftIcons = [Gift, Heart, Star, Package, Sparkles, PartyPopper, Gem, ShoppingBag]

  return (
    <section className="w-full relative overflow-hidden">
      {/* خلفية متدرجة متحركة - ألوان مبهجة */}
      <motion.div
        animate={controls}
        className="absolute inset-0 bg-gradient-to-br from-[#2C0735] via-[#4B155F] to-[#FFC857]"
        style={{ backgroundSize: "200% 200%" }}
      />

      {/* طبقة التأثيرات - ألوان مبهجة */}
      <div className="absolute inset-0">
        {/* تأثير الضوء المتحرك */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(255,215,0,0.15), transparent 70%)",
          }}
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />

        {/* أشكال زخرفية ملونة */}
        <motion.div
          className="absolute top-0 left-[20%] w-48 h-48 rounded-full bg-amber-400/20 blur-3xl"
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
        />

        <motion.div
          className="absolute bottom-0 right-[30%] w-40 h-40 rounded-full bg-pink-400/20 blur-3xl"
          animate={{ y: [10, -10, 10] }}
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
        />

        <motion.div
          className="absolute top-[30%] right-[20%] w-32 h-32 rounded-full bg-blue-400/20 blur-3xl hidden md:block"
          animate={{ x: [10, -10, 10] }}
          transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
        />

        {/* جسيمات متوهجة ملونة */}
        {[...Array(isMobile ? 8 : 15)].map((_, i) => {
          const colors = ["bg-amber-400", "bg-pink-400", "bg-blue-400", "bg-purple-400", "bg-green-400"]
          return (
            <motion.div
              key={`particle-${i}`}
              className={`absolute rounded-full ${colors[i % colors.length]}`}
              style={{
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.3,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: Math.random() * 5 + 3,
                repeat: Number.POSITIVE_INFINITY,
                delay: Math.random() * 2,
              }}
            />
          )
        })}

        {/* هدايا عائمة في الخلفية - ألوان مبهجة */}
        {[...Array(isMobile ? 3 : 6)].map((_, i) => {
          const Icon = giftIcons[i % giftIcons.length]
          const colors = [
            "text-amber-400",
            "text-pink-400",
            "text-blue-400",
            "text-purple-400",
            "text-green-400",
            "text-indigo-400",
          ]
          return (
            <motion.div
              key={`floating-gift-${i}`}
              className={`absolute ${colors[i % colors.length]}`}
              style={{
                top: `${Math.random() * 80 + 10}%`,
                left: `${Math.random() * 80 + 10}%`,
                opacity: 0.3,
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, Math.random() > 0.5 ? 10 : -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: Math.random() * 5 + 5,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
                delay: Math.random() * 2,
              }}
            >
              <Icon size={Math.random() * 20 + 20} />
            </motion.div>
          )
        })}
      </div>

      {/* المحتوى الرئيسي */}
      <div className="relative z-10 container mx-auto px-4 py-5 md:py-7 flex flex-col items-center">
        {/* العنوان والوصف - ألوان مبهجة */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-4 md:mb-6"
        >
          <div className="inline-flex items-center justify-center mb-2 bg-gradient-to-r from-amber-400/70 to-amber-500/70 p-2 rounded-full border border-amber-300 shadow-sm">
            <Gift className="w-4 h-4 md:w-5 md:h-5 text-white ml-1.5" />
            <span className="text-white text-xs md:text-sm font-semibold">مساعد الهدايا الذكي</span>
          </div>

          <h2 className="text-xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-3 text-purple-800">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700">
              اكتشف الهدية المثالية لمن تحب
            </span>
          </h2>

          <div className="bg-white/60 backdrop-blur-sm rounded-lg py-1.5 px-3 inline-block shadow-sm">
            <p className="text-purple-800 max-w-lg mx-auto text-sm md:text-base font-medium">
              مجموعة متنوعة من الهدايا المميزة لجميع المناسبات والأذواق
            </p>
          </div>
        </motion.div>

        {/* زر البحث في المنتصف مع تأثيرات جذابة */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative mb-5 md:mb-7"
        >
          {/* دائرة توهج خلفية */}
          <motion.div
            className="absolute -inset-4 md:-inset-6 rounded-full bg-amber-400/30 blur-xl"
            animate={{
              scale: isButtonHovered ? [1, 1.2, 1.1] : [1, 1.1, 1],
              opacity: isButtonHovered ? [0.3, 0.5, 0.4] : [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          />

          {/* زر البحث - تصميم مبهج */}
          <motion.button
            ref={buttonRef}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onMouseEnter={() => setIsButtonHovered(true)}
            onMouseLeave={() => setIsButtonHovered(false)}
            onClick={navigateToResults}
            className="relative px-6 py-3 md:px-10 md:py-4 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 md:gap-3 z-10 text-base md:text-lg border-2 border-amber-300"
          >
            <span className="drop-shadow-sm">ابدأ البحث عن هدية</span>
            <motion.div
              animate={{
                rotate: isButtonHovered ? [0, 15, 0, -15, 0] : 0,
              }}
              transition={{
                duration: 0.6,
                repeat: isButtonHovered ? 1 : 0,
              }}
            >
              <Search className="w-5 h-5 md:w-6 md:h-6" />
            </motion.div>

            {/* تأثير توهج عند التحويم */}
            {isButtonHovered && (
              <motion.div
                className="absolute inset-0 rounded-full bg-amber-300"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0, scale: 1.5 }}
                transition={{ duration: 0.8 }}
              />
            )}

            {/* تأثير بريق على الزر */}
            <motion.div
              className="absolute inset-0 overflow-hidden rounded-full"
              style={{
                background:
                  "linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.4) 25%, rgba(255,255,255,0.4) 50%, transparent 50%, transparent 75%, rgba(255,255,255,0.4) 75%)",
                backgroundSize: "200% 200%",
                mixBlendMode: "overlay",
              }}
              animate={{
                backgroundPosition: ["0% 0%", "200% 200%"],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            />
          </motion.button>

          {/* شرارات حول الزر */}
          {isButtonHovered && (
            <>
              {[...Array(8)].map((_, i) => {
                const angle = (i / 8) * Math.PI * 2
                const distance = isMobile ? 40 : 60

                return (
                  <motion.div
                    key={`spark-${i}`}
                    className="absolute w-2 h-2 bg-amber-300 rounded-full"
                    style={{
                      x: Math.cos(angle) * 30,
                      y: Math.sin(angle) * 30,
                    }}
                    animate={{
                      x: [Math.cos(angle) * 30, Math.cos(angle) * distance],
                      y: [Math.sin(angle) * 30, Math.sin(angle) * distance],
                      opacity: [1, 0],
                      scale: [1, 0.5],
                    }}
                    transition={{
                      duration: 0.8,
                      ease: "easeOut",
                    }}
                  />
                )
              })}
            </>
          )}
        </motion.div>

        {/* قسم الفئات المتغيرة مع الوصف - ألوان مبهجة */}
        <div className="w-full max-w-4xl mx-auto mb-4">
          {/* الفئات */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-3">
            {categories.map((category, index) => {
              const isActive = index === activeCategory
              const Icon = category.icon

              return (
                <motion.div
                  key={index}
                  whileHover={{ y: -3, scale: 1.05 }}
                  onClick={() => handleCategoryClick(index)}
                  className={`flex items-center cursor-pointer transition-all duration-300 px-2 py-1 md:px-4 md:py-2 rounded-full border ${
                    isActive
                      ? "bg-gradient-to-r from-amber-400/70 to-amber-500/70 border-amber-300 shadow-md"
                      : "bg-white/40 backdrop-blur-sm border-white/40 hover:bg-white/60"
                  }`}
                >
                  <Icon className={`w-3 h-3 md:w-4 md:h-4 ml-1 ${isActive ? "text-white" : "text-purple-700"}`} />
                  <span
                    className={`text-xs md:text-sm ${isActive ? "text-white font-semibold" : "text-purple-700 font-medium"}`}
                  >
                    {category.label}
                  </span>
                  <span
                    className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${category.color} mr-1 md:mr-1.5 ${isActive ? "opacity-100" : "opacity-70"}`}
                  ></span>
                </motion.div>
              )
            })}
          </div>

          {/* وصف الفئة النشطة - ألوان مبهجة */}
          <div className="relative h-12 md:h-14">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="bg-white/60 backdrop-blur-sm border border-amber-300 rounded-xl p-2.5 md:p-3 text-center w-full max-w-2xl shadow-md">
                  <p className="text-purple-800 text-sm md:text-base font-medium">
                    {categories[activeCategory].description}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* شريط إضافي للميزات - ألوان مبهجة */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-wrap justify-center gap-3 md:gap-5"
        >
          {[
            { text: "شحن سريع", icon: <Sparkles className="w-3 h-3 md:w-4 md:h-4" /> },
            { text: "ضمان الجودة", icon: <Star className="w-3 h-3 md:w-4 md:h-4" /> },
            { text: "تغليف هدايا ", icon: <Package className="w-3 h-3 md:w-4 md:h-4" /> },
          ].map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-1.5 text-purple-700 bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-amber-300/50 shadow-sm"
            >
              {feature.icon}
              <span className="text-xs md:text-sm font-medium">{feature.text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default GiftFinderSection

