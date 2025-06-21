"use client"

import { useState, useEffect } from "react"
import { ShoppingCart, AlertCircle, Heart } from "lucide-react"
import { toast } from "react-toastify"
import ProductColorSelector from "./product-color-selector"
import { useAuth } from "../../providers/AuthProvider"

interface ProductActionsProps {
  productId: number
  productName: string
  productImage: string
  productPrice: number
  stock: number
  colors?: string[]
  isInWishlist?: boolean
  onAddToCart: (quantity: number, color?: string) => void
  onAddToWishlist: (product: WishlistProduct) => void
  onRemoveFromWishlist: (productId: number) => void
}

interface WishlistProduct {
  id: number
  name: string
  image: string
  price: number
}

export default function ProductActions({
  productId,
  productName,
  productImage,
  productPrice,
  stock,
  colors = [],
  isInWishlist = false,
  onAddToCart,
  onAddToWishlist,
  onRemoveFromWishlist,
}: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState<string>("")
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const isOutOfStock = stock === 0
  const { user } = useAuth()
  const [sessionId] = useState(
    () => localStorage.getItem("sessionId") || `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
  )

  // تخزين معرف الجلسة في localStorage إذا لم يكن موجودًا
  useEffect(() => {
    if (!localStorage.getItem("sessionId")) {
      localStorage.setItem("sessionId", sessionId)
    }
  }, [sessionId])

  const changeQuantity = (amount: number) => {
    setQuantity((prev) => {
      const newValue = prev + amount
      // Ensure quantity is between 1 and stock
      return Math.max(1, Math.min(newValue, stock || 10))
    })
  }

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error("المنتج غير متوفر حالياً", { position: "bottom-right" })
      return
    }

    // Check if color is required but not selected
    if (colors.length > 0 && !selectedColor) {
      toast.warning("الرجاء اختيار اللون", { position: "bottom-right" })
      return
    }

    setIsAddingToCart(true)

    // تسجيل إضافة المنتج للسلة
    if (user?.id) {
      fetch("/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          productId,
          action: "add_to_cart",
          sessionId,
          quantity,
          context: {
            color: selectedColor,
            price: productPrice,
            fromProductPage: true,
          },
        }),
      }).catch((error) => console.error("Error recording add to cart:", error))
    }

    // Simulate adding to cart with delay
    setTimeout(() => {
      onAddToCart(quantity, selectedColor)
      setIsAddingToCart(false)
    }, 600)
  }

  const handleToggleWishlist = () => {
    // تسجيل إضافة/إزالة المنتج من المفضلة
    if (user?.id) {
      fetch("/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          productId,
          action: "favorite",
          sessionId,
          context: {
            action: isInWishlist ? "remove" : "add",
            fromProductPage: true,
          },
        }),
      }).catch((error) => console.error("Error recording wishlist action:", error))
    }

    if (isInWishlist) {
      onRemoveFromWishlist(productId)
    } else {
      onAddToWishlist({
        id: productId,
        name: productName,
        image: productImage,
        price: productPrice,
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Color selector */}
      {colors.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-xl">
          <ProductColorSelector colors={colors} selectedColor={selectedColor} onChange={setSelectedColor} />
        </div>
      )}

      {/* Quantity selector */}
      <div className="bg-gray-50 p-4 rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-700 font-medium">الكمية:</span>
          <div className="flex items-center border border-gray-300 rounded-lg bg-white">
            <button
              onClick={() => changeQuantity(-1)}
              className={`px-3 py-2 text-lg border-r rtl:border-r-0 rtl:border-l border-gray-300 hover:bg-gray-100 transition ${
                isOutOfStock ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isOutOfStock}
            >
              -
            </button>
            <span className="px-4 py-2 font-medium min-w-[40px] text-center">{quantity}</span>
            <button
              onClick={() => changeQuantity(1)}
              className={`px-3 py-2 text-lg border-l rtl:border-l-0 rtl:border-r border-gray-300 hover:bg-gray-100 transition ${
                isOutOfStock ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isOutOfStock}
            >
              +
            </button>
          </div>
        </div>

        {/* Stock indicator */}
        {!isOutOfStock && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">المتوفر في المخزون</span>
              <span className="text-sm font-medium">{stock} قطعة</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${
                  stock < 5 ? "bg-red-500" : stock < 20 ? "bg-amber-500" : "bg-green-500"
                }`}
                style={{ width: `${Math.min(100, (stock / 50) * 100)}%` }}
              ></div>
            </div>
            {stock < 5 && <p className="text-xs text-red-600 mt-1">كمية محدودة متبقية!</p>}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAddingToCart}
            className={`w-full px-6 py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition duration-300 shadow-sm ${
              isOutOfStock
                ? "bg-gray-400 cursor-not-allowed text-white"
                : isAddingToCart
                  ? "bg-amber-400 text-white"
                  : "bg-amber-500 hover:bg-amber-600 text-white hover:shadow-md"
            }`}
          >
            {isOutOfStock ? (
              <>
                <AlertCircle className="w-5 h-5" /> غير متوفر حالياً
              </>
            ) : isAddingToCart ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                جاري الإضافة...
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" /> أضف إلى السلة
              </>
            )}
          </button>

          <button
            onClick={handleToggleWishlist}
            className={`w-full px-6 py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition duration-300 ${
              isInWishlist
                ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            <Heart className={`w-5 h-5 ${isInWishlist ? "fill-red-500 text-red-500" : ""}`} />
            <span>{isInWishlist ? "في المفضلة" : "أضف للمفضلة"}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
