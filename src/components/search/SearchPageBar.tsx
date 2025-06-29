"use client"

import { useState, useEffect, useRef } from 'react';
import { Search, X, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchPageBarProps {
  initialValue: string;
  onSearch: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchPageBar({
  initialValue,
  onSearch,
  placeholder = "ابحث عن أي شيء...",
  className = ""
}: SearchPageBarProps) {
  const [value, setValue] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // تحديث القيمة عند تغيير القيمة الأولية
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // تحميل تاريخ البحث من localStorage
  useEffect(() => {
    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  // معالج تغيير النص - بسيط ومباشر
  const handleInputChange = (newValue: string) => {
    setValue(newValue);
  };

  // تحديد النص بالكامل عند النقر
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setShowSuggestions(true);
    
    // تحديد النص بالكامل عند التركيز
    setTimeout(() => {
      if (e.target && value) {
        e.target.select();
      }
    }, 0);
  };

  // حفظ البحث في التاريخ
  const saveToHistory = (query: string) => {
    if (!query.trim()) return;
    
    const newHistory = [query, ...searchHistory.filter(item => item !== query)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  // جلب الاقتراحات من الAPI
  const fetchSuggestions = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/products/suggestions?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.success) {
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('خطأ في جلب الاقتراحات:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // تحديث الاقتراحات عند تغيير النص
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value]);

  // تعامل مع لوحة المفاتيح
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const allSuggestions = [...suggestions, ...searchHistory];
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => prev < allSuggestions.length - 1 ? prev + 1 : -1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > -1 ? prev - 1 : allSuggestions.length - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && allSuggestions[selectedIndex]) {
        // اختيار اقتراح من القائمة
        handleSuggestionSelect(allSuggestions[selectedIndex]);
      } else if (value.trim()) {
        // تنفيذ البحث للنص المكتوب
        executeSearch(value);
      }
    } else if (e.key === 'Escape') {
      // إذا كان هناك نص، امحوه، وإلا أخف الاقتراحات
      if (value.trim()) {
        clearText();
      } else {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      // السماح لـ Ctrl+A بالعمل طبيعياً (اختيار الكل)
      return;
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
      // مسح النص مع Ctrl+X (قص)
      setTimeout(() => clearText(), 0);
    } else if (e.key === 'Delete' && (e.ctrlKey || e.metaKey)) {
      // مسح النص مع Ctrl+Delete
      e.preventDefault();
      clearText();
    }
  };

  // تنفيذ البحث
  const executeSearch = (searchValue: string) => {
    if (searchValue.trim()) {
      saveToHistory(searchValue);
      onSearch(searchValue);
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  // تعامل مع اختيار اقتراح
  const handleSuggestionSelect = (suggestion: string) => {
    setValue(suggestion);
    executeSearch(suggestion);
  };

  const removeFromHistory = (item: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newHistory = searchHistory.filter(h => h !== item);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  // مسح النص
  const clearText = () => {
    setValue('');
    setShowSuggestions(false);
    setSelectedIndex(-1);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 sm:w-4 sm:h-4 z-10" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={() => {
            // تأخير الإخفاء للسماح بالنقر على الاقتراحات
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pr-12 pl-12 py-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm"
          autoComplete="off"
          spellCheck="false"
        />
        
        {/* زر المسح */}
        {value && (
          <button
            onClick={clearText}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 w-5 h-5 sm:w-4 sm:h-4 z-10 flex items-center justify-center"
            aria-label="مسح النص"
          >
            <X className="w-5 h-5 sm:w-4 sm:h-4" />
          </button>
        )}
        
        {/* مؤشر التحميل */}
        {isLoading && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 sm:h-4 sm:w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {/* قائمة الاقتراحات */}
      <AnimatePresence>
        {showSuggestions && (value.length > 0 || searchHistory.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
            style={{ zIndex: 1000 }}
          >
            {/* الاقتراحات من API */}
            {suggestions.length > 0 && (
              <div className="p-2">
                <h4 className="text-xs font-medium text-gray-500 mb-2 px-2">اقتراحات</h4>
                {suggestions.map((suggestion, index) => (
                  <motion.button
                    key={`suggestion-${suggestion}-${index}`}
                    onClick={() => handleSuggestionSelect(suggestion)}
                    className={`w-full text-right px-4 py-3 sm:px-3 sm:py-2 text-base sm:text-sm hover:bg-gray-100 rounded flex items-center gap-3 sm:gap-2 ${
                      selectedIndex === index ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                    }`}
                    whileHover={{ backgroundColor: '#f3f4f6' }}
                  >
                    <Search className="w-4 h-4 sm:w-3 sm:h-3 text-gray-400" />
                    <span className="flex-1">{suggestion}</span>
                  </motion.button>
                ))}
              </div>
            )}

            {/* تاريخ البحث */}
            {searchHistory.length > 0 && value.length === 0 && (
              <div className="p-2 border-t border-gray-100">
                <h4 className="text-xs font-medium text-gray-500 mb-2 px-2">عمليات بحث سابقة</h4>
                {searchHistory.map((item, index) => (
                  <motion.button
                    key={`history-${item}-${index}`}
                    onClick={() => handleSuggestionSelect(item)}
                    className={`w-full text-right px-4 py-3 sm:px-3 sm:py-2 text-base sm:text-sm hover:bg-gray-100 rounded flex items-center gap-3 sm:gap-2 group ${
                      selectedIndex === (suggestions.length + index) ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                    }`}
                    whileHover={{ backgroundColor: '#f3f4f6' }}
                  >
                    <Clock className="w-4 h-4 sm:w-3 sm:h-3 text-gray-400" />
                    <span className="flex-1">{item}</span>
                    <button
                      onClick={(e) => removeFromHistory(item, e)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1"
                      aria-label="حذف من التاريخ"
                    >
                      <X className="w-4 h-4 sm:w-3 sm:h-3" />
                    </button>
                  </motion.button>
                ))}
              </div>
            )}

            {/* حالة فارغة */}
            {value.length > 0 && suggestions.length === 0 && !isLoading && (
              <div className="p-4 text-center text-gray-500 text-sm">
                لا توجد اقتراحات لـ &quot;{value}&quot;
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
