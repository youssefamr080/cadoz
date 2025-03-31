"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Gift, ChevronRight, Package, Sparkles } from "lucide-react"
import { Button } from "../ui/button"

export default function GiftPromoBanner() {
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 rounded-xl p-4 mb-6 border border-purple-100 shadow-sm overflow-hidden relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Decorative elements */}
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-pink-100 rounded-full opacity-30"></div>
      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-purple-100 rounded-full opacity-30"></div>

      <div className="relative flex flex-col md:flex-row items-center gap-4">
        <div className="flex-shrink-0 bg-white p-3 rounded-full shadow-sm">
          <Gift
            className={`w-10 h-10 ${isHovered ? "text-pink-500" : "text-purple-500"} transition-colors duration-300`}
          />
        </div>

        <div className="flex-1 text-center md:text-right">
          <h3 className="font-bold text-lg text-purple-800">حول مشترياتك إلى هدايا مميزة!</h3>
          <p className="text-purple-600 mt-1">أضف تغليف هدايا فاخر، بطاقة إهداء شخصية، وصندوق هدايا مميز</p>

          <div className="flex flex-wrap gap-3 mt-3 justify-center md:justify-start">
            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full text-xs text-purple-700 shadow-sm">
              <Package className="w-3 h-3" />
              <span>صناديق فاخرة</span>
            </div>
            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full text-xs text-pink-700 shadow-sm">
              <Sparkles className="w-3 h-3" />
              <span>تغليف مميز</span>
            </div>
            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full text-xs text-purple-700 shadow-sm">
              <Gift className="w-3 h-3" />
              <span>بطاقات إهداء</span>
            </div>
          </div>
        </div>

        <Button
          onClick={() => router.push("/gift")}
          className={`${isHovered ? "bg-pink-600 hover:bg-pink-700" : "bg-purple-600 hover:bg-purple-700"} transition-colors duration-300 shadow-md hover:shadow-lg`}
        >
          <span>تجهيز كهدية</span>
          <ChevronRight className="w-4 h-4 mr-1" />
        </Button>
      </div>
    </div>
  )
}

