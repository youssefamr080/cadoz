import React, { useState } from "react";
import { Star } from "lucide-react";
import { rateInspiration } from "@/lib/actions/inspiration-actions";

const ratingLabels = ["سيء جدًا", "سيء", "متوسط", "جيد", "ممتاز"];
function getStarColor(starValue: number, filled: boolean) {
  if (!filled) return "text-gray-300";
  if (starValue === 1) return "text-red-500 fill-red-400";
  if (starValue === 2) return "text-yellow-500 fill-yellow-400";
  if (starValue === 3) return "text-yellow-600 fill-yellow-500";
  if (starValue === 4) return "text-amber-400 fill-amber-400";
  return "text-green-500 fill-green-400";
}

interface InspirationStarsProps {
  inspirationId: string;
  userId: string | null;
  userRating?: number;
  avgRating: number;
  reviews: number;
  onRated: (newRating: number, newReviews: number) => void;
}

export default function InspirationStars({ inspirationId, userId, userRating = 0, avgRating, reviews, onRated }: InspirationStarsProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [localRating, setLocalRating] = useState(userRating);
  const [showRatedMsg, setShowRatedMsg] = useState(false);

  // Handle toast fallback
  function showToast(msg: string) {
    // Type guard for window.toast
    if (typeof (window as unknown as { toast?: unknown }).toast === 'function') {
      (window as unknown as { toast: (msg: string, opts: { type: string }) => void }).toast(msg, { type: "info" });
    } else {
      window.alert(msg);
    }
  }

  const handleRate = async (rating: number) => {
    if (!userId) {
      showToast("سجل الدخول لتقييم الإلهام");
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      const result = await rateInspiration(inspirationId, userId, rating);
      setLocalRating(rating);
      setShowRatedMsg(true);
      onRated(result.rating, result.reviews);
      setTimeout(() => setShowRatedMsg(false), 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1 justify-center mb-2">
      <div className="flex items-center gap-1 relative">
        {Array.from({ length: 5 }).map((_, i) => {
          const starValue = i + 1;
          const filled = hovered !== null ? starValue <= hovered : (localRating ? starValue <= localRating : starValue <= Math.round(avgRating));
          return (
            <button
              key={i}
              type="button"
              onMouseEnter={() => setHovered(starValue)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => handleRate(starValue)}
              disabled={loading}
              aria-label={userId ? `قيّم بـ ${starValue} نجمة` : "سجل الدخول لتقييم الإلهام"}
              className={`focus:outline-none transition-transform duration-150 ${hovered === starValue ? "scale-125" : ""}`}
              style={{ position: 'relative' }}
            >
              <Star className={`w-8 h-8 drop-shadow ${getStarColor(starValue, filled)} transition-all duration-200 ${hovered === starValue ? "animate-pulse" : ""}`} />
              {/* Spinner overlay */}
              {loading && localRating === starValue && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-4 h-4 animate-spin text-amber-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                </span>
              )}
            </button>
          );
        })}
        {/* Tooltip for rating label */}
        {(hovered || localRating) && (
          <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs bg-amber-50 text-amber-700 rounded px-2 py-1 shadow border border-amber-100 pointer-events-none">
            {hovered ? ratingLabels[hovered - 1] : (localRating ? `تقييمك: ${ratingLabels[localRating - 1]}` : "")}
          </span>
        )}
      </div>
      {/* Average and reviews */}
      <div className="flex items-center gap-2 mt-1">
        <span className="text-base font-bold text-amber-700">
          {avgRating.toFixed(2)} / 5
        </span>
        <span className="text-xs text-gray-500">({reviews} تقييم)</span>
      </div>
      {/* User already rated msg */}
      {showRatedMsg && <span className="text-green-600 text-xs mt-1">تم تسجيل تقييمك بنجاح!</span>}
      {/* Not logged in message */}
      {!userId && <span className="text-xs text-red-600 mt-1">سجل الدخول لتقييم الإلهام</span>}
    </div>
  );
}
