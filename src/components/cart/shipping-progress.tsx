"use client"

import { useEffect, useState } from "react"
import { Truck } from "lucide-react"

interface ShippingProgressProps {
  subtotal: number
  freeShippingThreshold: number
}

export default function ShippingProgress({ subtotal, freeShippingThreshold }: ShippingProgressProps) {
  const [progress, setProgress] = useState(0)
  const [isEligible, setIsEligible] = useState(false)

  useEffect(() => {
    // حساب نسبة التقدم
    const calculatedProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100)
    setProgress(calculatedProgress)
    setIsEligible(subtotal >= freeShippingThreshold)
  }, [subtotal, freeShippingThreshold])

  // حساب المبلغ المتبقي للشحن المجاني
  const remainingAmount = Math.max(0, freeShippingThreshold - subtotal)

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 mb-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-blue-100 p-2 rounded-full">
          <Truck className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          {isEligible ? (
            <p className="font-medium text-green-600">مؤهل للشحن المجاني! 🎉</p>
          ) : (
            <p className="font-medium text-gray-700">
              أضف <span className="text-blue-600 font-bold">{remainingAmount.toFixed(2)} ج.م</span> للحصول على شحن مجاني
            </p>
          )}
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
        <div
          className={`h-2.5 rounded-full transition-all duration-1000 ease-out ${
            isEligible ? "bg-green-500" : "bg-blue-500"
          }`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="flex justify-between text-xs text-gray-500">
        <span>0 ج.م</span>
        <span>{freeShippingThreshold} ج.م</span>
      </div>
    </div>
  )
}

