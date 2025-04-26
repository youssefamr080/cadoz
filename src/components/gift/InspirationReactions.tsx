import React, { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { likeInspiration, dislikeInspiration } from "@/lib/actions/inspiration-actions";

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
    if (!userId || hasLiked) return;
    setLoading("like");
    await likeInspiration(inspirationId, userId);
    setLoading(null);
    onReact("like");
  };

  const handleDislike = async () => {
    if (!userId || hasDisliked) return;
    setLoading("dislike");
    await dislikeInspiration(inspirationId, userId);
    setLoading(null);
    onReact("dislike");
  };

  return (
    <div className="flex items-center gap-4 mt-2">
      <button
        className={`flex items-center gap-1 px-3 py-1 rounded transition ${hasLiked ? "bg-green-600 text-white" : "bg-green-50 text-green-700 hover:bg-green-100"}`}
        onClick={handleLike}
        disabled={loading === "like" || !userId || hasLiked}
        title={userId ? (hasLiked ? "لقد قمت بالإعجاب" : "إعجاب") : "سجل الدخول أولاً"}
      >
        <ThumbsUp className="w-5 h-5" />
        <span>{likes}</span>
      </button>
      <button
        className={`flex items-center gap-1 px-3 py-1 rounded transition ${hasDisliked ? "bg-red-600 text-white" : "bg-red-50 text-red-700 hover:bg-red-100"}`}
        onClick={handleDislike}
        disabled={loading === "dislike" || !userId || hasDisliked}
        title={userId ? (hasDisliked ? "لقد قمت بعدم الإعجاب" : "عدم إعجاب") : "سجل الدخول أولاً"}
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
