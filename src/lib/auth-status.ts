export function checkAuthStatus() {
  // التحقق من وجود جلسة معتمدة
  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/check-session');
      const data = await response.json();
      return data.user !== null;
    } catch (error) {
      console.error('Error checking session:', error);
      return false;
    }
  };

  // التحقق من وجود بيانات محلية
  const checkLocalStorage = () => {
    try {
      const userData = localStorage.getItem('userData');
      return userData !== null;
    } catch (error) {
      console.error('Error checking localStorage:', error);
      return false;
    }
  };

  // التحقق من حالة المصادقة في Redux
  const checkReduxAuth = (getState: () => { auth: { isAuthenticated: boolean; user: unknown } }) => {
    const state = getState();
    return state.auth.isAuthenticated && state.auth.user !== null;
  };

  return {
    checkSession,
    checkLocalStorage,
    checkReduxAuth,
  };
}
