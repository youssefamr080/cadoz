"use client"

import { useState, useEffect } from "react"
import { Star, ThumbsUp, ThumbsDown, MessageSquare, StarHalf } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Textarea } from "../../components/ui/textarea"
import { Skeleton } from "../../components/ui/skeleton"
import { useToast } from "../../components/gift/hooks/use-toast"
import { Avatar, AvatarFallback } from "../../components/ui/avatar"

interface Review {
  _id: string
  productId: number
  userId: string
  userName: string
  rating: number
  comment: string
  createdAt: string
  helpful: number
  notHelpful: number
}

interface ProductReviewsProps {
  productId: number
  userId?: string
  userName?: string
}

export default function ProductReviews({
  productId,
  userId = "guest-user", // تعيين قيمة افتراضية للمستخدم الزائر
  userName = "زائر",
}: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState({ averageRating: 0, count: 0 })
  const [loading, setLoading] = useState(true)
  const [userRating, setUserRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const { toast } = useToast()

  // Handle helpful/not helpful clicks
  const handleHelpfulClick = async (reviewId: string, type: "helpful" | "notHelpful") => {
    try {
      const response = await fetch("/api/reviews", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reviewId,
          type,
          userId,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Update local state
        setReviews((prevReviews) =>
          prevReviews.map((review) =>
            review._id === reviewId
              ? { ...review, [type]: review[type] + 1 }
              : review
          )
        )

        toast({
          title: "تم بنجاح",
          description: type === "helpful" ? "تم تحديث التقييم كمفيد" : "تم تحديث التقييم كغير مفيد",
        })
      } else {
        toast({
          title: "تنبيه",
          description: data.message || "حدث خطأ أثناء تحديث التقييم",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating review:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث التقييم",
        variant: "destructive",
      })
    }
  }

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        console.log("Fetching reviews for productId:", productId)
        const response = await fetch(`/api/reviews?productId=${productId}`)
        const data = await response.json()

        console.log("Reviews API response:", data)

        if (data.success) {
          setReviews(data.data.reviews)
          setStats(data.data.stats)
        } else {
          console.error("Error in reviews response:", data.message)
        }
      } catch (error) {
        console.error("Error fetching reviews:", error)
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchReviews()
    }
  }, [productId])

  // Submit review
  const handleSubmitReview = async () => {
    if (!userRating) {
      toast({
        title: "خطأ",
        description: "يرجى تحديد تقييم",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    console.log("Submitting review:", {
      productId,
      userId,
      userName,
      rating: userRating,
      comment,
    })

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          userId,
          userName,
          rating: userRating,
          comment,
        }),
      })

      const data = await response.json()
      console.log("Review submission response:", data)

      if (data.success) {
        toast({
          title: "تم بنجاح",
          description: "تم إضافة تقييمك بنجاح",
        })

        // Refresh reviews
        const refreshResponse = await fetch(`/api/reviews?productId=${productId}`)
        const refreshData = await refreshResponse.json()

        if (refreshData.success) {
          setReviews(refreshData.data.reviews)
          setStats(refreshData.data.stats)
        }

        // Reset form
        setUserRating(0)
        setComment("")
        setShowForm(false)
      } else {
        toast({
          title: "خطأ",
          description: data.message || "حدث خطأ أثناء إضافة التقييم",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting review:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة التقييم",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  // Rating distribution
  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0]

    reviews.forEach((review) => {
      const ratingIndex = Math.floor(review.rating) - 1
      if (ratingIndex >= 0 && ratingIndex < 5) {
        distribution[ratingIndex]++
      }
    })

    return distribution.reverse() // 5 to 1 stars
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Skeleton className="h-40 w-full" />
          </div>
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <MessageSquare className="w-5 h-5" /> تقييمات المنتج
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Rating summary */}
        <div className="md:col-span-1 bg-gray-50 p-4 rounded-lg">
          <div className="text-center mb-4">
            <div className="text-4xl font-bold text-amber-500">{stats.averageRating.toFixed(1)}</div>
            <div className="flex justify-center my-2">
              {[1, 2, 3, 4, 5].map((star) => {
                if (star <= Math.floor(stats.averageRating)) {
                  return <Star key={star} className="w-5 h-5 fill-amber-400 text-amber-400" />
                } else if (star === Math.floor(stats.averageRating) + 1 && stats.averageRating % 1 >= 0.5) {
                  return <StarHalf key={star} className="w-5 h-5 fill-amber-400 text-amber-400" />
                } else {
                  return <Star key={star} className="w-5 h-5 text-gray-300" />
                }
              })}
            </div>
            <div className="text-sm text-gray-500">
              {stats.count} {stats.count === 1 ? "تقييم" : "تقييمات"}
            </div>
          </div>

          {/* Rating distribution */}
          <div className="space-y-2">
            {getRatingDistribution().map((count, index) => {
              const stars = 5 - index
              const percentage = stats.count > 0 ? Math.round((count / stats.count) * 100) : 0

              return (
                <div key={stars} className="flex items-center text-sm">
                  <span className="w-12 text-gray-600">{stars} نجوم</span>
                  <div className="flex-1 mx-2 bg-gray-200 rounded-full h-2.5">
                    <div className="bg-amber-400 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                  </div>
                  <span className="w-8 text-gray-500 text-xs">{percentage}%</span>
                </div>
              )
            })}
          </div>

          {/* Add review button */}
          <div className="mt-6">
            <Button onClick={() => setShowForm(!showForm)} variant="outline" className="w-full">
              {showForm ? "إلغاء" : "أضف تقييمك"}
            </Button>
          </div>
        </div>

        {/* Reviews and form */}
        <div className="md:col-span-2">
          {/* Review form */}
          {showForm && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-medium mb-3">أضف تقييمك</h3>

              <div className="flex items-center mb-4 gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setUserRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= (hoveredRating || userRating) ? "fill-amber-400 text-amber-400" : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
                <span className="text-sm text-gray-500 mr-2">{userRating > 0 ? `(${userRating} نجوم)` : ""}</span>
              </div>

              <Textarea
                placeholder="اكتب تعليقك (اختياري)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mb-4"
                rows={4}
              />

              <Button onClick={handleSubmitReview} disabled={submitting || !userRating}>
                {submitting ? "جاري الإرسال..." : "إرسال التقييم"}
              </Button>
            </div>
          )}

          {/* Reviews list */}
          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review._id} className="border-b border-gray-100 pb-6 last:border-0">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{review.userName}</h4>
                        <span className="text-xs text-gray-500">{formatDate(review.createdAt)}</span>
                      </div>

                      <div className="flex my-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>

                      {review.comment && <p className="text-gray-700 mt-2 text-sm">{review.comment}</p>}

                      <div className="flex items-center gap-4 mt-3">
                        <button 
                          onClick={() => handleHelpfulClick(review._id, "helpful")}
                          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>مفيد ({review.helpful})</span>
                        </button>
                        <button 
                          onClick={() => handleHelpfulClick(review._id, "notHelpful")}
                          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                        >
                          <ThumbsDown className="w-3 h-3" />
                          <span>غير مفيد ({review.notHelpful})</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-700">لا توجد تقييمات بعد</h3>
              <p className="text-gray-500 mt-1">كن أول من يقيم هذا المنتج</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

