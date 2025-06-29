"use client"

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Search, Tag } from 'lucide-react';

interface SearchSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
  currentQuery?: string;
}

export default function SearchSuggestions({ onSuggestionClick, currentQuery }: SearchSuggestionsProps) {
  const [trendingSuggestions] = useState([
    'ساعة روليكس',
    'محفظة رجالي',
    'عطر نسائي',
    'نظارة شمسية',
    'ساعة أبل',
    'هدايا أطفال',
    'محفظة جلد',
    'ساعة كاسيو'
  ]);

  const [categorySuggestions] = useState([
    'ساعات رجالي',
    'ساعات نسائي',
    'محافظ رجالي',
    'محافظ نسائي',
    'نظارات طبية',
    'نظارات شمسية',
    'عطور رجالي',
    'عطور نسائي',
    'هدايا مخصصة',
    'إكسسوارات'
  ]);

  const [brandSuggestions] = useState([
    'روليكس',
    'كاسيو',
    'أبل',
    'سامسونج',
    'رايبان',
    'شانيل',
    'ديور',
    'كوتش'
  ]);

  if (currentQuery && currentQuery.trim().length > 2) {
    return null; // لا تظهر الاقتراحات إذا كان هناك بحث نشط
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* الاقتراحات الشائعة */}
      <div>
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-800">البحثات الشائعة</h3>
        </div>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
          {trendingSuggestions.map((suggestion, index) => (
            <motion.button
              key={suggestion}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSuggestionClick(suggestion)}
              className="px-3 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-medium hover:from-blue-100 hover:to-blue-200 transition-all duration-200 border border-blue-200 text-center min-h-[40px] sm:min-h-auto flex items-center justify-center"
            >
              {suggestion}
            </motion.button>
          ))}
        </div>
      </div>

      {/* اقتراحات الفئات */}
      <div>
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-800">تصفح حسب الفئة</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
          {categorySuggestions.map((suggestion, index) => (
            <motion.button
              key={suggestion}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSuggestionClick(suggestion)}
              className="p-3 sm:p-4 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-700 hover:border-green-300 hover:bg-green-50 transition-all duration-200 text-center min-h-[60px] sm:min-h-[70px] flex items-center justify-center"
            >
              {suggestion}
            </motion.button>
          ))}
        </div>
      </div>

      {/* اقتراحات العلامات التجارية */}
      <div>
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-800">العلامات التجارية المشهورة</h3>
        </div>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
          {brandSuggestions.map((suggestion, index) => (
            <motion.button
              key={suggestion}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.04 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSuggestionClick(suggestion)}
              className="px-3 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 rounded-full text-xs sm:text-sm font-medium hover:from-purple-100 hover:to-purple-200 transition-all duration-200 border border-purple-200 text-center min-h-[40px] sm:min-h-auto flex items-center justify-center"
            >
              {suggestion}
            </motion.button>
          ))}
        </div>
      </div>

      {/* نصائح البحث */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 sm:p-4 rounded-lg border border-blue-200"
      >
        <h4 className="font-semibold text-blue-800 mb-2 text-sm sm:text-base">💡 نصائح للبحث الأفضل</h4>
        <ul className="text-xs sm:text-sm text-blue-700 space-y-1">
          <li>• جرب البحث بأسماء العلامات التجارية مثل &quot;روليكس&quot; أو &quot;أبل&quot;</li>
          <li>• استخدم كلمات وصفية مثل &quot;ساعة ذهبية&quot; أو &quot;محفظة جلد&quot;</li>
          <li className="hidden sm:block">• ابحث بالألوان مثل &quot;أسود&quot; أو &quot;ذهبي&quot;</li>
          <li className="hidden sm:block">• جرب البحث بالفئة والجنس مثل &quot;ساعة رجالي&quot;</li>
        </ul>
      </motion.div>
    </motion.div>
  );
}
