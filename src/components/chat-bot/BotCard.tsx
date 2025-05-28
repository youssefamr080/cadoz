"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, ShoppingCart } from "lucide-react";
// استيراد التعريفات من الملفات الأصلية


// تعريف نوع موحد للعناصر التي يمكن عرضها في البطاقة
// هذا النوع يجمع بين خصائص المنتجات والهدايا
interface CardItem {
  _id?: string | { $oid: string };
  id?: string;
  name?: string;
  description?: string;
  image?: string;
  images?: string[];
  price?: number;
  oldPrice?: number;
  old_price?: number;
  rating?: number;
  category?: string;
  inStock?: boolean;
  [key: string]: unknown; // للسماح بأي حقول إضافية
}

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface BotCardProps {
  type: "products" | "gifts" | null;
  ids: string[];
}

export default function BotCard({ type, ids }: BotCardProps) {
  const [items, setItems] = useState<CardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Log props for debugging
  console.log("BotCard props:", { type, ids });
  
  // Ensure ids are properly formatted - only do this once during component initialization
  const formattedIds = useRef(ids ? ids.map(id => id.toString()) : []).current;

  // Use a ref to track if we've already fetched items
  const hasFetchedRef = useRef(false);
  
  useEffect(() => {
    // Only fetch items once to prevent infinite loops
    if (hasFetchedRef.current) return;
    
    const fetchItems = async () => {
      if (!type || formattedIds.length === 0) {
        setIsLoading(false);
        return;
      }
      
      // Mark that we've started fetching
      hasFetchedRef.current = true;

      try {
        setIsLoading(true);
        console.log("Fetching items:", { type, formattedIds });
        
        // استخدام نقاط النهاية API للبحث عن المنتجات/الهدايا الحقيقية في قاعدة البيانات
        console.log(`البحث عن ${type === "gifts" ? "الهدايا" : "المنتجات"} بالمعرفات:`, formattedIds);
        
        // التحقق من نوع البيانات المطلوبة
        const isGifts = type === "gifts";
        
        // استخدام نقاط النهاية الصحيحة للـ API
        const endpoint = isGifts
          ? "/api/inspiration/batch" 
          : "/api/products/batch";
        
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ids: formattedIds }),
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`تم جلب ${type === "gifts" ? "الهدايا" : "المنتجات"}:`, data);
          
          // محاولة استخدام البيانات الحقيقية إذا كانت متوفرة
          if (data && Array.isArray(data) && data.length > 0) {
            console.log(`تم العثور على ${data.length} من ${isGifts ? "الهدايا" : "المنتجات"}`);
            
            // التأكد من أن البيانات المسترجعة تحتوي على الحقول المطلوبة
            const validItems = data.filter(item => {
              // التحقق من وجود البيانات الأساسية
              const hasBasicData = item && (item.name || item.title);
              const hasPrice = item && (typeof item.price === 'number' || typeof item.price === 'string');
              const hasImage = item && (item.image || (item.images && item.images.length > 0));
              
              const isValid = hasBasicData && (hasPrice || isGifts); // السعر ليس إلزاميًا للهدايا
              
              console.log(`التحقق من العنصر ${item._id || item.id}:`, { 
                isValid, 
                hasBasicData, 
                hasPrice, 
                hasImage,
                item 
              });
              
              return isValid;
            });
            
            if (validItems.length > 0) {
              // تحويل الأسعار إلى أرقام إذا كانت نصوصًا
              const processedItems = validItems.map(item => ({
                ...item,
                price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
                oldPrice: typeof item.oldPrice === 'string' ? parseFloat(item.oldPrice) : item.oldPrice
              }));
              
              setItems(processedItems);
              return; // تم العثور على بيانات صالحة
            }
          }
          
          // إذا لم يتم العثور على بيانات حقيقية، استخدم بيانات وهمية
          console.log(`لم يتم العثور على بيانات حقيقية، استخدام بيانات وهمية للعرض`);
          
          // إنشاء بيانات وهمية للعرض
          const dummyItems = formattedIds.map((id, index) => ({
            _id: id,
            id: id,
            name: type === "gifts" ? `هدية رقم ${index + 1}` : `منتج رقم ${index + 1}`,
            description: "وصف المنتج",
            image: "/images/mug slider.jpg",
            price: 500 + (index * 100),
            oldPrice: 800 + (index * 100),
            rating: 4.5,
            category: "هدايا",
            inStock: true
          }));
          
          setItems(dummyItems);
        } else {
          throw new Error(`فشل في جلب البيانات: ${response.status}`);
        }
      } catch (error) {
        console.error("Error in items process:", error);
        setError("حدث خطأ أثناء جلب البيانات");
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [type, formattedIds]); // Include formattedIds to fix missing dependency warning

  // Calculate discount percentage
  const calculateDiscountPercentage = (price?: number, oldPrice?: number): number => {
    if (!price || !oldPrice || oldPrice <= price) return 0;
    return Math.round(((oldPrice - price) / oldPrice) * 100);
  };

  // الحصول على مصدر الصورة من العنصر
  const getImageSource = (item: CardItem): string => {
    // التحقق من وجود صورة مباشرة
    if (item.image && typeof item.image === 'string') {
      // التحقق من أن الصورة تحتوي على البروتوكول الصحيح
      if (item.image.startsWith('http') || item.image.startsWith('/')) {
        return item.image;
      }
      // إضافة الشرطة المائلة إذا لم تكن موجودة
      return `/${item.image}`;
    }
    
    // التحقق من وجود مصفوفة صور
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      const firstImage = item.images[0];
      if (typeof firstImage === 'string') {
        // التحقق من أن الصورة تحتوي على البروتوكول الصحيح
        if (firstImage.startsWith('http') || firstImage.startsWith('/')) {
          return firstImage;
        }
        // إضافة الشرطة المائلة إذا لم تكن موجودة
        return `/${firstImage}`;
      }
    }
    
    // استخدام صورة افتراضية مختلفة بناءً على نوع العنصر
    const isGift = type === "gifts";
    return isGift ? "/images/gift-placeholder.jpg" : "/images/mug slider.jpg";
  };
  
  // الحصول على اسم العنصر
  const getItemName = (item: CardItem): string => {
    return item.name || "";
  };
  
  // الحصول على سعر العنصر
  const getItemPrice = (item: CardItem): number => {
    if (typeof item.price === 'number') {
      return item.price;
    }
    if (typeof item.price === 'string') {
      return parseFloat(item.price) || 0;
    }
    return 0;
  };
  
  // الحصول على السعر القديم
  const getItemOldPrice = (item: CardItem): number | undefined => {
    if (item.oldPrice && typeof item.oldPrice === 'number') {
      return item.oldPrice;
    }
    if (item.oldPrice && typeof item.oldPrice === 'string') {
      return parseFloat(item.oldPrice) || undefined;
    }
    if (item.old_price && typeof item.old_price === 'number') {
      return item.old_price;
    }
    if (item.old_price && typeof item.old_price === 'string') {
      return parseFloat(item.old_price) || undefined;
    }
    return undefined;
  };

  if (isLoading) {
    return (
      <div className="w-full py-4">
        <div className="flex space-x-4 rtl:space-x-reverse overflow-x-auto pb-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="min-w-[200px] h-[260px] bg-gray-100 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-2 text-center text-red-500 text-sm">
        {error}
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="w-full mt-3">
      <Swiper
        spaceBetween={12}
        slidesPerView="auto"
        navigation={{
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        }}
        pagination={{
          clickable: true,
          el: '.swiper-pagination',
        }}
        modules={[Navigation, Pagination]}
        className="bot-card-swiper"
      >
        {items.map((item) => {
          const isInspiration = type === "gifts";
          // Handle different MongoDB ID formats safely
          let itemId = '';
          
          if (item.id) {
            itemId = item.id;
          } else if (item._id) {
            if (typeof item._id === 'string') {
              itemId = item._id;
            } else if (typeof item._id === 'object') {
              // Handle MongoDB ObjectId format which might have $oid property
              // Use type assertion to access potential $oid property safely
              const mongoId = item._id;
              if (typeof mongoId === 'object' && mongoId !== null && '$oid' in mongoId && typeof (mongoId as { $oid?: string }).$oid === 'string') {
                itemId = (mongoId as { $oid: string }).$oid;
              } else {
                // Try to convert to string if possible
                try {
                  itemId = String(item._id);
                } catch {
                  itemId = '';
                }
              }
            }
          }
          
          const itemLink = isInspiration 
            ? `/inspiration/${itemId}` 
            : `/product/${itemId}`;
          
          // Handle price and oldPrice for both product and inspiration
          const price = getItemPrice(item);
          const oldPrice = getItemOldPrice(item);
          
          const discountPercentage = calculateDiscountPercentage(price, oldPrice);
          
          return (
            <SwiperSlide key={itemId} style={{ width: '180px', height: 'auto' }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-purple-100 h-full flex flex-col"
              >
                <Link href={itemLink} className="block flex flex-col h-full">
                  <div className="relative h-32 overflow-hidden">
                    <Image
                      src={getImageSource(item)}
                      alt={getItemName(item) || (isInspiration ? "هدية" : "منتج")}
                      fill
                      className="object-cover transition-transform hover:scale-105"
                      sizes="180px"
                      onError={(e) => {
                        // Fallback to a local image if the product image fails to load
                        const target = e.target as HTMLImageElement;
                        target.src = "/images/mug slider.jpg";
                        console.log(`فشل تحميل الصورة للعنصر:`, item);
                      }}
                    />
                    {discountPercentage > 0 && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {discountPercentage}%-
                      </div>
                    )}
                  </div>
                  
                  <div className="p-2 flex flex-col flex-grow">
                    <h3 className="font-medium text-gray-900 text-xs line-clamp-2 mb-1 h-8">
                      {getItemName(item) || (isInspiration ? "هدية" : "منتج")}
                    </h3>
                    
                    <div className="flex items-center mb-1">
                      <div className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs text-gray-600 mr-1">
                          {typeof item.rating === 'number' ? item.rating : typeof item.stars === 'number' ? item.stars : 5}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-auto pt-2">
                      <div className="text-sm font-semibold">
                        {price ? `${price} ج.م` : ''}
                        {oldPrice && (
                          <span className="text-xs text-gray-500 line-through mr-1">
                            {oldPrice} ج.م
                          </span>
                        )}
                      </div>
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                        <ShoppingCart className="h-3 w-3 text-purple-700" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            </SwiperSlide>
          );
        })}
        
        {/* Custom navigation buttons */}
        <div className="swiper-button-next absolute top-1/2 left-1 -translate-y-1/2 z-10 rounded-full bg-white shadow-lg w-8 h-8 border border-purple-200 flex items-center justify-center hover:bg-purple-50 cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </div>
        
        <div className="swiper-button-prev absolute top-1/2 right-1 -translate-y-1/2 z-10 rounded-full bg-white shadow-lg w-8 h-8 border border-purple-200 flex items-center justify-center hover:bg-purple-50 cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </div>
      </Swiper>
      
      {/* Custom pagination */}
      <div className="swiper-pagination flex justify-center mt-3"></div>
    </div>
  );
}
