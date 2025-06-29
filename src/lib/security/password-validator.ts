export interface PasswordValidationResult {
  isValid: boolean;
  score: number;
  feedback: {
    warning?: string;
    suggestions: string[];
  };
}

export function validatePassword(password: string): PasswordValidationResult {
  // Minimum length check
  if (password.length < 6) {
    return {
      isValid: false,
      score: 0,
      feedback: {
        warning: "كلمة المرور قصيرة جداً",
        suggestions: ["استخدم على الأقل 6 أحرف"]
      }
    };
  }

  // Simple strength check
  let score = 1;
  
  // Check for different character types
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  
  // Length bonus
  if (password.length >= 8) score++;
  
  const isValid = score >= 2; // Require at least basic strength
  
  const suggestions = [];
  if (!/[a-z]/.test(password)) suggestions.push("أضف حروف صغيرة");
  if (!/[A-Z]/.test(password)) suggestions.push("أضف حروف كبيرة");
  if (!/[0-9]/.test(password)) suggestions.push("أضف أرقام");
  if (password.length < 8) suggestions.push("اجعل كلمة المرور أطول");
  
  return {
    isValid,
    score: Math.min(score, 4),
    feedback: {
      warning: !isValid ? "كلمة المرور ضعيفة" : undefined,
      suggestions
    }
  };
}
