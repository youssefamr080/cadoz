import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth.config";
import { validateSession } from "./security/session-manager";

export interface SessionValidationResult {
  isValid: boolean;
  session?: {
    user: {
      id: string;
      name: string;
      email?: string;
      role: 'user' | 'admin';
    };
  };
  error?: string;
}

export async function validateServerSession(): Promise<SessionValidationResult> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return {
        isValid: false,
        error: "No active session found"
      };
    }

    const isValid = await validateSession(session.user.id);
    if (!isValid) {
      return {
        isValid: false,
        error: "Session expired or invalid"
      };
    }

    return {
      isValid: true,
      session
    };
  } catch (error) {
    console.error("[VALIDATOR] Error validating session:", error);
    return {
      isValid: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

export function validateClientSession(): SessionValidationResult {
  try {
    const userData = localStorage.getItem('userData');
    if (!userData) {
      return {
        isValid: false,
        error: "No user data found"
      };
    }

    const user = JSON.parse(userData);
    if (!user?.id || !user?.name || !user?.role) {
      return {
        isValid: false,
        error: "Invalid user data"
      };
    }

    return {
      isValid: true,
      session: { user }
    };
  } catch (error) {
    console.error("[VALIDATOR] Error validating client session:", error);
    return {
      isValid: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
