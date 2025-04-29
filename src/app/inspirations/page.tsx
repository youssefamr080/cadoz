"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Star, Copy, Eye, Filter, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Inspiration } from "@/types/inspiration"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

export default function InspirationsPage() {

  const [inspirations, setInspirations] = useState<Inspiration[]>([])
  const [filteredInspirations, setFilteredInspirations] = useState<Inspiration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [ratingFilter, setRatingFilter] = useState<number>(0)
  const [sortBy, setSortBy] = useState<string>("popularity")

  // Fetch all inspirations
  useEffect(() => {
    const fetchInspirations = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/gift/inspirations?all=true")
        const result = await response.json()
        
        if (result.success) {
          setInspirations(result.data)
          setFilteredInspirations(result.data)
        } else {
          throw new Error(result.error || "حدث خطأ أثناء جلب البيانات")
        }
      } catch (err) {
        console.error("Error loading inspirations:", err)
        setError("حدث خطأ أثناء تحميل هدايا الإلهام. يرجى المحاولة مرة أخرى.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchInspirations()
  }, [])

  // Filter inspirations based on category, search query, and other filters
  useEffect(() => {
    if (inspirations.length === 0) return

    let filtered = [...inspirations]

    // Filter by category
    if (activeCategory !== "all") {
      filtered = filtered.filter(item => item.category === activeCategory)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        item => item.name.toLowerCase().includes(query) || 
                item.description.toLowerCase().includes(query)
      )
    }

    // Filter by price range
    filtered = filtered.filter(() => {
      // Calculate total price of the inspiration (simplified)
      const totalPrice = 300 // Placeholder - in a real app, you'd calculate this from the components
      return totalPrice >= priceRange[0] && totalPrice <= priceRange[1]
    })

    // Filter by rating
    if (ratingFilter > 0) {
      filtered = filtered.filter(item => item.rating >= ratingFilter)
    }

    // Sort the results
    switch (sortBy) {
      case "price_asc":
        filtered.sort(() => 300 - 300) // Placeholder - would use actual prices
        break
      case "price_desc":
        filtered.sort(() => 300 - 300) // Placeholder - would use actual prices
        break
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case "newest":
        // Assuming newer items have higher IDs or there's a createdAt field
        filtered.sort((a, b) => b.id.localeCompare(a.id))
        break
      case "popularity":
      default:
        // Sort by a combination of rating and reviews
        filtered.sort((a, b) => (b.rating * b.reviews) - (a.rating * a.reviews))
        break
    }

    setFilteredInspirations(filtered)
  }, [inspirations, activeCategory, searchQuery, priceRange, ratingFilter, sortBy])

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category)
  }

  const clearFilters = () => {
    setActiveCategory("all")
    setSearchQuery("")
    setPriceRange([0, 1000])
    setRatingFilter(0)
    setSortBy("popularity")
    setIsFilterOpen(false)
  }

  // Get category name in Arabic
  const getCategoryArabicName = (categoryName: string): string => {
    const names: Record<string, string> = {
      all: "الكل",
      men: "رجالي",
      women: "نسائي",
      kids: "أطفال",
    }
    return names[categoryName as keyof typeof names] || categoryName
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-2 gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">هدايا الإلهام الجاهزة</h1>
            <Link 
              href="/"
              className="text-purple-600 hover:text-purple-800 transition-colors text-sm font-medium flex items-center self-end sm:self-auto"
            >
              العودة للرئيسية
            </Link>
          </div>
          <p className="text-gray-600 max-w-3xl">
            اختر من مجموعة متنوعة من هدايا الإلهام الجاهزة المصممة بعناية لمختلف المناسبات والفئات. يمكنك استخدام أي من هذه الهدايا كنقطة بداية لتخصيص هديتك الخاصة.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col gap-3 mb-3 sm:mb-4">
            <div className="flex flex-col gap-2">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">تصفية حسب:</h2>
              <Tabs 
                defaultValue="all" 
                value={activeCategory}
                onValueChange={handleCategoryChange}
                className="w-full"
              >
                <TabsList className="bg-gray-100 w-full h-auto p-1 flex justify-between">
                  <TabsTrigger value="all" className="text-xs sm:text-sm flex-1 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                    الكل
                  </TabsTrigger>
                  <TabsTrigger value="men" className="text-xs sm:text-sm flex-1 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                    رجالي
                  </TabsTrigger>
                  <TabsTrigger value="women" className="text-xs sm:text-sm flex-1 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                    نسائي
                  </TabsTrigger>
                  <TabsTrigger value="kids" className="text-xs sm:text-sm flex-1 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                    أطفال
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex flex-col gap-3">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="بحث عن هدية..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-10 py-2 w-full text-sm"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1 text-xs sm:text-sm flex-1"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                  <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
                  فلترة متقدمة
                </Button>

                {(activeCategory !== "all" || searchQuery || ratingFilter > 0 || sortBy !== "popularity") && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={clearFilters}
                    className="text-purple-600 hover:text-purple-800 text-xs sm:text-sm flex-1"
                  >
                    مسح الفلاتر
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="border-t pt-3 mt-2">
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">السعر</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="من"
                          className="w-full border border-gray-200 rounded px-2 py-1 text-xs sm:text-sm"
                          value={priceRange[0]}
                          onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                        />
                        <span className="text-gray-400">-</span>
                        <input
                          type="number"
                          placeholder="إلى"
                          className="w-full border border-gray-200 rounded px-2 py-1 text-xs sm:text-sm"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 1000])}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">التقييم</label>
                      <select 
                        className="w-full border border-gray-200 rounded px-2 py-1 text-xs sm:text-sm"
                        value={ratingFilter}
                        onChange={(e) => setRatingFilter(parseInt(e.target.value))}
                      >
                        <option value="0">جميع التقييمات</option>
                        <option value="5">5 نجوم</option>
                        <option value="4">4 نجوم وأعلى</option>
                        <option value="3">3 نجوم وأعلى</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">ترتيب حسب</label>
                      <select 
                        className="w-full border border-gray-200 rounded px-2 py-1 text-xs sm:text-sm"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                      >
                        <option value="popularity">الأكثر شعبية</option>
                        <option value="price_asc">السعر: من الأقل للأعلى</option>
                        <option value="price_desc">السعر: من الأعلى للأقل</option>
                        <option value="rating">التقييم</option>
                        <option value="newest">الأحدث</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-between sm:justify-end mt-3 sm:mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsFilterOpen(false)}
                      className="text-xs sm:text-sm flex-1 sm:flex-none sm:mr-2"
                    >
                      إغلاق
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => setIsFilterOpen(false)}
                      className="bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm flex-1 sm:flex-none"
                    >
                      تطبيق الفلترة
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600">
            {!isLoading && (
              <span>
                تم العثور على <span className="font-semibold">{filteredInspirations.length}</span> هدية
                {activeCategory !== "all" && (
                  <span> في فئة <span className="font-semibold">{getCategoryArabicName(activeCategory)}</span></span>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Inspirations Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm">
                <Skeleton className="aspect-square w-full" />
                <div className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-5/6 mb-4" />
                  <div className="flex justify-between">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center p-12 bg-white rounded-lg shadow-sm">
            <div className="text-red-500 mb-2 text-lg">{error}</div>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              إعادة المحاولة
            </Button>
          </div>
        ) : filteredInspirations.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-lg shadow-sm">
            <div className="text-gray-500 mb-2">لا توجد هدايا تطابق معايير البحث الخاصة بك</div>
            <Button 
              onClick={clearFilters}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              مسح الفلاتر
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {filteredInspirations.map((gift) => (
              <motion.div
                key={gift.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-square bg-gray-100">
                  <Image 
                    src={gift.image || "/placeholder.svg"} 
                    alt={gift.name} 
                    fill 
                    className="object-cover"
                  />
                  
                  {/* Category Badge */}
                  {gift.category && (
                    <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                      {getCategoryArabicName(gift.category)}
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900 line-clamp-1">{gift.name}</h3>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-medium ml-1">{gift.rating}</span>
                      <span className="text-xs text-gray-500 ml-1">({gift.reviews})</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{gift.description}</p>

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="text-xs"
                    >
                      <Link href={`/inspiration/${gift.id}`}>
                        <Eye className="w-3 h-3 mr-1" />
                        عرض الهدية
                      </Link>
                    </Button>

                    <Button
                      size="sm"
                      asChild
                      className="text-xs bg-purple-600 hover:bg-purple-700 flex items-center justify-center gap-1"
                    >
                      <Link href={`/inspiration/${gift.id}`}>
                        <Copy className="w-3 h-3" />
                        استخدام هذه الهدية
                      </Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
