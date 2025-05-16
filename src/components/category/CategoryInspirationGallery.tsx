"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useGift } from "@/context/gift-context"
import { Button } from "@/components/ui/button"
import { Star, ChevronLeft, ChevronRight, Eye, ChevronDown, Heart, ShoppingCart, Edit } from "lucide-react"
import type { Inspiration } from "@/types/inspiration"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"
import { getBoxesByIds } from "@/lib/actions/box-actions"
import { getBagsByIds } from "@/lib/actions/bag-actions"
import { getGiftProductsByIds } from "@/lib/actions/product-actions" 
import { getDecorationsByIds } from "@/lib/actions/decoration-actions"
import { getMainProductsByIds } from "@/lib/actions/main-product-actions"
// Import Swiper components and modules
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, FreeMode, Autoplay } from "swiper/modules"
// Import Swiper styles
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import "swiper/css/free-mode"

interface CategoryInspirationGalleryProps {
  category: string
}

export default function CategoryInspirationGallery({ category }: CategoryInspirationGalleryProps) {
  const router = useRouter();
  const { loadInspiration } = useGift()
  const [inspirationGifts, setInspirationGifts] = useState<Inspiration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({})
  const [addingToCart, setAddingToCart] = useState<Record<string, boolean>>({})
  // عدد المنتجات التي سيتم جلبها
  const maxInspirationCount = 10 // عرض 10 منتجات

  // Toggle description visibility for a gift
  const toggleDescription = (giftId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [giftId]: !prev[giftId]
    }))
  }

  // Toggle like state for a gift
  const toggleLike = (giftId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedItems(prev => ({
      ...prev,
      [giftId]: !prev[giftId]
    }))
  }

  // Add gift directly to cart
  const handleAddToCart = async (gift: Inspiration, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Set loading state for this gift
    setAddingToCart(prev => ({
      ...prev,
      [gift.id]: true
    }));
    
    try {
      // Validate at least one product
      if (gift.products.length === 0) {
        toast.error("لا يمكن إضافة هدية بدون منتجات");
        return;
      }
      
      // Extract product IDs from the products array
      let productIds: string[] = [];
      let productQuantities: Record<string, number> = {};
      
      if (gift.products && gift.products.length > 0) {
        // Check if products are objects or just string IDs
        if (typeof gift.products[0] === 'string') {
          // Old format: array of IDs
          productIds = gift.products as string[];
          // Use quantities from productQuantities if available
          productQuantities = gift.productQuantities || {};
        } else {
          // New format: array of objects with id and quantity
          const productsWithQuantity = gift.products as { id: string; quantity: number | { $numberInt: string } }[];
          
          productIds = productsWithQuantity.map(p => {
            const id = p.id;
            // Handle quantity whether it's a number or an object
            const quantity = typeof p.quantity === 'number' 
              ? p.quantity 
              : parseInt((p.quantity as { $numberInt: string }).$numberInt || '1', 10);
              
            productQuantities[id] = quantity;
            return id;
          });
        }
      }
      
      // Fetch all related items by IDs
      const [boxArr, bagArr, productsArr, decorationsArr, mainProductsArr] = await Promise.all([
        gift.box ? getBoxesByIds([gift.box]) : [],
        gift.bag ? getBagsByIds([gift.bag]) : [],
        productIds.length > 0 ? getGiftProductsByIds(productIds) : [],
        gift.decorations && gift.decorations.length > 0 ? getDecorationsByIds(gift.decorations) : [],
        gift.Mainproducts && gift.Mainproducts.length > 0 ? getMainProductsByIds(gift.Mainproducts) : [],
      ]);
      
      // Extract the fetched objects
      const box = boxArr && boxArr.length > 0 ? boxArr[0] : null;
      const bag = bagArr && bagArr.length > 0 ? bagArr[0] : null;
      
      // Ensure all products have price and quantity
      const productsWithQuantities = productsArr.map(product => ({
        ...product,
        price: typeof product.price === 'number' ? product.price : 0,
        quantity: gift.productQuantities?.[product.id] || 1
      }));
      
      // Ensure all main products have price and quantity
      const mainProductsWithQuantities = mainProductsArr.map(product => ({
        ...product,
        price: typeof product.price === 'number' ? product.price : 0,
        quantity: gift.productQuantities?.[product.id] || 1 // Use same productQuantities for main products
      }));
      
      // Calculate total price
      const productsTotal = productsWithQuantities.reduce(
        (sum, item) => sum + (item.price * (item.quantity || 1)), 
        0
      );
      
      const mainProductsTotal = mainProductsWithQuantities.reduce(
        (sum, item) => sum + (item.price * (item.quantity || 1)), 
        0
      );
      
      const boxPrice = box && typeof box.price === 'number' ? box.price : 0;
      const bagPrice = bag && typeof bag.price === 'number' ? bag.price : 0;
      
      // Calculate decorations price
      let decorationsPrice = 0;
      for (const decoration of decorationsArr) {
        decorationsPrice += typeof decoration.price === 'number' ? decoration.price : 0;
      }
      
      const totalPrice = productsTotal + mainProductsTotal + boxPrice + bagPrice + decorationsPrice;
      
      // Create a cart item
      const cartItem = {
        id: Date.now(), // Use timestamp as ID
        name: gift.name || "هدية مخصصة",
        image: gift.image || box?.image || "/images/box.png",
        price: totalPrice,
        quantity: 1,
        category: "هدايا",
        variant: "مخصص",
        stock: 1,
        giftDetails: gift.description || "هدية مخصصة",
        giftData: {
          items: [
            ...productsWithQuantities.map(p => ({
              id: p.id,
              name: p.name,
              image: p.image,
              price: p.price,
              quantity: p.quantity || 1,
              type: 'gift'
            })),
            ...mainProductsWithQuantities.map(p => ({
              id: p.id,
              name: p.name,
              image: p.image,
              price: p.price,
              quantity: p.quantity || 1,
              type: 'main'
            })),
          ],
          box: box ? {
            name: box.name,
            image: box.image,
            price: boxPrice
          } : null,
          wrap: bag ? {
            name: bag.name,
            image: bag.image,
            price: bagPrice
          } : null,
          totalPrice: totalPrice,
          createdAt: new Date().toISOString()
        }
      };
      
      // Get existing cart and add new item
      const existingCart = localStorage.getItem("cadoz-cart");
      const cart = existingCart ? JSON.parse(existingCart) : [];
      cart.push(cartItem);
      
      // Update localStorage
      localStorage.setItem("cadoz-cart", JSON.stringify(cart));
      
      // Dispatch a custom event to notify cart context
      const cartUpdateEvent = new CustomEvent("cartUpdated", { detail: cart });
      window.dispatchEvent(cartUpdateEvent);
      
      toast.success(`تمت إضافة هدية "${gift.name}" إلى السلة بنجاح!`, {
        position: "top-center",
        autoClose: 1500
      });
    } catch (err) {
      console.error("خطأ في إضافة الهدية إلى السلة:", err);
      toast.error("حدث خطأ أثناء إضافة الهدية إلى السلة");
    } finally {
      // Clear loading state
      setAddingToCart(prev => ({
        ...prev,
        [gift.id]: false
      }));
    }
  }

  // Fetch inspiration gifts by category using API endpoint with limit and process for consistent display
  useEffect(() => {
    const fetchInspirations = async () => {
      try {
        setIsLoading(true)
        // إضافة معلمة لتحديد عدد النتائج
        console.log(`جلب المنتجات للفئة ${category} بحد أقصى: ${maxInspirationCount}`)
        
        const response = await fetch(`/api/gift/inspirations?category=${category}&limit=${maxInspirationCount}`)
        const result = await response.json()
                
        if (result.success) {
          const data = result.data || []
          console.log(`تم استلام عدد المنتجات للفئة ${category}: ${data.length}`, data)
          
          // تكرار البيانات إذا كان عددها أقل من 10 لضمان وجود ما يكفي للعرض
          const processedData = [...data]
          if (data.length < maxInspirationCount && data.length > 0) {
            while (processedData.length < maxInspirationCount) {
              // إضافة نسخة من البيانات الموجودة مع تعديل المعرف لتجنب التكرار
              const clonedItem = {
                ...data[processedData.length % data.length],
                id: `${data[processedData.length % data.length].id}_clone_${processedData.length}_${category}`
              }
              processedData.push(clonedItem)
            }
          }
          
          console.log(`عدد المنتجات النهائي للفئة ${category}: ${processedData.length}`)
          setInspirationGifts(processedData)
          setError(null)
        } else {
          throw new Error(result.error || 'حدث خطأ أثناء جلب البيانات')
        }
      } catch (err) {
        console.error(`Error loading inspirations for category ${category}:`, err)
        setError(`حدث خطأ أثناء تحميل هدايا الإلهام للفئة ${category}. يرجى المحاولة مرة أخرى.`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInspirations()
  }, [category, maxInspirationCount])

  const handleUseInspiration = (gift: Inspiration) => {
    loadInspiration(gift)
    router.push(`/gift`);
  }

  // Get category name in Arabic
  const getCategoryArabicName = (categoryName: string): string => {
    const names: Record<string, string> = {
      men: "رجالي",
      women: "نسائي",
      kids: "أطفال",
    }
    return names[categoryName as keyof typeof names] || categoryName
  }

  // Calculate slides per view based on screen size
  const getSlidesPerView = () => {
    if (typeof window !== "undefined") {
      if (window.innerWidth < 480) return 1.2
      if (window.innerWidth < 640) return 1.5
      if (window.innerWidth < 1024) return 2.5
      return 3.2
    }
    return 3 // Default fallback
  }

  return (
    <div className="mb-0 sm:mb-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">هدايا {getCategoryArabicName(category)} جاهزة</h2>
        <Link 
          href="/inspirations" 
          className="flex items-center text-purple-600 hover:text-purple-800 transition-colors text-xs sm:text-sm font-medium"
        >
          عرض الكل
          <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
        </Link>
      </div>
      <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">اختر من هذه الهدايا الجاهزة أو استخدمها كنقطة بداية لهديتك الخاصة</p>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[180px]">
          <div className="w-8 h-8 sm:w-10 sm:h-10 border-3 sm:border-4 border-gray-200 border-t-purple-500 rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="text-center p-6 text-red-500 text-sm">{error}</div>
      ) : inspirationGifts.length === 0 ? (
        <div className="text-center p-6 text-gray-500 flex flex-col items-center">
          <p className="mb-2 text-sm">لا توجد هدايا إلهام متاحة لهذه الفئة حالياً</p>
          <p className="text-xs text-purple-600">يمكنك زيارة /api/gift/inspirations/seed لإضافة بيانات تجريبية</p>
        </div>
      ) : (
        <div className="relative category-inspiration-swiper">
          {/* استخدام مكتبة Swiper.js بدلاً من التنفيذ اليدوي */}
          <Swiper
            modules={[Navigation, Pagination, FreeMode, Autoplay]}
            spaceBetween={12}
            slidesPerView={getSlidesPerView()}
            navigation={{
              nextEl: '.swiper-button-next',
              prevEl: '.swiper-button-prev',
            }}
            pagination={{
              clickable: true,
              el: '.swiper-pagination',
              bulletActiveClass: 'swiper-pagination-bullet-active',
              bulletClass: 'swiper-pagination-bullet',
            }}
            freeMode={{
              enabled: true,
              sticky: true,
              momentumBounce: false,
            }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: true,
              pauseOnMouseEnter: true,
            }}
            dir="rtl"
            className="rounded-xl pb-10"
          >
            {inspirationGifts.map((gift) => (
              <SwiperSlide key={gift.id} className="pb-4">
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
                    <button 
                      onClick={(e) => toggleLike(gift.id, e)}
                      className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md z-10 transition-transform duration-300 hover:scale-110"
                    >
                      <Heart 
                        className={`w-3.5 h-3.5 ${likedItems[gift.id] ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} 
                      />
                    </button>
                    <div className="absolute top-2 left-2 bg-white bg-opacity-90 rounded-full px-2 py-1 flex items-center shadow-sm z-10">
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
                      <h3 className="font-medium text-gray-900 truncate text-sm">{gift.name}</h3>
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
                          <p className="text-xs text-gray-600 my-2 line-clamp-3">{gift.description}</p>
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

                      <Button
                        size="sm"
                        className="text-xs bg-purple-600 hover:bg-purple-700 flex-1 h-8 rounded-xl"
                        onClick={(e) => handleAddToCart(gift, e)}
                        disabled={addingToCart[gift.id]}
                      >
                        {addingToCart[gift.id] ? (
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                        ) : (
                          <ShoppingCart className="w-3 h-3 mr-1" />
                        )}
                        اضافة للسلة
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
            
            {/* Custom navigation buttons */}
            <button className="swiper-button-next absolute top-1/2 left-1 -translate-y-1/2 z-10 rounded-full bg-white shadow-lg w-8 h-8 sm:w-10 sm:h-10 border border-purple-200 flex items-center justify-center hover:bg-purple-50 cursor-pointer">
              <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600" />
            </button>
            
            <button className="swiper-button-prev absolute top-1/2 right-1 -translate-y-1/2 z-10 rounded-full bg-white shadow-lg w-8 h-8 sm:w-10 sm:h-10 border border-purple-200 flex items-center justify-center hover:bg-purple-50 cursor-pointer">
              <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600" />
            </button>
          </Swiper>
          
          {/* Custom pagination */}
          <div className="swiper-pagination flex justify-center mt-3"></div>
        </div>
      )}
    </div>
  )
}