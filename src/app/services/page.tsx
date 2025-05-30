import React from 'react';

const ServicesPage = () => {
  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 h-full" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-amber-600 mb-4">
            <span className="inline-block transform hover:scale-105 transition-transform duration-300">✨ خدماتنا المميزة في متجر Cadoz ✨</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            تجربة فريدة في تجهيز الهدايا الفاخرة بأسلوب احترافي لمناسباتك الخاصة
          </p>
        </div>

        {/* Introduction Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12 transform hover:shadow-2xl transition-all duration-300">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="text-3xl mr-2">🎁</span> نقدم لك تجربة تجهيز هدايا استثنائية
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            في <span className="font-bold text-amber-600">Cadoz</span>، نؤمن أن كل هدية تحكي قصة. لذلك، نقدم لك خدمة <span className="font-bold">تجهيز الهدايا الفاخرة</span> بأسلوب احترافي لا مثيل له. اختر منتجاتك المفضلة وأضف لها لمسة سحرية مع خيارات التغليف الراقية لدينا.
          </p>
        </div>

        {/* Services Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-amber-600 mb-8 text-center">
            <span className="inline-block transform hover:scale-105 transition-transform duration-300">💎 خدماتنا المميزة</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Shopping Experience */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">🛍️</span>
                <h3 className="text-2xl font-bold text-gray-800">تجربة تسوق سلسة وفاخرة</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex">
                  <span className="text-green-500 font-bold ml-2">✓</span>
                  <span>تصفح أقسامنا المختارة بعناية: <span className="font-bold">رجالي – حريمي – أطفال</span>.</span>
                </li>
                <li className="flex">
                  <span className="text-green-500 font-bold ml-2">✓</span>
                  <span>استمتع بمجموعة من <span className="font-bold">الماركات الفاخرة</span> بكل سهولة.</span>
                </li>
                <li className="flex">
                  <span className="text-green-500 font-bold ml-2">✓</span>
                  <span>ابحث عن منتجاتك المفضلة واكتشف <span className="font-bold">الأكثر مبيعًا</span> بسرعة.</span>
                </li>
              </ul>
            </div>

            {/* Gift Preparation */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">🎁</span>
                <h3 className="text-2xl font-bold text-gray-800">إعداد الهدايا بتجربة احترافية</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex">
                  <span className="text-green-500 font-bold ml-2">✓</span>
                  <span>حول طلبك إلى <span className="font-bold">هدية مميزة</span> بضغطة زر.</span>
                </li>
                <li className="flex">
                  <span className="text-green-500 font-bold ml-2">✓</span>
                  <span>تخصيص الهدية عبر <span className="font-bold">6 خطوات احترافية</span>:</span>
                </li>
              </ul>
              <div className="bg-amber-50 rounded-lg p-4 my-3">
                <ol className="space-y-2 mr-6 list-decimal">
                  <li className="text-gray-700">🍫 إضافة الشوكولاتة الفاخرة</li>
                  <li className="text-gray-700">🍬 إضافة الحلويات الراقية</li>
                  <li className="text-gray-700">🎁 اختيار علبة هدايا أنيقة</li>
                  <li className="text-gray-700">🏷️ اختيار تغليف داخلي مميز</li>
                  <li className="text-gray-700">✨ إضافة زينة وإكسسوارات فاخرة</li>
                  <li className="text-gray-700">✅ مراجعة الهدية وإتمام التجهيز</li>
                </ol>
              </div>
              <ul className="space-y-3 mt-3">
                <li className="flex">
                  <span className="text-green-500 font-bold ml-2">✓</span>
                  <span>معاينة فورية أثناء التخصيص.</span>
                </li>
                <li className="flex">
                  <span className="text-green-500 font-bold ml-2">✓</span>
                  <span>احفظ هديتك لإكمالها لاحقًا إذا أردت.</span>
                </li>
              </ul>
            </div>

            {/* Fast Ordering */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">🚀</span>
                <h3 className="text-2xl font-bold text-gray-800">سرعة وسهولة في الطلب</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex">
                  <span className="text-green-500 font-bold ml-2">✓</span>
                  <span>اطلب بدون حساب – <span className="font-bold">الدفع عبر واتساب مباشرة</span>!</span>
                </li>
                <li className="flex">
                  <span className="text-green-500 font-bold ml-2">✓</span>
                  <span>أرسل سلتك عبر زر <span className="font-bold">&quot;إرسال عبر واتساب&quot;</span> بسهولة.</span>
                </li>
                <li className="flex">
                  <span className="text-green-500 font-bold ml-2">✓</span>
                  <span>تابع طلبك بتحديثات حية وعدّل بسرعة قبل الإرسال.</span>
                </li>
              </ul>
            </div>

            {/* Store Experience */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">🎨</span>
                <h3 className="text-2xl font-bold text-gray-800">تصميم فاخر وتجربة مريحة</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex">
                  <span className="text-green-500 font-bold ml-2">✓</span>
                  <span>استمتع بـ <span className="font-bold">واجهة أنيقة</span> تجعل التسوق ممتعًا.</span>
                </li>
                <li className="flex">
                  <span className="text-green-500 font-bold ml-2">✓</span>
                  <span>تنقل بسهولة بين الأقسام المختلفة.</span>
                </li>
                <li className="flex">
                  <span className="text-green-500 font-bold ml-2">✓</span>
                  <span>اكتشف <span className="font-bold">الماركات الفاخرة</span> بأسلوب راقٍ.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="bg-amber-50 rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-amber-600 mb-6 text-center">
            <span className="inline-block transform hover:scale-105 transition-transform duration-300">💬 لماذا تختار Cadoz؟</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <span className="text-amber-600 text-2xl font-bold ml-3">✓</span>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">اهتمام بأدق التفاصيل</h3>
                <p className="text-gray-600">من المنتج إلى التغليف، نضمن جودة عالية في كل خطوة.</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-amber-600 text-2xl font-bold ml-3">✓</span>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">تجربة تسوق فاخرة</h3>
                <p className="text-gray-600">استمتع بتجربة تسوق سهلة وبسيطة بدون تعقيدات.</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-amber-600 text-2xl font-bold ml-3">✓</span>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">خدمات مخصصة لكل مناسبة</h3>
                <p className="text-gray-600">أعياد، مفاجآت، وأكثر من ذلك، نحن نلبي جميع احتياجاتك.</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-amber-600 text-2xl font-bold ml-3">✓</span>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">دفع سهل وآمن</h3>
                <p className="text-gray-600">تواصل مباشرة عبر واتساب وادفع بطريقة آمنة وسهلة.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 transform hover:shadow-2xl transition-all duration-300">
          <h3 className="text-3xl font-bold text-amber-600 mb-6">
            🌟 ابدأ رحلتك في تجهيز الهدايا الفاخرة الآن! 🌟
          </h3>
          <button className="bg-amber-600 hover:bg-amber-700 text-white text-xl font-bold py-4 px-8 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300">
            اطلب هديتك الآن
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;