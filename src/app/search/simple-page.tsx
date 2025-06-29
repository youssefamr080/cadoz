"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SearchResults } from '@/components/search/SearchResults';
import { useSearchStore } from '@/lib/hooks/useSearchStore';
import { useSearchParams } from 'next/navigation';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'all' | 'products' | 'inspirations'>('all');
  
  const {
    results,
    isLoading,
    updateSearch
  } = useSearchStore();

  // تحديث البحث عند تحميل الصفحة مع query parameter
  useEffect(() => {
    if (initialQuery && initialQuery !== searchQuery) {
      setSearchQuery(initialQuery);
      updateSearch(initialQuery);
    }
  }, [initialQuery, searchQuery, updateSearch]);

  // معالج البحث
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    updateSearch(query);
  }, [updateSearch]);

  // معالج تغيير البحث في الخانة
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  // معالج إرسال البحث
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleSearch(searchQuery.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* شريط البحث البسيط */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-center mb-6 text-gray-900">
              البحث في المنتجات
            </h1>
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  placeholder="ابحث عن المنتجات..."
                  className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* محتوى النتائج */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* التبويبات */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | 'products' | 'inspirations')} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="all">
                جميع النتائج ({results.length})
              </TabsTrigger>
              <TabsTrigger value="products">
                المنتجات ({results.filter(r => r.type === 'product').length})
              </TabsTrigger>
              <TabsTrigger value="inspirations">
                الإلهامات ({results.filter(r => r.type === 'inspiration').length})
              </TabsTrigger>
            </TabsList>

            {/* النتائج */}
            <TabsContent value="all" className="mt-0">
              <SearchResults
                results={results}
                isLoading={isLoading}
                viewMode={viewMode}
                searchQuery={searchQuery}
                onViewModeChange={setViewMode}
              />
            </TabsContent>
            
            <TabsContent value="products" className="mt-0">
              <SearchResults
                results={results.filter(r => r.type === 'product')}
                isLoading={isLoading}
                viewMode={viewMode}
                searchQuery={searchQuery}
                onViewModeChange={setViewMode}
              />
            </TabsContent>
            
            <TabsContent value="inspirations" className="mt-0">
              <SearchResults
                results={results.filter(r => r.type === 'inspiration')}
                isLoading={isLoading}
                viewMode={viewMode}
                searchQuery={searchQuery}
                onViewModeChange={setViewMode}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
