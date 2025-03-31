"use client"

import { useState, useEffect } from "react"
import { Star, StarHalf } from "lucide-react"
import { Skeleton } from "../ui/skeleton"

interface ProductRatingProps {
  productId: number
  showCount?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

export default function ProductRating({
  productId,
  showCount = true,
  size = "md",
  className = "",
}: ProductRatingProps) {
  const [rating, setRating] = useState<number>(0)
  const [count, setCount] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const response = await fetch(`/api/reviews?productId=${productId}`)
        const data = await response.json()

        if (data.success) {
          setRating(data.data.stats.averageRating || 0)
          setCount(data.data.stats.count || 0)
        }
      } catch (error) {
        console.error("Error fetching rating:", error)
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchRating()
    }
  }, [productId])

  // Size classes
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  }

  const starSize = sizeClasses[size]
  const textSize = size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base"

  if (loading) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <Skeleton className="h-5 w-24" />
        {showCount && <Skeleton className="h-5 w-10 mr-2" />}
      </div>
    )
  }

  // If no ratings yet
  if (count === 0) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className={`${starSize} text-gray-300`} />
          ))}
        </div>
        {showCount && <span className={`${textSize} text-gray-500 mr-1`}>(لا توجد تقييمات)</span>}
      </div>
    )
  }

  // Calculate full and half stars
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => {
          if (star <= fullStars) {
            return <Star key={star} className={`${starSize} fill-amber-400 text-amber-400`} />
          } else if (star === fullStars + 1 && hasHalfStar) {
            return <StarHalf key={star} className={`${starSize} fill-amber-400 text-amber-400`} />
          } else {
            return <Star key={star} className={`${starSize} text-gray-300`} />
          }
        })}
      </div>
      {showCount && (
        <span className={`${textSize} text-gray-500 mr-1`}>
          ({rating.toFixed(1)}) {count} {count === 1 ? "تقييم" : "تقييمات"}
        </span>
      )}
    </div>
  )
}

