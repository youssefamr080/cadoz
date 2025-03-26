"use client"

import React, { useEffect, useState, useMemo, useCallback } from "react"
import Image from "next/image"
import { useGift } from "../../context/GiftContext"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-toastify"
import { X, Plus, Minus, Gift, ShoppingBag, Sparkles } from "lucide-react"
import { giftTheme } from "../gift/lib/gift-theme"

const GiftContainer = () => {
  const { state, dispatch, totalPrice } = useGift()
  const [isClient, setIsClient] = useState(false)

  // استخدام القيم المحسوبة مسبقًا من السياق
  const cart = useMemo(() => state?.cart || [], [state?.cart])
  const uniqueItemsCount = useMemo(() => cart.length, [cart])
  const hasItems = useMemo(() => cart.length > 0, [cart])
  // totalPrice متاح مباشرة من السياق ويتضمن أسعار الصندوق والتغليف

  // Hydration safety - avoid rendering until client-side
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Handle item removal with memoized callback
  const handleRemoveItem = useCallback(
    (itemId: string, itemName: string) => {
      dispatch({ type: "REMOVE_FROM_CART", payload: itemId })
      toast.success(`تم حذف ${itemName} بنجاح!`, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
    },
    [dispatch],
  )

  // Handle quantity updates with memoized callback and validation
  const handleUpdateQuantity = useCallback(
    (itemId: string, newQuantity: number, itemName: string) => {
      if (newQuantity <= 0) return

      // Limit maximum quantity to prevent abuse
      const safeQuantity = Math.min(newQuantity, 99)

      dispatch({
        type: "UPDATE_QUANTITY",
        payload: { id: itemId, quantity: safeQuantity },
      })

      // Only show toast for significant changes to avoid spam
      if (Math.abs(newQuantity - cart.find((item) => item.id === itemId)?.quantity || 0) > 1) {
        toast.info(`تم تحديث كمية ${itemName} إلى ${safeQuantity}`, {
          position: "bottom-right",
          autoClose: 1500,
          hideProgressBar: true,
        })
      }
    },
    [dispatch, cart],
  )

  // Early return during SSR to prevent hydration errors
  if (!isClient) return null

  return (
    <motion.div
      className={`relative ${giftTheme.gradients.light} p-4 md:p-6 ${giftTheme.rounded.lg} ${giftTheme.shadows.lg} border border-indigo-200 min-h-[200px] w-full`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      role="region"
      aria-label="صندوق الهدايا"
    >
      {/* Item count badge */}
      <div className="absolute -top-3 -right-3 z-10">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500 rounded-full blur-sm opacity-30 scale-110"></div>
          <div
            className={`relative ${giftTheme.gradients.primary} text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg`}
          >
            <span className="text-sm font-bold">{uniqueItemsCount}</span>
          </div>
        </div>
      </div>

      {/* Total price badge */}
      {hasItems && (
        <div className="absolute -top-3 -left-3 z-10">
          <div className="relative">
            <div className="absolute inset-0 bg-pink-500 rounded-full blur-sm opacity-30 scale-110"></div>
            <div
              className={`relative ${giftTheme.gradients.secondary} text-white px-3 py-1 rounded-full flex items-center justify-center shadow-lg`}
            >
              <ShoppingBag className="w-3 h-3 mr-1" />
              <span className="text-xs font-bold">{totalPrice.toLocaleString()} ج.م</span>
            </div>
          </div>
        </div>
      )}

      {/* Main content section */}
      <div className="pt-4">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-white p-2 rounded-full shadow-md mr-3">
            <Gift className="w-6 h-6 text-indigo-500" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            صندوق الهدايا
          </h2>
        </div>

        <AnimatePresence mode="wait">
          {!hasItems ? (
            <motion.div
              className="text-center py-6 flex flex-col items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-indigo-100 shadow-inner max-w-md mx-auto">
                <motion.div
                  className="p-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full mb-4 mx-auto w-20 h-20 flex items-center justify-center"
                  animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, 0, -5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                >
                  <Gift className="w-10 h-10 text-indigo-500" />
                </motion.div>
                <p className="text-indigo-700 font-medium mb-2">لا توجد عناصر في الصندوق</p>
                <p className="text-indigo-600/80 text-sm max-w-[250px] mx-auto">
                  أضف بعض العناصر من الأقسام أدناه لإنشاء هديتك المميزة
                </p>
                <motion.div
                  className="mt-4 flex justify-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center text-xs text-indigo-500">
                    <Sparkles className="w-4 h-4 mr-1" />
                    <span>اختر من الأقسام أدناه</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <div className="overflow-x-auto pb-2">
              <div className="flex flex-nowrap gap-3 min-w-full">
                {cart.map((item) => (
                  <motion.div
                    key={item.id}
                    className="relative flex-shrink-0 w-[160px] bg-white rounded-xl shadow-md p-3 border border-indigo-100 flex flex-col"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                    transition={{ duration: 0.2 }}
                  >
                    <button
                      onClick={() => handleRemoveItem(item.id, item.data.name)}
                      className="absolute top-1 right-1 z-10 p-1 bg-red-100/90 rounded-full backdrop-blur-sm hover:bg-red-200 transition-colors duration-200"
                      aria-label={`إزالة ${item.data.name}`}
                    >
                      <X className="w-3.5 h-3.5 text-red-600" />
                    </button>

                    <div className="flex-1 mb-2 relative flex items-center justify-center">
                      {item.data?.image && (
                        <div className="relative w-full h-[100px]">
                          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg"></div>
                          <Image
                            src={item.data.image || "/placeholder.svg?height=200&width=200"}
                            alt={item.data.name}
                            fill
                            className="object-contain p-2"
                            sizes="160px"
                            loading="lazy"
                          />
                        </div>
                      )}
                    </div>

                    <div className="text-center mb-2">
                      <h3 className="text-sm font-bold text-gray-800 mb-0.5 line-clamp-1">{item.data.name}</h3>
                      <p className="text-xs text-indigo-600 font-medium">{item.data.price.toLocaleString()} ج.م</p>
                    </div>

                    <div className="flex items-center justify-center gap-2 mt-auto">
                      <motion.button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1, item.data.name)}
                        disabled={item.quantity <= 1}
                        className={`p-1 rounded-full ${
                          item.quantity > 1
                            ? "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        } transition-colors duration-200`}
                        whileTap={{ scale: 0.9 }}
                        aria-label="تقليل الكمية"
                      >
                        <Minus className="w-3 h-3" />
                      </motion.button>
                      <span className="text-xs font-bold text-indigo-600 w-5 text-center">{item.quantity}</span>
                      <motion.button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1, item.data.name)}
                        className="p-1 bg-indigo-100 text-indigo-600 rounded-full hover:bg-indigo-200 transition-colors duration-200"
                        whileTap={{ scale: 0.9 }}
                        aria-label="زيادة الكمية"
                      >
                        <Plus className="w-3 h-3" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default React.memo(GiftContainer)

