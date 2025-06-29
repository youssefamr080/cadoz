"use client"

import { useState, useEffect, useRef } from 'react';
import { Search, X, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SmartSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onSelect?: (value: string) => void;
  onEnter?: (value: string) => void;
  placeholder?: string;
  className?: string;
  showSuggestionsOnly?: boolean; // اظهار الاقتراحات فقط بدون بحث فوري
  allowExternalUpdate?: boolean; // السماح بالتحديث من الخارج (افتراضي: true)
}

export default function SmartSearchBar({
  value,
  onChange,
  onFocus,
  onSelect,
  onEnter,
  placeholder = "ابحث عن أي شيء...",
  className = "",
  allowExternalUpdate = true
}: SmartSearchBarProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [internalValue, setInternalValue] = useState(value || '');
  const [isUserTyping, setIsUserTyping] = useState(false); // تتبع ما إذا كان المستخدم يكتب
  
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // تحديث القيمة الداخلية عند تغيير القيمة الخارجية فقط في حالات معينة
  useEffect(() => {
    // تحديث القيمة الداخلية فقط إذا لم يكن المستخدم يكتب حالياً
    if (allowExternalUpdate && !isUserTyping && (!inputRef.current || document.activeElement !== inputRef.current)) {
      setInternalValue(value || '');
    }
  }, [value, allowExternalUpdate, isUserTyping]);

  // تحميل تاريخ البحث من localStorage
  useEffect(() => {
    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  // معالج تغيير النص المحسن
  const handleInputChange = (newValue: string) => {
    setInternalValue(newValue);
    setIsUserTyping(true); // المستخدم يكتب الآن
    
    // إلغاء timeout السابق
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // تعيين timeout جديد لإيقاف حالة الكتابة
    typingTimeoutRef.current = setTimeout(() => {
      setIsUserTyping(false);
    }, 1000); // بعد ثانية من عدم الكتابة
    
    // تحديث فوري للقيمة بدون انتظار
    if (onChange) {
      // التأكد من أن onChange لا تؤثر على internalValue
      requestAnimationFrame(() => {
        onChange(newValue);
      });
    }
  };

  // تحديد النص بالكامل عند النقر
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setShowSuggestions(true);
    if (onFocus) onFocus();
    
    // تحديد النص بالكامل عند التركيز
    setTimeout(() => {
      if (e.target && internalValue) {
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
      fetchSuggestions(internalValue);
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [internalValue]);

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
      } else if (internalValue.trim()) {
        // تنفيذ البحث للنص المكتوب
        if (onEnter) {
          onEnter(internalValue);
        } else if (onSelect) {
          onSelect(internalValue);
        }
        saveToHistory(internalValue);
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    } else if (e.key === 'Escape') {
      // إذا كان هناك نص، امحوه، وإلا أخف الاقتراحات
      if (internalValue.trim()) {
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

  // تعامل مع اختيار اقتراح
  const handleSuggestionSelect = (suggestion: string) => {
    setIsUserTyping(true); // تأكد من أن المستخدم يتفاعل
    setInternalValue(suggestion);
    onChange(suggestion);
    saveToHistory(suggestion);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    
    if (onSelect) {
      onSelect(suggestion);
    }
    
    // إيقاف حالة الكتابة بعد وقت قصير
    setTimeout(() => {
      setIsUserTyping(false);
    }, 100);
  };

  // حذف عنصر من التاريخ
  const removeFromHistory = (item: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newHistory = searchHistory.filter(h => h !== item);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  // مسح النص
  const clearText = () => {
    setIsUserTyping(true); // تأكد من أن المستخدم يتفاعل
    setInternalValue('');
    onChange('');
    setShowSuggestions(false);
    setSelectedIndex(-1);
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    // إيقاف حالة الكتابة بعد وقت قصير
    setTimeout(() => {
      setIsUserTyping(false);
    }, 100);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
        <input
          ref={inputRef}
          type="text"
          value={internalValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={() => {
            // تأخير الإخفاء للسماح بالنقر على الاقتراحات
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pr-10 pl-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          autoComplete="off"
          spellCheck="false"
        />
        
        {/* زر المسح */}
        {internalValue && (
          <button
            onClick={clearText}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 w-4 h-4 z-10 flex items-center justify-center"
            aria-label="مسح النص"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        
        {/* مؤشر التحميل */}
        {isLoading && !internalValue && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {/* قائمة الاقتراحات */}
      <AnimatePresence>
        {showSuggestions && (internalValue.length > 0 || searchHistory.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-80 overflow-y-auto z-50"
          >
            {/* الاقتراحات الذكية */}
            {suggestions.length > 0 && (
              <div>
                <div className="px-3 py-2 text-xs text-gray-500 font-medium border-b">
                  اقتراحات
                </div>
                {suggestions.map((suggestion, index) => (
                  <motion.div
                    key={`suggestion-${index}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2 ${
                      selectedIndex === index ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                    }`}
                    onClick={() => handleSuggestionSelect(suggestion)}
                  >
                    <Search className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{suggestion}</span>
                  </motion.div>
                ))}
              </div>
            )}

            {/* تاريخ البحث */}
            {searchHistory.length > 0 && internalValue.length === 0 && (
              <div>
                {suggestions.length > 0 && <div className="border-b border-gray-100"></div>}
                <div className="px-3 py-2 text-xs text-gray-500 font-medium border-b">
                  البحثات السابقة
                </div>
                {searchHistory.slice(0, 5).map((item, index) => (
                  <motion.div
                    key={`history-${index}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between group ${
                      selectedIndex === suggestions.length + index ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                    }`}
                    onClick={() => handleSuggestionSelect(item)}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{item}</span>
                    </div>
                    <button
                      onClick={(e) => removeFromHistory(item, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded"
                    >
                      <X className="w-3 h-3 text-gray-500" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

            {/* رسالة عدم وجود نتائج */}
            {value.length > 2 && suggestions.length === 0 && !isLoading && (
              <div className="px-3 py-4 text-center text-gray-500 text-sm">
                لا توجد اقتراحات لـ &quot;{value}&quot;
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
