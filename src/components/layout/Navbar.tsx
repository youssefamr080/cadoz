"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, Menu, X } from "lucide-react"

// تعريف أنواع البيانات
type Category = {
  name: string
  link: string
  icon?: React.ReactNode
}

// قائمة الأقسام
const categories: Category[] = [
  { name: "رجالي", link: "/category/men" },
  { name: "حريمي", link: "/category/women" },
  { name: "أطفال", link: "/category/kids" },
]

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  // تحديد القسم الحالي بناءً على الرابط
  const currentCategory = categories.find((cat) => pathname.includes(cat.link))?.name || "الأقسام"
  const filteredCategories = categories.filter((cat) => !pathname.includes(cat.link)) // إخفاء القسم الحالي

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // إغلاق القائمة عند تغيير المسار
  useEffect(() => {
    setIsOpen(false)
    setIsMobileMenuOpen(false)
  }, [pathname])

  return (
    <nav className="relative font-sans" dir="rtl">
      {/* شريط التنقل للشاشات الكبيرة */}
      <div className="hidden md:block">
        <div className="relative" ref={menuRef}>
          {/* الزر الرئيسي يظهر اسم القسم الحالي */}
          <button
            className="flex items-center justify-between gap-2 text-gray-800 font-semibold px-5 py-2.5 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-all border border-gray-200 min-w-32"
            onClick={() => setIsOpen(!isOpen)}
            onMouseEnter={() => setIsOpen(true)}
            aria-expanded={isOpen}
            aria-haspopup="true"
          >
            <span>{currentCategory}</span>
            <ChevronDown className={`transition-transform duration-300 h-4 w-4 ${isOpen ? "rotate-180" : ""}`} />
          </button>

          {/* القائمة المنسدلة */}
          {filteredCategories.length > 0 && (
            <div
              className={`absolute right-0 top-full mt-1 bg-white shadow-lg rounded-lg w-full transition-all duration-200 overflow-hidden border border-gray-200 z-50 ${
                isOpen ? "opacity-100 translate-y-0 visible max-h-60" : "opacity-0 -translate-y-2 invisible max-h-0"
              }`}
              onMouseLeave={() => setIsOpen(false)}
            >
              {filteredCategories.map((category) => (
                <Link
                  key={category.name}
                  href={category.link}
                  className="block px-5 py-3 text-gray-700 hover:bg-yellow-500 hover:text-white transition-all text-md font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* شريط التنقل للشاشات الصغيرة */}
      <div className="md:hidden">
        <button
          className="flex items-center justify-between gap-2 text-gray-800 font-semibold px-4 py-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-all border border-gray-200 w-full"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-expanded={isMobileMenuOpen}
        >
          <span>{currentCategory}</span>
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* القائمة المنسدلة للموبايل */}
        <div
          className={`absolute right-0 left-0 mt-1 bg-white shadow-lg rounded-lg transition-all duration-300 overflow-hidden border border-gray-200 z-50 ${
            isMobileMenuOpen
              ? "opacity-100 translate-y-0 visible max-h-screen"
              : "opacity-0 -translate-y-4 invisible max-h-0"
          }`}
        >
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.link}
              className={`block px-4 py-3.5 transition-all text-md font-medium ${
                pathname.includes(category.link)
                  ? "bg-yellow-500 text-white"
                  : "text-gray-700 hover:bg-yellow-50 hover:text-yellow-700"
              }`}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}

export default Navbar

