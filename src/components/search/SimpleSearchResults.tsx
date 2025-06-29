"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Star, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

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

interface SimpleSearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  viewMode: 'grid' | 'list';
  searchQuery: string;
  className?: string;
}

export function SimpleSearchResults({ 
  results, 
  isLoading, 
  viewMode, 
  searchQuery,
  className 
}: SimpleSearchResultsProps) {

  // إظهار Skeleton أثناء التحميل
  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="grid gap-4" style={{
          gridTemplateColumns: viewMode === 'grid' 
            ? 'repeat(auto-fill, minmax(250px, 1fr))' 
            : '1fr'
        }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-48 w-full mb-4" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // عرض رسالة عدم وجود نتائج
  if (!results.length) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold mb-2">لا توجد نتائج</h3>
        <p className="text-gray-600">
          لم نجد أي منتجات تطابق بحثك عن &quot;{searchQuery}&quot;
        </p>
        <p className="text-sm text-gray-500 mt-2">
          جرب كلمات بحث مختلفة أو أكثر عمومية
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* عرض عدد النتائج */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          وُجد {results.length} منتج
          {searchQuery && (
            <span> لبحثك عن &quot;<strong>{searchQuery}</strong>&quot;</span>
          )}
        </p>
      </div>

      {/* النتائج */}
      <div className="grid gap-4" style={{
        gridTemplateColumns: viewMode === 'grid' 
          ? 'repeat(auto-fill, minmax(280px, 1fr))' 
          : '1fr'
      }}>
        {results.map((result, index) => (
          <motion.div
            key={result.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link href={result.url}>
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
                <CardContent className="p-0">
                  {viewMode === 'grid' ? (
                    // عرض الشبكة
                    <div>
                      {/* الصورة */}
                      <div className="relative aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                        <Image
                          src={result.image}
                          alt={result.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        
                        {/* شارات الحالة */}
                        <div className="absolute top-2 right-2 flex flex-col gap-1">
                          {result.trending && (
                            <Badge variant="secondary" className="bg-orange-500 text-white">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              رائج
                            </Badge>
                          )}
                          {!result.inStock && (
                            <Badge variant="destructive">
                              نفد المخزون
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* تفاصيل المنتج */}
                      <div className="p-4">
                        <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {result.name}
                        </h3>
                        
                        {/* الفئة والعلامة التجارية */}
                        <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                          <span>{result.category}</span>
                          {result.subCategory && (
                            <>
                              <span>•</span>
                              <span>{result.subCategory}</span>
                            </>
                          )}
                          {result.brand && (
                            <>
                              <span>•</span>
                              <span>{result.brand}</span>
                            </>
                          )}
                        </div>

                        {/* التقييم */}
                        {result.rating && (
                          <div className="flex items-center gap-1 mb-2">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{result.rating}</span>
                          </div>
                        )}

                        {/* السعر */}
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">
                            {result.price} ج.م
                          </span>
                          {result.oldPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              {result.oldPrice} ج.م
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // عرض القائمة
                    <div className="flex gap-4 p-4">
                      {/* الصورة */}
                      <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={result.image}
                          alt={result.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* التفاصيل */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold mb-1 group-hover:text-blue-600 transition-colors">
                          {result.name}
                        </h3>
                        
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {result.description}
                        </p>
                        
                        {/* معلومات إضافية */}
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                          <span>{result.category}</span>
                          {result.subCategory && <span>{result.subCategory}</span>}
                          {result.brand && <span>{result.brand}</span>}
                        </div>

                        {/* السعر والتقييم */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold">
                              {result.price} ج.م
                            </span>
                            {result.oldPrice && (
                              <span className="text-sm text-gray-500 line-through">
                                {result.oldPrice} ج.م
                              </span>
                            )}
                          </div>
                          
                          {result.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm">{result.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
