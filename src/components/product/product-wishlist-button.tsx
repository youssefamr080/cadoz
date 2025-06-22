"use client"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { Button } from "../ui/button"
import { toast } from "react-toastify"

interface ProductWishlistButtonProps {
  productId: string
  productName: string
  productImage: string
  productPrice: number
  initialIsFavorite?: boolean
  onAddToWishlist?: (product: WishlistProduct) => void
  onRemoveFromWishlist?: (productId: string) => void
}

// تعريف نوع محدد للمنتج في المفضلة
interface WishlistProduct {
  id: string
  name: string
  image: string
  price: number
}

export default function ProductWishlistButton({
  productId,
  productName,
  productImage,
  productPrice,
  initialIsFavorite = false,
  onAddToWishlist,
  onRemoveFromWishlist,
}: ProductWishlistButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [isAnimating, setIsAnimating] = useState(false)

  // Update state if prop changes
  useEffect(() => {
    setIsFavorite(initialIsFavorite)
  }, [initialIsFavorite])

  const handleToggleWishlist = () => {
    // Start animation
    setIsAnimating(true)

    // Toggle favorite state
    const newState = !isFavorite
    setIsFavorite(newState)

    // Call appropriate callback
    if (newState) {
      onAddToWishlist?.({
        id: productId,
        name: productName,
        image: productImage,
        price: productPrice,
      })
      toast.success("تمت الإضافة إلى المفضلة!", { position: "bottom-right" })
    } else {
      onRemoveFromWishlist?.(productId)
      toast.info("تمت الإزالة من المفضلة!", { position: "bottom-right" })
    }

    // End animation after delay
    setTimeout(() => setIsAnimating(false), 500)
  }

  return (
    <Button
      onClick={handleToggleWishlist}
      variant={isFavorite ? "default" : "outline"}
      className={`relative overflow-hidden transition-all duration-300 ${
        isFavorite ? "bg-red-600 hover:bg-red-700 text-white" : "bg-white hover:bg-gray-50 text-gray-700"
      }`}
    >
      <Heart
        className={`w-5 h-5 mr-2 transition-all duration-300 ${isAnimating ? "scale-150" : "scale-100"} ${
          isFavorite ? "fill-white text-white" : "fill-none text-gray-700"
        }`}
      />
      <span>{isFavorite ? "في المفضلة" : "أضف للمفضلة"}</span>

      {/* Animation overlay */}
      {isAnimating && <span className="absolute inset-0 bg-red-500 opacity-20 animate-ping"></span>}
    </Button>
  )
}

