import React, { useState } from "react";
import { addInspirationComment } from "@/lib/actions/inspiration-actions";

interface Comment {
  _id: string;
  userId: string;
  userName: string;
  comment: string;
  createdAt: string;
}

interface InspirationCommentsProps {
  inspirationId: string;
  comments: Comment[];
  userId: string | null;
  userName: string | null;
  onCommentAdded: (comment: Comment) => void;
}

export default function InspirationComments({ inspirationId, comments, userId, userName, onCommentAdded }: InspirationCommentsProps) {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setError("يجب تسجيل الدخول لإضافة تعليق.");
      return;
    }
    if (!comment.trim()) {
      setError("لا يمكن إرسال تعليق فارغ.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const newComment = await addInspirationComment(inspirationId, userId, comment, userName || undefined);
      // تحويل من نوع Prisma إلى النوع المتوقع
      const convertedComment: Comment = {
        _id: newComment.id,
        userId: newComment.userId,
        userName: newComment.userName,
        comment: newComment.comment,
        createdAt: newComment.createdAt.toISOString()
      };
      onCommentAdded(convertedComment);
      setComment("");
    } catch {
      setError("حدث خطأ أثناء إضافة التعليق.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-2 mb-4">
        <textarea
          className="w-full max-w-xl rounded border px-2 py-1 min-h-[48px]"
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="اكتب تعليقك هنا..."
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-1 bg-amber-600 text-white rounded hover:bg-amber-700 transition"
        >
          {loading ? "جاري الإرسال..." : "إرسال التعليق"}
        </button>
        {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
      </form>
      <div className="space-y-3">
        {comments.length === 0 && <div className="text-gray-500 text-center">لا توجد تعليقات بعد.</div>}
        {comments.map(c => (
          <div key={c._id} className="bg-white rounded-lg shadow p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-amber-700">{c.userName}</span>
              <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleString()}</span>
            </div>
            <div className="text-gray-800 text-sm">{c.comment}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
