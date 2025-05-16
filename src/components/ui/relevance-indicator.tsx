"use client";

import React from "react";
import { motion } from "framer-motion";

interface RelevanceIndicatorProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

/**
 * A component that visualizes the relevance score of a search result
 */
export function RelevanceIndicator({ 
  score, 
  size = "md", 
  showLabel = false 
}: RelevanceIndicatorProps) {
  // Normalize score to 0-100 for display
  const normalizedScore = Math.min(Math.round(score * 100), 100);
  
  // Determine color based on score
  const getColor = () => {
    if (normalizedScore >= 80) return "bg-green-500";
    if (normalizedScore >= 60) return "bg-green-400";
    if (normalizedScore >= 40) return "bg-yellow-400";
    if (normalizedScore >= 20) return "bg-orange-400";
    return "bg-red-400";
  };
  
  // Size classes
  const sizeClasses = {
    sm: "h-1 w-12",
    md: "h-1.5 w-16",
    lg: "h-2 w-20"
  };
  
  // Text size classes
  const textSizeClasses = {
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-sm"
  };
  
  return (
    <div className="flex flex-col items-center">
      <div className={`bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${normalizedScore}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`h-full ${getColor()}`}
        />
      </div>
      {showLabel && (
        <span className={`${textSizeClasses[size]} text-gray-500 mt-0.5 rtl:text-right`}>
          {normalizedScore}%
        </span>
      )}
    </div>
  );
}
