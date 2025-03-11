import React, { useEffect, useMemo } from "react";
import { products } from "../../data/products";
import BrandSwiper from "../../components/product/BrandSwiper";

const SubCategoryProducts = ({
  category,
  subCategory,
}: {
  category: string;
  subCategory: string;
}) => {
  // ✅ 1. حساب المنتجات المفلترة باستخدام useMemo
  const filteredProducts = useMemo(() => {
    return products.filter(
      (p) =>
        p.category?.toLowerCase() === category?.toLowerCase() &&
        p.subCategory?.toLowerCase() === subCategory?.toLowerCase()
    );
  }, [category, subCategory]); // يعاد الحساب عند تغيير الفئة أو الفئة الفرعية

  // ✅ 2. حساب البراندات باستخدام useMemo
  const brands = useMemo(() => {
    return [
      ...new Set(
        filteredProducts
          .map((p) => p.brand)
          .filter((b) => typeof b === "string" && b !== "")
      )
    ];
  }, [filteredProducts]); // يعاد الحساب عند تغير المنتجات المفلترة

  // ✅ 3. useEffect مع التبعيات الصحيحة
  useEffect(() => {
    console.log("🔹 الفئة:", category);
    console.log("🔹 الفئة الفرعية:", subCategory);
    console.log("🔹 عدد المنتجات المطابقة:", filteredProducts.length);
    console.log("🔹 البراندات المتاحة:", brands);
  }, [category, subCategory, filteredProducts.length, brands]);

  return (
    <div className="container mx-auto my-6">
      {filteredProducts.length > 0 ? (
        brands.length > 0 ? (
          brands.map((brand) => {
            const brandProducts = filteredProducts.filter((p) => p.brand === brand);
            return brandProducts.length > 0 ? (
              <BrandSwiper key={brand} brand={brand} products={brandProducts} />
            ) : null;
          })
        ) : (
          <p className="text-center text-gray-500 text-lg">
            ⚠️ لا توجد براندات متاحة لهذا القسم
          </p>
        )
      ) : (
        <p className="text-center text-gray-500 text-lg">
          ⚠️ لا توجد منتجات متاحة لهذا القسم حاليًا
        </p>
      )}
    </div>
  );
};

export default SubCategoryProducts;