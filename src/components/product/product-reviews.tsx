"use client"

import { useState, useEffect } from "react"
import { Star, ThumbsUp, ThumbsDown, MessageSquare, StarHalf, AlertCircle } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Textarea } from "../../components/ui/textarea"
import { Skeleton } from "../../components/ui/skeleton"
import { useToast } from "../../hooks/use-toast"
import { Avatar, AvatarFallback } from "../../components/ui/avatar"
import { useAuth } from "../../providers/AuthProvider"
import LoginModal from "../auth/login-modal"

interface Review {
  _id: string
  productId: string
  userId: string
  userName: string
  rating: number
  comment: string
  createdAt: string
  helpful: number
  notHelpful: number
  verified?: boolean
}

interface ProductReviewsProps {
  productId: string
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState({ averageRating: 0, count: 0 })
  const [loading, setLoading] = useState(true)
  const [userRating, setUserRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true)

        const response = await fetch(`/api/reviews?productId=${productId}${user?.id ? `&userId=${user.id}` : ""}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()

        if (data.success) {
          setReviews(data.data.reviews)
          setStats(data.data.stats)
        } else {
          throw new Error(data.message || "Failed to fetch reviews")
        }
      } catch (error) {
        console.error("Error fetching reviews:", error instanceof Error ? error.message : "Unknown error")
        setReviews([])
        setStats({ averageRating: 0, count: 0 })
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchReviews()
    }
  }, [productId, user])

  // Submit review
  const handleSubmitReview = async () => {
    if (!user) {
      setIsLoginModalOpen(true)
      return
    }

    if (!userRating) {
      toast({
        title: "خطأ",
        description: "يرجى تحديد تقييم",
        variant: "error",
      })
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          userId: user.id,
          userName: user.name,
          rating: userRating,
          comment,
        }),
      })

      const data = await response.json()

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
          variant: "error",
        })
      }
    } catch (error) {
      console.error("Error submitting review:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة التقييم",
        variant: "error",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Handle vote on review
  const handleVoteReview = async (reviewId: string, action: "helpful" | "notHelpful") => {
    if (!user) {
      setIsLoginModalOpen(true)
      return
    }

    try {
      const response = await fetch("/api/reviews", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reviewId,
          userId: user.id,
          action,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "تم بنجاح",
          description: "تم تسجيل تقييمك للمراجعة",
        })

        // Refresh reviews to update counts
        const refreshResponse = await fetch(`/api/reviews?productId=${productId}`)
        const refreshData = await refreshResponse.json()

        if (refreshData.success) {
          setReviews(refreshData.data.reviews)
        }
      } else {
        toast({
          title: "خطأ",
          description: data.message || "حدث خطأ أثناء تقييم المراجعة",
          variant: "error",
        })
      }
    } catch (error) {
      console.error("Error voting on review:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تقييم المراجعة",
        variant: "error",
      })
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

  // Handle login success
  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false)
    toast({
      title: "تم تسجيل الدخول بنجاح",
      description: "يمكنك الآن إضافة تقييمك",
    })
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

              {!user && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  <p className="text-amber-700 text-sm">يجب تسجيل الدخول لإضافة تقييم</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mr-auto text-amber-600 border-amber-200 hover:bg-amber-100"
                    onClick={() => setIsLoginModalOpen(true)}
                  >
                    تسجيل الدخول
                  </Button>
                </div>
              )}

              <div className="flex items-center mb-4 gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setUserRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="focus:outline-none"
                    disabled={!user}
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= (hoveredRating || userRating) ? "fill-amber-400 text-amber-400" : "text-gray-300"
                      } ${!user ? "opacity-50" : ""}`}
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
                disabled={!user}
              />

              <Button onClick={handleSubmitReview} disabled={submitting || !userRating || !user}>
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
                      <AvatarFallback
                        className={review.verified ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}
                      >
                        {review.userName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium flex items-center gap-1">
                          {review.userName}
                          {review.verified && (
                            <span className="bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded-full">مُتحقق</span>
                          )}
                        </h4>
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
                          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                          onClick={() => handleVoteReview(review._id, "helpful")}
                          disabled={!user}
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>مفيد ({review.helpful})</span>
                        </button>
                        <button
                          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                          onClick={() => handleVoteReview(review._id, "notHelpful")}
                          disabled={!user}
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

      {/* Login Modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onSuccess={handleLoginSuccess} />
    </div>
  )
}
