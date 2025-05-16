// Comment type definitions for the application
// Supporting both string IDs and MongoDB ObjectId format

export interface Comment {
  _id: string;
  userId: string;
  userName: string;
  comment: string;
  createdAt: string;
}

// MongoDB format of comments with ObjectId and date
export interface MongoDBComment {
  _id: { $oid: string } | string;
  userId: string;
  userName: string;
  comment: string;
  createdAt: { $date: { $numberLong: string } } | string;
}

// Helper function to convert MongoDB comment to application Comment
export function normalizeComment(comment: MongoDBComment): Comment {
  return {
    _id: typeof comment._id === 'string' ? comment._id : comment._id.$oid,
    userId: comment.userId,
    userName: comment.userName,
    comment: comment.comment,
    createdAt: typeof comment.createdAt === 'string' 
      ? comment.createdAt 
      : new Date(parseInt(comment.createdAt.$date.$numberLong)).toISOString()
  };
}

// Helper function to normalize an array of MongoDB comments
export function normalizeComments(comments: MongoDBComment[]): Comment[] {
  return comments.map(normalizeComment);
}
