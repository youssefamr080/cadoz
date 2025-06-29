"use client";

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SearchResults } from '@/components/search/SearchResults';
import SearchSuggestions from '@/components/search/SearchSuggestions';
import SearchPageBar from '@/components/search/SearchPageBar';
import { useSearchStore } from '@/lib/hooks/useSearchStore';
import { useSearchParams } from 'next/navigation';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'all' | 'products' | 'inspirations'>('all');
  
  const {
    results,
    isLoading,
    updateSearch
  } = useSearchStore();

  // معالج البحث البسيط
  const handleSearch = (query: string) => {
    if (query.trim()) {
      updateSearch(query);
      // تحديث URL
      const newUrl = `/search?q=${encodeURIComponent(query)}`;
      window.history.replaceState(null, '', newUrl);
    }
  };

  // تحديث البحث عند تحميل الصفحة مع query parameter
  useEffect(() => {
    if (initialQuery) {
      updateSearch(initialQuery);
    }
  }, [initialQuery, updateSearch]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* هيدر الصفحة مع شريط البحث - محسن للهواتف */}
      <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* العنوان - قابل للطي على الهواتف */}
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
              {initialQuery ? (
                <>
                  <span className="hidden sm:inline">نتائج البحث عن: &quot;</span>
                  <span className="sm:hidden">نتائج: &quot;</span>
                  <span className="text-blue-600">{initialQuery}</span>&quot;
                </>
              ) : (
                'نتائج البحث'
              )}
            </h1>
            
            {/* شريط البحث الخاص بصفحة البحث */}
            <div className="w-full">
              <SearchPageBar
                initialValue={initialQuery}
                onSearch={handleSearch}
                placeholder="ابحث عن أي شيء..."
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* محتوى النتائج - محسن للهواتف */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="max-w-7xl mx-auto">
          {/* إظهار الاقتراحات إذا لم يكن هناك بحث نشط */}
          {!initialQuery || initialQuery.trim().length === 0 ? (
            <SearchSuggestions 
              onSuggestionClick={(suggestion) => {
                handleSearch(suggestion);
              }}
              currentQuery={initialQuery}
            />
          ) : (
            <>
              {/* التبويبات - محسنة للهواتف */}
              <Tabs value={activeTab}                onValueChange={(value) => setActiveTab(value as 'all' | 'products' | 'inspirations')}className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-8 h-auto p-1">
                  <TabsTrigger 
                    value="all"
                    className="text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    <span className="hidden sm:inline">جميع النتائج</span>
                    <span className="sm:hidden">الكل</span>
                    <span className="mr-1 text-xs">({results.length})</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="products"
                    className="text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    <span className="hidden sm:inline">المنتجات</span>
                    <span className="sm:hidden">منتجات</span>
                    <span className="mr-1 text-xs">({results.filter(r => r.type === 'product').length})</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="inspirations"
                    className="text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    <span className="hidden sm:inline">الإلهامات</span>
                    <span className="sm:hidden">إلهامات</span>
                    <span className="mr-1 text-xs">({results.filter(r => r.type === 'inspiration').length})</span>
                  </TabsTrigger>
                </TabsList>

                {/* النتائج */}
                <TabsContent value="all" className="mt-0">
                  <SearchResults
                    results={results}
                    isLoading={isLoading}
                    viewMode={viewMode}
                    searchQuery={initialQuery}
                    onViewModeChange={setViewMode}
                  />
                </TabsContent>
                
                <TabsContent value="products" className="mt-0">
                  <SearchResults
                    results={results.filter(r => r.type === 'product')}
                    isLoading={isLoading}
                    viewMode={viewMode}
                    searchQuery={initialQuery}
                    onViewModeChange={setViewMode}
                  />
                </TabsContent>
                
                <TabsContent value="inspirations" className="mt-0">
                  <SearchResults
                    results={results.filter(r => r.type === 'inspiration')}
                    isLoading={isLoading}
                    viewMode={viewMode}
                    searchQuery={initialQuery}
                    onViewModeChange={setViewMode}
                  />
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
