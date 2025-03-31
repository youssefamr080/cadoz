"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { ShoppingBag, Heart, Search, User, Home, Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useCart } from "../../context/CartContext"
import { useWishlist } from "../../context/WishlistContext"
import { useAuth } from "../../context/AuthContext"
import SearchBar from "../search/SearchBar"
import UserAvatar from "../user/UserAvatar"
import { Button } from "../../components/ui/button"
import LoginModal from "../auth/login-modal"
import { toast } from "react-toastify"
import { usePathname } from "next/navigation"
import { cn } from "../../lib/utils"
import WishlistDrawer from "./WishlistDrawer"

const Header = () => {
  const { cart } = useCart()
  const { wishlist } = useWishlist()
  const { user, logout, isLoading } = useAuth()
  const [isWishlistOpen, setIsWishlistOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  // تأثير التمرير
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // إغلاق القائمة عند تغيير المسار
  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsSearchOpen(false)
  }, [pathname])

  const handleLogout = () => {
    logout()
    toast.info("✓")
  }

  const handleLoginSuccess = (userData) => {
    setIsLoginModalOpen(false)
    toast.success("✓")
  }

  // تأثيرات الحركة
  const mobileMenuVariants = {
    closed: {
      x: "100%",
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
      },
    },
    open: {
      x: "0%",
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const menuItemVariants = {
    closed: { x: 20, opacity: 0 },
    open: { x: 0, opacity: 1 },
  }

  const badgeVariants = {
    initial: { scale: 0 },
    animate: {
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 25,
      },
    },
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-white shadow-sm",
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20 md:h-24">
          {/* الشعار */}
          <div className="flex items-center">
            <Link
              href="/"
              className="relative transition-transform duration-300 hover:scale-105 mr-2 md:mr-6"
              aria-label="الصفحة الرئيسية"
            >
              <Image
                src="/logo.png"
                alt="Cadoz Logo"
                width={140}
                height={50}
                priority
                className="h-12 w-auto object-contain"
              />
            </Link>
          </div>

          {/* البحث - للشاشات الكبيرة */}
          <div className="hidden md:block flex-1 max-w-md mx-6">
            <SearchBar />
          </div>

          {/* الأيقونات */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* زر الصفحة الرئيسية */}
            <Link
              href="/"
              className={cn(
                "relative p-3 rounded-full transition-colors",
                pathname === "/" ? "bg-blue-100 text-blue-700" : "bg-gray-100 hover:bg-gray-200 text-gray-700",
              )}
              aria-label="الصفحة الرئيسية"
            >
              <Home className="h-6 w-6" />
            </Link>

            {/* زر المفضلة */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="relative p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="المفضلة"
            >
              <Heart className="h-6 w-6 text-red-500" />
              {wishlist.length > 0 && (
                <motion.span
                  variants={badgeVariants}
                  initial="initial"
                  animate="animate"
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold"
                >
                  {wishlist.length}
                </motion.span>
              )}
            </button>

            {/* زر سلة التسوق */}
            <Link
              href="/cart"
              className={cn(
                "relative p-3 rounded-full transition-colors",
                pathname === "/cart" ? "bg-amber-100 text-amber-700" : "bg-gray-100 hover:bg-gray-200 text-gray-700",
              )}
              aria-label="سلة التسوق"
            >
              <ShoppingBag className="h-6 w-6" />
              {cart.length > 0 && (
                <motion.span
                  variants={badgeVariants}
                  initial="initial"
                  animate="animate"
                  className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold"
                >
                  {cart.length}
                </motion.span>
              )}
            </Link>

            {/* زر المستخدم */}
            {!isLoading &&
              (user ? (
                <Link
                  href="/profile"
                  className={cn(
                    "relative p-1.5 rounded-full transition-colors",
                    pathname.includes("/profile") ? "bg-purple-100" : "bg-gray-100 hover:bg-gray-200",
                  )}
                >
                  <UserAvatar user={user} size="md" />
                </Link>
              ) : (
                <Button
                  onClick={() => setIsLoginModalOpen(true)}
                  variant="outline"
                  size="icon"
                  className="rounded-full h-12 w-12 border-gray-200 hover:bg-gray-100"
                >
                  <User className="h-6 w-6 text-purple-700" />
                </Button>
              ))}

            {/* زر البحث - للشاشات الصغيرة */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden relative p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="البحث"
            >
              <Search className="h-6 w-6 text-gray-700" />
            </button>

            {/* زر القائمة - للشاشات الصغيرة */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden relative p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label={isMobileMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6 text-gray-700" /> : <Menu className="h-6 w-6 text-gray-700" />}
            </button>
          </div>
        </div>

        {/* شريط البحث للشاشات الصغيرة */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden py-4 overflow-hidden"
            >
              <SearchBar />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* القائمة الجانبية للشاشات الصغيرة */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            <motion.div
              ref={mobileMenuRef}
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed top-0 right-0 bottom-0 w-4/5 max-w-sm bg-white shadow-xl z-50 overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-100">
                {user ? (
                  <div className="flex items-center">
                    <UserAvatar user={user} size="lg" />
                    <div className="mr-4">
                      <h3 className="font-bold text-lg">{user.name}</h3>
                      <p className="text-gray-500 text-sm">{user.phone}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <Button
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        setIsLoginModalOpen(true)
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white w-full mb-2"
                    >
                      <User className="h-5 w-5 ml-2" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-100">
                <div className="space-y-1">
                  <motion.div variants={menuItemVariants}>
                    <Link
                      href="/cart"
                      className="flex items-center py-3 px-4 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <ShoppingBag className="h-5 w-5 ml-3 text-amber-500" />
                      {cart.length > 0 && (
                        <span className="mr-auto bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
                          {cart.length}
                        </span>
                      )}
                    </Link>
                  </motion.div>

                  <motion.div variants={menuItemVariants}>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        setIsWishlistOpen(true)
                      }}
                      className="flex items-center py-3 px-4 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors w-full text-right"
                    >
                      <Heart className="h-5 w-5 ml-3 text-red-500" />
                      {wishlist.length > 0 && (
                        <span className="mr-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          {wishlist.length}
                        </span>
                      )}
                    </button>
                  </motion.div>

                  {user && (
                    <>
                      <motion.div variants={menuItemVariants}>
                        <Link
                          href="/profile"
                          className="flex items-center py-3 px-4 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <User className="h-5 w-5 ml-3 text-purple-500" />
                        </Link>
                      </motion.div>

                      <motion.div variants={menuItemVariants}>
                        <Link
                          href="/profile/orders"
                          className="flex items-center py-3 px-4 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <svg
                            className="h-5 w-5 ml-3 text-blue-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                            />
                          </svg>
                        </Link>
                      </motion.div>

                      <motion.div variants={menuItemVariants}>
                        <button
                          onClick={() => {
                            handleLogout()
                            setIsMobileMenuOpen(false)
                          }}
                          className="flex items-center py-3 px-4 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full text-right"
                        >
                          <svg className="h-5 w-5 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                        </button>
                      </motion.div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* مكونات الطبقة العليا */}
      <WishlistDrawer isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onSuccess={handleLoginSuccess} />
    </header>
  )
}

export default Header

