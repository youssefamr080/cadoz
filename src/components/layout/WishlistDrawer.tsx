"use client";

import React, { useEffect, useCallback } from "react";
import Image from "next/image";
import { FiTrash, FiX, FiShoppingCart, FiHeart } from "react-icons/fi";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import { motion, AnimatePresence, usePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { useOnClickOutside } from "usehooks-ts";

const WishlistDrawer = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const drawerRef = React.useRef<HTMLDivElement>(null);
  
  // Custom hook for click outside handling
  useOnClickOutside(drawerRef, onClose);
  
  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen]);
  

  const handleAddToCart = useCallback((item: { id: number; name: string; price: number; image: string }) => {
      addToCart({ ...item, quantity: 1 });
      toast.success("تمت الإضافة إلى السلة بنجاح!", {
        position: "bottom-right",
        icon: "🛒",
        style: {
          direction: "rtl",
        },
      });
    }, [addToCart]);
  
    const handleRemoveFromWishlist = useCallback((id: number) => {
      removeFromWishlist(id);
      toast(() => (
        <div className="flex items-center gap-2">
          <FiTrash className="text-red-500" />
          <span>تم الحذف من القائمة</span>
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-md z-40"
            role="dialog"
            aria-modal="true"
          />

          <motion.div
            ref={drawerRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 w-full max-w-md h-screen bg-white shadow-2xl z-50 flex flex-col"
            role="dialog"
            aria-labelledby="wishlist-heading"
          >
            <Header onClose={onClose} />
            
            <main className="flex-1 overflow-y-auto px-4 sm:px-6">
              {wishlist.length > 0 ? (
                <motion.ul
                  initial="hidden"
                  animate="visible"
                  variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                  className="divide-y divide-gray-100"
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

            <Footer onClose={onClose} itemCount={wishlist.length} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Sub-components for better readability

const Header = ({ onClose }: { onClose: () => void }) => (
  <div className="sticky top-0 bg-white z-10 border-b border-gray-100 shadow-sm">
    <div className="flex items-center justify-between p-6">
      <h2 id="wishlist-heading" className="text-2xl font-bold text-gray-900">
        قائمة الرغبات ❤️
      </h2>
      <button
        onClick={onClose}
        className="p-2 hover:bg-gray-50 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-label="إغلاق القائمة"
      >
        <FiX className="w-6 h-6 text-gray-600" />
      </button>
    </div>
  </div>
);

const WishlistItem = ({
  item,
  onAddToCart,
  onRemove,
}: {
  item: { id: number; name: string; price: number; image: string };
  onAddToCart: (item: { id: number; name: string; price: number; image: string }) => void;
  onRemove: (id: number) => void;
}) => {
  const [isPresent, safeToRemove] = usePresence();

  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{
        opacity: 0,
        x: 50,
        transition: { duration: 0.2 },
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
            className="w-24 h-24 object-cover rounded-xl border border-gray-200"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,...[your base64 encoded placeholder]"
            loading="lazy"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-gray-900 truncate">{item.name}</h3>
          <p className="text-primary-600 font-semibold mt-1">{item.price} ج.م</p>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => onAddToCart(item)}
            className="p-2 hover:bg-gray-50 rounded-lg transition-colors relative group/tooltip"
            aria-label="إضافة إلى السلة"
          >
            <FiShoppingCart className="w-5 h-5 text-green-600" />
            <span className="tooltip">إضافة إلى السلة</span>
          </button>

          <button
            onClick={() => onRemove(item.id)}
            className="p-2 hover:bg-gray-50 rounded-lg transition-colors relative group/tooltip"
            aria-label="حذف من القائمة"
          >
            <FiTrash className="w-5 h-5 text-red-600" />
            <span className="tooltip">حذف من القائمة</span>
          </button>
        </div>
      </div>
    </motion.li>
  );
};

const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="h-full flex flex-col items-center justify-center text-center py-16"
  >
    <div className="mb-4 text-gray-200">
      <FiHeart className="w-24 h-24" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">القائمة فارغة</h3>
    <p className="text-gray-500 max-w-xs">
      ابدأ بإضافة منتجاتك المفضلة لتظهر هنا
    </p>
  </motion.div>
);

const Footer = ({ onClose, itemCount }: { onClose: () => void; itemCount: number }) => (
  <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6">
    <div className="flex items-center justify-between mb-4">
      <span className="text-gray-600">عدد العناصر</span>
      <span className="font-semibold text-primary-600">{itemCount}</span>
    </div>
    <button
      onClick={onClose}
      className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
    >
      متابعة التسوق →
    </button>
  </div>
);

export default WishlistDrawer;