"use client"

import { useState } from 'react'

// نوع البيانات لخيارات الترتيب
export type SortOption = 'newest' | 'popularity' | 'price_asc' | 'price_desc' | 'discount'

// Hook مخصص لإدارة خيارات الترتيب
export function useSortOptions(defaultOption: SortOption = 'newest', onSortChange?: (option: SortOption) => void) {
  // حالة خيار الترتيب الحالي
  const [sortOption, setSortOption] = useState<SortOption>(defaultOption)
  // حالة عرض قائمة خيارات الترتيب
  const [showSortOptions, setShowSortOptions] = useState(false)

  // تغيير خيار الترتيب
  const handleSortChange = (value: SortOption) => {
    setSortOption(value)
    setShowSortOptions(false)
    if (onSortChange) {
      onSortChange(value)
    }
  }

  return {
    sortOption,
    showSortOptions,
    setShowSortOptions,
    handleSortChange
  }
}
