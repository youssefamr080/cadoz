"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"

// UI Components
import { motion, AnimatePresence } from "framer-motion"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

// Icons
import {
  Heart,
  ShoppingCart,
  Star,
  Search,
  ChevronDown,
  X,
  Clock,
  Filter,
  ArrowLeft,
  Check,
  Gift,
} from "lucide-react"

// Context and API
import { useCart } from "../../context/CartContext"
import { useWishlist } from "../../context/WishlistContext"
import { useGetProductsQuery } from "../../lib/redux/api/apiSlice"

// Layout Components
import Header from "../../components/layout/Header"
import Footer from "../../components/layout/Footer"

// Types
import type { Product } from "../../types/product"
import type React from "react"

interface FilterOptions {
  gender: string
  occasion: string
  priceRange: [number, number]
}

interface QueryParams {
  isGift: boolean
  limit: number
  page: number
  category?: string
  occasion?: string
  minPrice?: number
  maxPrice?: number
  search?: string
  sort?: string
  trending?: boolean
}

const GiftResultsPage: React.FC = () => {
  const router = useRouter()
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    gender: "all",
    occasion: "all",
    priceRange: [0, 10000],
  })
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [sortBy, setSortBy] = useState<string>("recommended")
  const [selectedGift, setSelectedGift] = useState<Product | null>(null)
  const { addToCart } = useCart()
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist()
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [activeCategory, setActiveCategory] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const limit = 20

  // Convert filter options to API query parameters
  const getQueryParams = () => {
    const params: QueryParams = {
      isGift: true,
      limit,
      page: currentPage,
    }

    // Add gender/category filter
    if (filterOptions.gender !== "all") {
      params.category = filterOptions.gender
    }

    // Add occasion filter
    if (filterOptions.occasion !== "all") {
      params.occasion = filterOptions.occasion
    }

    // Add price range filter
    if (filterOptions.priceRange[0] > 0) {
      params.minPrice = filterOptions.priceRange[0]
    }
    if (filterOptions.priceRange[1] < 10000) {
      params.maxPrice = filterOptions.priceRange[1]
    }

    // Add search query
    if (searchQuery) {
      params.search = searchQuery
    }

    // Add sorting
    if (sortBy === "price-asc") {
      params.sort = "price_asc"
    } else if (sortBy === "price-desc") {
      params.sort = "price_desc"
    } else if (sortBy === "rating") {
      params.sort = "rating_desc"
    } else if (sortBy === "newest") {
      params.sort = "_id_desc" // Assuming newest is by ID descending
    }

    return params
  }

  // Fetch products using RTK Query
  const { data: productsData, isLoading, isFetching, error } = useGetProductsQuery(getQueryParams())

  // Fetch recommended products
  const { data: recommendedData } = useGetProductsQuery({
    trending: true,
    limit: 5,
  })

  // Price presets
  const pricePresets = [
    { label: "أقل من 300 ج.م", value: 300 },
    { label: "أقل من 500 ج.م", value: 500 },
    { label: "أقل من 700 ج.م", value: 700 },
    { label: "أقل من 1000 ج.م", value: 1000 },
    { label: "أقل من 2000 ج.م", value: 2000 },
  ]

  // Function to load filter options from local storage
  const loadFilterOptions = (): FilterOptions => {
    try {
      const storedOptions = localStorage.getItem("giftFilterOptions")
      if (storedOptions) {
        return JSON.parse(storedOptions)
      }
      return {
        gender: "all",
        occasion: "all",
        priceRange: [0, 10000],
      }
    } catch (error) {
      console.error("Failed to load filter options from local storage:", error)
      return {
        gender: "all",
        occasion: "all",
        priceRange: [0, 10000],
      }
    }
  }

  // Function to save filter options to local storage
  const saveFilterOptions = (options: FilterOptions) => {
    try {
      localStorage.setItem("giftFilterOptions", JSON.stringify(options))
    } catch (error) {
      console.error("Failed to save filter options to local storage:", error)
    }
  }

  // Use Effect to update filterOptions state from localStorage on initial load
  useEffect(() => {
    const storedOptions = loadFilterOptions()
    setFilterOptions(storedOptions)
  }, [])

  // Update active filters array for badges
  useEffect(() => {
    const newActiveFilters: string[] = []

    if (filterOptions.gender !== "all") {
      newActiveFilters.push(
        filterOptions.gender === "men" ? "رجالي" : filterOptions.gender === "women" ? "نسائي" : "أطفال",
      )
    }

    if (filterOptions.occasion !== "all") {
      newActiveFilters.push(filterOptions.occasion)
    }

    if (filterOptions.priceRange[1] !== 10000) {
      newActiveFilters.push(`أقل من ${filterOptions.priceRange[1]} ج.م`)
    }

    setActiveFilters(newActiveFilters)

    // Save filter options to localStorage whenever they change
    saveFilterOptions(filterOptions)

    // Reset to first page when filters change
    setCurrentPage(1)
  }, [filterOptions])

  // Event handlers
  const handleGenderChange = (value: string) => {
    setFilterOptions((prev) => ({ ...prev, gender: value }))
    setActiveCategory(value)
  }

  const handleOccasionChange = (value: string) => {
    setFilterOptions((prev) => ({ ...prev, occasion: value }))
  }

  const handlePricePresetClick = (maxPrice: number) => {
    setFilterOptions((prev) => ({ ...prev, priceRange: [0, maxPrice] }))
  }

  const handlePriceRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    setFilterOptions((prev) => ({ ...prev, priceRange: [0, value] }))
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // The query will be automatically updated due to the dependency in useGetProductsQuery
  }

  const isFavorite = (productId: number) => {
    return wishlist.some((item) => item.id === productId)
  }

  const handleToggleWishlist = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()

    if (isFavorite(product.id)) {
      removeFromWishlist(product.id)
      toast.info("تمت الإزالة من المفضلة")
    } else {
      addToWishlist({ id: product.id, name: product.name, image: product.image, price: product.price })
      toast.success("تمت الإضافة إلى المفضلة")
    }
  }

  const handleAddToCart = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()

    addToCart({ id: product.id, name: product.name, image: product.image, price: product.price, quantity: 1 })
    toast.success(
      <div className="flex items-center justify-between w-full">
        <span>✅ تمت الإضافة للسلة</span>
        <Link href="/cart" className="text-blue-600 underline mr-2 font-medium">
          عرض السلة
        </Link>
      </div>,
      { position: "bottom-center", autoClose: 3000 },
    )
  }

  const resetFilters = () => {
    setFilterOptions({
      gender: "all",
      occasion: "all",
      priceRange: [0, 10000],
    })
    setSearchQuery("")
    setSortBy("recommended")
    setActiveCategory("all")
    setCurrentPage(1)
  }

  const removeFilter = (filter: string) => {
    if (filter.includes("ج.م")) {
      setFilterOptions((prev) => ({ ...prev, priceRange: [0, 10000] }))
    } else if (filter === "رجالي") {
      setFilterOptions((prev) => ({ ...prev, gender: "all" }))
      setActiveCategory("all")
    } else if (filter === "نسائي") {
      setFilterOptions((prev) => ({ ...prev, gender: "all" }))
      setActiveCategory("all")
    } else if (filter === "أطفال") {
      setFilterOptions((prev) => ({ ...prev, gender: "all" }))
      setActiveCategory("all")
    } else {
      setFilterOptions((prev) => ({ ...prev, occasion: "all" }))
    }
  }

  const occasionsList = useMemo(() => {
    return ["رمضان", "عيد الحب", "عيد الأم", "عيد الفطر", "رأس السنة", "عيد زواج", "عيد ميلاد"]
  }, [])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  }

  // Handle pagination
  const handleNextPage = () => {
    if (productsData && currentPage < productsData.pagination.pages) {
      setCurrentPage((prev) => prev + 1)
      // Scroll to top when changing page
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1)
      // Scroll to top when changing page
      window.scrollTo({ top: 0, behavior: "smooth" })
      // Scroll to top when changing page
    }
  }

  // Get products from API response
  const products = productsData?.data || []
  const recommendedProducts = recommendedData?.data || []
  const totalProducts = productsData?.pagination.total || 0
  const totalPages = productsData?.pagination.pages || 0

  return (
    <div className="bg-gray-50 min-h-screen font-tajawal" dir="rtl">
      <Header />

      <main className="container mx-auto px-4 py-4">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-purple-600 transition-colors">
            الرئيسية
          </Link>
          <span className="mx-2">/</span>
          <span className="text-purple-600 font-medium">الهدايا</span>
        </div>

        {/* Page Title - Added for better hierarchy */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">استكشف الهدايا المميزة</h1>
          <p className="text-gray-600 mt-1">اختر من بين مجموعة متنوعة من الهدايا المناسبة لكل مناسبة</p>
        </div>

        {/* Mobile Search and Filter Bar */}
        <div className="sticky top-0 z-30 -mx-4 px-4 py-3 bg-white shadow-md md:hidden">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="ابحث عن هدايا..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-sm"
              />
              <button type="submit" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Search size={16} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowFilters(true)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2.5 rounded-full flex items-center justify-center transition-colors"
            >
              <Filter size={18} />
            </button>
          </form>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-2 no-scrollbar">
              {activeFilters.map((filter, index) => (
                <div
                  key={index}
                  className="bg-purple-50 text-purple-700 text-xs rounded-full px-3 py-1.5 flex items-center whitespace-nowrap border border-purple-100"
                >
                  {filter}
                  <button onClick={() => removeFilter(filter)} className="mr-1.5 hover:text-red-500">
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button
                onClick={resetFilters}
                className="text-xs text-purple-600 whitespace-nowrap px-3 py-1.5 bg-white border border-purple-200 rounded-full hover:bg-purple-50"
              >
                مسح الكل
              </button>
            </div>
          )}
        </div>

        {/* Category Tabs - Mobile Only */}
        <div className="md:hidden mb-5 overflow-x-auto no-scrollbar">
          <div className="flex bg-white rounded-full p-1 shadow-sm">
            <button
              onClick={() => {
                setActiveCategory("all")
                handleGenderChange("all")
              }}
              className={`px-4 py-2 text-sm rounded-full transition-colors ${
                activeCategory === "all" ? "bg-purple-600 text-white" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => {
                setActiveCategory("men")
                handleGenderChange("men")
              }}
              className={`px-4 py-2 text-sm rounded-full transition-colors ${
                activeCategory === "men" ? "bg-purple-600 text-white" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              رجالي
            </button>
            <button
              onClick={() => {
                setActiveCategory("women")
                handleGenderChange("women")
              }}
              className={`px-4 py-2 text-sm rounded-full transition-colors ${
                activeCategory === "women" ? "bg-purple-600 text-white" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              نسائي
            </button>
            <button
              onClick={() => {
                setActiveCategory("kids")
                handleGenderChange("kids")
              }}
              className={`px-4 py-2 text-sm rounded-full transition-colors ${
                activeCategory === "kids" ? "bg-purple-600 text-white" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              أطفال
            </button>
          </div>
        </div>

        {/* Desktop Search and Filter */}
        <div className="hidden md:block mb-6">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-4 mb-5">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="ابحث عن هدايا مميزة..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                />
                <button type="submit" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Search size={18} />
                </button>
              </div>

              <div className="relative w-56">
                <select
                  className="appearance-none w-full bg-white border border-gray-200 rounded-lg px-4 py-3 pr-8 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  value={sortBy}
                  onChange={handleSortChange}
                >
                  <option value="recommended">الأكثر شيوعاً</option>
                  <option value="price-asc">السعر: من الأقل للأعلى</option>
                  <option value="price-desc">السعر: من الأعلى للأقل</option>
                  <option value="rating">التقييم</option>
                  <option value="newest">الأحدث</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-2 text-gray-600">
                  <ChevronDown size={16} />
                </div>
              </div>
            </form>

            {/* Quick Filters */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2 text-sm rounded-full flex items-center gap-1.5 transition-colors ${
                    showFilters ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Filter size={14} className="ml-1" />
                  الفلاتر
                </button>

                {activeFilters.length > 0 && (
                  <div className="flex gap-2">
                    {activeFilters.map((filter, index) => (
                      <div
                        key={index}
                        className="bg-purple-50 text-purple-700 text-xs rounded-full px-3 py-2 flex items-center border border-purple-100"
                      >
                        {filter}
                        <button onClick={() => removeFilter(filter)} className="mr-1.5 hover:text-red-500">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={resetFilters}
                      className="text-xs text-purple-600 hover:bg-purple-50 px-3 py-2 rounded-full border border-purple-200 transition-colors"
                    >
                      مسح الكل
                    </button>
                  </div>
                )}
              </div>

              <div className="text-sm text-gray-500 font-medium">
                {!isLoading && <span>{totalProducts} هدية متاحة</span>}
              </div>
            </div>

            {/* Expanded Quick Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-5 pt-5 border-t border-gray-100"
                >
                  <div className="grid grid-cols-3 gap-8">
                    {/* Gender Filter */}
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">الجنس</h4>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleGenderChange("all")}
                          className={`px-3 py-2 text-sm rounded-full transition-colors ${
                            filterOptions.gender === "all"
                              ? "bg-purple-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          الكل
                        </button>
                        <button
                          onClick={() => handleGenderChange("men")}
                          className={`px-3 py-2 text-sm rounded-full transition-colors ${
                            filterOptions.gender === "men"
                              ? "bg-purple-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          رجالي
                        </button>
                        <button
                          onClick={() => handleGenderChange("women")}
                          className={`px-3 py-2 text-sm rounded-full transition-colors ${
                            filterOptions.gender === "women"
                              ? "bg-purple-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          نسائي
                        </button>
                        <button
                          onClick={() => handleGenderChange("kids")}
                          className={`px-3 py-2 text-sm rounded-full transition-colors ${
                            filterOptions.gender === "kids"
                              ? "bg-purple-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          أطفال
                        </button>
                      </div>
                    </div>

                    {/* Price Filter */}
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">السعر</h4>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handlePricePresetClick(10000)}
                          className={`px-3 py-2 text-sm rounded-full transition-colors ${
                            filterOptions.priceRange[1] === 10000
                              ? "bg-purple-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          الكل
                        </button>
                        {pricePresets.map((preset, index) => (
                          <button
                            key={index}
                            onClick={() => handlePricePresetClick(preset.value)}
                            className={`px-3 py-2 text-sm rounded-full transition-colors ${
                              filterOptions.priceRange[1] === preset.value
                                ? "bg-purple-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Occasion Filter */}
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">المناسبة</h4>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleOccasionChange("all")}
                          className={`px-3 py-2 text-sm rounded-full transition-colors ${
                            filterOptions.occasion === "all"
                              ? "bg-purple-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          الكل
                        </button>
                        {occasionsList.map((occasion, index) => (
                          <button
                            key={index}
                            onClick={() => handleOccasionChange(occasion)}
                            className={`px-3 py-2 text-sm rounded-full transition-colors ${
                              filterOptions.occasion === occasion
                                ? "bg-purple-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {occasion}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Recommendations - Only show one recommendations section */}
        {!isLoading && products.length > 0 && recommendedProducts.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <span className="bg-purple-100 text-purple-600 p-1.5 rounded-lg mr-2">
                  <Star size={18} fill="currentColor" />
                </span>
                رائجة الآن
              </h2>
              <Link href="/gifts" className="text-sm text-purple-600 hover:underline flex items-center">
                عرض المزيد
                <ArrowLeft size={14} className="mr-1" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {recommendedProducts.map((gift) => (
                <div
                  key={`rec-${gift.id}`}
                  onClick={() => setSelectedGift(gift)}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col cursor-pointer group"
                >
                  <div className="relative">
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                      <Image
                        src={gift.image || "/placeholder.svg?height=300&width=300"}
                        alt={gift.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                        style={{ objectFit: "cover" }}
                        className="transition-transform duration-300 group-hover:scale-105"
                      />
                      {gift.old_price && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2.5 py-1.5 rounded-lg">
                          خصم {Math.round(((gift.old_price - gift.price) / gift.old_price) * 100)}%
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-3">
                    <div className="flex justify-between items-center mb-1.5">
                      <h3 className="font-bold text-gray-800 text-sm line-clamp-1 group-hover:text-purple-600 transition-colors">
                        {gift.name}
                      </h3>
                      <div className="flex items-center text-amber-500">
                        <Star size={12} fill="#F59E0B" />
                        <span className="text-xs font-medium text-gray-700 mr-1">{gift.rating || 0}</span>
                      </div>
                    </div>
                    <div className="font-bold text-purple-600 text-sm">{gift.price} ج.م</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Visual separator between sections */}
        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-gray-50 px-4 text-sm text-gray-500">هدايا متنوعة</span>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-sm">
            <div className="w-14 h-14 border-4 border-gray-100 border-t-purple-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 font-medium">جاري تحميل الهدايا...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl p-8 text-center my-8 shadow-sm">
            <div className="flex justify-center mb-4 text-red-500">
              <X size={48} />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-3">حدث خطأ أثناء تحميل البيانات</h3>
            <p className="text-gray-600 mb-5">يرجى المحاولة مرة أخرى لاحقاً</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : products.length > 0 ? (
          <>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            >
              {products.map((gift) => (
                <motion.div
                  key={gift.id}
                  variants={itemVariants}
                  onClick={() => setSelectedGift(gift)}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col cursor-pointer group"
                >
                  <div className="relative">
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                      <Image
                        src={gift.image || "/placeholder.svg?height=300&width=300"}
                        alt={gift.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        style={{ objectFit: "cover" }}
                        className="transition-transform duration-300 group-hover:scale-105"
                      />
                      {gift.old_price && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2.5 py-1.5 rounded-lg">
                          خصم {Math.round(((gift.old_price - gift.price) / gift.old_price) * 100)}%
                        </div>
                      )}
                      <button
                        onClick={(e) => handleToggleWishlist(gift, e)}
                        className={`absolute top-2 left-2 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm transition-all ${
                          isFavorite(gift.id) ? "bg-red-500 text-white" : "bg-white/80 text-gray-600 hover:bg-white/95"
                        }`}
                      >
                        <Heart size={16} fill={isFavorite(gift.id) ? "#fff" : "none"} />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 flex-grow flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-800 text-sm line-clamp-1 group-hover:text-purple-600 transition-colors">
                        {gift.name}
                      </h3>
                      <div className="flex items-center text-amber-500">
                        <Star size={12} fill="#F59E0B" />
                        <span className="text-xs font-medium text-gray-700 mr-1">{gift.rating || 0}</span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-xs mb-3 line-clamp-2 flex-grow">{gift.description}</p>

                    <div className="flex items-center justify-between mb-3">
                      <div className="font-bold text-purple-600">{gift.price} ج.م</div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock size={12} className="ml-1" />
                        <span>توصيل سريع</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleAddToCart(gift, e)}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                    >
                      <ShoppingCart size={14} className="ml-1.5" />
                      إضافة للسلة
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-10 mb-6">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1 || isFetching}
                  className={`px-5 py-2.5 rounded-lg mr-3 font-medium transition-colors ${
                    currentPage === 1 || isFetching
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-white text-purple-600 hover:bg-purple-50 border border-purple-200"
                  }`}
                >
                  السابق
                </button>
                <div className="mx-4 bg-white px-4 py-2 rounded-lg border border-gray-200">
                  <span className="text-gray-700 font-medium">
                    صفحة {currentPage} من {totalPages}
                  </span>
                </div>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || isFetching}
                  className={`px-5 py-2.5 rounded-lg ml-3 font-medium transition-colors ${
                    currentPage === totalPages || isFetching
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-white text-purple-600 hover:bg-purple-50 border border-purple-200"
                  }`}
                >
                  التالي
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl p-8 text-center my-8 shadow-sm">
            <div className="flex justify-center mb-4">
              <Search size={48} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-3">لم نعثر على نتائج مطابقة</h3>
            <p className="text-gray-600 mb-5">يرجى تجربة مصطلحات بحث مختلفة أو تغيير خيارات التصفية.</p>
            <button
              onClick={resetFilters}
              className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <X size={16} className="ml-1.5" />
              إعادة ضبط الفلاتر
            </button>
          </div>
        )}

        {/* Footer CTA */}
        <div className="mt-10 bg-white rounded-xl p-8 text-center shadow-sm">
          <div className="max-w-md mx-auto">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center">
                <Gift className="w-7 h-7 text-purple-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">لم تجد ما تبحث عنه؟</h3>
            <p className="text-gray-600 mb-5">
              يمكنك الحصول على المزيد من الاقتراحات عن طريق التواصل مع مستشار الهدايا لدينا للحصول على توصيات مخصصة
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => router.push("/")}
                className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-lg font-medium transition-colors"
              >
                <ArrowLeft className="ml-1.5 inline-block" size={16} />
                العودة للرئيسية
              </button>
              <a 
  href="https://wa.me/+201026972523?text=أحتاج مساعدتكم في اختيار هدية مناسبة لمناسبة خاصة" 
  target="_blank" 
  rel="noopener noreferrer"
  className="flex items-center justify-center gap-2"
>
  <button className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
    المساعدة في اختيار هدية
  </button>
</a>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Filter Modal */}
      {showFilters && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
          onClick={() => setShowFilters(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-h-[85vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
            <h3 className="text-lg font-bold mb-6 text-center">تصفية النتائج</h3>

            <div className="space-y-8">
              {/* Gender Filter */}
              <div>
                <h4 className="font-bold text-gray-700 mb-3">الجنس</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleGenderChange("all")}
                    className={`px-4 py-2 text-sm rounded-full ${
                      filterOptions.gender === "all"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    الكل
                  </button>
                  <button
                    onClick={() => handleGenderChange("men")}
                    className={`px-4 py-2 text-sm rounded-full ${
                      filterOptions.gender === "men"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    رجالي
                  </button>
                  <button
                    onClick={() => handleGenderChange("women")}
                    className={`px-4 py-2 text-sm rounded-full ${
                      filterOptions.gender === "women"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    نسائي
                  </button>
                  <button
                    onClick={() => handleGenderChange("kids")}
                    className={`px-4 py-2 text-sm rounded-full ${
                      filterOptions.gender === "kids"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    أطفال
                  </button>
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <h4 className="font-bold text-gray-700 mb-3">السعر</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handlePricePresetClick(10000)}
                    className={`px-4 py-2 text-sm rounded-full ${
                      filterOptions.priceRange[1] === 10000
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    الكل
                  </button>
                  {pricePresets.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => handlePricePresetClick(preset.value)}
                      className={`px-4 py-2 text-sm rounded-full ${
                        filterOptions.priceRange[1] === preset.value
                          ? "bg-purple-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="mt-5 px-2">
                  <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>السعر الأقصى: {filterOptions.priceRange[1]} ج.م</span>
                  </div>
                  <input
                    type="range"
                    min="200"
                    max="10000"
                    step="100"
                    value={filterOptions.priceRange[1]}
                    onChange={handlePriceRangeChange}
                    className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-purple-600"
                  />
                </div>
              </div>

              {/* Occasion Filter */}
              <div>
                <h4 className="font-bold text-gray-700 mb-3">المناسبة</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleOccasionChange("all")}
                    className={`px-4 py-2 text-sm rounded-full ${
                      filterOptions.occasion === "all"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    الكل
                  </button>
                  {occasionsList.map((occasion, index) => (
                    <button
                      key={index}
                      onClick={() => handleOccasionChange(occasion)}
                      className={`px-4 py-2 text-sm rounded-full ${
                        filterOptions.occasion === occasion
                          ? "bg-purple-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {occasion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <h4 className="font-bold text-gray-700 mb-3">ترتيب حسب</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSortBy("recommended")}
                    className={`px-4 py-2 text-sm rounded-full ${
                      sortBy === "recommended"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    الأكثر شيوعاً
                  </button>
                  <button
                    onClick={() => setSortBy("price-asc")}
                    className={`px-4 py-2 text-sm rounded-full ${
                      sortBy === "price-asc"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    السعر: الأقل أولاً
                  </button>
                  <button
                    onClick={() => setSortBy("price-desc")}
                    className={`px-4 py-2 text-sm rounded-full ${
                      sortBy === "price-desc"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    السعر: الأعلى أولاً
                  </button>
                  <button
                    onClick={() => setSortBy("rating")}
                    className={`px-4 py-2 text-sm rounded-full ${
                      sortBy === "rating" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    التقييم
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-10">
              <button
                onClick={resetFilters}
                className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-lg font-medium transition-colors"
              >
                إعادة ضبط
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
              >
                عرض النتائج ({totalProducts})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gift Detail Modal */}
      <AnimatePresence>
        {selectedGift && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedGift(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto"
            >
              <div className="sticky top-0 z-10 flex justify-between items-center p-4 bg-white border-b">
                <h3 className="text-lg font-bold text-gray-800">{selectedGift.name}</h3>
                <button onClick={() => setSelectedGift(null)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative">
                    <Image
                      src={selectedGift.image || "/placeholder.svg?height=500&width=500"}
                      alt={selectedGift.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      style={{ objectFit: "cover" }}
                    />
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center mb-4">
                      <div className="flex items-center text-amber-500 mr-4">
                        <Star size={18} fill="#F59E0B" />
                        <span className="font-bold ml-1">{selectedGift.rating || 0}</span>
                        <span className="text-gray-500 text-sm mr-1">(120)</span>
                      </div>
                      <div className="text-gray-500 text-sm">ماركة: {selectedGift.brand || "متجرنا"}</div>
                    </div>

                    <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium inline-block mb-3 w-fit">
                      {selectedGift.category === "men"
                        ? "هدية رجالية"
                        : selectedGift.category === "women"
                          ? "هدية نسائية"
                          : "هدية للأطفال"}
                    </div>

                    <div className="text-2xl font-bold text-purple-600 mb-4">
                      {selectedGift.price} ج.م
                      {selectedGift.old_price && (
                        <span className="text-sm text-gray-500 line-through mr-2">{selectedGift.old_price} ج.م</span>
                      )}
                    </div>

                    <p className="text-gray-700 mb-5">{selectedGift.description}</p>

                    <div className="grid grid-cols-2 gap-3 mb-5 bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center text-gray-600 text-sm">
                        <Clock className="ml-2" size={16} />
                        <span>توصيل سريع </span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <Check className="ml-2" size={16} />
                        <span>ضمان جودة المنتج</span>
                      </div>
                    </div>

                    {selectedGift.tags && selectedGift.tags.length > 0 && (
                      <div className="mb-5">
                        <h4 className="font-bold text-gray-700 mb-2">المميزات:</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedGift.tags.map((tag, idx) => (
                            <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-auto flex flex-col sm:flex-row gap-3">
                      <button
                        className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-bold transition-colors shadow-sm flex-grow flex items-center justify-center"
                        onClick={() => {
                          handleAddToCart(selectedGift)
                          setSelectedGift(null)
                        }}
                      >
                        <ShoppingCart size={18} className="ml-2" />
                        إضافة للسلة
                      </button>

                      <button
                        className={`border py-3 px-4 rounded-lg font-bold transition-colors flex items-center justify-center ${
                          isFavorite(selectedGift.id)
                            ? "bg-red-50 text-red-600 border-red-200"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                        onClick={() => handleToggleWishlist(selectedGift)}
                      >
                        <Heart
                          size={18}
                          className="ml-2"
                          fill={isFavorite(selectedGift.id) ? "currentColor" : "none"}
                        />
                        {isFavorite(selectedGift.id) ? "إزالة من المفضلة" : "أضف للمفضلة"}
                      </button>
                    </div>

                    <div className="mt-4 text-sm text-center">
                      {selectedGift.stock ? (
                        selectedGift.stock < 10 ? (
                          <span className="text-red-500 font-medium">متبقي {selectedGift.stock} فقط!</span>
                        ) : (
                          <span className="text-green-600 font-medium">متوفر</span>
                        )
                      ) : (
                        <span className="text-red-500 font-medium">غير متوفر حالياً</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ToastContainer
        position="bottom-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Footer />
    </div>
  )
}

export default GiftResultsPage
