"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Minus, ShoppingBag } from "lucide-react"
import { giftTheme } from "../../components/gift/lib/gift-theme"
import Image from "next/image"
import { useInView } from "react-intersection-observer"

// تعريف أنواع البيانات
interface Product {
  id: string
  name: string
  price: number
  image: string
  description?: string
  category: string
  tags?: string[]
}

interface GiftProductCardProps {
  product: Product
  isInCart: boolean
  quantity: number
  onClick: () => void
  variant?: "primary" | "secondary" | "accent"
  "aria-label"?: string
}

const GiftProductCard = ({
  product,
  isInCart,
  quantity,
  onClick,
  variant = "primary",
  "aria-label": ariaLabel,
}: GiftProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })
  const [imageLoaded, setImageLoaded] = useState(false)

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

  // تحميل الصورة مسبقًا عند ظهور البطاقة في العرض
  useEffect(() => {
    if (inView && product.image) {
      const img = new window.Image()
      img.src = product.image
      img.onload = () => setImageLoaded(true)
    }
  }, [inView, product.image])

  return (
    <motion.div
      ref={ref}
      className={`max-w-[200px] bg-white rounded-xl overflow-hidden shadow-sm border transition-all duration-200 ${
        isInCart ? `border-2 ${colors.border}` : "border-gray-100 hover:border-gray-200"
      }`}
      whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        <div className="w-full h-[140px] relative overflow-hidden bg-gray-50">
          {product.image ? (
            <Image
              src={product.image || "/placeholder.svg"}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className={`object-cover transition-transform duration-300 hover:scale-110 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <ShoppingBag className="w-8 h-8 text-gray-400" aria-hidden="true" />
            </div>
          )}
          {isInCart && (
            <div className="absolute top-2 left-2 bg-white rounded-full p-1.5 shadow-md">
              <span className={`text-xs font-bold ${colors.text}`}>{quantity}</span>
            </div>
          )}
          {product.tags && product.tags.length > 0 && (
            <div className="absolute bottom-2 right-2">
              <div className="bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
                {product.tags[0]}
              </div>
            </div>
          )}
        </div>

        <div className="p-3">
          <h3 className={`font-bold ${colors.text} mb-1 text-sm line-clamp-1`}>{product.name}</h3>
          <p className="text-gray-600 text-sm mb-3">
            {product.price.toLocaleString()} <span className="text-xs">ج.م</span>
          </p>

          <button
            onClick={onClick}
            className={`w-full h-9 rounded-lg font-medium transition-colors flex items-center justify-center ${
              isInCart
                ? "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                : `${colors.button} text-white hover:${colors.buttonHover}`
            }`}
            aria-label={ariaLabel || `إضافة ${product.name} إلى الهدية - ${product.price} جنيه`}
          >
            {isInCart ? (
              <div className="flex items-center">
                <Minus className="w-4 h-4 mr-1" aria-hidden="true" />
                <span>{quantity}</span>
                <Plus className="w-4 h-4 ml-1" aria-hidden="true" />
              </div>
            ) : (
              <span>إضافة</span>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default GiftProductCard

