import { useState, useEffect } from 'react'

// نوع البيانات للفئة
export interface Category {
  id: string;
  name: string;
}

// نوع البيانات لخيارات الفلتر
export interface FilterOptions {
  priceRange: [number, number];
  selectedCategories: string[];
  activeFilters: string[];
}

// قائمة الفئات المتاحة مع ربط الاسم العربي بمعرف الفئة الإنجليزي
export const availableCategories: Category[] = [
  { id: "watches", name: "ساعات" },
  { id: "wallets", name: "محافظ" },
  { id: "perfumes", name: "عطور" },
  { id: "handbags", name: "شنط يد" },
  { id: "accessories", name: "إكسسوارات" },
  { id: "sunglasses", name: "نظارات شمسية" },
  { id: "toys", name: "العاب اطفال" },
  { id: "plush", name: "دباديب" },
  { id: "spray", name: "spray" },
];

// دالة مساعدة للحصول على معرف الفئة من الاسم العربي
export function getCategoryIdByName(name: string): string | undefined {
  const category = availableCategories.find(cat => cat.name === name);
  return category?.id;
}

// دالة مساعدة للحصول على اسم الفئة من المعرف
export function getCategoryNameById(id: string): string | undefined {
  const category = availableCategories.find(cat => cat.id === id);
  return category?.name;
}

/**
 * Hook مخصص لإدارة فلاتر التصفية
 */
export function useCategoryFilter(onFilterChange?: (options: FilterOptions) => void) {
  // حالة نطاق السعر
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  // حالة الفئات المحددة
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  // حالة الفلاتر النشطة
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  // حالة عرض قائمة الفلاتر
  const [showFilters, setShowFilters] = useState(false);

  // تحديث الفلاتر عند تغيير أي من الحالات
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({
        priceRange,
        selectedCategories,
        activeFilters
      });
    }
  }, [priceRange, selectedCategories, activeFilters, onFilterChange]);

  // تبديل حالة فئة معينة (إضافة/إزالة)
  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(c => c !== categoryId) 
        : [...prev, categoryId]
    );
  };

  // إضافة فئة باستخدام الاسم العربي
  const addCategoryByName = (categoryName: string) => {
    const categoryId = getCategoryIdByName(categoryName);
    if (categoryId && !selectedCategories.includes(categoryId)) {
      setSelectedCategories(prev => [...prev, categoryId]);
      if (!activeFilters.includes(categoryId)) {
        setActiveFilters(prev => [...prev, categoryId]);
      }
    }
  };

  // إزالة فلتر معين
  const handleFilterRemove = (filter: string) => {
    if (filter === "price") {
      setPriceRange([0, 5000]);
    } else {
      setSelectedCategories(prev => prev.filter(c => c !== filter));
    }
    setActiveFilters(prev => prev.filter(f => f !== filter));
  };

  // تطبيق الفلاتر المحددة
  const applyFilters = () => {
    const newFilters = [...selectedCategories];
    if (priceRange[0] > 0 || priceRange[1] < 5000) {
      newFilters.push("price");
    }
    setActiveFilters(newFilters);
    setShowFilters(false);
  };

  // مسح جميع الفلاتر
  const clearAllFilters = () => {
    setPriceRange([0, 5000]);
    setSelectedCategories([]);
    setActiveFilters([]);
  };

  // تغيير الحد الأدنى للسعر
  const handlePriceMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setPriceRange([value, priceRange[1]]);
  };

  // تغيير الحد الأقصى للسعر
  const handlePriceMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setPriceRange([priceRange[0], value]);
  };

  return {
    priceRange,
    selectedCategories,
    activeFilters,
    showFilters,
    setShowFilters,
    handleCategoryToggle,
    handleFilterRemove,
    applyFilters,
    clearAllFilters,
    handlePriceMinChange,
    handlePriceMaxChange,
    addCategoryByName,
    categories: availableCategories
  };
}
