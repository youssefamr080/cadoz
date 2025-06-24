"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Search, X, Clock, ArrowUpRight, 
  Sparkles, Tag, Settings, CheckCircle2, 
  Lightbulb, Gift, ShoppingBag, Filter
} from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { setQuery, addRecentSearch, /*setProductsCache,*/ /*setInspirationsCache,*/ clearSearch, searchAsync } from "@/lib/redux/slices/searchSlice";
import { HighlightText } from "@/components/ui/highlight-text";
import { RelevanceIndicator } from "@/components/ui/relevance-indicator";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useOnClickOutside } from "@/lib/hooks/useOnClickOutside";
import type { RootState } from "@/lib/redux/store"

import type { Product, Inspiration } from "@/lib/types";
// Utility functions imported as needed

interface SearchBarEnhancedProps {
  // وظائف التحديد
  onProductSelect?: (product: Product) => void;
  onInspirationSelect?: (inspiration: Inspiration) => void;
  // خيارات الواجهة
  className?: string;
  showTrendingItems?: boolean;
  maxResults?: number;
  debounceTime?: number;
  placeholder?: string;
  // خيارات البحث المتقدمة
  enableFilters?: boolean;
  initialCategory?: string;
  showSortOptions?: boolean;
  showSettingsButton?: boolean;
  compact?: boolean; // وضع مدمج لواجهات المستخدم الصغيرة
  // تهيئة مُسبقة
  preloadSuggestions?: boolean; // تحميل مقترحات فور تهيئة المكون
  autoFocus?: boolean; // تركيز تلقائي على حقل البحث
}

const SearchBarEnhanced: React.FC<SearchBarEnhancedProps> = ({
  onProductSelect,
  onInspirationSelect,
  className = "",
  debounceTime = 300,
  placeholder = "ابحث عن منتجات أو هدايا جاهزة...",
  preloadSuggestions = true
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "products" | "inspirations">("all");
  const [showSettings, setShowSettings] = useState(false);
  const [searchResults, setSearchResults] = useState<(Product | Inspiration)[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // استخراج الحالة والوظائف من مخزن البحث (Zustand)
  const searchState = useSelector((state: RootState) => state.search);
  const { suggestions, enableSpellCorrection, enableAutocomplete, productsCache, inspirationsCache, recentSearches: storeRecentSearches } = searchState;
  const dispatch = useDispatch();

  // إضافة متغيرات جديدة للاقتراحات الذكية
  const [smartSuggestions, setSmartSuggestions] = useState<string[]>([]);

  // تأخير البحث لتحسين الأداء عند الكتابة
  const debouncedSearch = useDebounce((value: string) => {
    if (value.length >= 2) {
      performSearch(value);
    }
  }, debounceTime);
  
  // استدعاء API البحث مع تطبيق فلترة المنتجات في واجهة المستخدم بدلاً من تعديل المخزن
  const performSearch = (searchQuery: string) => {
    if (searchQuery.length >= 2) {
      // @ts-expect-error - AsyncThunk type conflict with Redux dispatch
      dispatch(searchAsync(searchQuery));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    dispatch(setQuery(value));
    
    if (value.length >= 2) {
      setIsLoading(true);
      debouncedSearch(value);
      
      // توليد اقتراحات ذكية
      const smartSuggestions = generateSmartSuggestions(value);
      setSmartSuggestions(smartSuggestions);
    } else {
      dispatch(clearSearch());
      setSearchResults([]);
    }
  };

  // دالة جديدة لتوليد اقتراحات ذكية
  const generateSmartSuggestions = (query: string): string[] => {
    const suggestions: string[] = [];
    const normalizedQuery = query.toLowerCase();

    // اقتراحات من عمليات البحث السابقة (المنتجات المختارة سابقاً)
    storeRecentSearches.forEach(term => {
      if (term.toLowerCase().includes(normalizedQuery) && !suggestions.includes(term)) {
        suggestions.push(term);
      }
    });

    // اقتراحات من المنتجات
    productsCache.forEach(product => {
      if (product.name.toLowerCase().includes(normalizedQuery) && !suggestions.includes(product.name)) {
        suggestions.push(product.name);
      }
      if (product.category.toLowerCase().includes(normalizedQuery) && !suggestions.includes(product.category)) {
        suggestions.push(product.category);
      }
    });

    // اقتراحات من الهدايا الجاهزة
    inspirationsCache.forEach(inspiration => {
      if (inspiration.name.toLowerCase().includes(normalizedQuery) && !suggestions.includes(inspiration.name)) {
        suggestions.push(inspiration.name);
      }
      if (inspiration.category?.toLowerCase().includes(normalizedQuery) && !suggestions.includes(inspiration.category)) {
        suggestions.push(inspiration.category);
      }
    });

    return suggestions.slice(0, 7); // إرجاع أفضل 7 اقتراحات
  };

  // Handle result selection
  const handleResultSelect = useCallback((result: Product | Inspiration) => {
    if (result.type === "product" && onProductSelect) {
      // إضافة اسم المنتج المختار إلى عمليات البحث السابقة
      dispatch(addRecentSearch(result.name));
      // تحديث حالة عمليات البحث السابقة مباشرة
      setRecentSearches([result.name, ...storeRecentSearches].slice(0, 7));
      onProductSelect(result);
    } else if (result.type === "inspiration" && onInspirationSelect) {
      onInspirationSelect(result);
    }
    setIsFocused(false);
  }, [onProductSelect, onInspirationSelect, dispatch, storeRecentSearches]);

  // Update search results when store suggestions change
  useEffect(() => {
    if (suggestions.length > 0) {
      // Filter products and inspirations based on suggestions
      const filteredProducts = productsCache.filter(product => 
        suggestions.some(suggestion => 
          product.name.toLowerCase().includes(suggestion.toLowerCase()) ||
          product.description.toLowerCase().includes(suggestion.toLowerCase())
        )
      ).map(product => ({
        _id: product._id || product.id.toString(),
        id: product.id.toString(),
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        category: product.category,
        type: 'product' as const,
        url: `/product/${product.id}`,
        relevanceScore: calculateRelevanceScore(product, inputValue)
      }));

      const filteredInspirations = inspirationsCache.filter(inspiration => 
        suggestions.some(suggestion => 
          inspiration.name.toLowerCase().includes(suggestion.toLowerCase()) ||
          inspiration.description.toLowerCase().includes(suggestion.toLowerCase())
        )      ).map(inspiration => ({
        _id: inspiration.id,
        id: inspiration.id,
        name: inspiration.name,
        description: inspiration.description,
        image: inspiration.image,
        category: inspiration.category || '',        occasions: [],
        tags: [],
        type: 'inspiration' as const,
        url: `/inspiration/${inspiration.id}`,
        relevanceScore: calculateRelevanceScore(inspiration, inputValue)
      }));

      // Combine and sort results by relevance
      const combinedResults = [
        ...filteredProducts,
        ...filteredInspirations
      ].sort((a, b) => b.relevanceScore - a.relevanceScore);

      setSearchResults(combinedResults);
      setIsLoading(false);
    }
  }, [suggestions, productsCache, inspirationsCache, inputValue]);

  // Helper function to calculate relevance score
  const calculateRelevanceScore = (item: { 
    name: string; 
    description: string; 
    category?: string; 
    tags?: string[];
    occasions?: string[];
  }, searchQuery: string) => {
    const query = searchQuery.toLowerCase();
    let score = 0;

    // Name match has highest weight
    if (item.name.toLowerCase().includes(query)) {
      score += 3;
    }

    // Description match has medium weight
    if (item.description.toLowerCase().includes(query)) {
      score += 2;
    }

    // Category match has lower weight
    if (item.category?.toLowerCase().includes(query)) {
      score += 1;
    }

    // Tags match has lower weight
    if (item.tags?.some(tag => tag.toLowerCase().includes(query))) {
      score += 1;
    }

    // Occasions match has lower weight
    if (item.occasions?.some(occasion => occasion.toLowerCase().includes(query))) {
      score += 1;
    }

    return score;
  };

  // Filter results based on active tab
  const filteredResults = useMemo(() => {
    if (activeTab === "all") return searchResults;
    return searchResults.filter(result => 
      (activeTab === "products" && result.type === "product") ||
      (activeTab === "inspirations" && result.type === "inspiration")
    );
  }, [searchResults, activeTab]);

  // Update recent searches when store recent searches change
  useEffect(() => {
    setRecentSearches(storeRecentSearches.slice(0, 7)); // عرض آخر 7 عمليات بحث فقط
  }, [storeRecentSearches]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < searchResults.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      const selectedResult = searchResults[selectedIndex];
      if (selectedResult) {
        handleResultSelect(selectedResult);
      }
    } else if (e.key === 'Escape') {
      setIsFocused(false);
    }
  }, [searchResults, selectedIndex, handleResultSelect]);

  // Add keyboard event listener
  useEffect(() => {
    const input = inputRef.current;
    if (input) {
      input.addEventListener('keydown', handleKeyDown);
      return () => {
        input.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [handleKeyDown]);

  useOnClickOutside(searchRef, () => {
    setIsFocused(false);
  });

  // Fetch products and inspirations for search
  // const { data: productsData, isLoading: isProductsLoading, error: productsError } = useGetProductsQuery({});

  useEffect(() => {
    // تحميل البيانات فقط عند الحاجة (الآن فقط للاقتراحات وليس المنتجات)
    if (preloadSuggestions && !localStorage.getItem('cadoz-search-suggestions')) {
      // يمكنك هنا جلب اقتراحات البحث فقط إذا أردت
    }
  }, [preloadSuggestions]);

  const handleTabChange = (tab: "all" | "products" | "inspirations") => {
    setActiveTab(tab);
  };

  // تطبيق اقتراح أو بحث سابق
  const applySearchTerm = (term: string) => {
    setInputValue(term);
    performSearch(term);
    inputRef.current?.focus();
  };

  const searchMode = (() => {
    if (isLoading) return "loading";
    if (inputValue.length < 2) return recentSearches.length > 0 ? "recent" : "empty";
    return searchResults.length > 0 ? "results" : "no-results";
  })();

  // Animation variants
  const dropdownVariants: Variants = {
    hidden: { opacity: 0, y: -5, height: 0, boxShadow: "0 0 0 rgba(0, 0, 0, 0)" },
    visible: { 
      opacity: 1, 
      y: 0, 
      height: "auto", 
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30
      }
    }
  };

  const loadingVariants: Variants = {
    animate: {
      rotate: 360,
      transition: {
        repeat: Infinity,
        duration: 0.8,
        ease: "linear"
      }
    }
  };
  
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3
      }
    }),
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };
  
  const pulseVariants: Variants = {
    pulse: {
      scale: [1, 1.05, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // إضافة دالة مسح البحث
  const clearSearchHandler = useCallback(() => {
    setInputValue("");
    dispatch(setQuery(""));
    dispatch(clearSearch());
    setSearchResults([]);
    setSmartSuggestions([]);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  }, [dispatch]);

  return (
    <div 
      ref={searchRef} 
      className={`relative w-full ${className}`}
    >
      {/* Search bar */}
      <div className="relative">
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <motion.div
            initial={{ scale: 1 }}
            animate={isLoading ? { scale: [1, 1.2, 1] } : { scale: 1 }}
            transition={{ repeat: isLoading ? Infinity : 0, duration: 1 }}
          >
            <Search className={`h-4 w-4 ${isLoading ? 'text-indigo-500' : 'text-gray-500'}`} />
          </motion.div>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          className="w-full py-2.5 pr-10 pl-4 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 placeholder-gray-400 rtl:pr-10 rtl:pl-4 shadow-sm transition-all duration-200"
          dir="rtl"
          inputMode="search"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          style={{ fontSize: '16px' }}
        />
        <AnimatePresence>
          {inputValue && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
              onClick={clearSearchHandler}
              className="absolute inset-y-0 left-0 flex items-center pl-3 hover:bg-gray-100 rounded-l-lg transition-colors"
              aria-label="مسح البحث"
            >
              <X className="h-4 w-4 text-gray-500 hover:text-red-500 transition-colors" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={dropdownVariants}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
            style={{ maxHeight: "80vh", overflowY: "auto" }}
          >
            {/* Tabs for filtering results */}
            <div className="border-b border-gray-100 px-2 pt-2">
              <div className="flex space-x-1 rtl:space-x-reverse">
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ y: 1 }}
                  onClick={() => handleTabChange("all")}
                  className={`px-3 py-1.5 text-xs rounded-t-lg font-medium flex items-center gap-1 transition-all duration-200 ${
                    activeTab === "all"
                      ? "bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 border-b-2 border-indigo-500 shadow-sm"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Search className="h-3 w-3" />
                  <span>الكل</span>
                </motion.button>
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ y: 1 }}
                  onClick={() => handleTabChange("products")}
                  className={`px-3 py-1.5 text-xs rounded-t-lg font-medium flex items-center gap-1 transition-all duration-200 ${
                    activeTab === "products"
                      ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-b-2 border-blue-500 shadow-sm"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <ShoppingBag className="h-3 w-3" />
                  <span>المنتجات</span>
                </motion.button>
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ y: 1 }}
                  onClick={() => handleTabChange("inspirations")}
                  className={`px-3 py-1.5 text-xs rounded-t-lg font-medium flex items-center gap-1 transition-all duration-200 ${
                    activeTab === "inspirations"
                      ? "bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border-b-2 border-purple-500 shadow-sm"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Gift className="h-3 w-3" />
                  <span>الهدايا الجاهزة</span>
                </motion.button>
                
                {/* Settings button */}
                <div className="ml-auto rtl:mr-auto rtl:ml-0">
                  <motion.button
                    whileHover={{ rotate: 30 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowSettings(!showSettings)}
                    className={`px-2 py-1.5 text-xs rounded-lg font-medium flex items-center transition-all duration-200 ${
                      showSettings
                        ? "bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 shadow-sm"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Settings className="h-3 w-3" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Settings panel */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-gray-50 px-4 py-2 border-b border-gray-100"
                >
                  <h4 className="text-xs font-medium text-gray-700 mb-2">إعدادات البحث</h4>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {}}
                      className="flex items-center justify-between text-xs py-1 px-2 rounded hover:bg-gray-100"
                    >
                      <span className="flex items-center gap-1">
                        <Lightbulb className="h-3 w-3 text-amber-500" />
                        <span>اقتراحات الإكمال التلقائي</span>
                      </span>
                      <span className={`${enableAutocomplete ? "text-green-600" : "text-gray-400"}`}>
                        {enableAutocomplete ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border border-gray-300" />
                        )}
                      </span>
                    </button>
                    <button
                      onClick={() => {}}
                      className="flex items-center justify-between text-xs py-1 px-2 rounded hover:bg-gray-100"
                    >
                      <span className="flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-purple-500" />
                        <span>تصحيح الأخطاء الإملائية</span>
                      </span>
                      <span className={`${enableSpellCorrection ? "text-green-600" : "text-gray-400"}`}>
                        {enableSpellCorrection ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border border-gray-300" />
                        )}
                      </span>
                    </button>
                    {recentSearches.length > 0 && (
                      <button
                        onClick={() => {}}
                        className="text-xs text-red-600 hover:text-red-700 self-end mt-1"
                      >
                        مسح عمليات البحث السابقة
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Search content */}
            <div className="overflow-hidden">
              {/* Loading state */}
              {isLoading && (
                <div className="p-6 flex flex-col items-center justify-center">
                  <motion.div className="h-8 w-8 mb-4" variants={loadingVariants} animate="animate">
                    <div className="h-8 w-8 rounded-full border-2 border-indigo-200 border-t-indigo-500"></div>
                  </motion.div>
                  <p className="text-indigo-600">جاري البحث...</p>
                </div>
              )}

              {/* Autocomplete suggestions */}
              {!isLoading && inputValue.length >= 2 && (suggestions.length > 0 || smartSuggestions.length > 0) && (
                <div className="border-b border-gray-100 p-2">
                  <div className="flex items-center text-xs text-gray-500 px-2 py-1">
                    <Lightbulb className="h-3 w-3 ml-1 text-amber-500" />
                    <span>اقتراحات البحث</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 p-2">
                    <AnimatePresence>
                      {/* اقتراحات النظام */}
                      {suggestions.map((suggestion, index) => (
                        <motion.button
                          key={`suggestion-${index}`}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => applySearchTerm(suggestion)}
                          className="text-xs bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 text-indigo-800 px-2.5 py-1.5 rounded-full transition-all shadow-sm border border-indigo-100 flex items-center gap-1"
                        >
                          <Search className="h-2.5 w-2.5 text-indigo-400" />
                          {suggestion}
                        </motion.button>
                      ))}
                      
                      {/* اقتراحات ذكية */}
                      {smartSuggestions.map((suggestion, index) => (
                        <motion.button
                          key={`smart-suggestion-${index}`}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ delay: (index + suggestions.length) * 0.05 }}
                          onClick={() => applySearchTerm(suggestion)}
                          className="text-xs bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 text-emerald-800 px-2.5 py-1.5 rounded-full transition-all shadow-sm border border-green-100 flex items-center gap-1"
                        >
                          <Sparkles className="h-2.5 w-2.5 text-emerald-400" />
                          {suggestion}
                        </motion.button>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Recent searches */}
              {searchMode === "recent" && (
                <div className="p-2">
                  <div className="flex items-center justify-between text-xs text-gray-500 px-2 py-1">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 ml-1" />
                      <span>عمليات البحث السابقة</span>
                    </div>
                    {recentSearches.length > 0 && (
                      <button
                        onClick={() => {}}
                        className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                      >
                        <X className="h-3 w-3" />
                        مسح الكل
                      </button>
                    )}
                  </div>
                  {recentSearches.length > 0 ? (
                    <div className="space-y-1 mt-1">
                      {recentSearches.map((term, index) => (
                        <motion.button
                          key={`recent-${index}`}
                          data-search-item
                          onClick={() => applySearchTerm(term)}
                          className="w-full text-right text-sm px-3 py-2 hover:bg-gray-50 rounded-lg flex items-center justify-between group transition-all duration-200"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                              <Clock className="h-4 w-4 text-indigo-500" />
                            </div>
                            <div className="flex flex-col items-start">
                              <span className="text-gray-900 font-medium">{term}</span>
                              <span className="text-xs text-gray-500">بحث سابق</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 group-hover:text-indigo-500 transition-colors">
                              {new Date().toLocaleDateString('ar-EG')}
                            </span>
                            <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  ) : (
                    <motion.div 
                      className="p-6 text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
                        <Clock className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-gray-700 font-medium text-lg mb-2">لا توجد عمليات بحث سابقة</h3>
                      <p className="text-sm text-gray-500">
                        ابدأ بالبحث عن المنتجات والهدايا الجاهزة
                      </p>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Empty state */}
              {searchMode === "empty" && inputValue.length >= 2 && (
                <motion.div 
                  className="p-8 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div 
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4 border border-gray-200"
                    animate="pulse"
                    variants={pulseVariants}
                  >
                    <Search className="h-8 w-8 text-gray-400" />
                  </motion.div>
                  <h3 className="text-gray-700 font-medium text-lg mb-2">لم يتم العثور على نتائج</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    لم نتمكن من العثور على نتائج مطابقة لـ <span className="font-bold text-indigo-600 px-1 bg-indigo-50 rounded">{inputValue}</span>
                  </p>
                  <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100 inline-block">
                    <p className="font-medium mb-2">اقتراحات للبحث:</p>
                    <ul className="list-disc list-inside mt-1 text-right space-y-1">
                      <li>تأكد من كتابة جميع الكلمات بشكل صحيح</li>
                      <li>جرب كلمات مفتاحية مختلفة</li>
                      <li>جرب كلمات مفتاحية أكثر عمومية</li>
                      <li>تحقق من تصنيف المنتج أو الهدية</li>
                    </ul>
                  </div>
                </motion.div>
              )}

              {/* Search results */}
              {searchMode === "results" && (
                <div className="divide-y divide-gray-100">
                  {/* Results header */}
                  <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="bg-indigo-100 text-indigo-800 h-6 w-6 rounded-full flex items-center justify-center mr-2">
                        <span className="text-xs font-bold">{filteredResults.length}</span>
                      </div>
                      <h3 className="text-sm font-medium text-gray-800">
                        نتائج البحث
                      </h3>
                    </div>
                    <div className="flex items-center text-xs bg-white px-2 py-1 rounded-full border border-gray-200 shadow-sm">
                      <Filter className="h-3 w-3 ml-1 text-indigo-500" />
                      <span className="text-gray-700 font-medium">
                        {activeTab === "all" 
                          ? "جميع النتائج" 
                          : activeTab === "products" 
                            ? "المنتجات فقط" 
                            : "الهدايا الجاهزة فقط"}
                      </span>
                    </div>
                  </div>

                  {/* Results list */}
                  <div className="max-h-[60vh] overflow-y-auto">
                    {filteredResults.map((result, index) => (
                      <motion.div
                        key={`${result.type}-${result.id}`}
                        custom={index}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={itemVariants}
                      >
                        <Link
                          href={result.url}
                          data-search-item
                          className={`block p-3 hover:bg-gray-50 transition-all duration-200 border-r-0 border-l-0 border-t-0 border-b border-gray-100 ${
                            index === selectedIndex ? "bg-indigo-50/50 border-r-4 border-r-indigo-500 pr-2" : ""
                          }`}
                          onClick={() => handleResultSelect(result)}
                        >
                        <div className="flex items-start gap-3">
                          {/* Result image */}
                          <div className="relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden border border-gray-200">
                            <Image
                              src={result.image || "/placeholder.svg"}
                              alt={result.name}
                              fill
                              sizes="64px"
                              className="object-cover"
                              unoptimized
                            />
                            {/* Badge for result type */}
                            <div className={`absolute top-0 right-0 text-[10px] px-1 py-0.5 font-medium ${
                              result.type === "product" 
                                ? "bg-blue-500 text-white" 
                                : "bg-purple-500 text-white"
                            }`}>
                              {result.type === "product" ? "منتج" : "هدية"}
                            </div>
                          </div>

                          {/* Result content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <h4 className="text-sm font-medium text-gray-900 mb-0.5 line-clamp-1">
                                <HighlightText 
                                  text={result.name} 
                                  searchTerms={inputValue.split(/\s+/)} 
                                  matches={result.matches?.filter(match => match.key === 'name' || !match.key)}
                                  useFuse={Boolean(result.matches?.length)}
                                  highlightClassName="bg-indigo-100 text-indigo-800 px-0.5 rounded"
                                />
                              </h4>
                              <RelevanceIndicator 
                                score={result.relevanceScore} 
                                size="sm" 
                              />
                            </div>
                            
                            <p className="text-xs text-gray-600 line-clamp-2 mb-1">
                              <HighlightText 
                                text={result.description} 
                                searchTerms={inputValue.split(/\s+/)} 
                                matches={result.matches?.filter(match => match.key === 'description' || !match.key)}
                                useFuse={Boolean(result.matches?.length)}
                                highlightClassName="bg-indigo-100 text-indigo-800 px-0.5 rounded"
                              />
                            </p>
                            
                            <div className="flex items-center justify-between">
                              {/* Category */}
                              {result.category && (
                                <span className="inline-flex items-center text-[10px] bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded-full">
                                  <Tag className="h-2 w-2 ml-0.5" />
                                  {result.category}
                                </span>
                              )}
                              
                              {/* Price (for products) */}
                              {result.type === "product" && result.price && (
                                <span className="text-xs font-medium text-purple-700">
                                  {result.price.toLocaleString()} ج.م
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Search footer */}
            <div className="py-2 px-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-t border-gray-100 text-xs text-gray-500 flex justify-between items-center">
              <motion.span
                initial={{ opacity: 0.5 }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex items-center gap-1"
              >
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-gray-600 text-xs shadow-sm">
                  Esc
                </kbd>
                للإغلاق
              </motion.span>
              <span className="flex items-center">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-gray-600 text-xs ml-1 shadow-sm">
                  ↑
                </kbd>
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-gray-600 text-xs ml-1 shadow-sm">
                  ↓
                </kbd>
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-gray-600 text-xs ml-1 shadow-sm">
                  Enter
                </kbd>
                للتنقل
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBarEnhanced;
