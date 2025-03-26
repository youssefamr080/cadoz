"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import { FiTrash, FiX, FiShoppingCart, FiHeart } from "react-icons/fi"
import { useWishlist } from "../../context/WishlistContext"
import { useCart } from "../../context/CartContext"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-hot-toast"

const WishlistDrawer = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { wishlist, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()
  const drawerRef = useRef<HTMLDivElement>(null)
  const [mountedState, setMountedState] = useState(isOpen)

  // Sync mounted state with isOpen prop
  useEffect(() => {
    if (isOpen) {
      setMountedState(true)
    }
  }, [isOpen])

  // Safely manage body overflow and touch events
  useEffect(() => {
    if (!isOpen) return

    // Store original body styles
    const originalOverflow = window.getComputedStyle(document.body).overflow
    const originalPosition = window.getComputedStyle(document.body).position
    const originalWidth = window.getComputedStyle(document.body).width
    const originalTop = window.getComputedStyle(document.body).top
    const originalTouchAction = window.getComputedStyle(document.body).touchAction

    const scrollY = window.scrollY

    // Prevent body scroll while maintaining touch functionality
    document.body.style.overflow = "hidden"
    document.body.style.position = "fixed"
    document.body.style.width = "100%"
    document.body.style.top = `-${scrollY}px`
    document.body.style.touchAction = "pan-y"
    document.body.setAttribute("data-scroll-position", scrollY.toString())

    return () => {
      // Restore all original styles
      document.body.style.overflow = originalOverflow
      document.body.style.position = originalPosition
      document.body.style.width = originalWidth
      document.body.style.top = originalTop
      document.body.style.touchAction = originalTouchAction

      // Restore scroll position
      const savedScrollY = Number.parseInt(document.body.getAttribute("data-scroll-position") || "0")
      window.scrollTo(0, savedScrollY)
      document.body.removeAttribute("data-scroll-position")

      // Force a small delay to ensure all touch events are properly reset
      setTimeout(() => {
        document.body.style.touchAction = originalTouchAction
      }, 100)
    }
  }, [isOpen])

  // Safe close method
  const handleClose = useCallback(() => {
    setMountedState(false)

    // Delay actual close to match animation
    setTimeout(() => {
      onClose()
    }, 300)
  }, [onClose])

  // Improved click/touch outside handling
  useEffect(() => {
    if (!isOpen || !drawerRef.current) return

    const drawer = drawerRef.current

    const handleOutsideClick = (e: MouseEvent) => {
      if (drawer && !drawer.contains(e.target as Node)) {
        handleClose()
      }
    }

    // Only use mousedown for outside clicks
    document.addEventListener("mousedown", handleOutsideClick)

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
    }
  }, [isOpen, handleClose])

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, handleClose])

  // Simplified handlers without event parameters
  const handleAddToCart = useCallback(
    (item: { id: number; name: string; price: number; image: string }) => {
      addToCart({ ...item, quantity: 1 })
      toast.success("تمت الإضافة إلى السلة بنجاح!", {
        position: "bottom-right",
        icon: "🛒",
        style: {
          direction: "rtl",
        },
      })
    },
    [addToCart],
  )

  const handleRemoveFromWishlist = useCallback(
    (id: number) => {
      removeFromWishlist(id)
      toast(
        () => (
          <div className="flex items-center gap-2">
            <FiTrash className="text-red-500" />
            <span>تم الحذف من القائمة</span>
          </div>
        ),
        {
          position: "bottom-right",
          style: {
            direction: "rtl",
          },
        },
      )
    },
    [removeFromWishlist],
  )

  return (
    <AnimatePresence
      mode="wait"
      onExitComplete={() => {
        if (!isOpen) {
          setMountedState(false)
        }
      }}
    >
      {mountedState && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-md z-40"
            role="dialog"
            aria-modal="true"
            onClick={handleClose}
            key="wishlist-overlay"
          />

          <motion.div
            ref={drawerRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.3,
            }}
            className="fixed top-0 right-0 w-full max-w-md h-screen bg-white shadow-2xl z-50 flex flex-col"
            role="dialog"
            aria-labelledby="wishlist-heading"
            onClick={(e) => e.stopPropagation()}
            key="wishlist-drawer"
          >
            <Header onClose={handleClose} />

            <main className="flex-1 overflow-y-auto px-4 sm:px-6 overscroll-contain">
              {wishlist.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {wishlist.map((item) => (
                    <WishlistItem
                      key={item.id}
                      item={item}
                      onAddToCart={handleAddToCart}
                      onRemove={handleRemoveFromWishlist}
                    />
                  ))}
                </ul>
              ) : (
                <EmptyState />
              )}
            </main>

            <Footer onClose={handleClose} itemCount={wishlist.length} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Sub-components with simplified event handling
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
)

// Simplified WishlistItem without usePresence and with simpler animation
const WishlistItem = ({
  item,
  onAddToCart,
  onRemove,
}: {
  item: { id: number; name: string; price: number; image: string }
  onAddToCart: (item: { id: number; name: string; price: number; image: string }) => void
  onRemove: (id: number) => void
}) => {
  return (
    <motion.li initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-4 group relative">
      <div className="flex gap-4 items-center">
        <div className="relative flex-shrink-0">
          <Image
            src={item.image || "/placeholder.svg"}
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
  )
}

const EmptyState = () => (
  <div className="h-full flex flex-col items-center justify-center text-center py-16">
    <div className="mb-4 text-gray-200">
      <FiHeart className="w-24 h-24" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">القائمة فارغة</h3>
    <p className="text-gray-500 max-w-xs">ابدأ بإضافة منتجاتك المفضلة لتظهر هنا</p>
  </div>
)

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
)

export default WishlistDrawer

