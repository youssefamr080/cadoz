"use client"

import React from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { ShoppingBag, Star } from "lucide-react"
import { giftTheme } from "../gift/lib/gift-theme"

interface GiftProductCardProps {
  product: {
    id: string
    name: string
    price: number
    originalPrice?: number
    image: string
    isNew?: boolean
  }
  isInCart?: boolean
  quantity?: number
  onClick: () => void
  variant?: "primary" | "secondary" | "accent"
}

const GiftProductCard: React.FC<GiftProductCardProps> = ({
  product,
  isInCart = false,
  quantity = 0,
  onClick,
  variant = "primary",
}) => {
  // تحديد الألوان بناءً على التنويع
  const getColors = () => {
    switch (variant) {
      case "primary":
        return {
          bg: giftTheme.colors.primary.light,
          text: giftTheme.colors.primary.text,
          button: isInCart ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200" : giftTheme.buttons.primary,
          badge: "from-indigo-500 to-purple-500",
          counter: "bg-indigo-500",
        }
      case "secondary":
        return {
          bg: giftTheme.colors.secondary.light,
          text: giftTheme.colors.secondary.text,
          button: isInCart ? "bg-purple-100 text-purple-700 hover:bg-purple-200" : giftTheme.buttons.primary,
          badge: "from-purple-500 to-violet-500",
          counter: "bg-purple-500",
        }
      case "accent":
        return {
          bg: giftTheme.colors.accent.light,
          text: giftTheme.colors.accent.text,
          button: isInCart ? "bg-pink-100 text-pink-700 hover:bg-pink-200" : giftTheme.buttons.accent,
          badge: "from-pink-500 to-rose-500",
          counter: "bg-pink-500",
        }
      default:
        return {
          bg: giftTheme.colors.primary.light,
          text: giftTheme.colors.primary.text,
          button: isInCart ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200" : giftTheme.buttons.primary,
          badge: "from-indigo-500 to-purple-500",
          counter: "bg-indigo-500",
        }
    }
  }

  const colors = getColors()

  return (
    <motion.div
      className={`bg-white p-3 rounded-xl hover:shadow-lg ${giftTheme.transitions.default} ${
        isInCart ? giftTheme.cards.selected : "border border-gray-100"
      }`}
      whileHover={{ scale: 1.02, y: -3 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative mb-2">
        <div className={`relative h-28 w-full ${colors.bg} rounded-lg overflow-hidden`}>
          <Image
            src={product.image || "/placeholder.svg?height=200&width=200"}
            alt={product.name}
            width={200}
            height={200}
            className="w-full h-full object-contain p-2"
            loading="lazy"
          />
        </div>

        {product.isNew && (
          <div className="absolute -top-2 -right-2">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 rounded-full blur-sm opacity-30 scale-110"></div>
              <span
                className={`relative bg-gradient-to-r ${colors.badge} text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-md flex items-center`}
              >
                <Star className="w-3 h-3 mr-0.5 fill-white" />
                جديد
              </span>
            </div>
          </div>
        )}

        {isInCart && (
          <motion.div
            className="absolute top-1 left-1 bg-white/80 backdrop-blur-sm rounded-full p-0.5 shadow-sm"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            <div
              className={`${colors.counter} text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold`}
            >
              {quantity}
            </div>
          </motion.div>
        )}
      </div>

      <h4 className="font-bold text-gray-800 text-sm mb-0.5 truncate">{product.name}</h4>

      <div className="flex justify-between items-center mt-1 mb-2">
        <p className={`${colors.text} font-bold text-sm`}>{product.price.toLocaleString()} ج.م</p>
        {product.originalPrice && (
          <p className="text-gray-400 text-xs line-through">{product.originalPrice.toLocaleString()} ج.م</p>
        )}
      </div>

      <button
        onClick={onClick}
        className={`w-full py-1.5 rounded-lg font-medium text-xs flex items-center justify-center ${giftTheme.transitions.default} ${colors.button}`}
        aria-label={`إضافة ${product.name} إلى الهدية`}
      >
        <ShoppingBag className="w-3 h-3 ml-1" />
        {isInCart ? "إضافة المزيد" : "إضافة إلى الهدية"}
      </button>
    </motion.div>
  )
}

export default React.memo(GiftProductCard)

