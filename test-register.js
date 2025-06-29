// تشغيل هذا الملف لاختبار API التسجيل
async function testRegisterAPI() {
  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'مستخدم تجريبي',
        phone: '01012345678',
        email: 'test@example.com',
        password: 'test123'
      })
    })

    const data = await response.json()
    console.log('استجابة API:', data)
    console.log('حالة الاستجابة:', response.status)
    
    if (data.success) {
      console.log('✅ التسجيل نجح!')
    } else {
      console.log('❌ التسجيل فشل:', data.message)
    }
  } catch (error) {
    console.error('خطأ في الاختبار:', error)
  }
}

// تشغيل الاختبار إذا كان هذا الملف يعمل في Node.js
if (typeof window === 'undefined') {
  testRegisterAPI()
}

export { testRegisterAPI }
