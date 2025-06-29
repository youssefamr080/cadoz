// اختبار تسجيل الدخول
async function testLogin() {
  try {
    // محاولة تسجيل الدخول بالمستخدم الذي أنشأناه
    const response = await fetch('http://localhost:3000/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: '01012345678',
        password: 'test123',
        redirect: false
      })
    })

    console.log('استجابة تسجيل الدخول:', response.status)
    const data = await response.text()
    console.log('البيانات:', data)
  } catch (error) {
    console.error('خطأ في الاختبار:', error)
  }
}

// تشغيل الاختبار
if (typeof window === 'undefined') {
  testLogin()
}

export { testLogin }
