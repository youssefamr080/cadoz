"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FiHeart, FiShoppingCart, FiShare2, FiArrowLeft, FiCheck, FiPackage, FiTruck, FiCopy, FiAlertCircle } from "react-icons/fi";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation, Pagination, Thumbs } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/thumbs";
import Fuse from "fuse.js";
import { products } from "../../../data/products";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useCart } from "../../../context/CartContext";
import { useWishlist } from "../../../context/WishlistContext";

interface ProductType {
  id: number;
  name: string;
  image: string;
  images: string[];
  description: string;
  price: number;
  old_price?: number;
  stock: number;
  tags: string[];
}

const ProductPage = () => {
  const { productId } = useParams();
  const router = useRouter();
  const product = products.find((p) => p.id.toString() === productId) as ProductType | undefined;
  const [, setMainImage] = useState("");
  const { addToCart } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);

  // تحميل الصفحة مع تأثير بصري
  useEffect(() => {
    if (product) {
      setTimeout(() => setLoading(false), 500);
    }
  }, [product]);

  // تعيين الصورة الرئيسية عند تحميل المنتج
  useEffect(() => {
    if (product?.images[0]) {
      setMainImage(product.images[0]);
    }
  }, [product]);

  // تحديث حالة المفضلة وحفظ المنتجات المشاهدة
  useEffect(() => {
    if (product) {
      setIsFavorite(wishlist.some((item) => item.id === product.id));
  
      // حفظ المنتج في LocalStorage ضمن المنتجات التي تمت مشاهدتها
      const viewedProducts = JSON.parse(localStorage.getItem("viewedProducts") || "[]");
      
      // منع تكرار نفس المنتج
      const updatedViewed = [
        product,
        ...viewedProducts.filter((p: { id: number; }) => p.id !== product.id),
      ].slice(0, 10); // حفظ آخر 10 منتجات فقط
  
      localStorage.setItem("viewedProducts", JSON.stringify(updatedViewed));
    }
  }, [product, wishlist]);
  
  // تحديد خيارات البحث للمنتجات المشابهة - تحسين الدقة
  const fuseOptions = useMemo(() => ({
    keys: ["tags", "name"],
    threshold: 0.6,
    includeScore: true,
  }), []);

  // إنشاء كائن Fuse للبحث
  const fuse = useMemo(() => new Fuse(products, fuseOptions), [fuseOptions]);

  // البحث عن منتجات مشابهة بطريقة محسنة
  const similarProducts = useMemo(() => {
    if (!product) return [];
    
    // البحث باستخدام الوسوم + اسم المنتج لتحسين النتائج
    const results = [
      ...fuse.search(product.tags.join(" ")),
      ...fuse.search(product.name)
    ];
    
    // إزالة التكرارات وترتيب النتائج حسب درجة التشابه
    const uniqueResults = Array.from(
      new Map(results.map(item => [item.item.id, item])).values()
    )
    .filter(item => item.item.id !== product.id) // استبعاد المنتج الحالي
    .sort((a, b) => (a.score || 1) - (b.score || 1))
    .slice(0, 20)
    .map(result => result.item);
    
    return uniqueResults;
  }, [product, fuse]);

  // معالجة تغيير كمية المنتج
  const changeQuantity = useCallback((amount: number) => {
    setQuantity(prev => {
      const newValue = prev + amount;
      // التأكد من أن الكمية بين 1 ومخزون المنتج
      return Math.max(1, Math.min(newValue, product?.stock || 10));
    });
  }, [product]);

  // التحقق من توفر المنتج في المخزون
  const isProductOutOfStock = useMemo(() => {
    return product?.stock === 0;
  }, [product]);

  // معالجة إضافة المنتج إلى سلة التسوق
  const handleAddToCart = useCallback(() => {
    if (!product) return;
    
    // التحقق من توفر المنتج قبل الإضافة
    if (isProductOutOfStock) {
      toast.error("المنتج غير متوفر حالياً", { 
        position: "bottom-right",
        icon: <FiAlertCircle className="text-red-500" />
      });
      return;
    }
    
    addToCart({ 
      id: product.id, 
      name: product.name, 
      image: product.image, 
      price: product.price, 
      quantity 
    });
    
    toast.success(
      <div className="flex items-center rtl:flex-row-reverse">
        <span>✅ تمت الإضافة!</span>
        <Link href="/cart" className="text-blue-600 underline mr-2 rtl:mr-0 rtl:ml-2">
          عرض السلة 🛒
        </Link>
      </div>,
      { position: "bottom-right", autoClose: 3000 }
    );
  }, [product, addToCart, quantity, isProductOutOfStock]);

  // معالجة إضافة/إزالة المنتج من المفضلة
  const handleToggleWishlist = useCallback(() => {
    if (!product) return;
    
    if (isFavorite) {
      removeFromWishlist(product.id);
      toast.info("تمت الإزالة من المفضلة!", { position: "bottom-right" });
    } else {
      addToWishlist({ 
        id: product.id, 
        name: product.name, 
        image: product.image, 
        price: product.price,
        stock: product.stock
      });
      toast.success("تمت الإضافة إلى المفضلة!", { position: "bottom-right" });
    }
    setIsFavorite(!isFavorite);
  }, [product, isFavorite, addToWishlist, removeFromWishlist]);

  // معالجة مشاركة المنتج عبر وسائل التواصل المختلفة
  const handleShare = useCallback((platform: string) => {
    if (!product) return;
    
    const url = window.location.href;
    const message = `✨ تحقق من هذا المنتج: *${product.name}* 📌 السعر: ${product.price} ج.م`;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(message + ' 🔗 ' + url)}`;
        break;
      
      default:
        // نسخ الرابط للمشاركة
        navigator.clipboard.writeText(url);
        toast.info("تم نسخ رابط المنتج!", { position: "bottom-right" });
        return;
    }
    
    window.open(shareUrl, "_blank");
  }, [product]);

  // عرض شاشة التحميل
  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen flex flex-col">
        <Header />
        <div className="container mx-auto px-4 py-20 flex-1 flex items-center justify-center">
          <div className="animate-pulse space-y-6 w-full max-w-4xl">
            <div className="h-96 bg-gray-300 rounded-xl"></div>
            <div className="space-y-3">
              <div className="h-6 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // عرض رسالة إذا لم يتم العثور على المنتج
  if (!product) {
    return (
      <div className="bg-gray-100 min-h-screen flex flex-col">
        <Header />
        <div className="container mx-auto px-4 py-20 flex-1 flex flex-col items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-5xl mb-4">❓</div>
            <h1 className="text-2xl font-bold text-gray-800">المنتج غير موجود</h1>
            <p className="text-gray-600 max-w-md">عذراً، هذا المنتج غير متوفر أو قد تمت إزالته</p>
            <button
              onClick={() => router.push("/products")}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition duration-300"
            >
              استعرض المنتجات
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // حساب نسبة الخصم
  const discountPercentage =
    product.old_price &&
    Math.round(((product.old_price - product.price) / product.old_price) * 100);

  return (
    <div className="bg-gray-50 min-h-screen font-sans flex flex-col">
      <Header />
      <div className="flex-1">
        <main className="container mx-auto px-4 py-6 md:py-12">
          {/* زر العودة */}
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition duration-300"
          >
            <FiArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 
            <span>العودة</span>
          </button>
          
          {/* بطاقة المنتج الرئيسية */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8">
              {/* قسم الصور */}
              <div className="relative p-4 md:p-6">
                {/* شارة الخصم */}
                {discountPercentage > 0 && (
                  <div
                    className="absolute top-6 left-6 bg-red-500 text-white py-1 px-3 text-sm font-bold z-10 shadow-md rounded-full"
                  >
                    خصم {discountPercentage}%
                  </div>
                )}
                
                {/* شارة المخزون */}
                {isProductOutOfStock ? (
                  <div
                    className="absolute top-6 right-6 bg-red-500 text-white py-1 px-3 text-sm font-bold z-10 shadow-md rounded-full"
                  >
                    غير متوفر
                  </div>
                ) : product.stock < 5 && (
                  <div
                    className="absolute top-6 right-6 bg-amber-500 text-white py-1 px-3 text-sm font-bold z-10 shadow-md rounded-full"
                  >
                    كمية محدودة
                  </div>
                )}
                
                {/* عارض الصور الرئيسي */}
                <div className="mb-3">
                  <Swiper
                    slidesPerView={1}
                    pagination={{ 
                      clickable: true,
                      dynamicBullets: true
                    }}
                    navigation={true}
                    modules={[Navigation, Pagination, Thumbs]}
                    thumbs={{ swiper: thumbsSwiper }}
                    className="rounded-xl overflow-hidden product-main-swiper h-80 md:h-96"
                  >
                    {product.images.map((img, index) => (
                      <SwiperSlide key={index}>
                        <div className="relative w-full h-80 md:h-96 bg-gray-100 rounded-xl overflow-hidden">
                          <Image
                            src={img}
                            alt={`${product.name} - صورة ${index + 1}`}
                            fill
                            priority={index === 0}
                            className="object-contain"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
                
                {/* المصغرات */}
                <Swiper
                  onSwiper={setThumbsSwiper}
                  spaceBetween={8}
                  slidesPerView={4.5}
                  freeMode={true}
                  watchSlidesProgress={true}
                  modules={[FreeMode, Navigation, Thumbs]}
                  className="thumbs-swiper"
                  breakpoints={{
                    320: { slidesPerView: 3.5 },
                    480: { slidesPerView: 4.5 },
                    640: { slidesPerView: 5.5 },
                  }}
                >
                  {product.images.map((img, index) => (
                    <SwiperSlide key={index}>
                      <div
                        className="relative w-16 h-16 md:w-20 md:h-20 rounded-md overflow-hidden cursor-pointer border-2 hover:border-blue-500 transition-all"
                        onClick={() => setMainImage(img)}
                      >
                        <Image
                          src={img}
                          alt={`صورة مصغرة ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>

              {/* تفاصيل المنتج */}
              <div className="p-4 md:p-6 space-y-5">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    {isProductOutOfStock ? (
                      <div className="bg-red-100 text-red-700 text-sm py-1 px-3 rounded-full flex items-center">
                        <FiAlertCircle className="mr-1" /> غير متوفر حالياً
                      </div>
                    ) : (
                      <div className="bg-green-100 text-green-700 text-sm py-1 px-3 rounded-full flex items-center">
                        <FiCheck className="mr-1" /> متوفر للطلب
                      </div>
                    )}
                    {!isProductOutOfStock && product.stock > 10 && (
                      <div className="bg-blue-100 text-blue-700 text-sm py-1 px-3 rounded-full">
                        يشحن سريعاً
                      </div>
                    )}
                  </div>
                </div>
                
                {/* السعر */}
                <div className="flex items-center flex-wrap gap-3">
                  <p className="text-3xl font-bold text-gray-900">
                    {product.price} <span className="text-lg">ج.م</span>
                  </p>
                  {product.old_price && (
                    <p className="text-gray-500 line-through text-lg">
                      {product.old_price} ج.م
                    </p>
                  )}
                </div>
                
                {/* الوصف */}
                <div className="py-3 border-t border-b border-gray-100">
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                </div>
                
                {/* كمية المنتج */}
                <div className="flex items-center space-x-4 rtl:space-x-reverse pt-2">
                  <span className="text-gray-700">الكمية:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button 
                      onClick={() => changeQuantity(-1)}
                      className={`px-3 py-1 text-lg border-r rtl:border-r-0 rtl:border-l border-gray-300 hover:bg-gray-100 transition ${
                        isProductOutOfStock ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      disabled={isProductOutOfStock}
                    >
                      -
                    </button>
                    <span className="px-4 py-1 font-medium">{quantity}</span>
                    <button 
                      onClick={() => changeQuantity(1)}
                      className={`px-3 py-1 text-lg border-l rtl:border-l-0 rtl:border-r border-gray-300 hover:bg-gray-100 transition ${
                        isProductOutOfStock ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      disabled={isProductOutOfStock}
                    >
                      +
                    </button>
                  </div>
                </div>
                
                {/* أزرار العمليات */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button
                    onClick={handleAddToCart}
                    disabled={isProductOutOfStock}
                    className={`flex-1 px-6 py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition duration-300 shadow-sm ${
                      isProductOutOfStock
                        ? "bg-gray-400 cursor-not-allowed text-white"
                        : "bg-amber-500 hover:bg-amber-600 text-white"
                    }`}
                  >
                    {isProductOutOfStock ? (
                      <>
                        <FiAlertCircle className="w-5 h-5" /> غير متوفر حالياً
                      </>
                    ) : (
                      <>
                        <FiShoppingCart className="w-5 h-5" /> أضف إلى السلة
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleToggleWishlist}
                    className={`flex-1 sm:flex-none px-6 py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition duration-300 shadow-sm ${
                      isFavorite
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                    }`}
                  >
                    <FiHeart className="w-5 h-5" /> {isFavorite ? "في المفضلة" : "أضف للمفضلة"}
                  </button>
                </div>
                
                {/* مميزات المتجر */}
                <div className="grid grid-cols-2 gap-3 pt-4 mt-6 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <FiTruck className="text-blue-600 w-5 h-5" />
                    <span className="text-sm text-gray-700">توصيل سريع</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiPackage className="text-blue-600 w-5 h-5" />
                    <span className="text-sm text-gray-700">ضمان جودة المنتج</span>
                  </div>
                </div>
                
                {/* المشاركة */}
                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100">
                  <span className="text-gray-700">مشاركة:</span>
                  <button
                    onClick={() => handleShare('whatsapp')}
                    className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full transition"
                    aria-label="مشاركة عبر واتساب"
                  >
                    <FiShare2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleShare('copy')}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-full transition"
                    aria-label="نسخ الرابط"
                  >
                    <FiCopy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* منتجات مشابهة */}
          {similarProducts.length > 0 && (
            <div className="mt-10 md:mt-16">
              <h2 className="text-xl md:text-2xl font-bold mb-6 text-gray-800 relative pr-3 rtl:pl-3 rtl:pr-0 before:absolute before:right-0 rtl:before:left-0 rtl:before:right-auto before:top-0 before:h-full before:w-1 before:bg-amber-500 before:rounded-full">
                قد يعجبك أيضاً
              </h2>
              <div className="space-y-6">
                {/* Similar Products Swiper */}
                <Swiper
                  modules={[FreeMode, Navigation]}
                  spaceBetween={16}
                  slidesPerView={6}
                  freeMode={true}
                  navigation={{
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                  }}
                  breakpoints={{
                    320: { slidesPerView: 2.2, spaceBetween: 12 },
                    480: { slidesPerView: 2.5, spaceBetween: 12 },
                    640: { slidesPerView: 3.5, spaceBetween: 16 },
                    768: { slidesPerView: 4, spaceBetween: 16 },
                    1024: { slidesPerView: 5, spaceBetween: 16 },
                    1280: { slidesPerView: 6, spaceBetween: 16 },
                  }}
                  className="py-4 px-2"
                >
                  {similarProducts.map((p) => (
                    <SwiperSlide key={p.id} className="h-auto">
                      <Link
                        href={`/product/${p.id}`}
                        className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-all h-full border border-gray-100 overflow-hidden"
                      >
                        <div className="relative pt-[100%]">
                          <Image
                            src={p.image}
                            alt={p.name}
                            fill
                            className="rounded-t-xl object-cover transition-transform hover:scale-105 duration-300"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                          />
                          {p.old_price && (
                            <div className="absolute top-2 left-2 bg-red-500 text-white py-1 px-2 text-xs font-semibold rounded-full">
                              خصم {Math.round(((p.old_price - p.price) / p.old_price) * 100)}%
                            </div>
                          )}
                          {p.stock === 0 && (
                            <div className="absolute bottom-2 right-2 bg-red-500 text-white py-1 px-2 text-xs font-semibold rounded-full">
                              غير متوفر
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <h3 className="font-medium text-sm line-clamp-2 h-10 mb-1">{p.name}</h3>
                          <div className="flex items-center justify-between">
                            <p className="text-gray-900 font-bold text-sm">
                              {p.price} <span className="text-xs">ج.م</span>
                            </p>
                            {p.old_price && (
                              <p className="text-gray-500 line-through text-xs">
                                {p.old_price}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    </SwiperSlide>
                  ))}
                  <div className="swiper-button-next !w-10 !h-10 !rounded-full bg-white shadow-md after:!text-lg"></div>
                  <div className="swiper-button-prev !w-10 !h-10 !rounded-full bg-white shadow-md after:!text-lg"></div>
                </Swiper>
              </div>
            </div>
          )}
        </main>
      </div>
      <ToastContainer rtl={true} />
      <Footer />
      
      {/* CSS إضافي - يمكن نقله لملف منفصل */}
      <style jsx global>{`
        .product-main-swiper .swiper-pagination-bullet-active {
          background: #f59e0b;
        }
        .product-main-swiper .swiper-button-next,
        .product-main-swiper .swiper-button-prev {
          color: #f59e0b;
        }
        .thumbs-swiper .swiper-slide-thumb-active div {
          border-color: #f59e0b;
        }
      `}</style>
    </div>
  );
};

export default ProductPage;