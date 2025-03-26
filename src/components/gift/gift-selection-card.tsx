"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { X, Check, ShoppingBag } from "lucide-react"
import { giftTheme } from "../gift/lib/gift-theme"
import Image from "next/image"

// تعريف أنواع البيانات
interface Item {
  id: string
  name: string
  price: number
  image: string
  description?: string
  category: string
}

interface GiftSelectionCardProps {
  item: Item
  isSelected: boolean
  onClick: () => void
  onRemove: () => void
  variant?: "primary" | "secondary" | "accent"
  compact?: boolean // إضافة خاصية للبطاقات الصغيرة
}

const GiftSelectionCard = ({
  item,
  isSelected,
  onClick,
  onRemove,
  variant = "primary",
  compact = false,
}: GiftSelectionCardProps) => {
  const [isHovered, setIsHovered] = useState(false)

  // تحديد الألوان بناءً على النوع
  const getColors = () => {
    switch (variant) {
      case "primary":
        return {
          bg: giftTheme.colors.primary.light,
          border: giftTheme.colors.primary.border,
          text: giftTheme.colors.primary.text,
          button: giftTheme.colors.primary.default,
          buttonHover: giftTheme.colors.primary.hover,
          selectedBg: giftTheme.colors.primary.medium,
        }
      case "secondary":
        return {
          bg: giftTheme.colors.secondary.light,
          border: giftTheme.colors.secondary.border,
          text: giftTheme.colors.secondary.text,
          button: giftTheme.colors.secondary.default,
          buttonHover: giftTheme.colors.secondary.hover,
          selectedBg: giftTheme.colors.secondary.medium,
        }
      case "accent":
        return {
          bg: giftTheme.colors.accent.light,
          border: giftTheme.colors.accent.border,
          text: giftTheme.colors.accent.text,
          button: giftTheme.colors.accent.default,
          buttonHover: giftTheme.colors.accent.hover,
          selectedBg: giftTheme.colors.accent.medium,
        }
      default:
        return {
          bg: giftTheme.colors.primary.light,
          border: giftTheme.colors.primary.border,
          text: giftTheme.colors.primary.text,
          button: giftTheme.colors.primary.default,
          buttonHover: giftTheme.colors.primary.hover,
          selectedBg: giftTheme.colors.primary.medium,
        }
    }
  }

  const colors = getColors()

  // تحديد أحجام البطاقة بناءً على خاصية compact
  const cardSizes = compact
    ? {
        card: "max-w-[140px] min-h-[180px]",
        image: "h-[80px]",
        title: "text-xs",
        price: "text-xs",
        button: "h-7 text-xs",
      }
    : {
        card: "max-w-[220px] min-h-[240px]",
        image: "h-[120px]",
        title: "text-sm",
        price: "text-sm",
        button: "h-9 text-sm",
      }

  return (
    <motion.div
      className={`${cardSizes.card} bg-white rounded-xl overflow-hidden shadow-sm border transition-all duration-200 ${
        isSelected ? `border-2 ${colors.border} ${colors.selectedBg}` : "border-gray-100 hover:border-gray-200"
      }`}
      whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        <div className={`w-full ${cardSizes.image} relative overflow-hidden bg-gray-50`}>
          {item.image ? (
            <Image
              src={item.image || "/placeholder.svg"}
              alt={item.name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-300 hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <ShoppingBag className="w-8 h-8 text-gray-400" />
            </div>
          )}
          {isSelected && (
            <div className="absolute top-2 left-2 bg-white rounded-full p-1 shadow-md">
              <Check className={`w-4 h-4 ${colors.text}`} />
            </div>
          )}
        </div>

        <div className="p-2 sm:p-3">
          <h3 className={`font-bold ${colors.text} mb-1 ${cardSizes.title} line-clamp-1`}>{item.name}</h3>
          <p className={`text-gray-600 ${cardSizes.price} mb-2`}>
            {item.price.toLocaleString()} <span className="text-xs">ج.م</span>
          </p>

          <button
            onClick={onClick}
            className={`w-full ${cardSizes.button} rounded-lg font-medium transition-colors flex items-center justify-center ${
              isSelected
                ? "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                : `${colors.button} text-white hover:${colors.buttonHover}`
            }`}
          >
            {isSelected ? "تم الاختيار" : "اختيار"}
          </button>
        </div>

        {isSelected && isHovered && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-red-50 transition-colors"
            aria-label="إزالة"
          >
            <X className="w-3 h-3 text-red-500" />
          </button>
        )}
      </div>
    </motion.div>
  )
}

export default GiftSelectionCard

