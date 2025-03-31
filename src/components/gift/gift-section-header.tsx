"use client"

import { motion } from "framer-motion"
import { giftTheme } from "../../components/gift/lib/gift-theme"
import type { ReactNode } from "react"

interface GiftSectionHeaderProps {
  title: string
  icon: ReactNode
  variant?: "primary" | "secondary" | "accent"
  description?: string
}

const GiftSectionHeader = ({ title, icon, variant = "primary", description }: GiftSectionHeaderProps) => {
  // تحديد الألوان بناءً على النوع
  const getColors = () => {
    switch (variant) {
      case "primary":
        return {
          bg: giftTheme.colors.primary.light,
          text: giftTheme.colors.primary.text,
          border: giftTheme.colors.primary.border,
          iconBg: giftTheme.colors.primary.medium,
        }
      case "secondary":
        return {
          bg: giftTheme.colors.secondary.light,
          text: giftTheme.colors.secondary.text,
          border: giftTheme.colors.secondary.border,
          iconBg: giftTheme.colors.secondary.medium,
        }
      case "accent":
        return {
          bg: giftTheme.colors.accent.light,
          text: giftTheme.colors.accent.text,
          border: giftTheme.colors.accent.border,
          iconBg: giftTheme.colors.accent.medium,
        }
      default:
        return {
          bg: giftTheme.colors.primary.light,
          text: giftTheme.colors.primary.text,
          border: giftTheme.colors.primary.border,
          iconBg: giftTheme.colors.primary.medium,
        }
    }
  }

  const colors = getColors()

  return (
    <motion.div
      className={`mb-5 flex items-center ${colors.bg} p-3 rounded-xl border ${colors.border}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`p-2 rounded-lg ${colors.iconBg} mr-3`}>{icon}</div>
      <div>
        <h2 className={`text-lg font-bold ${colors.text}`}>{title}</h2>
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </div>
    </motion.div>
  )
}

export default GiftSectionHeader

