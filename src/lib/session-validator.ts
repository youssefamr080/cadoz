import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth.config";

export async function validateServerSession() {
  try {
    const session = await getServerSession(authOptions);
    return {
      isValid: !!session?.user,
      session
    };
  } catch (error) {
    console.error("Error validating session:", error);
    return {
      isValid: false,
      session: null
    };
  }
}

export function validateClientSession() {
  try {
    const userData = localStorage.getItem("userData");
    if (!userData) {
      return {
        isValid: false,
        user: null
      };
    }

    const user = JSON.parse(userData);
    return {
      isValid: !!user?.id,
      user
    };
  } catch (error) {
    console.error("Error validating client session:", error);
    return {
      isValid: false,
      user: null
    };
  }
}
