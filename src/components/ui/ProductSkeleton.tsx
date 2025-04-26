import React from 'react';

interface ProductSkeletonProps {
  count?: number;
}

const ProductSkeleton: React.FC<ProductSkeletonProps> = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white p-4 rounded-lg shadow-sm animate-pulse border border-gray-100">
          {/* صورة المنتج */}
          <div className="w-full h-48 bg-gray-200 rounded-md mb-4"></div>
          
          {/* اسم المنتج */}
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
          
          {/* السعر */}
          <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
          
          {/* نجوم التقييم */}
          <div className="flex gap-1 mb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-4 h-4 bg-gray-200 rounded-full"></div>
            ))}
          </div>
          
          {/* زر الإضافة للسلة */}
          <div className="h-10 bg-gray-200 rounded-md w-full mt-auto"></div>
        </div>
      ))}
    </>
  );
};

export default ProductSkeleton;
