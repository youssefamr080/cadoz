"use client"

import { useEffect } from "react"
import GiftContainer from "../../components/gift/gift-container"
import GiftStepSwitcher from "../../components/gift/gift-step-switcher"
import { GiftProvider } from "../../context/GiftContext"
import { motion, useReducedMotion } from "framer-motion"
import { Gift, Heart, ShoppingBag, Sparkles, Package, Truck } from "lucide-react"
import { giftTheme } from "../../components/gift/lib/gift-theme"
import { useToast } from "../../components/gift/hooks/use-toast"


const GiftPage = () => {
  const shouldReduceMotion = useReducedMotion()
  const { toast } = useToast()

  // تتبع مشاهدة الصفحة
  useEffect(() => {
    // تتبع مشاهدة الصفحة (يمكن استخدامه مع أدوات التحليلات)
    if (typeof window !== "undefined" && "gtag" in window) {
      const gtag = window.gtag
      gtag("event", "page_view", {
        page_title: "Gift Customization",
        page_location: window.location.href,
        page_path: "/gift",
      })
    }

    // عرض رسالة ترحيبية
    toast({
      title: "مرحبًا بك في صفحة تخصيص الهدايا",
      description: "يمكنك الآن تصميم هديتك المميزة بكل سهولة",
      variant: "default",
    })
  }, [toast])

  // إعدادات الحركة للصفحة بأكملها
  const pageVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: shouldReduceMotion ? 0.1 : 0.8,
        ease: "easeOut",
        staggerChildren: shouldReduceMotion ? 0 : 0.2,
      },
    },
    exit: { opacity: 0, transition: { duration: shouldReduceMotion ? 0.1 : 0.5 } },
  }

  // إعدادات الحركة للأقسام الفرعية
  const sectionVariants = {
    initial: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 30 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0.1 : 0.6, ease: "easeOut" },
    },
  }

  // ميزات الهدايا
  const giftFeatures = [
    {
      icon: <Heart className="w-4 h-4" aria-hidden="true" />,
      text: "هدايا مميزة",
      ariaLabel: "ميزة: هدايا مميزة",
    },
    {
      icon: <ShoppingBag className="w-4 h-4" aria-hidden="true" />,
      text: "منتجات فاخرة",
      ariaLabel: "ميزة: منتجات فاخرة",
    },
    {
      icon: <Gift className="w-4 h-4" aria-hidden="true" />,
      text: "تغليف احترافي",
      ariaLabel: "ميزة: تغليف احترافي",
    },
  ]

  // خطوات عمل خدمة الهدايا
  const giftSteps = [
    {
      step: "1",
      title: "اختر المنتجات",
      desc: "اختر من مجموعة متنوعة من الشوكولاتة والحلويات",
      icon: <ShoppingBag className="w-5 h-5" aria-hidden="true" />,
    },
    {
      step: "2",
      title: "أضف الصندوق والتغليف",
      desc: "اختر صندوق هدية مناسب وتغليف مميز",
      icon: <Package className="w-5 h-5" aria-hidden="true" />,
    },
    {
      step: "3",
      title: "أكمل الطلب",
      desc: "راجع طلبك وأكمل عملية الشراء",
      icon: <Truck className="w-5 h-5" aria-hidden="true" />,
    },
  ]

  return (
    <GiftProvider>
      <motion.div
        className={`min-h-screen flex flex-col ${giftTheme.gradients.light} overflow-hidden`}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        suppressHydrationWarning
      >


        {/* المحتوى الرئيسي */}
        <main className="flex-grow py-6 md:py-10">
          <div className="w-full max-w-[100%] mx-auto px-3 sm:px-4 lg:px-6">
            {/* العنوان */}
            <motion.div 
              className="text-center mb-6 md:mb-10" 
              variants={sectionVariants} 
              role="banner"
              suppressHydrationWarning
            >
              <div className="inline-flex items-center justify-center p-2 bg-white rounded-full shadow-md mb-4">
                <div className={`${giftTheme.gradients.primary} text-white p-2 rounded-full`}>
                  <Gift className="w-6 h-6" aria-hidden="true" />
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-4 tracking-tight">
                اصنع هديتك المميزة
              </h1>
              <p className="max-w-2xl mx-auto text-gray-600 text-lg">
                صمم هدية فريدة من نوعها تناسب مناسبتك الخاصة مع مجموعة متنوعة من الخيارات المميزة
              </p>

              {/* ميزات سريعة */}
              <div className="flex flex-wrap justify-center gap-3 mt-5">
                {giftFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm text-sm text-gray-700"
                    aria-label={feature.ariaLabel}
                  >
                    <span className={`${giftTheme.gradients.primary} p-1.5 rounded-full text-white mr-2`}>
                      {feature.icon}
                    </span>
                    {feature.text}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* صندوق الهدايا */}
            <motion.section 
              className="mb-6 md:mb-8" 
              variants={sectionVariants} 
              aria-label="عرض الهدية"
              suppressHydrationWarning
            >
              <GiftContainer />
            </motion.section>

            {/* خطوات الاختيار */}
            <motion.section
              className="bg-white rounded-2xl shadow-xl mb-8 overflow-hidden"
              variants={sectionVariants}
              aria-label="خطوات تخصيص الهدية"
              suppressHydrationWarning
            >
              <GiftStepSwitcher />
            </motion.section>

            {/* معلومات إضافية */}
            <motion.section
              className="text-center max-w-5xl mx-auto mb-8 px-3"
              variants={sectionVariants}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              aria-labelledby="how-it-works"
              suppressHydrationWarning
            >
              <h2 id="how-it-works" className="text-xl font-bold text-gray-800 mb-3">
                كيف تعمل خدمة الهدايا؟
              </h2>
              <p className="text-gray-600 mb-6">
                اختر المنتجات التي تريدها، وصندوق الهدية المناسب، وإكسسوارات الزينة، ثم أضف تغليفًا مميزًا. سنقوم بتجهيز
                هديتك بعناية فائقة وتوصيلها إلى العنوان المطلوب.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {giftSteps.map((item, index) => (
                  <div
                    key={index}
                    className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                  >
                    <div
                      className={`${giftTheme.gradients.primary} w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-3`}
                      aria-hidden="true"
                    >
                      {item.step}
                    </div>
                    <div className="flex items-center justify-center mb-2">
                      <span className="bg-indigo-100 p-2 rounded-full text-indigo-600">{item.icon}</span>
                    </div>
                    <h3 className="font-bold text-gray-800 mb-1">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* زر العودة للأعلى */}
            <motion.div
              className="fixed bottom-6 right-6 z-50"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 }}
            >
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className={`${giftTheme.gradients.primary} p-3 rounded-full shadow-lg text-white hover:shadow-xl transition-all duration-300`}
                aria-label="العودة إلى أعلى الصفحة"
              >
                <Sparkles className="w-5 h-5" aria-hidden="true" />
              </button>
            </motion.div>
          </div>
        </main>


      </motion.div>
    </GiftProvider>
  )
}


export default GiftPage
