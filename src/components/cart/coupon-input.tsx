"use client"

import { useState } from "react"
import { Tag, Check, X, Loader2 } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { toast } from "react-toastify"

interface CouponInputProps {
  onApply: (code: string) => Promise<boolean>
  onClear: () => void
  currentCode: string
  isValid: boolean
  discountPercentage: number
}

export default function CouponInput({ onApply, onClear, currentCode, isValid, discountPercentage }: CouponInputProps) {
  const [code, setCode] = useState(currentCode || "")
  const [isLoading, setIsLoading] = useState(false)
  const [availableCoupons] = useState([
    { code: "WELCOME15", description: "خصم 15% للعملاء الجدد" },
    { code: "FREESHIP", description: "شحن مجاني لجميع المنتجات" },
    { code: "CADOZ10", description: "خصم 10% على جميع المنتجات" },
  ])

  const handleApply = async () => {
    if (!code.trim()) {
      toast.error("الرجاء إدخال كود الخصم")
      return
    }

    setIsLoading(true)
    try {
      const success = await onApply(code)
      if (!success) {
        // تم عرض رسالة الخطأ في الدالة onApply
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setCode("")
    onClear()
  }

  const applyCoupon = (couponCode: string) => {
    setCode(couponCode)
    setTimeout(() => {
      onApply(couponCode)
    }, 100)
  }

  return (
    <div className="space-y-3">
      {isValid ? (
        <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200">
          <div className="flex items-center gap-2">
            <div className="bg-green-100 p-1 rounded-full">
              <Check className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-700">{currentCode}</p>
              <p className="text-xs text-green-600">تم تطبيق خصم {(discountPercentage * 100).toFixed(0)}%</p>
            </div>
          </div>
          <Button onClick={handleClear} variant="ghost" size="sm" className="text-gray-500 hover:text-red-500">
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="أدخل كود الخصم"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="pl-9 pr-3"
                dir="ltr"
              />
            </div>
            <Button
              onClick={handleApply}
              disabled={isLoading || !code.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "تطبيق"}
            </Button>
          </div>

          {availableCoupons.length > 0 && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
              <p className="text-sm font-medium text-blue-700 mb-2">كوبونات متاحة لك:</p>
              <div className="space-y-2">
                {availableCoupons.map((coupon) => (
                  <div
                    key={coupon.code}
                    className="flex justify-between items-center bg-white p-2 rounded border border-blue-100 hover:border-blue-300 transition-colors cursor-pointer"
                    onClick={() => applyCoupon(coupon.code)}
                  >
                    <div>
                      <p className="font-medium text-gray-800">{coupon.code}</p>
                      <p className="text-xs text-gray-500">{coupon.description}</p>
                    </div>
                    <Button size="sm" variant="ghost" className="text-blue-600 hover:bg-blue-50">
                      استخدام
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

