"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import CategoryBanner from "../../../components/category/CategoryBanner";
import SubCategorySwiper from "../../../components/category/SubCategorySwiper";
import SubCategoryProducts from "../../../components/category/SubCategoryProducts";

type CategoryType = "men" | "women" | "kids" ;

// القيم الافتراضية للفئات الفرعية (تم نقلها خارج المكون لتجنب إعادة إنشائها)
const defaultSubCategories: Record<CategoryType, string> = {
  men: "ساعات",
  women: "ساعات",
  kids: "دباديب"
};

const CategoryPage = () => {
  const params = useParams();
  const categoryName = params?.categoryName as CategoryType;
  
  // إدارة حالة القسم الفرعي
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");
  
  // التحقق من صحة الفئة
  const isValidCategory = (category: string): category is CategoryType => {
    return ["men", "women", "kids"].includes(category);
  };

  // تهيئة القسم الفرعي
  useEffect(() => {
    if (isValidCategory(categoryName)) {
      setSelectedSubCategory(defaultSubCategories[categoryName]);
    }
  }, [categoryName]); // أضف defaultSubCategories هنا

  // التحقق من وجود فئة صالحة
  if (!isValidCategory(categoryName)) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-semibold">
        ⚠️ خطأ: هذا القسم غير موجود!
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <CategoryBanner category={categoryName} />
      
      <SubCategorySwiper
        category={categoryName}
        onSelectSubCategory={setSelectedSubCategory}
        initialSubCategory={selectedSubCategory} // استخدم selectedSubCategory هنا
      />
      
      <div className="container mx-auto px-4 my-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {selectedSubCategory}
        </h2>
        <SubCategoryProducts
          category={categoryName}
          subCategory={selectedSubCategory}
        />
      </div>
      
      <Footer />
    </div>
  );
};

export default CategoryPage;