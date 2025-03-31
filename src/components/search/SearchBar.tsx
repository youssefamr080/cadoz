"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, X, Clock, ArrowUpRight, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { debounce } from "lodash"
import type { Product } from "../../types/product"
import { useGetProductsQuery } from "../../lib/redux/api/apiSlice"

interface SearchBarProps {
  onProductSelect?: (product: Product) => void
  className?: string
}

const SearchBar: React.FC<SearchBarProps> = ({ onProductSelect, className = "" }) => {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Product[]>([])
  const [isFocused, setIsFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Recent searches from localStorage with proper initialization
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        return JSON.parse(localStorage.getItem("recentSearches") || "[]")
      } catch (error) {
        console.error("Error parsing recent searches:", error)
        return []
      }
    }
    return []
  })

  // RTK Query hook with skip option to control when the query runs
  const { data, isFetching } = useGetProductsQuery({ search: query, limit: 8 }, { skip: query.length < 2 })

  // Save recent searches to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("recentSearches", JSON.stringify(recentSearches))
    }
  }, [recentSearches])

  // Update search results when data changes
  useEffect(() => {
    if (data?.data) {
      setResults(data.data)
    }
    setIsLoading(isFetching)
  }, [data, isFetching])

  // Handle search input changes with debounce
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setQuery(value)
      if (value.length < 2) {
        setResults([])
      }
    }, 300),
    [],
  )

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    if (value.length > 1) {
      setIsLoading(true)
    }
    debouncedSearch(value)
  }

  // Clear search and close dropdown
  const clearSearch = () => {
    setQuery("")
    setResults([])
    inputRef.current?.focus()
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setQuery("")
        setResults([])
        setIsFocused(false)
        inputRef.current?.blur()
      } else if (e.key === "ArrowDown" && isFocused && resultsRef.current) {
        e.preventDefault()
        const firstResult = resultsRef.current.querySelector("a") as HTMLElement
        firstResult?.focus()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isFocused])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Add search term to recent searches
  const addRecentSearch = (term: string) => {
    if (term.trim().length < 2) return

    setRecentSearches((prev) => {
      const newSearches = [term, ...prev.filter((t) => t !== term)].slice(0, 5)
      return newSearches
    })
  }

  // Handle product selection
  const handleProductSelect = (product: Product) => {
    setQuery(product.name)
    setResults([])
    setIsFocused(false)
    addRecentSearch(product.name)
    onProductSelect?.(product)
  }

  // Clear all recent searches
  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem("recentSearches")
  }

  // Apply term from recent searches
  const applyRecentSearch = (term: string) => {
    setQuery(term)
    debouncedSearch(term)
    inputRef.current?.focus()
  }

  // Animation variants for framer-motion
  const dropdownVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
      },
    },
    exit: {
      opacity: 0,
      y: 10,
      scale: 0.98,
      transition: {
        duration: 0.2,
      },
    },
  }

  // Loading indicator animation
  const loadingVariants = {
    animate: {
      rotate: 360,
      transition: { repeat: Number.POSITIVE_INFINITY, duration: 1, ease: "linear" },
    },
  }

  return (
    <div className={`relative w-full max-w-lg ${className}`} ref={searchRef}>
      {/* تحسين حقل البحث */}
      <div className="relative flex items-center">
        <motion.div
          className="absolute right-3 flex items-center justify-center h-5 w-5 text-gray-500"
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
        >
          {isLoading ? (
            <motion.div className="h-5 w-5" variants={loadingVariants} animate="animate">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                <path className="opacity-75" d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2"></path>
              </svg>
            </motion.div>
          ) : (
            <Search className="h-5 w-5" />
          )}
        </motion.div>

        <motion.input
          type="text"
          value={query}
          onChange={handleSearch}
          onFocus={() => setIsFocused(true)}
          placeholder="ابحث عن منتج..."
          className="w-full px-4 py-3 pr-10 pl-10 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all shadow-sm hover:shadow-md rtl"
          ref={inputRef}
          initial={{ boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}
          whileFocus={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
        />

        <AnimatePresence>
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute left-3 flex items-center justify-center h-6 w-6 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
              onClick={clearSearch}
              aria-label="مسح البحث"
            >
              <X className="h-4 w-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* عمليات البحث الأخيرة مع تصميم محسن */}
      <AnimatePresence>
        {isFocused && query.length < 2 && recentSearches.length > 0 && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute left-0 mt-2 w-full bg-white shadow-xl rounded-2xl z-50 border border-gray-200 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
              <p className="text-gray-600 text-sm font-medium">عمليات البحث الأخيرة</p>
              <button
                onClick={clearRecentSearches}
                className="text-xs text-gray-500 hover:text-red-500 transition-colors"
              >
                مسح الكل
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {recentSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => applyRecentSearch(term)}
                  className="flex items-center px-4 py-3 hover:bg-gray-50 transition w-full text-right group"
                >
                  <Clock className="w-4 h-4 ml-3 text-gray-400 group-hover:text-primary-500" />
                  <span className="flex-1 truncate">{term}</span>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transform group-hover:translate-x-1 transition-transform rtl:rotate-180" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* نتائج البحث بتصميم أكثر احترافية */}
      <AnimatePresence>
        {isFocused && (isLoading || results.length > 0) && (
          <motion.div
            ref={resultsRef}
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute left-0 mt-2 w-full bg-white shadow-xl rounded-2xl z-50 border border-gray-200 overflow-hidden"
          >
            <div className="max-h-72 overflow-y-auto overscroll-contain">
              {/* حالة التحميل */}
              {isLoading && results.length === 0 && (
                <div className="py-12 flex flex-col items-center justify-center text-gray-500">
                  <motion.div className="h-8 w-8 mb-4" variants={loadingVariants} animate="animate">
                    <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8" stroke="currentColor" strokeWidth="2">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="2"
                      ></circle>
                      <path
                        className="opacity-75"
                        d="M12 2a10 10 0 0 1 10 10"
                        stroke="currentColor"
                        strokeWidth="2"
                      ></path>
                    </svg>
                  </motion.div>
                  <p>جاري البحث...</p>
                </div>
              )}

              {/* عرض النتائج */}
              {!isLoading && results.length > 0 && (
                <>
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                    <p className="text-gray-600 text-sm font-medium">تم العثور على {results.length} نتيجة</p>
                  </div>

                  {results.map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.id}`}
                      className="flex items-center px-4 py-3 hover:bg-gray-50 group transition-colors border-b border-gray-100 last:border-0"
                      onClick={() => handleProductSelect(product)}
                    >
                      <div className="relative w-12 h-12 mr-3 overflow-hidden rounded-lg shadow-sm group-hover:shadow">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          sizes="48px"
                          className="object-cover transition-transform group-hover:scale-110"
                          unoptimized
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800 font-medium truncate">{product.name}</p>
                        <div className="flex items-center mt-1">
                          <span className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                            {product.category}
                          </span>
                          <p className="text-primary-600 font-semibold text-sm mr-2 truncate">
                            {product.price.toLocaleString()} ج.م
                          </p>
                        </div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transform group-hover:translate-x-1 transition-transform ml-2 rtl:rotate-180" />
                    </Link>
                  ))}
                </>
              )}

              {/* لا توجد نتائج */}
              {!isLoading && query.length > 1 && results.length === 0 && (
                <div className="py-12 flex flex-col items-center justify-center text-gray-500">
                  <svg className="h-12 w-12 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 14l2 2 4-4"
                      style={{ opacity: 0 }}
                    />
                  </svg>
                  <p className="text-lg font-medium mb-1">لا توجد نتائج</p>
                  <p className="text-sm text-gray-400">حاول استخدام كلمات بحث مختلفة</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SearchBar
