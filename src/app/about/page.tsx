import React from 'react';
import Link from 'next/link';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-right" dir="rtl">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-black/10 z-0"></div>
        <div className="bg-[url('/images/luxury-background.jpg')] bg-cover bg-center h-96 flex items-center justify-center relative">
          <div className="container mx-auto px-4 z-10 text-center">
            <div className="inline-block bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-xl">
              <h1 className="text-4xl md:text-5xl font-bold text-amber-600 mb-4">
                <span className="text-3xl">💎</span> عن Cadoz
              </h1>
              <p className="text-xl text-gray-700 max-w-2xl mx-auto">
                حيث تتحول الهدايا إلى لحظات لا تُنسى
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="container mx-auto px-4 py-12">
        {/* المقدمة مع تأثير خاص */}
        <div className="mb-16 text-center">
          <div className="relative max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-lg border-t-4 border-amber-500">
            <div className="absolute -top-6 right-1/2 transform translate-x-1/2 bg-amber-500 p-3 rounded-full">
              <span className="text-3xl">🎁</span>
            </div>
            <p className="text-lg md:text-xl text-gray-700 mt-4">
              في <span className="font-bold text-amber-600">Cadoz</span>، نحن لا نبيع المنتجات فقط، بل نصنع <span className="font-bold">تجربة فاخرة في تجهيز الهدايا</span>. كل تفصيلة، من اختيار المنتج إلى تغليفه، مصممة لتجعل كل هدية تعبر عن مشاعر لا تُنسى.
            </p>
          </div>
        </div>

        {/* القيم والمميزات في بطاقات */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* رؤيتنا */}
          <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border-r-4 border-amber-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">رؤيتنا</h2>
              <span className="text-4xl">🚀</span>
            </div>
            <p className="text-gray-700 text-lg">
              أن نكون الوجهة الأولى لكل من يبحث عن <span className="font-bold text-amber-600">هدايا فاخرة وتجربة شراء سلسة ومبتكرة</span>، حيث يجتمع الإبداع مع الأناقة في كل تفصيلة.
            </p>
          </div>

          {/* مهمتنا */}
          <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border-r-4 border-amber-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">مهمتنا</h2>
              <span className="text-4xl">🎯</span>
            </div>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-center">
                <span className="text-amber-600 ml-2 text-xl">✓</span>
                <span>تقديم تجربة <strong>تسوق راقية وسهلة</strong> لعملائنا.</span>
              </li>
              <li className="flex items-center">
                <span className="text-amber-600 ml-2 text-xl">✓</span>
                <span>توفير <strong>خيارات تغليف متطورة</strong> تجعل كل هدية فريدة من نوعها.</span>
              </li>
              <li className="flex items-center">
                <span className="text-amber-600 ml-2 text-xl">✓</span>
                <span>تصميم <strong>منصة متميزة بتجربة مستخدم سلسة</strong> تدمج بين الفخامة والسهولة.</span>
              </li>
              <li className="flex items-center">
                <span className="text-amber-600 ml-2 text-xl">✓</span>
                <span>تقديم <strong>منتجات منتقاة بعناية</strong> تناسب جميع المناسبات.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* لماذا Cadoz مع تصميم متميز */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 inline-block border-b-4 border-amber-500 pb-2">
              <span className="ml-2">💡</span>
              لماذا Cadoz؟
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-all duration-300">
              <div className="h-3 bg-amber-500"></div>
              <div className="p-6">
                <div className="rounded-full bg-amber-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎀</span>
                </div>
                <h3 className="text-xl font-bold text-center mb-3 text-gray-800">تجربة تجهيز هدايا احترافية</h3>
                <p className="text-gray-600 text-center">
                  خيارات تغليف أنيقة ومراحل تخصيص متكاملة تناسب كل مناسبة وذوق.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-all duration-300">
              <div className="h-3 bg-amber-500"></div>
              <div className="p-6">
                <div className="rounded-full bg-amber-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💻</span>
                </div>
                <h3 className="text-xl font-bold text-center mb-3 text-gray-800">متجر إلكتروني متطور</h3>
                <p className="text-gray-600 text-center">
                  تصفح سهل، عرض البراندات بأسلوب أنيق، وبحث متقدم يوفر عليك الوقت.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-all duration-300">
              <div className="h-3 bg-amber-500"></div>
              <div className="p-6">
                <div className="rounded-full bg-amber-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📱</span>
                </div>
                <h3 className="text-xl font-bold text-center mb-3 text-gray-800">شراء بدون تعقيد</h3>
                <p className="text-gray-600 text-center">
                  لا حاجة لحساب، فقط أضف منتجاتك واضغط &quot;إرسال السلة عبر واتساب&quot;!
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-all duration-300">
              <div className="h-3 bg-amber-500"></div>
              <div className="p-6">
                <div className="rounded-full bg-amber-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">✨</span>
                </div>
                <h3 className="text-xl font-bold text-center mb-3 text-gray-800">اهتمام بأدق التفاصيل</h3>
                <p className="text-gray-600 text-center">
                  من اختيار المنتج إلى وصوله إليك بأفضل شكل ممكن بكل اهتمام وعناية.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* قسم صور مميز */}
        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-amber-100 p-4 rounded-lg h-64 flex items-center justify-center">
              <div className="text-center">
                <span className="text-6xl block mb-2">🎁</span>
                <h3 className="text-xl font-bold text-amber-800">تغليف فاخر</h3>
              </div>
            </div>
            <div className="bg-amber-100 p-4 rounded-lg h-64 flex items-center justify-center">
              <div className="text-center">
                <span className="text-6xl block mb-2">🛍️</span>
                <h3 className="text-xl font-bold text-amber-800">منتجات حصرية</h3>
              </div>
            </div>
            <div className="bg-amber-100 p-4 rounded-lg h-64 flex items-center justify-center">
              <div className="text-center">
                <span className="text-6xl block mb-2">🚚</span>
                <h3 className="text-xl font-bold text-amber-800">توصيل سريع</h3>
              </div>
            </div>
          </div>
        </div>

        {/* ختام ودعوة للعمل */}
        <div className="text-center bg-gradient-to-r from-amber-500 to-amber-600 p-12 rounded-lg shadow-xl">
          <h3 className="text-3xl font-bold text-white mb-6">
            💎 Cadoz – لأن كل هدية تستحق أن تكون مميزة! 💎
          </h3>
          <div className="flex flex-col md:flex-row justify-center items-center gap-4">
            <Link href="/">
              <button className="bg-white text-amber-600 px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-shadow duration-300 hover:bg-gray-50">
                ابدأ التسوق الآن
              </button>
            </Link>
            <Link href="/contact">
              <button className="bg-transparent text-white border-2 border-white px-8 py-3 rounded-full font-bold text-lg hover:bg-white/10 transition-colors duration-300">
                تواصل معنا
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* شريط الشهادات */}
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">ماذا يقول عملاؤنا</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-center mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-amber-500 text-xl">★</span>
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-4 text-center">
                &quot;تجربة رائعة، التغليف فاق توقعاتي والهدية وصلت بشكل مميز جداً!&quot;
              </p>
              <p className="font-bold text-center">- سارة أحمد</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-center mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-amber-500 text-xl">★</span>
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-4 text-center">
                &quot;سهولة الطلب والتواصل السريع جعل التجربة مميزة. سأعود للشراء مرة أخرى!&quot;
              </p>
              <p className="font-bold text-center">- محمد خالد</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-center mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-amber-500 text-xl">★</span>
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-4 text-center">
                &quot;الاهتمام بالتفاصيل والجودة العالية للمنتجات جعلت Cadoz خياري الأول للهدايا!&quot;
              </p>
              <p className="font-bold text-center">- نورة سعيد</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center items-center space-x-4 space-x-reverse mb-4">
            <a href="#" className="hover:text-amber-500 transition-colors duration-300">
              <span className="text-2xl">📱</span>
            </a>
            <a href="#" className="hover:text-amber-500 transition-colors duration-300">
              <span className="text-2xl">📷</span>
            </a>
            <a href="#" className="hover:text-amber-500 transition-colors duration-300">
              <span className="text-2xl">💬</span>
            </a>
          </div>
          <p className="text-gray-400">© {new Date().getFullYear()} Cadoz. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;