"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { User, Menu, X, LogOut, Package, Settings, Facebook, Instagram, Twitter, ChevronDown, ChevronRight, AlertCircle } from "lucide-react"
import { Button } from "../../components/ui/button"
import UserAvatar from "../user/UserAvatar"
import { usePathname } from "next/navigation"

// Types
interface UserType {
  name: string
  phone?: string
  email?: string
  avatar?: string
}

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
  user: UserType | null
  isLoading: boolean
  logout: () => void
  categories: {
    name: string
    link: string
    icon: React.ReactNode
    subCategories?: {
      name: string
      link: string
    }[]
  }[]
  secondaryLinks: {
    name: string
    link: string
    icon: React.ReactNode
  }[]
}

const MobileSidebar = ({
  isOpen,
  onClose,
  user,
  isLoading,
  logout,
  categories,
  secondaryLinks,
}: MobileSidebarProps) => {
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen, onClose])

  const handleLogout = () => {
    logout()
    onClose()
  }

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryName]: !prev[categoryName],
    }))
  }

  // Initialize the subcategory data based on the existing structure
  const categoriesWithSubcategories = [
    {
      name: "رجالي",
      link: "/category/men",
      icon: categories.find(cat => cat.name === "رجالي")?.icon,
      subCategories: [
        { name: "ساعات", link: "/category/men#watches" },
        { name: "محافظ", link: "/category/men#wallets" },
        { name: "عطور", link: "/category/men#perfumes" },
        { name: "شنط يد", link: "/category/men#handbags" },
        { name: "نظارات شمسية", link: "/category/men#sunglasses" },
        { name: "سبراي", link: "/category/men#spray" },
      ]
    },
    {
      name: "نسائي",
      link: "/category/women",
      icon: categories.find(cat => cat.name === "نسائي")?.icon,
      subCategories: [
        { name: "ساعات", link: "/category/women#watches" },
        { name: "محافظ", link: "/category/women#wallets" },
        { name: "عطور", link: "/category/women#perfumes" },
        { name: "إكسسوارات", link: "/category/women#accessories" },
        { name: "نظارات شمسية", link: "/category/women#sunglasses" },
        { name: "سبراي", link: "/category/women#spray" },
      ]
    },
    {
      name: "أطفال",
      link: "/category/kids",
      icon: categories.find(cat => cat.name === "أطفال")?.icon,
      subCategories: [
        { name: "العاب اطفال", link: "/category/kids#toys" },
        { name: "دباديب", link: "/category/kids#teddy-bears" },
        { name: "ساعات اطفال", link: "/category/kids#watches" },
      ]
    },
    {
      name: "هدايا",
      link: "/inspirations",
      icon: categories.find(cat => cat.name === "أهدايا")?.icon,
      subCategories: [
        { name: "المساعد الذكي للهدايا", link: "/smart-gift-finder" },
        { name: "هدايا جاهزة", link: "/inspirations" },
        { name: "تخصيص هدية", link: "/gift" },
        { name: "هدايا شخصيه", link: "/custom-gifts" },
      ]
    },
    ...categories.filter(cat => !["رجالي", "نسائي", "أطفال", "هدايا"].includes(cat.name))
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            style={{ zIndex: 59 }}
            onClick={onClose}
          />

          <motion.div
            ref={mobileMenuRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-4/5 max-w-xs bg-white shadow-xl overflow-y-auto"
            style={{ 
              zIndex: 101,
              height: "100vh",
              position: "fixed",
              right: 0,
              top: 0,
              bottom: 0,
              overflowY: "auto",
              WebkitOverflowScrolling: "touch"
            }}
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
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/50 transition-colors"
                aria-label="إغلاق القائمة"
              >
                <X className="h-5 w-5 text-gray-700" />
              </button>
            </div>

            {/* User information */}
            <div className="p-4 border-b bg-gradient-to-br from-white to-purple-50">
              {!isLoading &&
                (user ? (
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
                  <div className="space-y-3">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-700">قم بتسجيل الدخول لمتابعة طلباتك والاستفادة من جميع المميزات</p>
                    </div>
                    <Button
                      onClick={onClose}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    >
                      <User className="h-4 w-4 ml-2" />
                      تسجيل الدخول
                    </Button>
                  </div>
                ))}
            </div>

            {/* Main menu links */}
            <div className="p-2">
              <div className="mb-2 px-2 py-1 text-xs font-medium text-gray-500">الأقسام الرئيسية</div>
              <ul className="space-y-1">
                {categoriesWithSubcategories.map((category) => (
                  <motion.li key={category.name} whileTap={{ scale: 0.98 }}>
                    <div 
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer ${
                        pathname === category.link || pathname?.startsWith(category.link + "/")
                          ? "bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 font-medium shadow-sm"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          pathname === category.link || pathname?.startsWith(category.link + "/")
                            ? "bg-purple-100 text-purple-700" 
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {category.icon}
                      </div>
                      
                      <Link 
                        href={category.link}
                        className="flex-1" 
                        onClick={onClose}
                      >
                        <span>{category.name}</span>
                      </Link>
                      
                      {category.subCategories && category.subCategories.length > 0 && (
                        <button
                          onClick={() => toggleCategory(category.name)}
                          className="p-1 rounded-full hover:bg-white/80 transition-colors"
                          aria-label={expandedCategories[category.name] ? "طي القائمة" : "توسيع القائمة"}
                        >
                          {expandedCategories[category.name] ? (
                            <ChevronDown className="h-4 w-4 text-gray-600" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-600" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Subcategories */}
                    {category.subCategories && category.subCategories.length > 0 && (
                      <AnimatePresence>
                        {expandedCategories[category.name] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-1 mb-2 mr-4 pr-2 border-r-2 border-purple-100">
                              {category.subCategories.map((subcategory) => (
                                <Link
                                  key={subcategory.link}
                                  href={subcategory.link}
                                  className="flex items-center gap-2 p-2 hover:bg-purple-50 rounded-md text-gray-700 transition-colors"
                                  onClick={onClose}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                                  <span>{subcategory.name}</span>
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
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
                      onClick={onClose}
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
            {user ? (
              <div className="p-4 border-t mt-4">
                <div className="space-y-3">
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 hover:shadow-sm transition-all"
                    onClick={onClose}
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <span>الملف الشخصي</span>
                  </Link>

                  <Link
                    href="/profile/orders"
                    className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 hover:shadow-sm transition-all"
                    onClick={onClose}
                  >
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <Package className="h-4 w-4 text-green-600" />
                    </div>
                    <span>طلباتي</span>
                  </Link>

                  <Link
                    href="/profile/settings"
                    className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 hover:shadow-sm transition-all"
                    onClick={onClose}
                  >
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                      <Settings className="h-4 w-4 text-amber-600" />
                    </div>
                    <span>الإعدادات</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-red-50 to-rose-50 text-red-700 hover:shadow-sm transition-all"
                  >
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <LogOut className="h-4 w-4 text-red-600" />
                    </div>
                    <span>تسجيل الخروج</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 border-t mt-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <Package className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">يجب تسجيل الدخول لمراجعة طلباتك السابقة وتتبع الشحنات</p>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="p-4 mt-6 border-t text-center">
              <div className="flex justify-center gap-4 mb-2">
                <a
                  href="#facebook"
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-purple-100 hover:text-purple-600 transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                  <span className="sr-only">Facebook</span>
                </a>
                <a
                  href="#instagram"
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-purple-100 hover:text-purple-600 transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                  <span className="sr-only">Instagram</span>
                </a>
                <a
                  href="#twitter"
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-purple-100 hover:text-purple-600 transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                  <span className="sr-only">Twitter</span>
                </a>
              </div>
              <p className="text-xs text-gray-500">© {new Date().getFullYear()} كادوز. جميع الحقوق محفوظة</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default MobileSidebar