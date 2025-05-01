import React, { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { likeInspiration, dislikeInspiration } from "@/lib/actions/inspiration-actions";
import { toast } from "react-toastify";

interface InspirationReactionsProps {
  inspirationId: string;
  likes: number;
  dislikes: number;
  likedBy: string[];
  dislikedBy: string[];
  userId: string | null;
  onReact: (type: "like" | "dislike") => void;
}

export default function InspirationReactions({ inspirationId, likes, dislikes, likedBy, dislikedBy, userId, onReact }: InspirationReactionsProps) {
  const [loading, setLoading] = useState<"like" | "dislike" | null>(null);

  const hasLiked = userId && likedBy.includes(userId);
  const hasDisliked = userId && dislikedBy.includes(userId);

  const handleLike = async () => {
    if (!userId) return;
    
    setLoading("like");
    try {
      // API now handles both adding and removing likes
      const result = await likeInspiration(inspirationId, userId);
      
      // Update parent component with the updated state from the server
      // This ensures UI is in sync with the database
      onReact("like");
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("حدث خطأ أثناء تسجيل الإعجاب");
    } finally {
      setLoading(null);
    }
  };

  const handleDislike = async () => {
    if (!userId) return;
    
    setLoading("dislike");
    try {
      // API now handles both adding and removing dislikes
      const result = await dislikeInspiration(inspirationId, userId);
      
      // Update parent component with the updated state from the server
      // This ensures UI is in sync with the database
      onReact("dislike");
    } catch (error) {
      console.error("Error toggling dislike:", error);
      toast.error("حدث خطأ أثناء تسجيل عدم الإعجاب");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex items-center gap-4 mt-2">
      <button
        className={`flex items-center gap-1 px-3 py-1 rounded transition ${hasLiked ? "bg-green-600 text-white" : "bg-green-50 text-green-700 hover:bg-green-100"}`}
        onClick={handleLike}
        disabled={loading === "like" || !userId}
        title={userId ? (hasLiked ? "إلغاء الإعجاب" : "إعجاب") : "سجل الدخول أولاً"}
      >
        <ThumbsUp className="w-5 h-5" />
        <span>{likes}</span>
      </button>
      <button
        className={`flex items-center gap-1 px-3 py-1 rounded transition ${hasDisliked ? "bg-red-600 text-white" : "bg-red-50 text-red-700 hover:bg-red-100"}`}
        onClick={handleDislike}
        disabled={loading === "dislike" || !userId}
        title={userId ? (hasDisliked ? "إلغاء عدم الإعجاب" : "عدم إعجاب") : "سجل الدخول أولاً"}
      >
        <ThumbsDown className="w-5 h-5" />
        <span>{dislikes}</span>
      </button>
      {!userId && (
        <div className="text-sm text-red-600 mt-2 text-center">يجب تسجيل الدخول للتفاعل مع الإلهام (إعجاب أو عدم إعجاب).</div>
      )}
    </div>
  );
}
