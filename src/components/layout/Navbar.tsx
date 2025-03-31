"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Home, ShoppingBag, Heart, Gift, Phone, Info, ChevronRight } from 'lucide-react'
import { useAuth } from "../../context/AuthContext"
import { useCart } from "../../context/CartContext"
import { useWishlist } from "../../context/WishlistContext"
import UserAvatar from "../user/UserAvatar"
import { Button } from "../../components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

// تعريف أنواع البيانات
type MenuItem = {
  name: string
  link: string
  icon: React.ReactNode
}

// قائمة العناصر الرئيسية
const menuItems: MenuItem[] = [
  { name: "الرئيسية", link: "/", icon: <Home className="w-5 h-5" /> },
  { name: "منتجات رجالية", link: "/category/men", icon: <ShoppingBag className="w-5 h-5" /> },
  { name: "منتجات نسائية", link: "/category/women", icon: <ShoppingBag className="w-5 h-5" /> },
  { name: "منتجات أطفال", link: "/category/kids", icon: <ShoppingBag className="w-5 h-5" /> },
  { name: "هدايا مميزة", link: "/gift", icon: <Gift className="w-5 h-5" /> },
  { name: "من نحن", link: "/about", icon: <Info className="w-5 h-5" /> },
  { name: "اتصل بنا", link: "/contact", icon: <Phone className="w-5 h-5" /> },
]

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { cart } = useCart()
  const { wishlist } = useWishlist()

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsSidebarOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // إغلاق القائمة عند تغيير المسار
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [pathname])

  // تأثير عند فتح القائمة الجانبية
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isSidebarOpen])

  return (
    <nav className="relative font-sans" dir="rtl">
      {/* زر القائمة */}
      <button
        className="flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
        onClick={() => setIsSidebarOpen(true)}
        aria-label="فتح القائمة"
      >
        <Menu className="h-6 w-6 text-gray-700" />
      </button>

      {/* القائمة الجانبية */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* طبقة التعتيم */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setIsSidebarOpen(false)}
            />

            {/* القائمة الجانبية */}
            <motion.div
              ref={sidebarRef}
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 overflow-y-auto"
            >
              <div className="p-4 flex justify-between items-center border-b">
                <h2 className="text-xl font-bold text-gray-800">القائمة الرئيسية</h2>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="إغلاق القائمة"
                >
                  <X className="h-6 w-6 text-gray-700" />
                </button>
              </div>

              {/* معلومات المستخدم */}
              <div className="p-4 border-b bg-gray-50">
                {user ? (
                  <div className="flex items-center gap-3">
                    <UserAvatar user={user} />
                    <div>
                      <p className="font-medium text-gray-800">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.phone}</p>
                    </div>
                  </div>
                ) : (
                  <Link href="/login">
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                      تسجيل الدخول
                    </Button>
                  </Link>
                )}
              </div>

              {/* روابط القائمة */}
              <div className="p-2">
                <ul className="space-y-1">
                  {menuItems.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.link}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                          pathname === item.link
                            ? "bg-purple-50 text-purple-700 font-medium"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span className={pathname === item.link ? "text-purple-600" : "text-gray-500"}>
                          {item.icon}
                        </span>
                        <span>{item.name}</span>
                        {pathname === item.link && (
                          <div className="mr-auto">
                            <div className="w-1.5 h-6 bg-purple-600 rounded-full"></div>
                          </div>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* روابط إضافية */}
              <div className="p-4 border-t mt-4">
                <div className="space-y-3">
                  <Link
                    href="/cart"
                    className="flex items-center justify-between p-3 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="w-5 h-5" />
                      <span>سلة التسوق</span>
                    </div>
                    {cart.length > 0 && (
                      <span className="bg-amber-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                        {cart.length}
                      </span>
                    )}
                  </Link>

                  <Link
                    href="/wishlist"
                    className="flex items-center justify-between p-3 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Heart className="w-5 h-5" />
                      <span>المفضلة</span>
                    </div>
                    {wishlist.length > 0 && (
                      <span className="bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                        {wishlist.length}
                      </span>
                    )}
                  </Link>

                  {user && (
                    <>
                      <Link
                        href="/profile"
                        className="flex items-center justify-between p-3 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <UserAvatar user={user} size="sm" />
                          <span>الملف الشخصي</span>
                        </div>
                        <ChevronRight className="w-5 h-5" />
                      </Link>

                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <X className="w-5 h-5 text-red-500" />
                        <span>تسجيل الخروج</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar
