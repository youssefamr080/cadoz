"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaChevronDown } from "react-icons/fa";

const categories = [
  { name: "رجالي", link: "/category/men" },
  { name: "حريمي", link: "/category/women" },
  { name: "أطفال", link: "/category/kids" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // تحديد القسم الحالي بناءً على الرابط
  const currentCategory = categories.find((cat) => pathname.includes(cat.link))?.name || "الأقسام";
  const filteredCategories = categories.filter((cat) => cat.name !== currentCategory); // إخفاء القسم الحالي

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="relative">
      <div className="relative" ref={menuRef}>
        {/* الزر الرئيسي يظهر اسم القسم الحالي */}
        <button
          className="flex items-center text-gray-800 font-semibold px-4 py-2 bg-gray-100 rounded-lg shadow-md hover:bg-gray-200 transition-all"
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={() => setIsOpen(true)}
        >
          {currentCategory}
          <FaChevronDown className={`ml-2 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {/* القائمة المنسدلة */}
        {filteredCategories.length > 0 && (
          <div
            className={`absolute left-0 top-full mt-2 bg-white shadow-lg rounded-md w-full transition-all duration-300 overflow-hidden border border-gray-200 ${
              isOpen ? "opacity-100 translate-y-0 visible" : "opacity-0 -translate-y-3 invisible"
            }`}
            onMouseLeave={() => setIsOpen(false)}
          >
            {filteredCategories.map((category) => (
              <Link
                key={category.name}
                href={category.link}
                className="block px-4 py-3 text-gray-700 hover:bg-yellow-500 hover:text-white transition-all text-lg font-medium"
                onClick={() => setIsOpen(false)}
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;