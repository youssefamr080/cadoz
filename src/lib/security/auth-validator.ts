import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth.config";
import { getUserSessions } from "./session-manager";

export interface SecurityValidationResult {
  isValid: boolean;
  userId?: string;
  sessionId?: string;
  error?: string;
  details?: {
    ipAddress?: string;
    userAgent?: string;
    lastActiveAt?: Date;
  };
}

export async function validateRequestSecurity(
  request: Request,
  requireSession: boolean = true
): Promise<SecurityValidationResult> {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // 1. التحقق من الجلسة إذا كان مطلوباً
    if (requireSession) {
      const session = await getServerSession(authOptions);
      
      if (!session?.user?.id) {
        return {
          isValid: false,
          error: "No active session found",
          details: { ipAddress: ip, userAgent }
        };
      }

      // 2. التحقق من صحة الجلسة في قاعدة البيانات
      const sessions = await getUserSessions(session.user.id);
      const activeSession = sessions[0];

      if (!activeSession) {
        return {
          isValid: false,
          error: "No valid session found",
          details: { ipAddress: ip, userAgent }
        };
      }

      // 3. التحقق من تطابق معلومات الجهاز
      if (activeSession.ipAddress !== ip || activeSession.userAgent !== userAgent) {
        return {
          isValid: false,
          error: "Device mismatch detected",
          details: {
            ipAddress: ip,
            userAgent,
            lastActiveAt: activeSession.lastActiveAt
          }
        };
      }

      return {
        isValid: true,
        userId: session.user.id,
        sessionId: activeSession.sessionId,
        details: {
          ipAddress: ip,
          userAgent,
          lastActiveAt: activeSession.lastActiveAt
        }
      };
    }

    // إذا لم يكن التحقق من الجلسة مطلوباً
    return {
      isValid: true,
      details: { ipAddress: ip, userAgent }
    };
  } catch (error) {
    console.error("[SECURITY] Error in security validation:", error);
    return {
      isValid: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

export function validateRateLimit(): boolean {
  // TODO: Implement rate limiting logic
  // This should use Redis or a similar solution for distributed rate limiting
  return true;
}

interface UserData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'user' | 'admin';
  image?: string;
  [key: string]: unknown;
}

export function sanitizeUserData(userData: UserData): UserData {
  const allowedFields = ['id', 'name', 'email', 'phone', 'role', 'image'];
  const sanitized: UserData = {
    id: userData.id,
    name: userData.name,
    role: userData.role
  };

  for (const field of allowedFields) {
    if (userData[field] !== undefined) {
      sanitized[field] = userData[field];
    }
  }

  return sanitized;
} 