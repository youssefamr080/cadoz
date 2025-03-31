"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Swiper, SwiperSlide } from "swiper/react"
import { FreeMode, Autoplay } from "swiper/modules"
import "swiper/css"
import "swiper/css/free-mode"
import { Gift, ArrowRight, Sparkles, PiggyBank, Diamond, Crown, Tag } from 'lucide-react'

interface PriceCategory {
  maxPrice: number
  minPrice: number
  title: string
  icon: React.ReactNode
  color: string
  gradient: string
  description: string
  image?: string
}

const PriceRangeSwiper: React.FC = () => {
  const router = useRouter()
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const priceCategories: PriceCategory[] = [
    {
      minPrice: 0,
      maxPrice: 300,
      title: "هدايا أقل من 300 ج.م",
      icon: <PiggyBank className="w-5 h-5" />,
      color: "bg-emerald-500",
      gradient: "from-emerald-500 to-teal-600",
      description: "هدايا مميزة بأسعار اقتصادية",
      image: "/placeholder.svg?height=80&width=80"
    },
    {
      minPrice: 0,
      maxPrice: 500,
      title: "هدايا أقل من 500 ج.م",
      icon: <Tag className="w-5 h-5" />,
      color: "bg-blue-500",
      gradient: "from-blue-500 to-indigo-600",
      description: "خيارات متنوعة بأسعار متوسطة",
      image: "/placeholder.svg?height=80&width=80"
    },
    {
      minPrice: 0,
      maxPrice: 700,
      title: "هدايا أقل من 700 ج.م",
      icon: <Gift className="w-5 h-5" />,
      color: "bg-purple-500",
      gradient: "from-purple-500 to-violet-600",
      description: "هدايا فاخرة بأسعار معقولة",
      image: "/placeholder.svg?height=80&width=80"
    },
    {
      minPrice: 0,
      maxPrice: 1000,
      title: "هدايا أقل من 1000 ج.م",
      icon: <Diamond className="w-5 h-5" />,
      color: "bg-rose-500",
      gradient: "from-rose-500 to-pink-600",
      description: "هدايا فاخرة للمناسبات الخاصة",
      image: "/placeholder.svg?height=80&width=80"
    },
    {
      minPrice: 0,
      maxPrice: 2000,
      title: "هدايا أقل من 2000 ج.م",
      icon: <Crown className="w-5 h-5" />,
      color: "bg-amber-500",
      gradient: "from-amber-500 to-yellow-600",
      description: "هدايا استثنائية للأشخاص المميزين",
      image: "/placeholder.svg?height=80&width=80"
    }
  ]

  const handlePriceRangeClick = (minPrice: number, maxPrice: number) => {
    // حفظ خيارات الفلتر في localStorage
    const filterOptions = {
      gender: "all",
      occasion: "all",
      priceRange: [minPrice, maxPrice]
    }
    
    localStorage.setItem("giftFilterOptions", JSON.stringify(filterOptions))
    
    // الانتقال إلى صفحة النتائج
    router.push("/gift-results")
  }

  // تأثيرات الحركة
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeOut" } 
    }
  }

  const cardVariants = {
    inactive: { scale: 1, y: 0 },
    active: { scale: 1.05, y: -5 },
    tap: { scale: 0.98 }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="mb-8 py-6"
      style={{ 
        background: "linear-gradient(to bottom, rgba(241, 245, 249, 0.5), rgba(248, 250, 252, 0.8))",
        borderRadius: "16px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)"
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-1">تسوق حسب السعر</h3>
            <p className="text-sm text-slate-500">اختر الفئة السعرية المناسبة لميزانيتك</p>
          </div>
          <a href="/gift-results" className="text-sm text-blue-600 hover:underline flex items-center">
            عرض الكل
            <ArrowRight className="w-3.5 h-3.5 mr-1" />
          </a>
        </div>
        
        <Swiper
          slidesPerView="auto"
          spaceBetween={16}
          freeMode={true}
          modules={[FreeMode, Autoplay]}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
          }}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          style={{ 
            paddingBottom: "20px",
            paddingTop: "10px"
          }}
        >
          {priceCategories.map((category, index) => (
            <SwiperSlide 
              key={index} 
              style={{ 
                width: "auto", 
                height: "auto"
              }}
            >
              <motion.div
                variants={cardVariants}
                initial="inactive"
                animate={activeIndex === index || hoveredIndex === index ? "active" : "inactive"}
                whileTap="tap"
                onClick={() => handlePriceRangeClick(category.minPrice, category.maxPrice)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-slate-100"
                style={{ 
                  width: "220px",
                  height: "140px",
                  position: "relative"
                }}
              >
                {/* Decorative elements */}
                <div className={`h-1.5 bg-gradient-to-r ${category.gradient}`}></div>
                <div 
                  className="absolute top-0 right-0 w-24 h-24 opacity-5 rounded-full"
                  style={{ 
                    background: `radial-gradient(circle, ${category.color.replace('bg-', '')} 0%, transparent 70%)`,
                    transform: "translate(30%, -30%)"
                  }}
                ></div>
                
                <div className="p-4 flex flex-col h-full justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${category.gradient} flex items-center justify-center text-white shadow-md`}>
                      {category.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-slate-800 mb-1">{category.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2">{category.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                      {category.maxPrice} ج.م
                    </span>
                    <motion.div 
                      initial={{ x: 5, opacity: 0 }}
                      animate={{ 
                        x: hoveredIndex === index ? 0 : 5, 
                        opacity: hoveredIndex === index ? 1 : 0 
                      }}
                      className="text-xs text-blue-600 font-medium flex items-center"
                    >
                      تسوق الآن
                      <ArrowRight className="w-3 h-3 mr-1" />
                    </motion.div>
                  </div>
                </div>
                
                {/* Decorative sparkle effect on hover */}
                <AnimatePresence>
                  {hoveredIndex === index && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute top-2 right-2"
                    >
                      <Sparkles className="w-4 h-4 text-yellow-400" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
        
        {/* Custom pagination dots */}
        <div className="flex justify-center gap-1.5 mt-2">
          {priceCategories.map((_, index) => (
            <motion.div
              key={index}
              className="w-2 h-2 rounded-full bg-slate-300"
              animate={{
                backgroundColor: activeIndex === index ? "#6366f1" : "#cbd5e1",
                scale: activeIndex === index ? 1.2 : 1
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default PriceRangeSwiper
