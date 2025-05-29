export const AuthErrorMessages = {
  LOGIN: {
    INVALID_CREDENTIALS: 'رقم الهاتف أو كلمة المرور غير صحيحة',
    USER_NOT_FOUND: 'لم يتم العثور على حساب بهذا الرقم',
    ACCOUNT_DISABLED: 'تم تعطيل الحساب. يرجى التواصل مع الدعم',
    INVALID_PASSWORD: 'كلمة المرور غير صحيحة',
    MISSING_FIELDS: 'يرجى إدخال جميع البيانات المطلوبة',
    TOO_MANY_ATTEMPTS: 'تم تجاوز عدد محاولات تسجيل الدخول. يرجى المحاولة لاحقاً',
    SERVER_ERROR: 'حدث خطأ في النظام. يرجى المحاولة مرة أخرى',
  },
  LOGOUT: {
    SUCCESS: 'تم تسجيل الخروج بنجاح',
    SESSION_NOT_FOUND: 'لم يتم العثور على الجلسة',
    SERVER_ERROR: 'حدث خطأ أثناء تسجيل الخروج',
  },
  REGISTER: {
    PHONE_EXISTS: 'رقم الهاتف مسجل مسبقاً',
    EMAIL_EXISTS: 'البريد الإلكتروني مسجل مسبقاً',
    WEAK_PASSWORD: 'كلمة المرور ضعيفة. يجب أن تحتوي على 8 أحرف على الأقل',
    SUCCESS: 'تم إنشاء الحساب بنجاح',
    INVALID_PHONE: 'رقم الهاتف غير صالح',
  }
} as const;
