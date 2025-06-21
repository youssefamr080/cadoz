"use client"

import type React from "react"
import { useEffect, useState } from "react"
import type { Product } from "../../types/product"
import { motion } from "framer-motion"
import LoadingSpinner from "../ui/LoadingSpinner"
import ProductSwiper from "./ProductSwiper"
import { useGetProductsQuery } from '@/lib/redux/api/apiSlice';

interface RecommendationEngineProps {
  title?: string
  subtitle?: string
}

const RecommendationEngine: React.FC<RecommendationEngineProps> = ({
  title = "مقترحة لك",
  subtitle = "منتجات قد تعجبك بناءً على اهتماماتك",
}) => {
  const [recommendations, setRecommendations] = useState<Product[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { data: fallbackProductsData, isLoading: isFallbackLoading } = useGetProductsQuery({ sort: 'rating_desc', limit: 12 });

  useEffect(() => {
    let isMounted = true;
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        // دمج بيانات التفاعل
        const viewedProducts = JSON.parse(localStorage.getItem("viewedProducts") || "[]");
        const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        const interestedProducts = JSON.parse(localStorage.getItem("interestedProducts") || "[]");
        const recentSearches = JSON.parse(localStorage.getItem("cadoz-search-history") || "[]");
        const searchTerms = recentSearches.map((search: { term?: string }) => search.term || search).filter(Boolean);
        const allInteracted = [...viewedProducts, ...wishlist, ...cart, ...interestedProducts];
        const categories = allInteracted.map((p) => p.category).filter(Boolean);
        const tags = allInteracted.flatMap((p) => p.tags || []).filter(Boolean);
        const excludeIds = [...new Set(allInteracted.map((p) => p.id))];
        const searchCategories = searchTerms.flatMap(term => {
          const matchingProducts = allInteracted.filter(p =>
            p.name.toLowerCase().includes(term.toLowerCase()) ||
            p.description?.toLowerCase().includes(term.toLowerCase())
          );
          return matchingProducts.map(p => p.category).filter(Boolean);
        });
        const searchTags = searchTerms.flatMap(term => {
          const matchingProducts = allInteracted.filter(p =>
            p.tags?.some(tag => tag.toLowerCase().includes(term.toLowerCase()))
          );
          return matchingProducts.flatMap(p => p.tags || []).filter(Boolean);
        });
        const allCategories = [...categories, ...searchCategories];
        const allTags = [...tags, ...searchTags];
        const mostCommonCategory = allCategories.sort((a, b) =>
          allCategories.filter(v => v === a).length - allCategories.filter(v => v === b).length
        ).pop();
        const mostCommonTags = [...new Set(allTags)].slice(0, 5);
        const params = new URLSearchParams();
        if (mostCommonCategory) params.append("category", mostCommonCategory);
        if (mostCommonTags.length) params.append("tags", mostCommonTags.join(","));
        if (excludeIds.length) params.append("excludeIds", excludeIds.join(","));
        if (searchTerms.length) params.append("searchTerms", searchTerms.join(","));
        params.append("limit", "12");
        params.append("personalized", "true");
        // كاش للتوصيات (15 دقيقة)
        const CacheService = (await import("@/lib/services/cache-service")).default;
        const cacheKey = `recommendations_${params.toString()}`;
        const cached = await CacheService.getItem<Product[]>(cacheKey);
        if (isMounted && cached && Array.isArray(cached) && cached.length > 0) {
          setRecommendations(cached);
          setIsLoading(false);
          return;
        }
        // إذا لم توجد توصيات مخصصة، استخدم fallback
        if (isMounted) {
          setRecommendations(null);
          setIsLoading(false);
        }
      } catch {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    fetchRecommendations();
    return () => { isMounted = false; };
  }, []);

  // عرض التحميل
  if (isLoading || isFallbackLoading) {
    return <LoadingSpinner message="جاري تحميل التوصيات..." />;
  }
  // عرض التوصيات المخصصة إذا وجدت، وإلا fallback
  const products = recommendations && recommendations.length > 0
    ? recommendations
    : (fallbackProductsData?.data || []);
  if (!products.length) {
    return null;
  }
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="py-16 bg-gradient-to-b from-white to-gray-50"
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white mb-4 shadow-lg shadow-purple-200/50">
            <span className="text-2xl">✨</span>
          </div>
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">{title}</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full mb-3"></div>
          <p className="text-center text-gray-600 max-w-2xl">{subtitle}</p>
        </div>
        <ProductSwiper products={products} />
      </div>
    </motion.section>
  );
};

export default RecommendationEngine;
