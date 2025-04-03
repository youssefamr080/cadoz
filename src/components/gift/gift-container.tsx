"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useGift } from "../../context/GiftContext"
import { Gift, ShoppingBag, Package, Sparkles } from "lucide-react"
import { giftTheme } from "../../components/gift/lib/gift-theme"
import Image from "next/image"

const GiftContainer = () => {
  const { state, totalItems, totalPrice, isBoxSelected, isWrapSelected, isCartEmpty } = useGift()
  const [isVisible, setIsVisible] = useState(false)

  // تأخير ظهور العنصر للحصول على تأثير أفضل
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // تحديد حالة الهدية
  const giftStatus = isCartEmpty
    ? "empty"
    : isBoxSelected && isWrapSelected
      ? "complete"
      : isBoxSelected
        ? "box-only"
        : "items-only"

  // تحديد الرسالة المناسبة
  const getMessage = () => {
    switch (giftStatus) {
      case "empty":
        return "لم تقم بإضافة أي منتجات بعد"
      case "complete":
        return "هديتك جاهزة! يمكنك الآن إضافة المزيد من المنتجات أو المتابعة للدفع"
      case "box-only":
        return "اختر المنتجات والتغليف لإكمال هديتك"
      case "items-only":
        return "لا تنسَ اختيار صندوق وتغليف مناسب لهديتك"
      default:
        return "صمم هديتك المميزة"
    }
  }

  // تحديد الأيقونة المناسبة
  const getIcon = () => {
    switch (giftStatus) {
      case "empty":
        return <ShoppingBag className="w-6 h-6 text-gray-400" aria-hidden="true" />
      case "complete":
        return <Gift className="w-6 h-6 text-indigo-500" aria-hidden="true" />
      case "box-only":
        return <Package className="w-6 h-6 text-indigo-500" aria-hidden="true" />
      case "items-only":
        return <Sparkles className="w-6 h-6 text-pink-500" aria-hidden="true" />
      default:
        return <Gift className="w-6 h-6 text-indigo-500" aria-hidden="true" />
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="bg-white rounded-xl shadow-xl overflow-hidden border border-indigo-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-4 sm:p-6 flex flex-col md:flex-row items-center gap-6">
            {/* صورة الهدية */}
            <div className="relative w-full md:w-1/3 aspect-square max-w-[300px]">
              <div className={`absolute inset-0 ${giftTheme.gradients.light} rounded-xl`} />
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                {giftStatus === "empty" ? (
                  <div className="text-8xl">🎁</div>
                ) : (
                  <div className="relative w-full h-full">
                    <Image
                      src={state.selectedBox?.image || "/placeholder.svg?height=300&width=300"}
                      alt="صندوق الهدية"
                      fill
                      className="object-contain p-4"
                    />
                    {state.cart.length > 0 && (
                      <motion.div
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                        initial={{ scale: 0, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                      >
                        <div className="text-4xl">🍫</div>
                      </motion.div>
                    )}
                    {isWrapSelected && (
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.7 }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                      >
                        <Image
                          src={state.selectedWrap?.image || "/placeholder.svg?height=300&width=300"}
                          alt="تغليف الهدية"
                          fill
                          className="object-contain p-2"
                        />
                      </motion.div>
                    )}
                  </div>
                )}
              </motion.div>
            </div>

            {/* معلومات الهدية */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-full ${giftTheme.colors.primary.light}`}>{getIcon()}</div>
                <h2 className="text-xl font-bold text-gray-800">هديتك المميزة</h2>
              </div>

              <p className="text-gray-600 mb-4">{getMessage()}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">عدد المنتجات</div>
                  <div className="text-xl font-bold text-indigo-600">{totalItems}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">السعر الإجمالي</div>
                  <div className="text-xl font-bold text-indigo-600">{totalPrice.toLocaleString()} ج.م</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {state.selectedBox && (
                  <div className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-sm flex items-center">
                    <Package className="w-4 h-4 mr-1" aria-hidden="true" />
                    <span>{state.selectedBox.name}</span>
                  </div>
                )}
                {state.selectedWrap && (
                  <div className="bg-pink-50 text-pink-600 px-3 py-1 rounded-full text-sm flex items-center">
                    <Sparkles className="w-4 h-4 mr-1" aria-hidden="true" />
                    <span>{state.selectedWrap.name}</span>
                  </div>
                )}
                {state.cart.length > 0 && (
                  <div className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-sm flex items-center">
                    <ShoppingBag className="w-4 h-4 mr-1" aria-hidden="true" />
                    <span>{state.cart.length} منتج</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* شريط التقدم */}
          <div className="bg-gray-50 p-4 border-t border-gray-100">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>البداية</span>
              <span>اختيار المنتجات</span>
              <span>اختيار الصندوق</span>
              <span>اختيار التغليف</span>
              <span>الملخص</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <motion.div
                className={`h-full ${giftTheme.gradients.primary}`}
                initial={{ width: "0%" }}
                animate={{
                  width:
                    giftStatus === "empty"
                      ? "10%"
                      : giftStatus === "items-only"
                        ? "40%"
                        : giftStatus === "box-only"
                          ? "70%"
                          : "100%",
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default GiftContainer
