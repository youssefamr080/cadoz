"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// ✅ تعريف نوع بيانات المنتج داخل المفضلة
interface WishlistItem {
  id: number;
  name: string;
  image: string;
  price: number;
}

// ✅ تعريف نوع `WishlistContext`
interface WishlistContextType {
  wishlist: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: number) => void;
  toggleWishlist: (item: WishlistItem) => void;
}

// ✅ إنشاء السياق
const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

// ✅ مزود `WishlistProvider`
export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  // ✅ تحميل المفضلة من LocalStorage عند تحميل الصفحة
  useEffect(() => {
    const storedWishlist = localStorage.getItem("wishlist");
    if (storedWishlist) {
      setWishlist(JSON.parse(storedWishlist));
    }
  }, []);

  // ✅ تحديث LocalStorage عند تغيير المفضلة
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // ✅ إضافة منتج إلى المفضلة
  const addToWishlist = (item: WishlistItem) => {
    setWishlist((prevWishlist) => [...prevWishlist, item]);
  };

  // ✅ إزالة منتج من المفضلة
  const removeFromWishlist = (id: number) => {
    setWishlist((prevWishlist) => prevWishlist.filter((item) => item.id !== id));
  };

  // ✅ وظيفة التبديل بين الإضافة والإزالة (تعمل مع الوظائف القديمة)
  const toggleWishlist = (item: WishlistItem) => {
    setWishlist((prevWishlist) => {
      const isExisting = prevWishlist.some((w) => w.id === item.id);
      return isExisting ? prevWishlist.filter((w) => w.id !== item.id) : [...prevWishlist, item];
    });
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

// ✅ هوك `useWishlist`
export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
