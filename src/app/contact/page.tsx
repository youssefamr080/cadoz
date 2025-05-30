import React from 'react';
import { 
  MessageSquare, 
  Instagram, 
  Facebook, 
  MessageCircle, 
  Music, 
  Phone, 
  Globe, 
  Gift 
} from 'lucide-react';

const ContactPage = () => {
  return (
    <div className="h-full bg-gray-50" dir="rtl">
      <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-amber-600 mb-4">
            <span className="inline-block transform hover:scale-105 transition-transform duration-300">
              <Phone className="inline-block ml-2" size={36} strokeWidth={2} /> تواصل معنا – Cadoz <Gift className="inline-block mr-2" size={36} strokeWidth={2} />
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            هل لديك استفسار أو طلب خاص؟ يسعدنا دائمًا مساعدتك! 🤍✨
          </p>
        </div>

        {/* Main Contact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* WhatsApp Card - Main Contact Method */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-xl p-8 transform hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-center mb-6">
              <MessageSquare size={56} className="text-green-600" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-bold text-green-600 text-center mb-4">تواصل عبر واتساب</h2>
            <p className="text-gray-700 text-center mb-6">
              الطريقة الأسرع للتواصل! نرد على رسائلك خلال دقائق
            </p>
            <a 
              href="https://wa.me/201026972523" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white text-lg font-bold py-4 px-6 rounded-lg shadow-lg w-full transition-colors duration-300"
            >
              <MessageSquare size={24} className="ml-2" />
              تواصل مباشرة عبر واتساب
            </a>
          </div>

          {/* Quick Contact Methods */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">وسائل التواصل الأخرى</h2>
            <div className="space-y-6">
              <a 
                href="https://www.instagram.com/cadoz" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-colors duration-300"
              >
                <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-full shadow-md ml-4">
                  <Instagram size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">انستجرام</h3>
                  <p className="text-gray-600">تابع أحدث منتجاتنا وعروضنا</p>
                </div>
              </a>

              <a 
                href="https://www.facebook.com/cadoz" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-colors duration-300"
              >
                <div className="w-12 h-12 flex items-center justify-center bg-blue-600 text-white rounded-full shadow-md ml-4">
                  <Facebook size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">فيس بوك</h3>
                  <p className="text-gray-600">اطلع على آخر الأخبار والفعاليات</p>
                </div>
              </a>

              <a 
                href="https://m.me/cadoz" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors duration-300"
              >
                <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full shadow-md ml-4">
                  <MessageCircle size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">ماسنجر</h3>
                  <p className="text-gray-600">محادثة فورية للاستفسارات</p>
                </div>
              </a>

              <a 
                href="https://www.tiktok.com/@cadoz" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-colors duration-300"
              >
                <div className="w-12 h-12 flex items-center justify-center bg-black text-white rounded-full shadow-md ml-4">
                  <Music size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">تيك توك</h3>
                  <p className="text-gray-600">شاهد فيديوهات منتجاتنا المميزة</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* All Social Media Links */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-amber-600 text-center mb-8">
            <span className="inline-block transform hover:scale-105 transition-transform duration-300">
              <Globe className="inline-block ml-2" size={28} /> تابعنا على جميع المنصات
            </span>
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            <a 
              href="https://wa.me/201026972523" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors duration-300"
            >
              <div className="w-12 h-12 flex items-center justify-center bg-green-600 text-white rounded-full shadow-md mb-2">
                <MessageSquare size={24} />
              </div>
              <span className="font-bold text-gray-800">واتساب</span>
            </a>
            
            <a 
              href="https://www.instagram.com/cadoz" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-colors duration-300"
            >
              <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-full shadow-md mb-2">
                <Instagram size={24} />
              </div>
              <span className="font-bold text-gray-800">انستجرام</span>
            </a>
            
            <a 
              href="https://www.facebook.com/cadoz" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors duration-300"
            >
              <div className="w-12 h-12 flex items-center justify-center bg-blue-600 text-white rounded-full shadow-md mb-2">
                <Facebook size={24} />
              </div>
              <span className="font-bold text-gray-800">فيس بوك</span>
            </a>
            
            <a 
              href="https://m.me/cadoz" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors duration-300"
            >
              <div className="w-12 h-12 flex items-center justify-center bg-blue-500 text-white rounded-full shadow-md mb-2">
                <MessageCircle size={24} />
              </div>
              <span className="font-bold text-gray-800">ماسنجر</span>
            </a>
            
            <a 
              href="https://www.tiktok.com/@cadoz" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-300"
            >
              <div className="w-12 h-12 flex items-center justify-center bg-black text-white rounded-full shadow-md mb-2">
                <Music size={24} />
              </div>
              <span className="font-bold text-gray-800">تيك توك</span>
            </a>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-amber-50 to-amber-100 rounded-2xl shadow-lg p-8 transform hover:shadow-2xl transition-all duration-300">
          <h3 className="text-3xl font-bold text-amber-600 mb-6">
            <Gift className="inline-block ml-2" size={28} strokeWidth={2} /> Cadoz – نهتم بأدق التفاصيل لنُقدّم لك تجربة هدايا لا تُنسى! <Gift className="inline-block mr-2" size={28} strokeWidth={2} />
          </h3>
          <p className="text-lg text-gray-600 mb-8">
            متجر إلكتروني متميز يقدم لك أفضل خدمات تجهيز الهدايا الفاخرة بلمسة احترافية
          </p>
          <a 
            href="https://wa.me/201026972523" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block bg-amber-600 hover:bg-amber-700 text-white text-xl font-bold py-4 px-8 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            <Gift className="inline-block ml-2" size={24} /> احصل على هديتك الآن
          </a>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;