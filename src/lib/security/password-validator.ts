import zxcvbn from 'zxcvbn';

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
  if (password.length < 8) {
    return {
      isValid: false,
      score: 0,
      feedback: {
        warning: "Password is too short",
        suggestions: ["Use at least 8 characters"]
      }
    };
  }

  // Use zxcvbn for comprehensive password strength checking
  const result = zxcvbn(password);
  
  // Convert zxcvbn result to our format
  return {
    isValid: result.score >= 3, // Require at least medium strength
    score: result.score,
    feedback: {
      warning: result.feedback.warning || undefined,
      suggestions: result.feedback.suggestions
    }
  };
}
