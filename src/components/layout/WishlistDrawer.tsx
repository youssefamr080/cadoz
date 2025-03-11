"use client";

import React, { useEffect, useCallback, useState, useRef } from "react";
import Image from "next/image";
import { 
  FiTrash, 
  FiX, 
  FiShoppingCart, 
  FiHeart, 
  FiAlertTriangle, 
  FiArrowLeft, 
  FiCheck 
} from "react-icons/fi";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import { motion, AnimatePresence, usePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { useOnClickOutside } from "usehooks-ts";

// تعريف نوع المنتج
interface WishlistItemType {
  id: number;
  name: string;
  price: number;
  image: string;
  stock: number;
  discount?: number;
  rating?: number;
}

// تأثيرات الانتقال المشتركة
const commonTransitions = {
  drawer: {
    type: "spring" as const,
    stiffness: 300,
    damping: 30
  },
  item: {
    duration: 0.2
  }
};

const WishlistDrawer = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { wishlist, removeFromWishlist, validateStock } = useWishlist();
  const { addToCart, updateQuantity, isItemInCart, getItemQuantity } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);
  const [, setIsClosing] = useState<boolean>(false);
  
  // إغلاق الدرج
  const handleClose = useCallback(() => {
    setIsClosing(true);
    // تأخير الإغلاق للسماح بتأثير الخروج
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  }, [onClose]);
  
  // Custom hook للنقر خارج الدرج
  useOnClickOutside(drawerRef, handleClose);
  
  // قفل التمرير عند فتح الدرج
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    
    // تنظيف عند إزالة المكون
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);
  
  // إضافة المنتج إلى السلة مع التحقق من المخزون
  const handleAddToCart = useCallback((item: WishlistItemType) => {
    // التحقق من المخزون قبل الإضافة
    const validatedItem = validateStock(item);
    
    if (!validatedItem) {
      toast.error("هذا المنتج غير متوفر في المخزون", {
        position: "bottom-right",
        icon: <FiAlertTriangle className="text-red-500" />,
        style: {
          direction: "rtl",
        },
      });
      return;
    }
    
    // التحقق مما إذا كان المنتج موجوداً بالفعل في السلة
    if (isItemInCart(item.id)) {
      // تحديث الكمية بدلاً من الإضافة مرة أخرى
      const newQuantity = getItemQuantity(item.id) + 1;
      updateQuantity(item.id, newQuantity);
      
      toast.success("تم تحديث الكمية في السلة", {
        position: "bottom-right",
        icon: <FiCheck className="text-green-500" />,
        style: {
          direction: "rtl",
        },
      });
    } else {
      // إضافة منتج جديد إلى السلة
      addToCart({ 
        ...validatedItem, 
        quantity: 1 
      });
      
      toast.success("تمت الإضافة إلى السلة بنجاح!", {
        position: "bottom-right",
        icon: "🛒",
        style: {
          direction: "rtl",
        },
      });
    }
  }, [addToCart, updateQuantity, isItemInCart, validateStock]);
  
  // إزالة المنتج من المفضلة مع تأكيد الإزالة
  const handleRemoveFromWishlist = useCallback((id: number, name: string) => {
    removeFromWishlist(id);
    
    toast(() => (
      <div className="flex items-center gap-2 justify-between w-full">
        <div className="flex items-center gap-2">
          <FiTrash className="text-red-500" />
          <span>تم حذف <strong>{name}</strong> من القائمة</span>
        </div>
      </div>
    ), {
      position: "bottom-right",
      style: {
        direction: "rtl",
      },
    });
  }, [removeFromWishlist]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-md z-40"
            role="dialog"
            aria-modal="true"
            data-testid="wishlist-overlay"
          />

          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={commonTransitions.drawer}
            className="fixed top-0 right-0 w-full max-w-md h-screen bg-white shadow-2xl z-50 flex flex-col overflow-hidden"
            role="dialog"
            aria-labelledby="wishlist-heading"
            data-testid="wishlist-drawer"
          >
            <Header onClose={handleClose} itemCount={wishlist.length} />
            
            <main className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4 scrollbar">
              {wishlist.length > 0 ? (
                <motion.ul
                  initial="hidden"
                  animate="visible"
                  variants={{ 
                    visible: { 
                      transition: { staggerChildren: 0.05 } 
                    } 
                  }}
                  className="divide-y divide-gray-100"
                  role="list"
                  aria-label="قائمة المنتجات المفضلة"
                >
                  {wishlist.map((item) => (
                    <WishlistItem
                      key={item.id}
                      item={item}
                      onAddToCart={handleAddToCart}
                      onRemove={handleRemoveFromWishlist}
                    />
                  ))}
                </motion.ul>
              ) : (
                <EmptyState />
              )}
            </main>

            <Footer onClose={handleClose} itemCount={wishlist.length} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// مكون الهيدر
const Header = ({ onClose, itemCount }: { onClose: () => void; itemCount: number }) => (
  <div className="sticky top-0 bg-white z-10 border-b border-gray-100 shadow-sm">
    <div className="flex items-center justify-between p-6">
      <div className="flex items-center gap-2">
        <h2 id="wishlist-heading" className="text-2xl font-bold text-gray-900">
          قائمة الرغبات
        </h2>
        <div className="flex items-center justify-center bg-primary-50 text-primary-700 rounded-full w-7 h-7 text-sm font-medium">
          {itemCount}
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-2 hover:bg-gray-50 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-label="إغلاق القائمة"
        data-testid="close-wishlist-button"
      >
        <FiX className="w-6 h-6 text-gray-600" />
      </button>
    </div>
  </div>
);

// مكون عنصر المفضلة
const WishlistItem = ({
  item,
  onAddToCart,
  onRemove,
}: {
  item: WishlistItemType;
  onAddToCart: (item: WishlistItemType) => void;
  onRemove: (id: number, name: string) => void;
}) => {
  const [isPresent, safeToRemove] = usePresence();
  const isInStock = item.stock > 0;
  
  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{
        opacity: 0,
        x: 50,
        transition: commonTransitions.item,
      }}
      onAnimationComplete={() => !isPresent && safeToRemove?.()}
      className="py-4 group relative"
    >
      <div className="flex gap-4 items-center">
        <div className="relative flex-shrink-0">
          <Image
            src={item.image}
            alt={item.name}
            width={96}
            height={96}
            className={`w-24 h-24 object-cover rounded-xl border border-gray-200 ${!isInStock ? 'opacity-70 grayscale' : ''}`}
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YxZjFmMSIvPjwvc3ZnPg=="
            loading="lazy"
          />
          
          {/* عرض شارة الخصم إذا كان هناك خصم */}
          {item.discount && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {item.discount}%
            </div>
          )}
          
          {/* عرض حالة المخزون */}
          {!isInStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl">
              <span className="text-white text-xs font-bold px-2 py-1 bg-red-500 rounded">
                نفذت الكمية
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-gray-900 truncate">{item.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-primary-600 font-semibold">{item.price} ج.م</p>
            {/* عرض السعر قبل الخصم إذا كان هناك خصم */}
            {item.discount && (
              <p className="text-gray-400 text-sm line-through">
                {Math.round(item.price / (1 - item.discount / 100))} ج.م
              </p>
            )}
          </div>
          
          {/* عرض حالة المخزون */}
          <div className="mt-1 flex items-center gap-1">
            <span className={`inline-block w-2 h-2 rounded-full ${isInStock ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className={`text-sm ${isInStock ? 'text-green-600' : 'text-red-600'}`}>
              {isInStock ? `متوفر ` : 'غير متوفر'}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => onAddToCart(item)}
            className={`p-2 rounded-lg transition-colors relative group/tooltip 
              ${isInStock 
                ? 'hover:bg-green-50 text-green-600' 
                : 'text-gray-400 cursor-not-allowed bg-gray-50'
              }`}
            aria-label="إضافة إلى السلة"
            disabled={!isInStock}
            data-testid={`add-to-cart-${item.id}`}
          >
            <FiShoppingCart className="w-5 h-5" />
            <span className="tooltip">
              {isInStock ? 'إضافة إلى السلة' : 'غير متوفر'}
            </span>
          </button>

          <button
            onClick={() => onRemove(item.id, item.name)}
            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors relative group/tooltip"
            aria-label="حذف من القائمة"
            data-testid={`remove-from-wishlist-${item.id}`}
          >
            <FiTrash className="w-5 h-5" />
            <span className="tooltip">حذف من القائمة</span>
          </button>
        </div>
      </div>
    </motion.li>
  );
};

// مكون حالة الفراغ
const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="h-full flex flex-col items-center justify-center text-center py-16"
    data-testid="empty-wishlist"
  >
    <div className="mb-6 text-gray-200 bg-gray-50 p-6 rounded-full">
      <FiHeart className="w-16 h-16" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-3">قائمة الرغبات فارغة</h3>
    <p className="text-gray-500 max-w-xs leading-relaxed">
      قم بإضافة منتجاتك المفضلة للاحتفاظ بها في قائمة الرغبات الخاصة بك
    </p>
    <button
      className="mt-6 bg-primary-50 text-primary-700 flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
    >
      <FiArrowLeft className="w-4 h-4" />
      <span>استعرض المنتجات</span>
    </button>
  </motion.div>
);

// مكون الفوتر
const Footer = ({ onClose, itemCount }: { onClose: () => void; itemCount: number }) => (
  <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
    <div className="flex items-center justify-between mb-4">
      <span className="text-gray-600 font-medium">إجمالي العناصر</span>
      <span className="font-semibold text-primary-600 text-lg">{itemCount}</span>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <button
        onClick={onClose}
        className="bg-gray-50 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
        data-testid="continue-shopping-button"
      >
        متابعة التسوق
      </button>
      <button
        onClick={onClose}
        className="bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-70 disabled:hover:bg-primary-600"
        disabled={itemCount === 0}
        data-testid="go-to-cart-button"
      >
        الذهاب إلى السلة
      </button>
    </div>
  </div>
);

export default WishlistDrawer;

/* تعريف أنماط إضافية للتوليتيب */
