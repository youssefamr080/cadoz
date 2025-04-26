"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, X, Clock, ArrowUpRight, ChevronRight, Sparkles, TrendingUp, Tag } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { debounce } from "lodash"
import type { Product } from "../../types/product"
import { useGetProductsQuery } from "../../lib/redux/api/apiSlice"

interface SearchBarProps {
  onProductSelect?: (product: Product) => void
  className?: string
  showTrendingProducts?: boolean
  maxResults?: number
  debounceTime?: number
}

const SearchBar: React.FC<SearchBarProps> = ({
  onProductSelect,
  className = "",
  showTrendingProducts = true,
  maxResults = 8,
  debounceTime = 300,
}) => {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Product[]>([])
  const [isFocused, setIsFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTabIndex, setActiveTabIndex] = useState(0) // 0: results, 1: trending
  const [searchMode, setSearchMode] = useState<"recent" | "results" | "trending" | "empty" | "loading">("recent")
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
  const { data: searchData, isFetching: isSearchFetching } = useGetProductsQuery(
    { search: query, limit: maxResults },
    { skip: query.length < 2 },
  )

  // RTK Query hook for trending products - skip if not showing trending
  const { data: trendingData, isFetching: isTrendingFetching } = useGetProductsQuery(
    { trending: true, limit: 4 },
    { skip: !showTrendingProducts },
  )

  // Save recent searches to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("recentSearches", JSON.stringify(recentSearches))
    }
  }, [recentSearches])

  // Update search results when data changes
  useEffect(() => {
    if (searchData?.data) {
      setResults(searchData.data)
    }
    setIsLoading(isSearchFetching)
  }, [searchData, isSearchFetching])

  // Handle search mode based on various states
  useEffect(() => {
    if (isLoading) {
      setSearchMode("loading")
    } else if (query.length < 2) {
      setSearchMode(recentSearches.length > 0 ? "recent" : "empty")
    } else if (results.length === 0) {
      setSearchMode("empty")
    } else {
      setSearchMode("results")
    }
  }, [query, results, recentSearches, isLoading])

  // Handle search input changes with debounce
  // Fixed: Added explicit inline function with dependencies properly declared
  const debouncedSearch = useCallback(
    (value: string) => {
      const debouncedFn = debounce((searchValue: string) => {
        setQuery(searchValue)
        if (searchValue.length < 2) {
          setResults([])
        }
      }, debounceTime)

      debouncedFn(value)

      // Cleanup function to cancel debounced calls when component unmounts
      return () => debouncedFn.cancel()
    },
    [debounceTime],
  )

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    if (value.length > 1) {
      setIsLoading(true)
      setActiveTabIndex(0) // Switch to results tab when searching
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
      } else if (e.key === "Tab" && isFocused && activeTabIndex !== undefined) {
        e.preventDefault()
        setActiveTabIndex(activeTabIndex === 0 ? 1 : 0)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isFocused, activeTabIndex])

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
    hidden: { opacity: 0, y: 10, scale: 0.98, transformOrigin: "top" },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30,
        mass: 1,
      },
    },
    exit: {
      opacity: 0,
      y: 5,
      scale: 0.98,
      transition: {
        duration: 0.15,
      },
    },
  }

  const tabVariants = {
    inactive: { opacity: 0.7, scale: 0.95, y: 2 },
    active: { opacity: 1, scale: 1, y: 0 },
  }

  // Loading indicator animation
  const loadingVariants = {
    animate: {
      rotate: 360,
      transition: { repeat: Number.POSITIVE_INFINITY, duration: 1, ease: "linear" },
    },
  }

  // Shimmer effect for loading state
  const shimmerVariants = {
    initial: { x: "-100%" },
    animate: {
      x: "100%",
      transition: {
        repeat: Number.POSITIVE_INFINITY,
        duration: 1.5,
        ease: "linear",
      },
    },
  }

  // Calculate the dropdown visibility
  const showDropdown = isFocused && (searchMode !== "empty" || activeTabIndex === 1)

  return (
    <div className={`relative w-full max-w-lg ${className}`} ref={searchRef}>
      {/* Enhanced search input field */}
      <div className="relative flex items-center">
        <motion.div
          className="absolute right-3 flex items-center justify-center h-4 w-4 text-purple-500"
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
        >
          {isLoading ? (
            <motion.div className="h-4 w-4" variants={loadingVariants} animate="animate">
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                <path className="opacity-75" d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2"></path>
              </svg>
            </motion.div>
          ) : (
            <Search className="h-4 w-4" />
          )}
        </motion.div>

        <motion.input
          type="text"
          value={query}
          onChange={handleSearch}
          onFocus={() => setIsFocused(true)}
          placeholder="ابحث عن منتجات..."
          className="w-full px-4 py-2 pr-10 pl-10 rounded-full border border-gray-200 focus:ring-2 focus:ring-purple-300/30 focus:border-purple-500 focus:outline-none transition-all shadow-sm hover:shadow-md rtl text-sm bg-gray-50/80 hover:bg-white"
          ref={inputRef}
          initial={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
          whileFocus={{ boxShadow: "0 8px 20px rgba(0,0,0,0.12)" }}
          animate={isFocused ? { borderColor: "var(--color-primary)" } : {}}
        />

        <AnimatePresence mode="wait">
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute left-3 flex items-center justify-center h-5 w-5 text-gray-500 hover:text-purple-600 rounded-full hover:bg-purple-100 transition-all"
              onClick={clearSearch}
              aria-label="مسح البحث"
            >
              <X className="h-3.5 w-3.5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Enhanced dropdown with tabs, animations, and better UI */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute left-0 mt-2 w-full bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl border border-gray-200 overflow-hidden"
            style={{
              backdropFilter: "blur(8px)",
              zIndex: 40,
              position: "absolute",
            }}
          >
            {/* Tabs for results and trending */}
            {showTrendingProducts && (
              <div className="border-b border-gray-100 px-2 pt-2 bg-gradient-to-r from-purple-50 to-indigo-50">
                <div className="flex space-x-1 rtl:space-x-reverse">
                  <motion.button
                    variants={tabVariants}
                    animate={activeTabIndex === 0 ? "active" : "inactive"}
                    className={`flex-1 py-2 px-3 text-sm font-medium rounded-t-lg transition ${
                      activeTabIndex === 0
                        ? "bg-white text-purple-700 shadow-sm border-b-2 border-purple-500"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                    onClick={() => setActiveTabIndex(0)}
                  >
                    {searchMode === "recent" ? "عمليات البحث الأخيرة" : "نتائج البحث"}
                  </motion.button>
                  <motion.button
                    variants={tabVariants}
                    animate={activeTabIndex === 1 ? "active" : "inactive"}
                    className={`flex-1 py-2 px-3 text-sm font-medium rounded-t-lg transition flex items-center justify-center ${
                      activeTabIndex === 1
                        ? "bg-white text-indigo-700 shadow-sm border-b-2 border-indigo-500"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                    onClick={() => setActiveTabIndex(1)}
                  >
                    <TrendingUp className="w-4 h-4 ml-1.5" />
                    المنتجات الأكثر رواجاً
                  </motion.button>
                </div>
              </div>
            )}

            <div ref={resultsRef} className="max-h-[60vh] overflow-y-auto overscroll-contain">
              {/* Tab content based on activeTabIndex */}
              <AnimatePresence mode="wait">
                {activeTabIndex === 0 ? (
                  <motion.div
                    key="main-tab"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Recent searches */}
                    {searchMode === "recent" && recentSearches.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-purple-50 to-purple-100/70">
                          <p className="text-purple-800 text-sm font-medium flex items-center">
                            <Clock className="w-4 h-4 ml-1.5 text-purple-500" />
                            عمليات البحث الأخيرة
                          </p>
                          <button
                            onClick={clearRecentSearches}
                            className="text-xs text-gray-500 hover:text-red-500 transition-colors py-1 px-2 rounded hover:bg-red-50"
                          >
                            مسح الكل
                          </button>
                        </div>
                        <div>
                          {recentSearches.map((term) => (
                            <motion.button
                              key={term}
                              onClick={() => applyRecentSearch(term)}
                              className="flex items-center px-4 py-3 hover:bg-purple-50/50 transition w-full text-right group border-b border-gray-50 last:border-0"
                              whileHover={{ backgroundColor: "rgba(243, 244, 246, 0.8)" }}
                            >
                              <Clock className="w-4 h-4 ml-3 text-purple-400 group-hover:text-purple-600" />
                              <span className="flex-1 truncate text-gray-700">{term}</span>
                              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-purple-500 transform group-hover:translate-x-1 transition-transform rtl:rotate-180" />
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Loading state */}
                    {searchMode === "loading" && (
                      <div className="py-12 flex flex-col items-center justify-center text-gray-500 space-y-4">
                        <motion.div className="h-10 w-10 relative" variants={loadingVariants} animate="animate">
                          <div className="h-10 w-10 rounded-full border-2 border-gray-200 border-t-purple-500"></div>
                        </motion.div>
                        <p className="text-gray-600">جاري البحث...</p>

                        {/* Skeleton loading items */}
                        <div className="w-full px-4 space-y-3 mt-4">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-center space-x-3 rtl:space-x-reverse">
                              <div className="w-12 h-12 rounded-lg bg-gray-200 relative overflow-hidden">
                                <motion.div
                                  className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 w-full h-full"
                                  variants={shimmerVariants}
                                  initial="initial"
                                  animate="animate"
                                />
                              </div>
                              <div className="flex-1 space-y-2">
                                <div className="h-4 w-2/3 bg-gray-200 rounded relative overflow-hidden">
                                  <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 w-full h-full"
                                    variants={shimmerVariants}
                                    initial="initial"
                                    animate="animate"
                                  />
                                </div>
                                <div className="h-3 w-1/3 bg-gray-200 rounded relative overflow-hidden">
                                  <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 w-full h-full"
                                    variants={shimmerVariants}
                                    initial="initial"
                                    animate="animate"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Search results */}
                    {searchMode === "results" && (
                      <>
                        <div className="px-4 py-2.5 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100 flex items-center justify-between">
                          <p className="text-purple-800 text-sm font-medium flex items-center">
                            <span className="ml-1 bg-purple-600 text-white w-5 h-5 inline-flex items-center justify-center rounded-full text-xs">
                              {results.length}
                            </span>
                            نتيجة لـ &ldquo;{query}&rdquo;
                          </p>
                          {results.length > 0 && (
                            <Link
                              href={`/search?q=${encodeURIComponent(query)}`}
                              className="text-xs text-indigo-600 hover:text-indigo-700 transition-colors flex items-center"
                            >
                              عرض الكل
                              <ChevronRight className="w-3 h-3 mr-1 rtl:rotate-180" />
                            </Link>
                          )}
                        </div>

                        <div className="divide-y divide-gray-50">
                          {results.map((product) => (
                            <motion.div
                              key={product.id}
                              initial={{ backgroundColor: "rgba(255, 255, 255, 0)" }}
                              whileHover={{ backgroundColor: "rgba(237, 233, 254, 0.2)" }}
                            >
                              <Link
                                href={`/product/${product.id}`}
                                className="flex items-center px-4 py-3 group transition-colors"
                                onClick={() => handleProductSelect(product)}
                              >
                                <div className="relative w-16 h-16 ml-3 overflow-hidden rounded-lg shadow-sm group-hover:shadow ring-1 ring-gray-200 group-hover:ring-purple-200">
                                  <Image
                                    src={product.image || "/placeholder.svg"}
                                    alt={product.name}
                                    fill
                                    sizes="64px"
                                    className="object-cover transition-transform group-hover:scale-110"
                                    unoptimized
                                  />
                                  {product.discount_percentage > 0 && (
                                    <div className="absolute top-0 right-0 bg-red-500 text-white text-xs py-0.5 px-1 rounded-bl-lg">
                                      {product.discount_percentage}%
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-gray-800 font-medium truncate">{product.name}</p>
                                  <div className="flex items-center mt-1 flex-wrap gap-2">
                                    <span className="inline-flex items-center px-2 py-0.5 text-xs bg-purple-50 text-purple-700 rounded-full">
                                      <Tag className="w-3 h-3 ml-1" />
                                      {product.category}
                                    </span>
                                    <div className="flex items-center">
                                      {product.old_price && (
                                        <p className="text-gray-400 text-xs line-through ml-2">
                                          {product.old_price.toLocaleString()} ج.م
                                        </p>
                                      )}
                                      <p className="text-purple-700 font-semibold text-sm truncate flex items-center">
                                        {product.price.toLocaleString()} ج.م
                                      </p>
                                    </div>
                                  </div>
                                  {product.rating && (
                                    <div className="flex items-center mt-1">
                                      <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                          <svg
                                            key={i}
                                            className={`w-3 h-3 ${
                                              i < Math.floor(product.rating)
                                                ? "text-amber-400"
                                                : i < product.rating
                                                  ? "text-amber-300"
                                                  : "text-gray-300"
                                            }`}
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                          >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                          </svg>
                                        ))}
                                      </div>
                                      <span className="text-xs text-gray-500 mr-1">({product.rating || 0})</span>
                                    </div>
                                  )}
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-purple-400 group-hover:text-purple-600 transform group-hover:translate-x-1 transition-transform ml-2 rtl:rotate-180" />
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* No results */}
                    {searchMode === "empty" && query.length > 1 && (
                      <div className="py-12 flex flex-col items-center justify-center text-gray-500">
                        <div className="w-16 h-16 mb-4 bg-purple-50 rounded-full flex items-center justify-center text-purple-400">
                          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                        </div>
                        <p className="text-lg font-medium mb-1 text-purple-900">لا توجد نتائج</p>
                        <p className="text-sm text-gray-400 mb-4">لم نتمكن من العثور على &ldquo;{query}&rdquo;</p>
                        <div className="text-sm bg-purple-50 rounded-lg p-3 max-w-xs text-center">
                          <p className="text-purple-800 font-medium mb-1">اقتراحات البحث:</p>
                          <ul className="text-gray-500">
                            <li>• تأكد من كتابة جميع الكلمات بشكل صحيح</li>
                            <li>• جرب كلمات رئيسية مختلفة</li>
                            <li>• استخدم كلمات أكثر عمومية</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="trending-tab"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Trending products tab */}
                    <div className="px-4 py-2.5 bg-gradient-to-r from-indigo-50 to-indigo-100 border-b border-indigo-200">
                      <p className="text-indigo-800 text-sm font-medium flex items-center">
                        <Sparkles className="w-4 h-4 ml-1.5 text-indigo-500" />
                        المنتجات الأكثر رواجاً
                      </p>
                    </div>

                    {isTrendingFetching ? (
                      <div className="p-6 flex flex-col items-center justify-center">
                        <motion.div className="h-8 w-8 mb-4" variants={loadingVariants} animate="animate">
                          <div className="h-8 w-8 rounded-full border-2 border-indigo-200 border-t-indigo-500"></div>
                        </motion.div>
                        <p className="text-indigo-600">جاري تحميل المنتجات...</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 p-2">
                        {(trendingData?.data || []).map((product: Product) => (
                          <Link
                            key={product.id}
                            href={`/product/${product.id}`}
                            className="group bg-white hover:bg-indigo-50/50 rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow transition-all p-2"
                            onClick={() => handleProductSelect(product)}
                          >
                            <div className="relative w-full h-32 mb-2 overflow-hidden rounded-lg">
                              <Image
                                src={product.image || "/placeholder.svg"}
                                alt={product.name}
                                fill
                                sizes="150px"
                                className="object-cover transition-transform group-hover:scale-105"
                                unoptimized
                              />
                              {product.discount_percentage > 0 && (
                                <div className="absolute top-0 right-0 bg-red-500 text-white text-xs py-0.5 px-1.5 rounded-bl-lg font-medium">
                                  خصم {product.discount_percentage}%
                                </div>
                              )}
                              {product.new_arrival && (
                                <div className="absolute top-0 left-0 bg-green-500 text-white text-xs py-0.5 px-1.5 rounded-br-lg font-medium">
                                  جديد
                                </div>
                              )}
                            </div>
                            <h3 className="font-medium text-sm line-clamp-1 mb-1">{product.name}</h3>
                            <div className="flex justify-between items-center">
                              <span className="inline-block px-1.5 py-0.5 text-xs bg-indigo-50 text-indigo-700 rounded-full">
                                {product.category}
                              </span>
                              <p className="text-purple-700 font-semibold text-sm">
                                {product.price.toLocaleString()} ج.م
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Search tips/footer */}
            <div className="py-2 px-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-t border-gray-100 text-xs text-gray-500 flex justify-between items-center">
              <span>اضغط ESC للإغلاق</span>
              <span className="flex items-center">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-gray-600 text-xs ml-1 shadow-sm">
                  ↑
                </kbd>
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-gray-600 text-xs ml-1 shadow-sm">
                  ↓
                </kbd>
                للتنقل
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SearchBar
