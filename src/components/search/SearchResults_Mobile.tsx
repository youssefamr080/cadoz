"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Loader2, SortAsc, Filter, Grid, List } from 'lucide-react';

// Types للبحث
interface SearchResult {
  id: string;
  name: string;
  description: string;
  image: string;
  price?: number;
  oldPrice?: number;
  rating?: number;
  category: string;
  subCategory?: string;
  brand?: string;
  type: 'product' | 'inspiration';
  tags: string[];
  url: string;
  inStock?: boolean;
  trending?: boolean;
  relevanceScore?: number;
}

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  viewMode: 'grid' | 'list';
  searchQuery: string;
  onViewModeChange?: (mode: 'grid' | 'list') => void;
}

export function SearchResults({ 
  results, 
  isLoading, 
  viewMode, 
  searchQuery,
  onViewModeChange
}: SearchResultsProps) {
  
  const [sortBy, setSortBy] = useState<'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest'>('relevance');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // استخراج الفلاتر المتاحة من النتائج
  const availableFilters = useMemo(() => {
    const brands = Array.from(new Set(results.map(r => r.brand).filter(Boolean)));
    const categories = Array.from(new Set(results.map(r => r.category).filter(Boolean)));
    const subCategories = Array.from(new Set(results.map(r => r.subCategory).filter(Boolean)));
    
    return { brands, categories, subCategories };
  }, [results]);

  // فلترة وترتيب النتائج
  const filteredAndSortedResults = useMemo(() => {
    let filtered = [...results];

    // تطبيق فلاتر العلامة التجارية
    if (selectedBrand !== 'all') {
      filtered = filtered.filter(item => item.brand === selectedBrand);
    }

    // تطبيق فلاتر الفئة
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // ترتيب النتائج
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return (a.price || 0) - (b.price || 0);
        case 'price_desc':
          return (b.price || 0) - (a.price || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
          return 0; // يمكن إضافة منطق التاريخ لاحقاً
        case 'relevance':
        default:
          return (b.relevanceScore || 0) - (a.relevanceScore || 0);
      }
    });

    return filtered;
  }, [results, sortBy, selectedBrand, selectedCategory]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 sm:py-20">
        <div className="text-center">
          <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin mx-auto mb-3 sm:mb-4 text-blue-600" />
          <p className="text-sm sm:text-base text-gray-600">جاري البحث...</p>
        </div>
      </div>
    );
  }

  // No results
  if (!results || results.length === 0) {
    return (
      <div className="text-center py-12 sm:py-20">
        <div className="max-w-md mx-auto px-4">
          <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <Star className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            لا توجد نتائج
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            لم نجد أي منتجات تطابق بحثك عن "{searchQuery}"
          </p>
          <div className="text-xs sm:text-sm text-gray-500">
            <p>جرب:</p>
            <ul className="mt-2 space-y-1">
              <li>• التحقق من الإملاء</li>
              <li>• استخدام كلمات أكثر عمومية</li>
              <li>• البحث عن فئة مختلفة</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Results display
  return (
    <div className="space-y-3 sm:space-y-6">
      {/* شريط التحكم - محسن للهواتف */}
      <div className="bg-white p-3 sm:p-4 rounded-lg border shadow-sm">
        {/* عدد النتائج */}
        <div className="mb-3 sm:mb-4">
          <p className="text-sm sm:text-base text-gray-600">
            <span className="hidden sm:inline">تم العثور على </span>
            <span className="font-semibold text-blue-600">{filteredAndSortedResults.length}</span>
            <span className="hidden sm:inline"> نتيجة من أصل {results.length}</span>
            <span className="sm:hidden"> نتيجة</span>
            <span className="hidden sm:inline"> للبحث عن "{searchQuery}"</span>
          </p>
        </div>

        {/* أدوات التحكم */}
        <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
          {/* أزرار وضع العرض والترتيب */}
          <div className="flex items-center gap-3">
            {/* أزرار وضع العرض */}
            {onViewModeChange && (
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => onViewModeChange('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="عرض شبكي"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onViewModeChange('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="عرض قائمة"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* الترتيب */}
            <div className="flex items-center gap-2">
              <SortAsc className="w-4 h-4 text-gray-500 hidden sm:block" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="relevance">الأكثر صلة</option>
                <option value="price_asc">السعر: الأقل أولاً</option>
                <option value="price_desc">السعر: الأعلى أولاً</option>
                <option value="rating">الأعلى تقييماً</option>
                <option value="newest">الأحدث</option>
              </select>
            </div>
          </div>

          {/* الفلاتر */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {/* فلتر العلامة التجارية */}
            {availableFilters.brands.length > 0 && (
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-0 flex-shrink-0"
              >
                <option value="all">جميع العلامات</option>
                {availableFilters.brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            )}

            {/* فلتر الفئة */}
            {availableFilters.categories.length > 0 && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-0 flex-shrink-0"
              >
                <option value="all">جميع الفئات</option>
                {availableFilters.categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* النتائج - محسنة للهواتف */}
      <div className={viewMode === 'grid' 
        ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4'
        : 'space-y-3 sm:space-y-4'
      }>
        {filteredAndSortedResults.map((result) => (
          <ProductCard 
            key={result.id} 
            product={result} 
            viewMode={viewMode}
          />
        ))}
      </div>

      {/* رسالة إذا لم توجد نتائج بعد الفلترة */}
      {filteredAndSortedResults.length === 0 && results.length > 0 && (
        <div className="text-center py-8 sm:py-10">
          <p className="text-gray-600 mb-4">لا توجد نتائج تطابق الفلاتر المحددة</p>
          <button
            onClick={() => {
              setSelectedBrand('all');
              setSelectedCategory('all');
            }}
            className="text-blue-600 hover:text-blue-800 underline text-sm sm:text-base"
          >
            إزالة جميع الفلاتر
          </button>
        </div>
      )}
    </div>
  );
}

// Product Card Component - محسن للهواتف
function ProductCard({ 
  product, 
  viewMode 
}: { 
  product: SearchResult; 
  viewMode: 'grid' | 'list' 
}) {
  if (viewMode === 'grid') {
    return (
      <Link href={product.url} className="group block">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
          {/* Product Image */}
          <div className="aspect-square relative overflow-hidden bg-gray-100">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            />
            {product.trending && (
              <div className="absolute top-1 right-1 sm:top-2 sm:right-2">
                <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">
                  رائج
                </span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-2 sm:p-3 lg:p-4">
            <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-xs sm:text-sm lg:text-base line-clamp-2 group-hover:text-blue-600 transition-colors">
              {product.name}
            </h3>
            
            {/* Price */}
            <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
              <span className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">
                {product.price} ج.م
              </span>
              {product.oldPrice && (
                <span className="text-xs sm:text-sm text-gray-500 line-through">
                  {product.oldPrice} ج.م
                </span>
              )}
            </div>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-xs sm:text-sm text-gray-600">{product.rating}</span>
              </div>
            )}

            {/* Category - مخفي على الهواتف الصغيرة */}
            <div className="hidden sm:block mt-2 text-xs text-gray-500 truncate">
              {product.category}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // List view - محسن للهواتف
  return (
    <Link href={product.url} className="group block">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
        <div className="flex">
          {/* Product Image */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 relative overflow-hidden bg-gray-100 flex-shrink-0">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 640px) 80px, (max-width: 1024px) 96px, 128px"
            />
          </div>

          {/* Product Info */}
          <div className="flex-1 p-3 sm:p-4 min-w-0">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base group-hover:text-blue-600 transition-colors line-clamp-2">
                  {product.name}
                </h3>
                
                {/* Description - مخفي على الهواتف الصغيرة */}
                <p className="hidden sm:block text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2">
                  {product.description}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg font-bold text-gray-900">
                      {product.price} ج.م
                    </span>
                    {product.oldPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        {product.oldPrice} ج.م
                      </span>
                    )}
                  </div>

                  {/* Rating */}
                  {product.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-600">{product.rating}</span>
                    </div>
                  )}
                </div>

                {/* Category and Tags */}
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                  <span className="truncate">{product.category}</span>
                  {product.trending && (
                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full flex-shrink-0">
                      رائج
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
