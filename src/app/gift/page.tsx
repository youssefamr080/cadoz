"use client"
import Header from "../../components/layout/Header"
import Footer from "../../components/layout/Footer"
import GiftContainer from "../../components/gift/gift-container"
import GiftStepSwitcher from "../../components/gift/gift-step-switcher"
import { GiftProvider } from "../../context/GiftContext"
import { motion } from "framer-motion"
import { Gift, Heart, ShoppingBag } from "lucide-react"
import { giftTheme } from "../../components/gift/lib/gift-theme"

const GiftPage = () => {
  // إعدادات الحركة للصفحة بأكملها
  const pageVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut", staggerChildren: 0.2 },
    },
    exit: { opacity: 0, transition: { duration: 0.5 } },
  }

  // إعدادات الحركة للأقسام الفرعية
  const sectionVariants = {
    initial: { opacity: 0, y: 30 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }

  return (
    <GiftProvider>
      <motion.div
        className={`min-h-screen flex flex-col ${giftTheme.gradients.light} overflow-hidden`}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {/* الهيدر */}
        <Header />

        {/* المحتوى الرئيسي */}
        <main className="flex-grow py-6 md:py-10">
          <div className="w-full max-w-[100%] mx-auto px-3 sm:px-4 lg:px-6">
            {/* العنوان */}
            <motion.div className="text-center mb-6 md:mb-10" variants={sectionVariants}>
              <div className="inline-flex items-center justify-center p-2 bg-white rounded-full shadow-md mb-4">
                <div className={`${giftTheme.gradients.primary} text-white p-2 rounded-full`}>
                  <Gift className="w-6 h-6" />
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
                {[
                  { icon: <Heart className="w-4 h-4" />, text: "هدايا مميزة" },
                  { icon: <ShoppingBag className="w-4 h-4" />, text: "منتجات فاخرة" },
                  { icon: <Gift className="w-4 h-4" />, text: "تغليف احترافي" },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm text-sm text-gray-700"
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
            <motion.section className="mb-6 md:mb-8" variants={sectionVariants}>
              <GiftContainer />
            </motion.section>

            {/* خطوات الاختيار */}
            <motion.section className="bg-white rounded-2xl shadow-xl mb-8 overflow-hidden" variants={sectionVariants}>
              <GiftStepSwitcher />
            </motion.section>

            {/* معلومات إضافية */}
            <motion.section
              className="text-center max-w-5xl mx-auto mb-8 px-3"
              variants={sectionVariants}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-3">كيف تعمل خدمة الهدايا؟</h2>
              <p className="text-gray-600 mb-6">
                اختر المنتجات التي تريدها، وصندوق الهدية المناسب، وإكسسوارات الزينة، ثم أضف تغليفًا مميزًا. سنقوم بتجهيز
                هديتك بعناية فائقة وتوصيلها إلى العنوان المطلوب.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { step: "1", title: "اختر المنتجات", desc: "اختر من مجموعة متنوعة من الشوكولاتة والحلويات" },
                  { step: "2", title: "أضف الصندوق والتغليف", desc: "اختر صندوق هدية مناسب وتغليف مميز" },
                  { step: "3", title: "أكمل الطلب", desc: "راجع طلبك وأكمل عملية الشراء" },
                ].map((item, index) => (
                  <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div
                      className={`${giftTheme.gradients.primary} w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-3`}
                    >
                      {item.step}
                    </div>
                    <h3 className="font-bold text-gray-800 mb-1">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.section>
          </div>
        </main>

        {/* الفوتر */}
        <Footer />
      </motion.div>
    </GiftProvider>
  )
}

export default GiftPage

