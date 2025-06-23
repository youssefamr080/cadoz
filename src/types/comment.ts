// Comment type definitions for the application
// Using Prisma types for consistency

export type { 
  InspirationComment as Comment 
} from "../../prisma/generated/client"

// Legacy interface for backward compatibility
export interface LegacyComment {
  _id: string;
  userId: string;
  userName: string;
  comment: string;
  createdAt: string;
}

// Helper function to convert Prisma comment to legacy format if needed
export function toLegacyComment(comment: Record<string, unknown>): LegacyComment {
  return {
    _id: comment.id as string,
    userId: comment.userId as string,
    userName: comment.userName as string,
    comment: comment.comment as string,
    createdAt: (comment.createdAt as Date).toISOString()
  };
}

// Helper function to normalize an array of comments
export function toLegacyComments(comments: Record<string, unknown>[]): LegacyComment[] {
  return comments.map(toLegacyComment);
}

// للتوافق مع الكود الموجود
export const normalizeComments = toLegacyComments
