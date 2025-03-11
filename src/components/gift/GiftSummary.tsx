"use client";

import React, { useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { useGift } from "../../context/GiftContext";
import { useCart } from "../../context/CartContext";
import { useRouter } from "next/navigation";
import { XMarkIcon, PlusIcon, MinusIcon, ShoppingBagIcon, GiftIcon } from "@heroicons/react/24/outline";
import { CurrencyDollarIcon, ArrowRightIcon, SparklesIcon, HeartIcon } from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// صورة افتراضية للهدية
const DEFAULT_GIFT_IMAGE = "/images/decoration.png";

// تأثيرات الحركة المشتركة للتحسين
const sharedAnimations = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.2 } // تقليل مدة الحركة
};

const GiftSummary = () => {
  const { state } = useGift();
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart();
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // حساب السعر الإجمالي للهدية باستخدام useMemo لتحسين الأداء
  const giftTotal = useMemo(() => {
    const giftItemsTotal = state.cart.reduce((sum, item) => sum + item.data.price * item.quantity, 0);
    const boxPrice = state.selectedBox?.price || 0;
    const wrapPrice = state.selectedWrap?.price || 0;
    return giftItemsTotal + boxPrice + wrapPrice;
  }, [state.cart, state.selectedBox, state.selectedWrap]);

  // حساب الإجمالي الكلي للمنتجات الأساسية والهدية باستخدام useMemo
  const totalPrice = useMemo(() => {
    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return cartTotal + giftTotal;
  }, [cart, giftTotal]);

  // إنشاء عنصر الهدية باستخدام useCallback لتجنب إعادة الإنشاء غير الضروري
  const createGiftItem = useCallback(() => {
    // تحسين تنسيق تفاصيل الهدية لتكون أكثر تنظيماً
    const giftItems = state.cart.map(item => ({ 
      name: item.data.name, 
      quantity: item.quantity,
      image: item.data.image,
      price: item.data.price
    }));
    
    const boxDetail = state.selectedBox ? {
      name: state.selectedBox.name,
      image: state.selectedBox.image,
      price: state.selectedBox.price
    } : null;
    
    const wrapDetail = state.selectedWrap ? {
      name: state.selectedWrap.name,
      image: state.selectedWrap.image,
      price: state.selectedWrap.price
    } : null;
    
    // تخزين التفاصيل المنظمة كـ JSON
    const giftData = {
      items: giftItems,
      box: boxDetail,
      wrap: wrapDetail,
      message: state.message || "",
      recipient: state.recipient || ""
    };
    
    // المعلومات المعروضة في ملخص نصي
    const itemsNames = giftItems.map(item => `${item.name} ×${item.quantity}`).join(", ");
    const boxText = boxDetail ? `صندوق: ${boxDetail.name}` : "";
    const wrapText = wrapDetail ? `تغليف: ${wrapDetail.name}` : "";
    const summaryText = [itemsNames, boxText, wrapText].filter(Boolean).join(" | ");
  
    return {
      id: Date.now(),
      name: state.recipient ? `هدية لـ ${state.recipient}` : "هدية مخصصة",
      image: DEFAULT_GIFT_IMAGE,
      price: giftTotal,
      quantity: 1,
      category: "هدايا",
      variant: "مخصص",
      stock: 1,
      giftDetails: summaryText,
      giftData: giftData,
    };
  }, [state.cart, state.selectedBox, state.selectedWrap, state.message, state.recipient, giftTotal]);
  
  // معالجة إضافة الهدية إلى السلة - تحسين الأداء
  const handleAddGiftToCart = useCallback(async () => {
    if (state.cart.length === 0) {
      toast.error("لا يمكن إضافة هدية فارغة! الرجاء إضافة منتج واحد على الأقل");
      return;
    }
    
    // منع النقرات المتكررة
    if (isAdding) return;
    
    setIsAdding(true);
    
    try {
      const giftItem = createGiftItem();
      addToCart(giftItem);
      
      // إضافة تأثير احتفالي خفيف
      setShowConfetti(true);
      
      toast.success("🎁 تمت إضافة الهدية إلى السلة بنجاح!", {
        icon: <span>🎁</span>,
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // تقليل التأخير قبل الانتقال
      setTimeout(() => {
        router.push("/cart");
      }, 300);
    } catch (error) {
      toast.error("حدث خطأ أثناء إضافة الهدية، يرجى المحاولة مرة أخرى");
      console.error("Error adding gift to cart:", error);
    } finally {
      // إيقاف حالة التحميل بعد فترة قصيرة
      setTimeout(() => {
        setIsAdding(false);
        setShowConfetti(false);
      }, 800);
    }
  }, [state.cart, isAdding, createGiftItem, addToCart, router]);

  // معالجة تحديث الكمية مع تحسين الأداء
  const handleUpdateQuantity = useCallback((id, amount) => {
    updateQuantity(id, amount);
    toast.success("تم تحديث الكمية بنجاح!", {
      position: "top-right",
      autoClose: 1500,
      hideProgressBar: true,
    });
  }, [updateQuantity]);

  // معالجة إزالة منتج من السلة مع تحسين الأداء
  const handleRemoveFromCart = useCallback((id) => {
    removeFromCart(id);
    toast.error("تم إزالة المنتج من السلة!", {
      position: "top-right",
      autoClose: 1500,
      hideProgressBar: true,
    });
  }, [removeFromCart]);

  // مكون فرعي محسن لعرض المنتجات
  const ProductItem = useCallback(({ item, isGift = false, showControls = true }) => (
    <motion.div
      layout
      {...sharedAnimations}
      className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 p-4 rounded-lg mb-3 shadow-sm border border-gray-100"
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <Image
            src={isGift ? item.data.image : item.image}
            alt={isGift ? item.data.name : item.name}
            width={64}
            height={64}
            className="w-16 h-16 object-contain rounded-lg bg-white p-1 shadow-sm"
          />
          {isGift && (
            <div className="absolute -top-2 -right-2 bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md">
              <GiftIcon className="w-3 h-3" />
            </div>
          )}
        </div>
        <div>
          <h3 className="text-md font-semibold text-gray-800">{isGift ? item.data.name : item.name}</h3>
          <p className="text-gray-600 text-sm">{(isGift ? item.data.price : item.price).toLocaleString()} ج.م للقطعة</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {showControls ? (
          <>
            <div className="flex items-center bg-white p-1 rounded-full border border-gray-200 shadow-sm">
              <button
                onClick={() => handleUpdateQuantity(item.id, -1)}
                className="p-1 hover:bg-red-50 rounded-full transition-colors"
                aria-label="تقليل الكمية"
              >
                <MinusIcon className="w-5 h-5 text-red-500" />
              </button>
              <span className="mx-2 font-medium min-w-6 text-center">{item.quantity}</span>
              <button
                onClick={() => handleUpdateQuantity(item.id, 1)}
                className="p-1 hover:bg-green-50 rounded-full transition-colors"
                aria-label="زيادة الكمية"
              >
                <PlusIcon className="w-5 h-5 text-green-500" />
              </button>
            </div>
            <button
              onClick={() => handleRemoveFromCart(item.id)}
              className="text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors"
              aria-label="إزالة من السلة"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </>
        ) : (
          <span className="font-medium text-gray-800 bg-gray-200 px-3 py-1 rounded-full">× {item.quantity}</span>
        )}
      </div>
    </motion.div>
  ), [handleUpdateQuantity, handleRemoveFromCart]);

  // مكون فرعي محسن لعرض صندوق الهدية أو التغليف
  const GiftPackagingItem = useCallback(({ item, icon }) => (
    <motion.div
      {...sharedAnimations}
      className="flex items-center gap-4 bg-gray-50 hover:bg-gray-100 p-4 rounded-lg mb-3 shadow-sm border border-gray-100"
    >
      <div className="relative">
        <Image
          src={item.image}
          alt={item.name}
          width={64}
          height={64}
          className="w-16 h-16 object-contain rounded-lg bg-white p-1 shadow-sm"
        />
        <div className="absolute -top-2 -right-2 bg-amber-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md">
          {icon}
        </div>
      </div>
      <div>
        <h3 className="text-md font-semibold text-gray-800">{item.name}</h3>
        <p className="text-gray-600 text-sm">{item.price.toLocaleString()} ج.م</p>
      </div>
    </motion.div>
  ), []);

  // مكون فرعي محسن لعرض قسم
  const Section = useCallback(({ title, icon, children, isEmpty = false, emptyMessage }) => (
    <motion.div
      className="mb-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-2">
        <div className="bg-emerald-100 p-2 rounded-full">{icon}</div>
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
      </div>
      {isEmpty ? (
        <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          {emptyMessage}
        </p>
      ) : (
        children
      )}
    </motion.div>
  ), []);

  // مكون الاحتفال المُحسن مع تقليل عدد العناصر وتحسين الأداء
  const LightConfetti = useCallback(() => (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-full"
          initial={{
            x: `calc(50% + ${Math.random() * 60 - 30}px)`,
            y: `calc(50% + ${Math.random() * 30 - 15}px)`,
            opacity: 1
          }}
          animate={{
            x: `calc(50% + ${Math.random() * 200 - 100}px)`,
            y: `calc(50% - ${Math.random() * 300 + 50}px)`,
            opacity: 0
          }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ backgroundColor: ['#8B5CF6', '#EC4899', '#10B981'][Math.floor(Math.random() * 3)] }}
        />
      ))}
    </div>
  ), []);

  // زر إضافة الهدية المُحسن
  const AddGiftButton = useCallback(() => {
    const isDisabled = isAdding || state.cart.length === 0;
    
    return (
      <motion.button
        onClick={handleAddGiftToCart}
        disabled={isDisabled}
        className={`w-full ${
          state.cart.length === 0 
            ? "bg-gray-400 cursor-not-allowed" 
            : isAdding 
              ? "bg-purple-700" 
              : "bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
        } text-white py-4 px-6 rounded-xl flex items-center justify-center gap-3 text-lg transition-all shadow-lg font-bold`}
        whileHover={{ scale: isDisabled ? 1 : 1.01 }}
        whileTap={{ scale: isDisabled ? 1 : 0.98 }}
      >
        {isAdding ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            جاري الإضافة...
          </span>
        ) : (
          <>
            <span>إضافة الهدية إلى السلة</span>
            <ArrowRightIcon className="w-5 h-5" />
          </>
        )}
      </motion.button>
    );
  }, [handleAddGiftToCart, isAdding, state.cart.length]);

  return (
    <motion.div
      className="bg-white p-6 md:p-8 rounded-2xl shadow-xl max-w-3xl mx-auto border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ToastContainer rtl={true} limit={3} />
      {showConfetti && <LightConfetti />}

      {/* العنوان */}
      <div className="mb-8 text-center">
        <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full mb-2 font-medium shadow-md">
          Cadoz
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">مراجعة الهدية النهائية</h2>
        <p className="text-gray-500">راجع تفاصيل هديتك المميزة قبل الإضافة إلى السلة</p>
      </div>

      {/* معلومات المستلم */}
      {state.recipient && (
        <motion.div 
          className="mb-6 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100" 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <HeartIcon className="w-5 h-5 text-pink-500" />
            <h3 className="font-bold text-gray-800">معلومات المستلم</h3>
          </div>
          <p className="text-gray-700">الاسم: <span className="font-semibold">{state.recipient}</span></p>
          {state.message && (
            <div className="mt-2 p-3 bg-white rounded-lg border border-purple-100 shadow-sm">
              <p className="italic text-gray-600">&quot;{state.message}&quot;</p>
            </div>
          )}
        </motion.div>
      )}

      {/* المنتجات الأساسية */}
      <Section
        title="المنتجات الأساسية"
        icon={<ShoppingBagIcon className="w-5 h-5 text-emerald-600" />}
        isEmpty={cart.length === 0}
        emptyMessage="لم يتم إضافة أي منتجات للسلة."
      >
        <AnimatePresence initial={false}>
          {cart.map((item) => (
            <ProductItem key={item.id} item={item} />
          ))}
        </AnimatePresence>
      </Section>

      {/* محتويات الهدية */}
      <Section
        title="محتويات الهدية"
        icon={<GiftIcon className="w-5 h-5 text-purple-600" />}
        isEmpty={state.cart.length === 0}
        emptyMessage="لم يتم إضافة أي منتجات داخل الهدية."
      >
        <AnimatePresence initial={false}>
          {state.cart.map((item) => (
            <ProductItem key={item.id} item={item} isGift={true} showControls={false} />
          ))}
        </AnimatePresence>
      </Section>

      {/* صندوق الهدية والتغليف */}
      {(state.selectedBox || state.selectedWrap) && (
        <Section
          title="صندوق الهدية والتغليف"
          icon={<SparklesIcon className="w-5 h-5 text-amber-600" />}
          emptyMessage="لم يتم اختيار صندوق أو تغليف."
        >
          {state.selectedBox && (
            <GiftPackagingItem item={state.selectedBox} icon={<GiftIcon className="w-3 h-3" />} />
          )}
          {state.selectedWrap && (
            <GiftPackagingItem item={state.selectedWrap} icon={<GiftIcon className="w-3 h-3" />} />
          )}
        </Section>
      )}

      {/* ملخص السعر */}
      <motion.div
        className="bg-gradient-to-r from-emerald-50 to-teal-50 p-5 rounded-xl mb-6 shadow-md border border-emerald-100"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2 rounded-full">
              <CurrencyDollarIcon className="w-6 h-6 text-emerald-700" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">الإجمالي النهائي:</h3>
          </div>
          <div className="flex flex-col items-end">
            <p className="text-2xl font-bold text-emerald-700 flex items-center gap-1">
              <span>{totalPrice.toLocaleString()}</span>
              <span className="text-sm font-medium">ج.م</span>
            </p>
            <div className="text-xs text-gray-500 mt-1">
              <span>هدية ({giftTotal.toLocaleString()}) + سلة ({cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString()})</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* زر إضافة الهدية إلى السلة */}
      <AddGiftButton />

      {/* رسالة مساعدة */}
      {state.cart.length === 0 && (
        <p className="text-center mt-3 text-red-500 text-sm">
          يجب إضافة منتج واحد على الأقل في الهدية
        </p>
      )}
    </motion.div>
  );
};

export default GiftSummary;