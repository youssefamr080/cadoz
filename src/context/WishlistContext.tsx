"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

// تعريف نوع بيانات المنتج مع إضافة خاصية المخزون
interface WishlistItem {
  id: number;
  name: string;
  image: string;
  price: number;
  stock: number; // إضافة حالة المخزون للمنتج
  discount?: number; // سعر الخصم (اختياري)
  rating?: number; // تقييم المنتج (اختياري)
  categoryId?: number; // تصنيف المنتج (اختياري)
}

// التأكد من صحة الإدخال
type ValidatedItem = Omit<WishlistItem, "stock"> & { stock: number };

// تعريف نوع سياق المفضلة
interface WishlistContextType {
  wishlist: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: number) => void;
  toggleWishlist: (item: WishlistItem) => void;
  isInWishlist: (id: number) => boolean;
  clearWishlist: () => void;
  validateStock: (item: WishlistItem) => ValidatedItem | null;
}

// إنشاء السياق مع قيمة افتراضية مناسبة
const WishlistContext = createContext<WishlistContextType>({
  wishlist: [],
  addToWishlist: () => {},
  removeFromWishlist: () => {},
  toggleWishlist: () => {},
  isInWishlist: () => false,
  clearWishlist: () => {},
  validateStock: () => null,
});

// مزود WishlistProvider
export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // تحميل المفضلة من LocalStorage بطريقة آمنة
  useEffect(() => {
    try {
      const storedWishlist = localStorage.getItem("wishlist");
      if (storedWishlist) {
        const parsedData = JSON.parse(storedWishlist);
        if (Array.isArray(parsedData)) {
          setWishlist(parsedData);
        } else {
          console.error("بيانات المفضلة غير صالحة، تم إعادة التعيين");
          setWishlist([]);
        }
      }
    } catch (error) {
      console.error("خطأ في تحميل المفضلة:", error);
      setWishlist([]);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // تحديث LocalStorage عند تغيير المفضلة بطريقة آمنة
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
      } catch (error) {
        console.error("خطأ في حفظ المفضلة:", error);
      }
    }
  }, [wishlist, isInitialized]);

  // التحقق من وجود المنتج في المفضلة
  const isInWishlist = useCallback((id: number): boolean => {
    return wishlist.some((item) => item.id === id);
  }, [wishlist]);

  // إضافة منتج إلى المفضلة مع التحقق من عدم التكرار
  const addToWishlist = useCallback((item: WishlistItem) => {
    setWishlist((prevWishlist) => {
      // التأكد من عدم وجود المنتج مسبقاً
      if (prevWishlist.some((existingItem) => existingItem.id === item.id)) {
        return prevWishlist; // لا تغيير إذا كان المنتج موجوداً بالفعل
      }
      
      // حفظ المخزون مع المنتج
      const stockSafeItem = {
        ...item,
        stock: item.stock ?? 0 // التأكد من وجود قيمة للمخزون
      };
      
      return [...prevWishlist, stockSafeItem];
    });
  }, []);

  // إزالة منتج من المفضلة
  const removeFromWishlist = useCallback((id: number) => {
    setWishlist((prevWishlist) => prevWishlist.filter((item) => item.id !== id));
  }, []);

  // تبديل حالة المنتج في المفضلة (إضافة أو إزالة)
  const toggleWishlist = useCallback((item: WishlistItem) => {
    setWishlist((prevWishlist) => {
      const existingIndex = prevWishlist.findIndex((w) => w.id === item.id);
      
      if (existingIndex >= 0) {
        // إزالة المنتج إذا كان موجوداً
        return prevWishlist.filter((_, index) => index !== existingIndex);
      } else {
        // إضافة المنتج مع التأكد من وجود قيمة للمخزون
        const stockSafeItem = {
          ...item,
          stock: item.stock ?? 0
        };
        return [...prevWishlist, stockSafeItem];
      }
    });
  }, []);

  // مسح المفضلة بالكامل
  const clearWishlist = useCallback(() => {
    setWishlist([]);
  }, []);

  // التحقق من توفر المخزون للمنتج
  const validateStock = useCallback((item: WishlistItem): ValidatedItem | null => {
    // التأكد من وجود معلومات المخزون
    if (item.stock === undefined || item.stock === null) {
      console.error(`المنتج ${item.id} لا يحتوي على معلومات المخزون`);
      return null;
    }
    
    // التحقق من أن المخزون أكبر من صفر
    if (item.stock <= 0) {
      return null; // المنتج غير متوفر في المخزون
    }
    
    return item as ValidatedItem;
  }, []);

  // توفير السياق للمكونات الفرعية
  return (
    <WishlistContext.Provider 
      value={{ 
        wishlist, 
        addToWishlist, 
        removeFromWishlist, 
        toggleWishlist, 
        isInWishlist,
        clearWishlist,
        validateStock
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

// هوك useWishlist لاستخدام سياق المفضلة
export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("يجب استخدام useWishlist داخل WishlistProvider");
  }
  return context;
};