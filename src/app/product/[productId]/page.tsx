"use client"
import { useState, useEffect, useMemo, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  FiShoppingCart,
  FiArrowLeft,
  FiCheck,
  FiPackage,
  FiTruck,
  FiAlertCircle,
  FiHeart,
  FiShare2,
} from "react-icons/fi"
import "swiper/css"
import "swiper/css/free-mode"
import "swiper/css/navigation"
import "swiper/css/pagination"
import "swiper/css/thumbs"
import Header from "../../../components/layout/Header"
import Footer from "../../../components/layout/Footer"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { useCart } from "../../../context/CartContext"
import { useWishlist } from "../../../context/WishlistContext"
import { useGetProductByIdQuery } from "../../../lib/redux/api/apiSlice"
import LoadingSpinner from "../../../components/ui/LoadingSpinner"
import ProductRating from "../../../components/product/product-rating"
import ProductReviews from "../../../components/product/product-reviews"
import ProductRecommendations from "../../../components/product/product-recommendations"
import ProductSocialShare from "../../../components/product/product-social-share"
import ProductImageGallery from "../../../components/product/product-image-gallery"
import ProductInfoTabs from "../../../components/product/product-info-tabs"
import ProductColorSelector from "../../../components/product/product-color-selector"
import ProductNotification from "../../../components/product/product-notification"
import RecentlyViewedProducts from "../../../components/product/recently-viewed-products"

const ProductPage = () => {
  const { productId } = useParams()
  const router = useRouter()
  const [, setMainImage] = useState("")
  const { addToCart } = useCart()
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist()
  const [isFavorite, setIsFavorite] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState<string>("")
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [showAddedAnimation, setShowAddedAnimation] = useState(false)

  // User info for reviews (normally would come from auth context)
  const userId = "guest-user" // Replace with actual user ID when authentication is implemented
  const userName = "زائر" // Replace with actual user name when authentication is implemented

  // Fetch product data using RTK Query
  const { data: product, isLoading, error } = useGetProductByIdQuery(Number(productId))

  // تعيين الصورة الرئيسية عند تحميل المنتج
  useEffect(() => {
    if (product?.images?.[0]) {
      setMainImage(product.images[0])
    }
  }, [product])

  // تحديث حالة المفضلة وحفظ المنتجات المشاهدة
  useEffect(() => {
    if (product) {
      setIsFavorite(wishlist.some((item) => item.id === product.id))

      // حفظ المنتج في LocalStorage ضمن المنتجات التي تمت مشاهدتها
      const viewedProducts = JSON.parse(localStorage.getItem("viewedProducts") || "[]")

      // منع تكرار نفس المنتج
      const updatedViewed = [product, ...viewedProducts.filter((p: { id: number }) => p.id !== product.id)].slice(0, 10) // حفظ آخر 10 منتجات فقط

      localStorage.setItem("viewedProducts", JSON.stringify(updatedViewed))

      // تسجيل مشاهدة المنتج في قاعدة البيانات
      const recordProductView = async () => {
        try {
          await fetch("/api/recommendations", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: userId || "anonymous", // استخدم معرف المستخدم إذا كان متاحًا
              productId: product.id,
              action: "view",
            }),
          })
        } catch (error) {
          console.error("Error recording product view:", error)
        }
      }

      recordProductView()
    }
  }, [product, wishlist, userId])

  // معالجة تغيير كمية المنتج
  const changeQuantity = useCallback(
    (amount: number) => {
      setQuantity((prev) => {
        const newValue = prev + amount
        // التأكد من أن الكمية بين 1 ومخزون المنتج
        return Math.max(1, Math.min(newValue, product?.stock || 10))
      })
    },
    [product],
  )

  // التحقق من توفر المنتج في المخزون
  const isProductOutOfStock = useMemo(() => {
    return product?.stock === 0
  }, [product])

  // معالجة إضافة المنتج إلى سلة التسوق
  const handleAddToCart = useCallback(() => {
    if (!product) return

    // التحقق من توفر المنتج قبل الإضافة
    if (isProductOutOfStock) {
      toast.error("المنتج غير متوفر حالياً", {
        position: "bottom-right",
        icon: <FiAlertCircle className="text-red-500" />,
      })
      return
    }

    // التحقق من اختيار اللون إذا كان المنتج يحتوي على ألوان متعددة
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast.warning("الرجاء اختيار اللون", {
        position: "bottom-right",
      })
      return
    }

    setIsAddingToCart(true)

    // محاكاة تأخير الإضافة للسلة
    setTimeout(() => {
      addToCart({
        id: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity,
        variant: selectedColor ? `اللون: ${selectedColor}` : undefined,
      })

      setIsAddingToCart(false)
      setShowAddedAnimation(true)

      setTimeout(() => {
        setShowAddedAnimation(false)
      }, 1500)

      toast.success(
        <div className="flex items-center rtl:flex-row-reverse">
          <span>✅ تمت الإضافة!</span>
          <Link href="/cart" className="text-blue-600 underline mr-2 rtl:mr-0 rtl:ml-2">
            عرض السلة 🛒
          </Link>
        </div>,
        { position: "bottom-right", autoClose: 3000 },
      )
    }, 600)
  }, [product, addToCart, quantity, isProductOutOfStock, selectedColor])

  // معالجة إضافة/إزالة المنتج من المفضلة
  const handleToggleWishlist = useCallback(() => {
    if (!product) return

    if (isFavorite) {
      removeFromWishlist(product.id)
      toast.info("تمت الإزالة من المفضلة!", { position: "bottom-right" })
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
      })

      // تسجيل إضافة المنتج للمفضلة
      if (userId) {
        fetch("/api/recommendations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            productId: product.id,
            action: "favorite",
          }),
        }).catch((error) => {
          console.error("Error recording favorite:", error)
        })
      }

      toast.success("تمت الإضافة إلى المفضلة!", { position: "bottom-right" })
    }
    setIsFavorite(!isFavorite)
  }, [product, isFavorite, addToWishlist, removeFromWishlist, userId])

  // عرض شاشة التحميل
  if (isLoading) {
    return (
      <div className="bg-gray-100 min-h-screen flex flex-col">
        <Header />
        <div className="container mx-auto px-4 py-20 flex-1 flex items-center justify-center">
          <LoadingSpinner message="جاري تحميل المنتج..." />
        </div>
        <Footer />
      </div>
    )
  }

  // عرض رسالة إذا حدث خطأ
  if (error) {
    return (
      <div className="bg-gray-100 min-h-screen flex flex-col">
        <Header />
        <div className="container mx-auto px-4 py-20 flex-1 flex flex-col items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-5xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-800">حدث خطأ</h1>
            <p className="text-gray-600 max-w-md">عذراً، حدث خطأ أثناء تحميل المنتج</p>
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
    )
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
    )
  }

  // حساب نسبة الخصم
  const discountPercentage =
    product.old_price && Math.round(((product.old_price - product.price) / product.old_price) * 100)

  // تحويل اللون الواحد إلى مصفوفة ألوان إذا لم تكن موجودة
  const productColors = product.colors || []

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
                  <div className="absolute top-6 left-6 bg-gradient-to-r from-red-500 to-pink-500 text-white py-1.5 px-4 text-sm font-bold z-10 shadow-md rounded-full animate-pulse">
                    خصم {discountPercentage}%
                  </div>
                )}

                {/* شارة المخزون */}
                {isProductOutOfStock ? (
                  <div className="absolute top-6 right-6 bg-red-500 text-white py-1 px-3 text-sm font-bold z-10 shadow-md rounded-full">
                    غير متوفر
                  </div>
                ) : (
                  product.stock < 5 && (
                    <div className="absolute top-6 right-6 bg-amber-500 text-white py-1 px-3 text-sm font-bold z-10 shadow-md rounded-full">
                      كمية محدودة
                    </div>
                  )
                )}

                {/* استخدام مكون معرض الصور المحسن */}
                <ProductImageGallery images={product.images || [product.image]} alt={product.name} />
              </div>

              {/* تفاصيل المنتج */}
              <div className="p-4 md:p-6 space-y-5">
                {/* معلومات المنتج الأساسية */}
                <div>
                  <div className="flex justify-between items-start">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
                    <div className="flex gap-2">
                      <button
                        onClick={handleToggleWishlist}
                        className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                          isFavorite
                            ? "bg-red-50 text-red-500 hover:bg-red-100"
                            : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                        }`}
                        aria-label={isFavorite ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
                      >
                        <FiHeart className={`w-5 h-5 ${isFavorite ? "fill-red-500" : ""}`} />
                      </button>
                      <div className="relative group">
                        <button
                          className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors"
                          aria-label="مشاركة"
                        >
                          <FiShare2 className="w-5 h-5" />
                        </button>
                        <div className="absolute top-full right-0 mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10">
                          <ProductSocialShare
                            url={typeof window !== "undefined" ? window.location.href : ""}
                            title={product.name}
                            image={product.image}
                            price={product.price}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <ProductRating productId={product.id} className="mb-3" />
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
                      <div className="bg-blue-100 text-blue-700 text-sm py-1 px-3 rounded-full">يشحن سريعاً</div>
                    )}

                    {/* إضافة مكون الإشعار عند توفر المنتج */}
                    <div className="ml-auto">
                      <ProductNotification
                        productId={product.id}
                        productName={product.name}
                        isOutOfStock={isProductOutOfStock}
                      />
                    </div>
                  </div>
                </div>

                {/* السعر */}
                <div className="flex items-center flex-wrap gap-3 bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-xl border border-amber-100">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 mb-1">السعر:</span>
                    <div className="flex items-end gap-2">
                      <p className="text-3xl font-bold text-amber-600">
                        {product.price} <span className="text-lg">ج.م</span>
                      </p>
                      {product.old_price && (
                        <div className="flex flex-col">
                          <p className="text-gray-500 line-through text-lg">{product.old_price} ج.م</p>
                          <p className="text-red-500 text-sm font-medium">
                            وفر {(product.old_price - product.price).toFixed(2)} ج.م
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {discountPercentage > 0 && (
                    <div className="ml-auto bg-red-500 text-white py-2 px-4 rounded-lg font-bold text-xl shadow-md">
                      {discountPercentage}% خصم
                    </div>
                  )}
                </div>

                {/* اختيار اللون - إذا كان المنتج يحتوي على ألوان متعددة */}
                {productColors.length > 0 && (
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <ProductColorSelector
                      colors={productColors}
                      selectedColor={selectedColor}
                      onChange={setSelectedColor}
                    />
                  </div>
                )}

                {/* قسم الشراء */}
                <div className="sticky bottom-0 md:relative bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
                  {/* كمية المنتج */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">الكمية:</span>
                    <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                      <button
                        onClick={() => changeQuantity(-1)}
                        className={`px-3 py-2 text-lg border-r rtl:border-r-0 rtl:border-l border-gray-300 hover:bg-gray-100 transition ${
                          isProductOutOfStock ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        disabled={isProductOutOfStock}
                      >
                        -
                      </button>
                      <span className="px-4 py-2 font-medium min-w-[40px] text-center">{quantity}</span>
                      <button
                        onClick={() => changeQuantity(1)}
                        className={`px-3 py-2 text-lg border-l rtl:border-l-0 rtl:border-r border-gray-300 hover:bg-gray-100 transition ${
                          isProductOutOfStock ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        disabled={isProductOutOfStock}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* عرض حالة المخزون بشكل مرئي */}
                  {!isProductOutOfStock && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">المتوفر في المخزون</span>
                        <span className="text-sm font-medium">{product.stock} قطعة</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${
                            product.stock < 5 ? "bg-red-500" : product.stock < 20 ? "bg-amber-500" : "bg-green-500"
                          }`}
                          style={{ width: `${Math.min(100, (product.stock / 50) * 100)}%` }}
                        ></div>
                      </div>
                      {product.stock < 5 && <p className="text-xs text-red-600 mt-1">كمية محدودة متبقية!</p>}
                    </div>
                  )}

                  {/* زر إضافة إلى السلة */}
                  <div className="relative">
                    <button
                      onClick={handleAddToCart}
                      disabled={isProductOutOfStock || isAddingToCart}
                      className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-bold text-lg transition-all duration-300 shadow-md ${
                        isProductOutOfStock
                          ? "bg-gray-400 cursor-not-allowed text-white"
                          : isAddingToCart
                            ? "bg-amber-400 text-white"
                            : "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white hover:shadow-lg transform hover:-translate-y-1"
                      }`}
                    >
                      {isProductOutOfStock ? (
                        <>
                          <FiAlertCircle className="w-6 h-6" /> غير متوفر حالياً
                        </>
                      ) : isAddingToCart ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          جاري الإضافة...
                        </>
                      ) : (
                        <>
                          <FiShoppingCart className="w-6 h-6" /> أضف إلى السلة
                        </>
                      )}
                    </button>

                    {/* تأثير الإضافة للسلة */}
                    {showAddedAnimation && (
                      <div className="absolute inset-0 flex items-center justify-center bg-green-500 text-white rounded-xl animate-fade-out">
                        <div className="flex items-center gap-2">
                          <FiCheck className="w-6 h-6" />
                          <span className="font-bold">تمت الإضافة!</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* الوصف المختصر */}
                {product.description && (
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-medium text-gray-800 mb-2">وصف المنتج:</h3>
                    <p className="text-gray-700 leading-relaxed line-clamp-3">{product.description}</p>
                    <button
                      onClick={() => document.getElementById("product-tabs")?.scrollIntoView({ behavior: "smooth" })}
                      className="text-blue-600 text-sm mt-2 hover:underline"
                    >
                      عرض المزيد من التفاصيل
                    </button>
                  </div>
                )}

                {/* مميزات المتجر */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <FiTruck className="text-blue-600 w-5 h-5" />
                    <span className="text-sm text-gray-700">توصيل سريع</span>
                  </div>
                  <div className="flex items-center gap-2 bg-green-50 p-3 rounded-lg border border-green-100">
                    <FiPackage className="text-green-600 w-5 h-5" />
                    <span className="text-sm text-gray-700">ضمان جودة المنتج</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* تفاصيل المنتج والمواصفات */}
          <div className="mt-8" id="product-tabs">
            <ProductInfoTabs
              description={product.description || "لا يوجد وصف متاح لهذا المنتج."}
              brand={product.brand}
              colors={productColors}
            />
          </div>

          {/* تقييمات المنتج */}
          <div className="mt-10 md:mt-16">
            <ProductReviews productId={product.id} userId={userId} userName={userName} />
          </div>

          {/* المنتجات المشاهدة مؤخرًا */}
          <div className="mt-10 md:mt-16">
            <RecentlyViewedProducts excludeProductId={product.id} />
          </div>

          {/* منتجات موصى بها */}
          <div className="mt-10 md:mt-16">
            <ProductRecommendations productId={product.id} category={product.category} tags={product.tags} />
          </div>
        </main>
      </div>
      <ToastContainer rtl={true} />
      <Footer />

      {/* زر ثابت للإضافة إلى السلة في الهواتف المحمولة */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 shadow-lg z-50">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="font-bold text-lg text-amber-600">{product.price} ج.م</p>
            {product.old_price && <p className="text-gray-500 line-through text-sm">{product.old_price} ج.م</p>}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={isProductOutOfStock || isAddingToCart}
            className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all duration-300 shadow-md ${
              isProductOutOfStock
                ? "bg-gray-400 cursor-not-allowed text-white"
                : isAddingToCart
                  ? "bg-amber-400 text-white"
                  : "bg-gradient-to-r from-amber-500 to-yellow-500 text-white"
            }`}
          >
            {isProductOutOfStock ? (
              <>
                <FiAlertCircle className="w-5 h-5" /> غير متوفر
              </>
            ) : isAddingToCart ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                جاري...
              </>
            ) : (
              <>
                <FiShoppingCart className="w-5 h-5" /> أضف إلى السلة
              </>
            )}
          </button>
        </div>
      </div>

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
        
        /* تحسينات للتجاوب مع الهواتف المحمولة */
        @media (max-width: 640px) {
          .product-main-swiper .swiper-button-next,
          .product-main-swiper .swiper-button-prev {
            display: none;
          }
          
          .product-main-swiper .swiper-pagination {
            bottom: 0;
          }
        }

        /* تأثير الإضافة للسلة */
        @keyframes fadeOut {
          0% { opacity: 1; }
          70% { opacity: 1; }
          100% { opacity: 0; }
        }
        
        .animate-fade-out {
          animation: fadeOut 1.5s forwards;
        }
      `}</style>
    </div>
  )
}

export default ProductPage

