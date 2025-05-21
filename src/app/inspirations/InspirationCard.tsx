"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Star, Eye, ChevronDown, Heart, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGift } from "@/context/gift-context";
import { useRouter } from "next/navigation";
import type { Inspiration } from "@/types/inspiration";

import { HighlightText } from "@/components/ui/highlight-text";
import { RelevanceIndicator } from "@/components/ui/relevance-indicator";
import AddToCartButton from "@/app/inspiration/[id]/AddToCartButton";

interface InspirationCardProps {
  gift: Inspiration;
  getCategoryArabicName?: (category: string) => string;
  searchTerms?: string[];
  relevanceScore?: number;
  showRelevance?: boolean;
}

export default function InspirationCard({ 
  gift, 
  getCategoryArabicName,
  searchTerms = [],
  relevanceScore = 0,
  showRelevance = false
}: InspirationCardProps) {
  const router = useRouter();
  const { loadInspiration } = useGift();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});
  // Toggle description visibility for a gift
  const toggleDescription = (giftId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [giftId]: !prev[giftId]
    }));
  };

  // Toggle like state for a gift
  const toggleLike = (giftId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedItems(prev => ({
      ...prev,
      [giftId]: !prev[giftId]
    }));
  };

  // Handle using the inspiration (customize)
  const handleUseInspiration = (gift: Inspiration) => {
    loadInspiration(gift);
    router.push(`/gift`);
  };

  // Format category name if function provided
  const categoryName = gift.category && getCategoryArabicName 
    ? getCategoryArabicName(gift.category) 
    : gift.category;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl border border-purple-100 overflow-hidden shadow-md h-full hover:shadow-xl transition-shadow duration-300"
    >
      {/* Image with improved aspect ratio */}
      <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden group">
        <Image 
          src={gift.image || "/placeholder.svg"} 
          alt={gift.name} 
          fill 
          sizes="(max-width: 480px) 100vw, (max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-700 hover:scale-110" 
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Like Button */}
        <button 
          onClick={(e) => toggleLike(gift.id, e)}
          className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md z-10 transition-transform duration-300 hover:scale-110"
        >
          <Heart 
            className={`w-3.5 h-3.5 ${likedItems[gift.id] ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} 
          />
        </button>
        
        {/* Category Badge */}
        {gift.category && (
          <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full z-10">
            {categoryName}
          </div>
        )}
        
        {/* Rating Badge */}
        <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 rounded-full px-2 py-1 flex items-center shadow-sm z-10">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-medium ml-1">{gift.rating}</span>
        </div>
        
        {/* Quick action button - Edit Gift */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => handleUseInspiration(gift)}
          className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-full text-xs font-medium shadow-lg flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <Edit className="w-3 h-3" />
          تخصيص الهدية
        </motion.button>
      </div>

      <div className="p-3">
        {/* Name with expandable arrow */}
        <div 
          className="flex justify-between items-center cursor-pointer py-1"
          onClick={() => toggleDescription(gift.id)}
        >
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-medium text-gray-900 truncate text-sm">
              {searchTerms.length > 0 ? (
                <HighlightText 
                  text={gift.name} 
                  searchTerms={searchTerms} 
                  highlightClassName="bg-yellow-100 text-gray-900 px-0.5 rounded"
                />
              ) : gift.name}
            </h3>
            {showRelevance && relevanceScore > 0 && (
              <div className="flex-shrink-0">
                <RelevanceIndicator score={relevanceScore} size="sm" />
              </div>
            )}
          </div>
          <motion.div
            animate={{ rotate: expandedItems[gift.id] ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </motion.div>
        </div>

        {/* Expandable description */}
        <AnimatePresence>
          {expandedItems[gift.id] && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <p className="text-xs text-gray-600 my-2 line-clamp-3">
                {searchTerms.length > 0 ? (
                  <HighlightText 
                    text={gift.description} 
                    searchTerms={searchTerms} 
                    highlightClassName="bg-yellow-100 text-gray-900 px-0.5 rounded"
                  />
                ) : gift.description}
              </p>
              
              {/* Occasions */}
              {gift.occasions && gift.occasions.length > 0 && (
                <div className="mt-2">
                  <h4 className="text-xs font-medium text-gray-700 mb-1">المناسبات:</h4>
                  <div className="flex flex-wrap gap-1">
                    {gift.occasions.map((occasion, index) => (
                      <span 
                        key={`${gift.id}-occasion-${index}`}
                        className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full"
                      >
                        {occasion}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Tags */}
              {gift.tags && gift.tags.length > 0 && (
                <div className="mt-2">
                  <h4 className="text-xs font-medium text-gray-700 mb-1">الكلمات المفتاحية:</h4>
                  <div className="flex flex-wrap gap-1">
                    {gift.tags.map((tag, index) => (
                      <span 
                        key={`${gift.id}-tag-${index}`}
                        className="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Action buttons */}
        <div className="flex justify-between mt-3 gap-1">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="text-xs flex-1 h-8 rounded-xl"
          >
            <Link href={`/inspiration/${gift.id}`}>
              <Eye className="w-3 h-3 mr-1" />
              عرض
            </Link>
          </Button>

          <AddToCartButton inspiration={gift} />
        </div>
      </div>
    </motion.div>
  );
}
