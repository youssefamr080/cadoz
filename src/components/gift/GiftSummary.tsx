"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import Image from "next/image";
import { useGift } from "../../context/GiftContext";
import { useCart } from "../../context/CartContext";
import { useRouter } from "next/navigation";
import { XMarkIcon, PlusIcon, MinusIcon, ShoppingBagIcon, GiftIcon } from "@heroicons/react/24/outline";
import { 
  ArrowRightIcon, 
  SparklesIcon, 
  HeartIcon, 
  TagIcon, 
  ShieldCheckIcon, 
  TruckIcon,
  ReceiptPercentIcon,
  ArchiveBoxIcon,
  GiftIcon as GiftIconSolid,
  BanknotesIcon
} from "@heroicons/react/24/solid";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Define a type for gift items
interface GiftItem {
  name: string;
  quantity: number;
  image: string;
  price: number;
}

// Create a gift preview image using HTML Canvas
const createGiftPreviewImage = (giftData: { items: GiftItem[]; box?: { name: string; image: string; price: number; }; wrap?: { name: string; image: string; price: number; }; createdAt?: string; totalPrice?: number; }) => {
  if (typeof window === 'undefined') return '';

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 400;
  canvas.height = 400;

  // Set gradient background
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#C084FC');
  gradient.addColorStop(1, '#EC4899');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Add gift box icon
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 100px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🎁', canvas.width / 2, canvas.height / 2 - 40);

  // Add text
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('هدية مميزة', canvas.width / 2, canvas.height / 2 + 40);
  ctx.font = '18px sans-serif';
  ctx.fillText(`${giftData.items.length} منتجات`, canvas.width / 2, canvas.height / 2 + 80);

  return canvas.toDataURL('image/png');
};


const fadeInScale = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.2 }
};

const GiftSummary = () => {
  const { state } = useGift();
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart();
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const priceDetails = useMemo(() => {
    const giftItemsTotal = state.cart.reduce((sum, item) => sum + item.data.price * item.quantity, 0);
    const boxPrice = state.selectedBox?.price || 0;
    const wrapPrice = state.selectedWrap?.price || 0;
    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    return {
      giftItemsTotal,
      boxPrice,
      wrapPrice,
      giftTotal: giftItemsTotal + boxPrice + wrapPrice,
      cartTotal,
      finalTotal: cartTotal + giftItemsTotal + boxPrice + wrapPrice
    };
  }, [state.cart, state.selectedBox, state.selectedWrap, cart]);

  const createGiftItem = useCallback(() => {
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
    
    const giftData = {
      items: giftItems,
      box: boxDetail,
      wrap: wrapDetail,
      createdAt: new Date().toISOString(),
      totalPrice: priceDetails.giftTotal
    };
    
    const itemsNames = giftItems.map(item => `${item.name} ×${item.quantity}`).join(", ");
    const boxText = boxDetail ? `صندوق: ${boxDetail.name}` : "";
    const wrapText = wrapDetail ? `تغليف: ${wrapDetail.name}` : "";
    const summaryText = [itemsNames, boxText, wrapText].filter(Boolean).join(" | ");

    // Generate a custom preview image for the gift
    const previewImage = createGiftPreviewImage(giftData);
  
    return {
      id: Date.now(),
      name: "هدية مميزة",
      image: previewImage,
      price: priceDetails.giftTotal,
      quantity: 1,
      category: "هدايا",
      variant: "مخصص",
      stock: 1,
      giftDetails: summaryText,
      giftData: giftData,
    };
  }, [state.cart, state.selectedBox, state.selectedWrap, priceDetails.giftTotal]);

  const handleAddGiftToCart = useCallback(async () => {
    if (state.cart.length === 0) {
      toast.error("لا يمكن إضافة هدية فارغة! الرجاء إضافة منتج واحد على الأقل", {
        position: "top-center",
        icon: <span>🎁</span>,
        className: "custom-toast-error"
      });
      return;
    }
    
    if (isAdding) return;
    
    setIsAdding(true);
    
    try {
      const giftItem = createGiftItem();
      addToCart(giftItem);
      
      if (!shouldReduceMotion) {
        setShowConfetti(true);
      }
      
      toast.success("تمت إضافة هديتك المميزة إلى السلة! 🎁", {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: "rtl-toast custom-toast-success"
      });
      
      setTimeout(() => {
        router.push("/cart");
      }, 300);
    } catch (error) {
      console.error("Error adding gift to cart:", error);
      toast.error("عذراً، حدث خطأ أثناء إضافة الهدية. يرجى المحاولة مرة أخرى", {
        position: "top-center",
        icon: <span>❌</span>,
        className: "custom-toast-error"
      });
    } finally {
      setTimeout(() => {
        setIsAdding(false);
        setShowConfetti(false);
      }, 800);
    }
  }, [state.cart, isAdding, createGiftItem, addToCart, router, shouldReduceMotion]);

  const handleUpdateQuantity = useCallback((id: number, amount: number) => {
    updateQuantity(id, amount);
    toast.success("تم تحديث الكمية بنجاح!", {
      position: "top-right",
      autoClose: 1500,
      hideProgressBar: true,
      icon: <span>✨</span>,
      className: "custom-toast-success"
    });
  }, [updateQuantity]);

  const handleRemoveFromCart = useCallback((id: number) => {
    removeFromCart(id);
    toast.error("تم إزالة المنتج من السلة", {
      position: "top-right",
      autoClose: 1500,
      hideProgressBar: true,
      icon: <span>🗑️</span>,
      className: "custom-toast-error"
    });
  }, [removeFromCart]);

  const ProductItem = useCallback(({ item, isGift = false, showControls = true }) => (
    <motion.div
      layout={!shouldReduceMotion}
      {...fadeInScale}
      className="flex items-center justify-between bg-white p-4 rounded-xl mb-3 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group"
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="relative w-16 h-16 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl overflow-hidden group-hover:shadow-lg transition-shadow duration-300">
            <Image
              src={isGift ? item.data.image : item.image}
              alt={isGift ? item.data.name : item.name}
              width={64}
              height={64}
              className="w-full h-full object-contain p-1 transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          {isGift && (
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
              <GiftIcon className="w-3 h-3" />
            </div>
          )}
        </div>
        <div>
          <h3 className="text-md font-bold text-gray-800 mb-1 line-clamp-1">{isGift ? item.data.name : item.name}</h3>
          <div className="flex items-center gap-2">
            <TagIcon className="w-4 h-4 text-emerald-500" />
            <p className="text-emerald-600 font-semibold">{(isGift ? item.data.price : item.price).toLocaleString()} ج.م</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {showControls ? (
          <>
            <div className="flex items-center bg-gray-50 p-1 rounded-full border border-gray-200 shadow-sm">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleUpdateQuantity(item.id, -1)}
                className="p-1 hover:bg-red-50 rounded-full transition-colors"
                aria-label="تقليل الكمية"
              >
                <MinusIcon className="w-5 h-5 text-red-500" />
              </motion.button>
              <span className="mx-3 font-bold text-gray-700">{item.quantity}</span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleUpdateQuantity(item.id, 1)}
                className="p-1 hover:bg-green-50 rounded-full transition-colors"
                aria-label="زيادة الكمية"
              >
                <PlusIcon className="w-5 h-5 text-green-500" />
              </motion.button>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleRemoveFromCart(item.id)}
              className="text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors"
              aria-label="إزالة من السلة"
            >
              <XMarkIcon className="w-5 h-5" />
            </motion.button>
          </>
        ) : (
          <span className="font-bold text-gray-700 bg-gray-100 px-4 py-2 rounded-full">× {item.quantity}</span>
        )}
      </div>
    </motion.div>
  ), [handleUpdateQuantity, handleRemoveFromCart, shouldReduceMotion]);

  const GiftPackagingItem = useCallback(({ item, icon }) => (
    <motion.div
      {...fadeInScale}
      className="flex items-center gap-4 bg-white p-4 rounded-xl mb-3 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group"
    >
      <div className="relative">
        <div className="relative w-16 h-16 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl overflow-hidden group-hover:shadow-lg transition-shadow duration-300">
          <Image
            src={item.image}
            alt={item.name}
            width={64}
            height={64}
            className="w-full h-full object-contain p-1 transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
          {icon}
        </div>
      </div>
      <div className="flex-1">
        <h3 className="text-md font-bold text-gray-800 mb-1 line-clamp-1">{item.name}</h3>
        <div className="flex items-center gap-2">
          <TagIcon className="w-4 h-4 text-amber-500" />
          <p className="text-amber-600 font-semibold">{item.price.toLocaleString()} ج.م</p>
        </div>
      </div>
    </motion.div>
  ), []);

  const Section = useCallback(({ title, icon, children, isEmpty = false, emptyMessage }) => (
    <motion.div
      className="mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-2.5 rounded-xl shadow-sm">
          {icon}
        </div>
        <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
          {title}
        </h3>
      </div>
      {isEmpty ? (
        <motion.div 
          className="text-center py-8 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-dashed border-gray-300"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-gray-500">{emptyMessage}</p>
        </motion.div>
      ) : (
        <div className="space-y-3">{children}</div>
      )}
    </motion.div>
  ), []);

  const LightConfetti = useCallback(() => (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          initial={{
            x: `calc(50% + ${Math.random() * 60 - 30}px)`,
            y: `calc(50% + ${Math.random() * 30 - 15}px)`,
            opacity: 1,
            scale: 0
          }}
          animate={{
            x: `calc(50% + ${Math.random() * 400 - 200}px)`,
            y: `calc(50% - ${Math.random() * 400 + 100}px)`,
            opacity: 0,
            scale: 1.5
          }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{
            backgroundColor: [
              '#8B5CF6',
              '#EC4899',
              '#10B981',
              '#F59E0B',
              '#3B82F6'
            ][Math.floor(Math.random() * 5)]
          }}
        />
      ))}
    </div>
  ), []);

  const Features = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {[
        {
          icon: <ShieldCheckIcon className="w-6 h-6 text-emerald-500" />,
          title: "ضمان الجودة",
          description: "نضمن جودة جميع منتجاتنا"
        },
        {
          icon: <TruckIcon className="w-6 h-6 text-blue-500" />,
          title: "توصيل سريع",
          description: "شحن سريع لجميع المناطق"
        },
        {
          icon: <HeartIcon className="w-6 h-6 text-red-500" />,
          title: "تغليف مميز",
          description: "عناية خاصة بتغليف الهدايا"
        }
      ].map((feature, index) => (
        <motion.div
          key={index}
          className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-50">
              {feature.icon}
            </div>
            <div>
              <h4 className="font-bold text-gray-800">{feature.title}</h4>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const PriceBreakdown = () => (
    <motion.div
      className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl mb-8 shadow-md border border-purple-100"
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <h3 className="text-xl font-bold text-purple-800 mb-4 flex items-center gap-2">
        <ReceiptPercentIcon className="w-6 h-6 text-purple-600" />
        تفاصيل التكلفة
      </h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <GiftIconSolid className="w-5 h-5 text-pink-500" />
            <span className="text-gray-700">محتويات الهدية</span>
          </div>
          <span className="font-bold text-pink-600">{priceDetails.giftItemsTotal.toLocaleString()} ج.م</span>
        </div>
        
        {state.selectedBox && (
          <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <ArchiveBoxIcon className="w-5 h-5 text-amber-500" />
              <span className="text-gray-700">صندوق الهدية</span>
            </div>
            <span className="font-bold text-amber-600">{priceDetails.boxPrice.toLocaleString()} ج.م</span>
          </div>
        )}
        
        {state.selectedWrap && (
          <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-purple-500" />
              <span className="text-gray-700">تغليف الهدية</span>
            </div>
            <span className="font-bold text-purple-600">{priceDetails.wrapPrice.toLocaleString()} ج.م</span>
          </div>
        )}
        
        <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <ShoppingBagIcon className="w-5 h-5 text-emerald-500" />
            <span className="text-gray-700">منتجات السلة</span>
          </div>
          <span className="font-bold text-emerald-600">{priceDetails.cartTotal.toLocaleString()} ج.م</span>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-md mt-4">
          <div className="flex items-center gap-2">
            <BanknotesIcon className="w-6 h-6 text-white" />
            <span className="text-white font-bold">الإجمالي النهائي</span>
          </div>
          <span className="font-bold text-white text-xl">{priceDetails.finalTotal.toLocaleString()} ج.م</span>
        </div>
      </div>
    </motion.div>
  );

  const AddGiftButton = useCallback(() => {
    const isDisabled = isAdding || state.cart.length === 0;
    
    return (
      <motion.button
        onClick={handleAddGiftToCart}
        disabled={isDisabled}
        className={`
          w-full relative overflow-hidden
          ${isDisabled 
            ? "bg-gray-400 cursor-not-allowed" 
            : "bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
          } 
          text-white py-4 px-6 rounded-xl flex items-center justify-center gap-3 
          text-lg transition-all shadow-lg font-bold
          ${isScrolled ? 'sticky bottom-4 z-50' : ''}
        `}
        whileHover={{ scale: isDisabled ? 1 : 1.01 }}
        whileTap={{ scale: isDisabled ? 1 : 0.98 }}
      >
        {isAdding ? (
          <span className="flex items-center gap-3">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            جاري إضافة هديتك المميزة...
          </span>
        ) : (
          <>
            <HeartIcon className="w-5 h-5" />
            <span>إضافة الهدية إلى السلة</span>
            <ArrowRightIcon className="w-5 h-5" />
          </>
        )}
      </motion.button>
    );
  }, [handleAddGiftToCart, isAdding, state.cart.length, isScrolled]);

  return (
    <motion.div
      className="bg-gradient-to-b from-white to-gray-50 p-6 md:p-8 rounded-2xl shadow-xl max-w-3xl mx-auto border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ToastContainer rtl={true} limit={3} />
      {showConfetti && <LightConfetti />}

      <div className="mb-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full mb-4 font-bold shadow-lg"
        >
          Cadoz
        </motion.div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-3">
          مراجعة هديتك المميزة
        </h2>
        <p className="text-gray-600 text-lg">
          راجع تفاصيل هديتك قبل إضافتها إلى السلة
        </p>
      </div>

      <Features />

      <Section
        title="المنتجات الأساسية"
        icon={<ShoppingBagIcon className="w-6 h-6 text-purple-600" />}
        isEmpty={cart.length === 0}
        emptyMessage="لم يتم إضافة أي منتجات للسلة بعد"
      >
        <AnimatePresence initial={false}>
          {cart.map((item) => (
            <ProductItem key={item.id} item={item} />
          ))}
        </AnimatePresence>
      </Section>

      <Section
        title="محتويات الهدية"
        icon={<GiftIcon className="w-6 h-6 text-pink-600" />}
        isEmpty={state.cart.length === 0}
        emptyMessage="لم يتم إضافة أي منتجات داخل الهدية بعد"
      >
        <AnimatePresence initial={false}>
          {state.cart.map((item) => (
            <ProductItem key={item.id} item={item} isGift={true} showControls={false} />
          ))}
        </AnimatePresence>
      </Section>

      {(state.selectedBox || state.selectedWrap) && (
        <Section
          title="صندوق الهدية والتغليف"
          icon={<SparklesIcon className="w-6 h-6 text-amber-600" />}
          emptyMessage="لم يتم اختيار صندوق أو تغليف بعد"
        >
          {state.selectedBox && (
            <GiftPackagingItem item={state.selectedBox} icon={<GiftIcon className="w-3 h-3" />} />
          )}
          {state.selectedWrap && (
            <GiftPackagingItem item={state.selectedWrap} icon={<SparklesIcon className="w-3 h-3" />} />
          )}
        </Section>
      )}

      <PriceBreakdown />

      <AddGiftButton />

      {state.cart.length === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-4 text-red-500 text-sm font-medium"
        >
          يجب إضافة منتج واحد على الأقل في الهدية
        </motion.p>
      )}
    </motion.div>
  );
};

export default GiftSummary;