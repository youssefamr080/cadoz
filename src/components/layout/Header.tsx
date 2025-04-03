"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Heart,
  Search,
  User,
  Home,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Package,
  Settings,
  Bell,
  Gift,
  HelpCircle,
  Headphones,
  ShoppingCart,
} from "lucide-react"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"

// Main navigation categories with icon support
const categories = [
  { name: "الرئيسية", link: "/", icon: <Home className="w-4 h-4" /> },
  { name: "رجالي", link: "/category/men", icon: <User className="w-4 h-4" /> },
  { name: "نسائي", link: "/category/women", icon: <User className="w-4 h-4" /> },
  { name: "أطفال", link: "/category/kids", icon: <User className="w-4 h-4" /> },
  { name: "هدايا", link: "/gift", icon: <Gift className="w-4 h-4" /> },
  { name: "عروض", link: "/category/sale", icon: <Bell className="w-4 h-4" /> },
]

// Secondary links for mega menu
const secondaryLinks = [
  { name: "تواصل معنا", link: "/contact", icon: <Headphones className="w-4 h-4" /> },
  { name: "عن كادوز", link: "/about", icon: <HelpCircle className="w-4 h-4" /> },
]

const Header = () => {
  const { cart } = useCart()
  const { wishlist } = useWishlist()
  const { user, logout, isLoading } = useAuth()
  const [isWishlistOpen, setIsWishlistOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const pathname = usePathname()
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)

  // Handle scroll effect
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

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsSearchOpen(false)
  }, [pathname])

  const handleLogout = () => {
    logout()
    toast.info("تم تسجيل الخروج بنجاح")
  }

  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false)
    toast.success("تم تسجيل الدخول بنجاح")
  }

  // Animation variants
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

  const megaMenuVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.1,
      },
    },
  }

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0)

  return (
    <header
      ref={headerRef}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 rtl",
        scrolled ? "bg-white/95 backdrop-blur-md shadow-md transform-gpu" : "bg-white shadow-sm",
      )}
      style={{
        backdropFilter: scrolled ? "blur(10px)" : "none",
      }}
    >
      {/* Announcement bar with enhanced gradient and animation */}
      <div className="relative bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white py-2 text-center text-sm overflow-hidden">
        <div className="container mx-auto px-4 flex items-center justify-center">
          <motion.div initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
            توصيل مجاني للطلبات فوق 500 جنيه
          </motion.div>
          <div className="mx-3 h-4 w-px bg-purple-300/40"></div>
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            خصم 15% على أول طلب - استخدم كود:{" "}
            <span className="font-bold bg-white/20 px-2 py-0.5 rounded-sm mx-1">WELCOME15</span>
          </motion.div>
        </div>

        {/* Animated glow effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          initial={{ x: -200 }}
          animate={{ x: 1000 }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: 3,
            ease: "linear",
            repeatDelay: 1,
          }}
        />
      </div>

      <div className="container mx-auto px-4">
        {/* Unified header for large screens */}
        <div className="hidden md:flex items-center justify-between h-16">
          <div className="flex items-center">
            {/* Logo with hover effect */}
            <Link
              href="/"
              className="relative transition-all duration-300 hover:scale-105 mr-6 group"
              aria-label="الصفحة الرئيسية"
            >
              <Image
                src="/logo.png"
                alt="Cadoz Logo"
                width={120}
                height={40}
                priority
                className="h-9 w-auto object-contain transition-transform"
              />
              <motion.div
                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"
                initial={{ width: 0, x: "50%" }}
                whileHover={{ width: "100%", x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </Link>

            {/* Main navigation - enhanced with hover effects */}
            <nav className="flex items-center space-x-1 space-x-reverse">
              {categories.map((category) => (
                <div
                  key={category.name}
                  className="relative"
                  onMouseEnter={() => setHoveredCategory(category.name)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <Link
                    href={category.link}
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5",
                      pathname === category.link
                        ? "bg-purple-50 text-purple-700 shadow-sm"
                        : "text-gray-700 hover:bg-gray-50",
                    )}
                  >
                    <span className={pathname === category.link ? "text-purple-600" : "text-gray-500"}>
                      {category.icon}
                    </span>
                    <span>{category.name}</span>
                    {/* Conditional animation for the current page indicator */}
                    {pathname === category.link && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </Link>

                  {/* Mega menu for categories */}
                  {category.name !== "الرئيسية" && category.name !== "عروض" && (
                    <AnimatePresence>
                      {hoveredCategory === category.name && (
                        <motion.div
                          variants={megaMenuVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50"
                        >
                          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-4 py-3 border-b border-gray-100">
                            <h3 className="font-medium text-purple-800 flex items-center gap-2">
                              {category.icon}
                              <span>قسم {category.name}</span>
                            </h3>
                          </div>
                          <div className="p-2">
                            {[1, 2, 3, 4].map((i) => (
                              <Link
                                key={i}
                                href={`${category.link}/subcategory-${i}`}
                                className="flex items-center gap-2 p-2 hover:bg-purple-50 rounded-md text-gray-700 transition-colors"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                                <span>فئة فرعية {i}</span>
                              </Link>
                            ))}
                            <div className="mt-2 pt-2 border-t border-gray-100">
                              <Link
                                href={category.link}
                                className="flex items-center justify-between w-full p-2 bg-purple-50 hover:bg-purple-100 rounded-md text-purple-700 transition-colors"
                              >
                                <span className="font-medium">عرض جميع {category.name}</span>
                                <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                              </Link>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Search bar */}
            <div className="w-64 lg:w-80">
              <SearchBar />
            </div>

            {/* User icons - enhanced with better animations */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsWishlistOpen(true)}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors group"
                aria-label="المفضلة"
              >
                <Heart className="h-5 w-5 text-gray-700 group-hover:text-red-500 transition-colors" />
                {wishlist.length > 0 && (
                  <motion.span
                    variants={badgeVariants}
                    initial="initial"
                    animate="animate"
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold"
                  >
                    {wishlist.length}
                  </motion.span>
                )}
              </motion.button>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative">
                <Link
                  href="/cart"
                  className="relative p-2 rounded-full hover:bg-gray-100 transition-colors group flex items-center justify-center"
                  aria-label="سلة التسوق"
                >
                  <ShoppingCart className="h-5 w-5 text-gray-700 group-hover:text-amber-500 transition-colors" />
                  {cartItemCount > 0 && (
                    <motion.span
                      variants={badgeVariants}
                      initial="initial"
                      animate="animate"
                      className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold"
                    >
                      {cartItemCount}
                    </motion.span>
                  )}
                </Link>

                {/* Quick cart preview on hover - can be implemented later */}
              </motion.div>

              {!isLoading &&
                (user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 py-1.5 px-3 rounded-full hover:bg-gray-100 transition-all group border border-transparent hover:border-gray-200"
                      >
                        <UserAvatar user={user} size="sm" />
                        <div className="text-right">
                          <p className="text-xs font-medium text-gray-900 line-clamp-1 max-w-[80px]">{user.name}</p>
                          <p className="text-[10px] text-gray-500 hidden lg:block">حسابي</p>
                        </div>
                        <ChevronDown className="h-3 w-3 text-gray-500 group-hover:rotate-180 transition-transform duration-300" />
                      </motion.button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 p-2">
                      <div className="p-3 mb-2 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-md">
                        <DropdownMenuLabel className="px-0 pt-0 pb-1">{user.name}</DropdownMenuLabel>
                        <p className="text-xs text-gray-600 truncate">{user.phone}</p>
                      </div>

                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link
                          href="/profile"
                          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-purple-50 transition-colors"
                        >
                          <User className="mr-2 h-4 w-4 text-purple-500" />
                          <span>الملف الشخصي</span>
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link
                          href="/profile/orders"
                          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-blue-50 transition-colors"
                        >
                          <Package className="mr-2 h-4 w-4 text-blue-500" />
                          <span>طلباتي</span>
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link
                          href="/profile/settings"
                          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-amber-50 transition-colors"
                        >
                          <Settings className="mr-2 h-4 w-4 text-amber-500" />
                          <span>الإعدادات</span>
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator className="my-2" />

                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-md text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>تسجيل الخروج</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => setIsLoginModalOpen(true)}
                      variant="default"
                      size="sm"
                      className="rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-md hover:shadow-purple-200 transition-all duration-300 font-medium"
                    >
                      <User className="h-3.5 w-3.5 mr-1.5" />
                      <span>تسجيل الدخول</span>
                    </Button>
                  </motion.div>
                ))}
            </div>
          </div>
        </div>

        {/* Mobile header - completely redesigned for better UX */}
        <div className="md:hidden">
          {/* Top section with logo and key actions */}
          <div className="flex items-center justify-between h-16">
            {/* Logo and menu toggle */}
            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label={isMobileMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
              >
                <Menu className="h-5 w-5 text-gray-700" />
              </motion.button>

              <Link href="/" className="relative" aria-label="الصفحة الرئيسية">
                <Image
                  src="/logo.png"
                  alt="Cadoz Logo"
                  width={100}
                  height={32}
                  priority
                  className="h-8 w-auto object-contain"
                />
              </Link>
            </div>

            {/* Primary user actions */}
            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={cn(
                  "p-2 rounded-full transition-colors",
                  isSearchOpen ? "bg-purple-100 text-purple-700" : "hover:bg-gray-100 text-gray-700",
                )}
                aria-label="بحث"
              >
                <Search className="h-5 w-5" />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsWishlistOpen(true)}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="المفضلة"
              >
                <Heart className="h-5 w-5 text-gray-700" />
                {wishlist.length > 0 && (
                  <motion.span
                    variants={badgeVariants}
                    initial="initial"
                    animate="animate"
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold"
                  >
                    {wishlist.length}
                  </motion.span>
                )}
              </motion.button>

              <Link
                href="/cart"
                className={cn(
                  "relative p-2 rounded-full transition-colors",
                  pathname === "/cart" ? "bg-amber-100 text-amber-700" : "hover:bg-gray-100 text-gray-700",
                )}
                aria-label="سلة التسوق"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <motion.span
                    variants={badgeVariants}
                    initial="initial"
                    animate="animate"
                    className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold"
                  >
                    {cartItemCount}
                  </motion.span>
                )}
              </Link>

              {!isLoading &&
                (user ? (
                  <Link
                    href="/profile"
                    className={cn(
                      "relative p-1.5 rounded-full transition-colors",
                      pathname.includes("/profile") ? "bg-purple-100" : "hover:bg-gray-100",
                    )}
                  >
                    <UserAvatar user={user} size="sm" />
                  </Link>
                ) : (
                  <Button
                    onClick={() => setIsLoginModalOpen(true)}
                    variant="outline"
                    size="icon"
                    className="rounded-full h-9 w-9 border-gray-200 hover:bg-gray-100"
                  >
                    <User className="h-5 w-5 text-purple-700" />
                  </Button>
                ))}
            </div>
          </div>

          {/* Search bar container */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden border-t border-gray-100 py-3"
              >
                <SearchBar showTrendingProducts={false} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile side menu - enhanced with animations */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            <motion.div
              ref={mobileMenuRef}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-4/5 max-w-xs bg-white shadow-xl z-50 overflow-y-auto"
            >
              {/* Header */}
              <div className="p-4 flex justify-between items-center border-b bg-gradient-to-r from-purple-50 to-indigo-50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <Menu className="h-5 w-5 text-purple-700" />
                  </div>
                  <h2 className="text-lg font-bold text-purple-900">القائمة الرئيسية</h2>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-white/50 transition-colors"
                  aria-label="إغلاق القائمة"
                >
                  <X className="h-5 w-5 text-gray-700" />
                </button>
              </div>

              {/* User information */}
              <div className="p-4 border-b bg-gradient-to-br from-white to-purple-50">
                {user ? (
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <UserAvatar user={user} />
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{user.name}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        متصل الآن
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 mb-2">قم بتسجيل الدخول للاستفادة من جميع المميزات</p>
                    <Button
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        setIsLoginModalOpen(true)
                      }}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    >
                      <User className="h-4 w-4 mr-2" />
                      تسجيل الدخول
                    </Button>
                  </div>
                )}
              </div>

              {/* Main menu links */}
              <div className="p-2">
                <div className="mb-2 px-2 py-1 text-xs font-medium text-gray-500">الأقسام الرئيسية</div>
                <ul className="space-y-1">
                  {categories.map((category) => (
                    <motion.li key={category.name} whileTap={{ scale: 0.98 }}>
                      <Link
                        href={category.link}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                          pathname === category.link
                            ? "bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 font-medium shadow-sm"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            pathname === category.link ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {category.icon}
                        </div>
                        <span>{category.name}</span>
                        {pathname === category.link && (
                          <div className="mr-auto">
                            <div className="w-1.5 h-6 bg-purple-600 rounded-full"></div>
                          </div>
                        )}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Secondary links */}
              <div className="p-2 mt-2">
                <div className="mb-2 px-2 py-1 text-xs font-medium text-gray-500">روابط سريعة</div>
                <ul className="space-y-1">
                  {secondaryLinks.map((link) => (
                    <motion.li key={link.name} whileTap={{ scale: 0.98 }}>
                      <Link
                        href={link.link}
                        className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                          {link.icon}
                        </div>
                        <span>{link.name}</span>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* User account links for logged in users */}
              {user && (
                <div className="p-4 border-t mt-4">
                  <div className="space-y-3">
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 hover:shadow-sm transition-all"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <span>الملف الشخصي</span>
                    </Link>

                    <Link
                      href="/profile/orders"
                      className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 hover:shadow-sm transition-all"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <Package className="h-4 w-4 text-green-600" />
                      </div>
                      <span>طلباتي</span>
                    </Link>

                    <Link
                      href="/profile/settings"
                      className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 hover:shadow-sm transition-all"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                        <Settings className="h-4 w-4 text-amber-600" />
                      </div>
                      <span>الإعدادات</span>
                    </Link>

                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-red-50 to-rose-50 text-red-700 hover:shadow-sm transition-all"
                    >
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                        <LogOut className="h-4 w-4 text-red-600" />
                      </div>
                      <span>تسجيل الخروج</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="p-4 mt-6 border-t text-center">
                <div className="flex justify-center gap-4 mb-2">
                  {["facebook", "instagram", "twitter"].map((platform) => (
                    <a
                      key={platform}
                      href={`#${platform}`}
                      className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-purple-100 hover:text-purple-600 transition-colors"
                    >
                      <span className="sr-only">{platform}</span>
                      <div className="w-4 h-4" />
                    </a>
                  ))}
                </div>
                <p className="text-xs text-gray-500">© {new Date().getFullYear()} كادوز. جميع الحقوق محفوظة</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Overlay components */}
      <WishlistDrawer isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onSuccess={handleLoginSuccess} />
    </header>
  )
}

export default Header

