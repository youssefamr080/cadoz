import type React from "react"

interface GiftSectionHeaderProps {
  title: string
  icon: React.ReactNode
  variant?: "primary" | "secondary" | "accent"
}

const GiftSectionHeader: React.FC<GiftSectionHeaderProps> = ({ title, icon, variant = "primary" }) => {
  // تحديد الألوان بناءً على التنويع
  const getGradient = () => {
    switch (variant) {
      case "primary":
        return "from-indigo-600 to-purple-600"
      case "secondary":
        return "from-purple-600 to-violet-600"
      case "accent":
        return "from-pink-600 to-rose-600"
      default:
        return "from-indigo-600 to-purple-600"
    }
  }

  const getIconBg = () => {
    switch (variant) {
      case "primary":
        return "text-indigo-500"
      case "secondary":
        return "text-purple-500"
      case "accent":
        return "text-pink-500"
      default:
        return "text-indigo-500"
    }
  }

  return (
    <div className="flex items-center justify-center mb-6">
      <div className="bg-white p-2 rounded-full shadow-md mr-3">
        <div className={getIconBg()}>{icon}</div>
      </div>
      <h3 className={`text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${getGradient()}`}>{title}</h3>
    </div>
  )
}

export default GiftSectionHeader

