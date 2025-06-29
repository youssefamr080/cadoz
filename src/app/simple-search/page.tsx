"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Grid, List, SortAsc } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SimpleSearchResults } from '@/components/search/SimpleSearchResults';
import { useSearchParams, useRouter } from 'next/navigation';

interface SearchResult {
  id: string;
  name: string;
  description: string;
  image: string;
  type: 'product' | 'inspiration';
  price?: number;
  oldPrice?: number;
  rating?: number;
  category: string;
  subCategory?: string;
  tags: string[];
  brand?: string;
  inStock?: boolean;
  trending?: boolean;
  url: string;
}

export default function SimpleSearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('relevance');

  // البحث في المنتجات
  const searchProducts = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔍 البحث عن:', query);
      const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}&sortBy=${sortBy}`);
      const data = await response.json();
      
      console.log('📊 نتائج البحث:', data);
      
      if (data.success) {
        setResults(data.data || []);
      } else {
        console.error('خطأ في البحث:', data.error);
        setResults([]);
      }
    } catch (error) {
      console.error('خطأ في استدعاء API:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [sortBy]);

  // البحث عند تغيير الاستعلام
  useEffect(() => {
    if (initialQuery) {
      searchProducts(initialQuery);
    }
  }, [initialQuery, searchProducts]);

  // معالج البحث
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        
        {/* شريط البحث */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <form onSubmit={handleSearch} className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="ابحث عن المنتجات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'جاري البحث...' : 'بحث'}
            </Button>
          </form>

          {/* أدوات التحكم */}
          {(results.length > 0 || isLoading) && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* طريقة العرض */}
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* الترتيب */}
              <div className="flex items-center gap-2">
                <SortAsc className="w-4 h-4 text-gray-600" />
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="ترتيب حسب" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">الأكثر صلة</SelectItem>
                    <SelectItem value="price_asc">السعر: من الأقل للأعلى</SelectItem>
                    <SelectItem value="price_desc">السعر: من الأعلى للأقل</SelectItem>
                    <SelectItem value="rating">التقييم</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </motion.div>

        {/* النتائج */}
        <SimpleSearchResults
          results={results}
          isLoading={isLoading}
          viewMode={viewMode}
          searchQuery={searchQuery}
        />

      </div>
    </div>
  );
}
