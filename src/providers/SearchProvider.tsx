"use client";

import React, { useEffect } from "react";
import { useSearchStore } from "@/lib/stores/useSearchStore";


interface SearchProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component that initializes the search store with products and inspirations data
 * This ensures that search functionality has access to the necessary data
 */
export function SearchProvider({ children }: SearchProviderProps) {
  const { 
    updateProductsCache, 
    updateInspirationsCache,
    productsCache,
    inspirationsCache
  } = useSearchStore();

  // Fetch products and inspirations data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Only fetch products if cache is empty
        if (productsCache.length === 0) {
          const productsResponse = await fetch("/api/products?limit=100");
          const productsData = await productsResponse.json();
          if (productsData.data && Array.isArray(productsData.data)) {
            updateProductsCache(productsData.data);
            console.log("Products cache updated with", productsData.data.length, "items");
          }
        }

        // Only fetch inspirations if cache is empty
        if (inspirationsCache.length === 0) {
          const inspirationsResponse = await fetch("/api/gift/inspirations?all=true&limit=100");
          const inspirationsData = await inspirationsResponse.json();
          if (inspirationsData.data && Array.isArray(inspirationsData.data)) {
            updateInspirationsCache(inspirationsData.data);
            console.log("Inspirations cache updated with", inspirationsData.data.length, "items");
          }
        }
      } catch (error) {
        console.error("Error fetching search data:", error);
      }
    };

    fetchData();
  }, [updateProductsCache, updateInspirationsCache, productsCache.length, inspirationsCache.length]);

  return <>{children}</>;
}

export default SearchProvider;
