"use client"

import { useState, useEffect } from "react"
import { Check } from "lucide-react"

interface ProductColorSelectorProps {
  colors: string[]
  selectedColor: string
  onChange: (color: string) => void
  className?: string
}

export default function ProductColorSelector({
  colors,
  selectedColor,
  onChange,
  className = "",
}: ProductColorSelectorProps) {
  const [selected, setSelected] = useState<string>(selectedColor || "")

  useEffect(() => {
    // إذا لم يكن هناك لون محدد وتوجد ألوان، اختر اللون الأول افتراضيًا
    if (!selected && colors.length > 0) {
      setSelected(colors[0])
      onChange(colors[0])
    }
  }, [colors, selected, onChange])

  // تحويل أسماء الألوان إلى قيم CSS
  const getColorValue = (colorName: string): string => {
    const colorMap: Record<string, string> = {
      أحمر: "#ef4444",
      أخضر: "#22c55e",
      أزرق: "#3b82f6",
      أصفر: "#eab308",
      أسود: "#000000",
      أبيض: "#ffffff",
      رمادي: "#6b7280",
      بني: "#92400e",
      برتقالي: "#f97316",
      وردي: "#ec4899",
      بنفسجي: "#8b5cf6",
      ذهبي: "#d4af37",
      فضي: "#c0c0c0",
    }

    return colorMap[colorName] || colorName
  }

  const handleColorChange = (color: string) => {
    setSelected(color)
    onChange(color)
  }

  if (!colors || colors.length === 0) {
    return null
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex justify-between items-center">
        <div className="text-base font-medium text-gray-800">اختر اللون:</div>
        {selected && (
          <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
            <div
              className="w-4 h-4 rounded-full border border-gray-300"
              style={{ backgroundColor: getColorValue(selected) }}
            ></div>
            <span className="text-sm font-medium text-blue-700">{selected}</span>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-3 mt-2">
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => handleColorChange(color)}
            className={`relative group transition-all duration-300 transform ${
              selected === color ? "scale-110" : "hover:scale-105"
            }`}
            aria-label={`اختر اللون ${color}`}
          >
            <div
              className={`w-14 h-14 rounded-full transition-all duration-300 ${
                selected === color
                  ? "ring-4 ring-blue-300 shadow-lg"
                  : "border-2 border-gray-200 hover:border-blue-200 hover:shadow-md"
              }`}
              style={{ backgroundColor: getColorValue(color) }}
            >
              {selected === color && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <Check
                    className={`w-6 h-6 ${["أبيض", "أصفر", "ذهبي"].includes(color) ? "text-gray-800" : "text-white"}`}
                  />
                </span>
              )}
            </div>
            <span
              className={`block mt-1 text-xs text-center ${
                selected === color ? "font-bold text-blue-700" : "text-gray-600"
              }`}
            >
              {color}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

