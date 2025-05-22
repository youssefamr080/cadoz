"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Filter, Search, X, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Inspiration } from "@/types/inspiration"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import InspirationCard from "./InspirationCard"

// Fuzzy search utility functions
const removeDiacritics = (str: string): string => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

// Calculate Levenshtein distance for fuzzy matching
const levenshteinDistance = (a: string, b: string): number => {
  const matrix = []

  // Increment along the first column of each row
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }

  // Increment each column in the first row
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        )
      }
    }
  }

  return matrix[b.length][a.length]
}

// Calculate similarity score between two strings (0-1)
const stringSimilarity = (str1: string, str2: string): number => {
  if (!str1 || !str2) return 0
  
  const s1 = removeDiacritics(str1.toLowerCase())
  const s2 = removeDiacritics(str2.toLowerCase())
  
  // Exact match gets highest score
  if (s1 === s2) return 1
  
  // Check if one string contains the other
  if (s1.includes(s2)) return 0.9
  if (s2.includes(s1)) return 0.8
  
  const maxLen = Math.max(s1.length, s2.length)
  if (maxLen === 0) return 1.0 // Both strings are empty
  
  // Calculate normalized Levenshtein distance
  const distance = levenshteinDistance(s1, s2)
  return 1 - (distance / maxLen)
}

// Calculate relevance score for an inspiration based on search terms
const calculateRelevance = (inspiration: Inspiration, searchTerms: string[]): number => {
  if (!searchTerms.length) return 0
  
  let totalScore = 0
  const fields = [
    { value: inspiration.name || "", weight: 10 },
    { value: inspiration.description || "", weight: 5 },
    { value: (inspiration.occasions || []).join(" "), weight: 8 },
    { value: (inspiration.tags || []).join(" "), weight: 7 },
    { value: inspiration.category || "", weight: 6 }
  ]
  
  // Calculate score for each search term against each field
  for (const term of searchTerms) {
    let termScore = 0
    
    for (const field of fields) {
      const similarity = stringSimilarity(term, field.value)
      termScore += similarity * field.weight
      
      // Boost score for exact matches in any field
      if (field.value.toLowerCase().includes(term.toLowerCase())) {
        termScore += field.weight * 0.5
      }
    }
    
    totalScore += termScore
  }
  
  // Normalize score based on number of terms
  return totalScore / searchTerms.length
}

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
  const [sortBy, setSortBy] = useState<string>("relevance")
  const [searchMode, setSearchMode] = useState<"standard" | "fuzzy">("fuzzy")
  
  // New state for occasions and tags filtering
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [availableOccasions, setAvailableOccasions] = useState<string[]>([])
  const [availableTags, setAvailableTags] = useState<string[]>([])
  
  // State for search results with relevance scores
  const [searchResults, setSearchResults] = useState<Array<{inspiration: Inspiration, score: number}>>([])
  const [searchTerms, setSearchTerms] = useState<string[]>([])

  // Add URL parameter handling
  useEffect(() => {
    // Get URL parameters
    const searchParams = new URLSearchParams(window.location.search)
    const priceRangeParam = searchParams.get('priceRange')
    
    // Apply price range filter if present
    if (priceRangeParam) {
      const [min, max] = priceRangeParam.split('-').map(Number)
      if (!isNaN(min) && !isNaN(max)) {
        setPriceRange([min, max])
      }
    }

    // Check localStorage for saved filter options
    const savedFilters = localStorage.getItem("giftFilterOptions")
    if (savedFilters) {
      try {
        const filters = JSON.parse(savedFilters)
        if (filters.priceRange) {
          setPriceRange(filters.priceRange)
        }
        if (filters.sortBy) {
          setSortBy(filters.sortBy)
        }
      } catch (error) {
        console.error("Error parsing saved filters:", error)
      }
    }
  }, [])

  // Fetch all inspirations
  useEffect(() => {
    const fetchInspirations = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/gift/inspirations?all=true")
        const result = await response.json()
        
        if (result.success) {
          const inspirationsData = result.data
          setInspirations(inspirationsData)
          setFilteredInspirations(inspirationsData)
          
          // Extract unique occasions and tags from all inspirations
          const allOccasions = new Set<string>()
          const allTags = new Set<string>()
          
          inspirationsData.forEach((inspiration: Inspiration) => {
            // Add occasions to set
            if (inspiration.occasions && Array.isArray(inspiration.occasions)) {
              inspiration.occasions.forEach(occasion => {
                if (occasion) allOccasions.add(occasion)
              })
            }
            
            // Add tags to set
            if (inspiration.tags && Array.isArray(inspiration.tags)) {
              inspiration.tags.forEach(tag => {
                if (tag) allTags.add(tag)
              })
            }
          })
          
          // Convert sets to sorted arrays
          setAvailableOccasions(Array.from(allOccasions).sort())
          setAvailableTags(Array.from(allTags).sort())
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

  // Process search query and extract search terms
  useEffect(() => {
    if (!searchQuery) {
      setSearchTerms([])
      return
    }
    
    const query = searchQuery.toLowerCase().trim()
    // Split the query into individual terms for more precise matching
    const terms = query.split(/\s+/).filter(term => term.length > 0)
    setSearchTerms(terms)
  }, [searchQuery])
  
  // Filter inspirations based on category, search query, occasions, tags, and other filters
  useEffect(() => {
    if (inspirations.length === 0) return

    let filtered = [...inspirations]
    let scoredResults: Array<{inspiration: Inspiration, score: number}> = []

    // Filter by category
    if (activeCategory !== "all") {
      filtered = filtered.filter(item => item.category === activeCategory)
    }

    // Advanced search functionality with fuzzy matching and relevance scoring
    if (searchTerms.length > 0) {
      // Calculate relevance scores for all inspirations
      scoredResults = filtered.map(inspiration => ({
        inspiration,
        score: calculateRelevance(inspiration, searchTerms)
      }))
      
      if (searchMode === "fuzzy") {
        // Keep only results with a minimum relevance score
        scoredResults = scoredResults.filter(result => result.score > 0.15)
        
        // Sort by relevance score
        scoredResults.sort((a, b) => b.score - a.score)
        
        // Extract just the inspirations for further filtering
        filtered = scoredResults.map(result => result.inspiration)
      } else {
        // Standard search mode - exact matching only
        filtered = filtered.filter(item => {
          return searchTerms.some(term => {
            const nameMatch = item.name?.toLowerCase().includes(term)
            const descMatch = item.description?.toLowerCase().includes(term)
            const occasionMatch = item.occasions?.some(occasion => 
              occasion?.toLowerCase().includes(term)
            )
            const tagMatch = item.tags?.some(tag => 
              tag?.toLowerCase().includes(term)
            )
            
            return nameMatch || descMatch || occasionMatch || tagMatch
          })
        })
      }
    } else {
      // No search terms, reset scored results
      scoredResults = filtered.map(inspiration => ({
        inspiration,
        score: 0
      }))
    }
    
    // Filter by occasions
    if (selectedOccasions.length > 0) {
      filtered = filtered.filter(item => {
        if (!item.occasions || !Array.isArray(item.occasions)) return false
        // Check if any of the selected occasions match this item's occasions
        return selectedOccasions.some(selectedOccasion => 
          item.occasions?.includes(selectedOccasion)
        )
      })
      
      // Update scored results to match filtered items
      scoredResults = scoredResults.filter(result => 
        filtered.some(item => item.id === result.inspiration.id)
      )
    }
    
    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(item => {
        if (!item.tags || !Array.isArray(item.tags)) return false
        // Check if any of the selected tags match this item's tags
        return selectedTags.some(selectedTag => 
          item.tags?.includes(selectedTag)
        )
      })
      
      // Update scored results to match filtered items
      scoredResults = scoredResults.filter(result => 
        filtered.some(item => item.id === result.inspiration.id)
      )
    }

    // Filter by price range
    filtered = filtered.filter((item) => {
      // Calculate total price of the inspiration
      const totalPrice = item.price || 0; // Use the price field if available
      return totalPrice >= priceRange[0] && totalPrice <= priceRange[1];
    });
    
    // Update scored results to match filtered items
    scoredResults = scoredResults.filter(result => 
      filtered.some(item => item.id === result.inspiration.id)
    )

    // Filter by rating
    if (ratingFilter > 0) {
      filtered = filtered.filter(item => item.rating >= ratingFilter)
      
      // Update scored results to match filtered items
      scoredResults = scoredResults.filter(result => 
        filtered.some(item => item.id === result.inspiration.id)
      )
    }

    // Sort the results
    switch (sortBy) {
      case "relevance":
        // If we have search terms, sort by relevance score
        if (searchTerms.length > 0) {
          // Already sorted by score in scoredResults
          filtered = scoredResults.map(result => result.inspiration)
        } else {
          // Default to popularity if no search terms
          filtered.sort((a, b) => {
            const aPopularity = (a.rating * (a.reviews || 1)) + (a.likes || 0) + (a.comments?.length || 0)
            const bPopularity = (b.rating * (b.reviews || 1)) + (b.likes || 0) + (b.comments?.length || 0)
            return bPopularity - aPopularity
          })
        }
        break
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
        // Sort by updatedAt if available, otherwise by ID
        filtered.sort((a, b) => {
          // Check if updatedAt exists and convert to comparable format
          const aDate = a.updatedAt ? 
            (typeof a.updatedAt === 'string' ? a.updatedAt : a.updatedAt.$date?.$numberLong) : 
            a.id
          const bDate = b.updatedAt ? 
            (typeof b.updatedAt === 'string' ? b.updatedAt : b.updatedAt.$date?.$numberLong) : 
            b.id
          
          // Compare as strings if not directly comparable
          return String(bDate).localeCompare(String(aDate))
        })
        break
      case "popularity":
        // Sort by a combination of rating, reviews, likes, and comments
        filtered.sort((a, b) => {
          const aPopularity = (a.rating * (a.reviews || 1)) + (a.likes || 0) + (a.comments?.length || 0)
          const bPopularity = (b.rating * (b.reviews || 1)) + (b.likes || 0) + (b.comments?.length || 0)
          return bPopularity - aPopularity
        })
        break
    }

    // Update state
    setFilteredInspirations(filtered)
    setSearchResults(scoredResults)
  }, [inspirations, activeCategory, searchTerms, searchMode, priceRange, ratingFilter, sortBy, selectedOccasions, selectedTags])

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category)
  }

  const clearFilters = () => {
    setActiveCategory("all")
    setSearchQuery("")
    setPriceRange([0, 1000])
    setRatingFilter(0)
    setSortBy("popularity")
    setSelectedOccasions([])
    setSelectedTags([])
    setIsFilterOpen(false)
    // Clear saved filters from localStorage
    localStorage.removeItem("giftFilterOptions")
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
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                    <button 
                      onClick={() => setSearchMode(searchMode === "fuzzy" ? "standard" : "fuzzy")}
                      className={`p-1 rounded-full ${searchMode === "fuzzy" ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
                      title={searchMode === "fuzzy" ? "البحث الذكي مفعل" : "تفعيل البحث الذكي"}
                    >
                      <Sparkles className="h-3 w-3" />
                    </button>
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="text-gray-400 hover:text-gray-600"
                      title="مسح البحث"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
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

                {(activeCategory !== "all" || searchQuery || ratingFilter > 0 || sortBy !== "popularity" || selectedOccasions.length > 0 || selectedTags.length > 0) && (
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
                    {/* Occasions Filter */}
                    {availableOccasions.length > 0 && (
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">المناسبة</label>
                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-gray-200 rounded bg-white">
                          {availableOccasions.map((occasion) => (
                            <div 
                              key={occasion}
                              className={`text-xs cursor-pointer px-2 py-1 rounded-full transition-colors ${selectedOccasions.includes(occasion) 
                                ? 'bg-purple-600 text-white' 
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                              onClick={() => {
                                if (selectedOccasions.includes(occasion)) {
                                  setSelectedOccasions(selectedOccasions.filter(o => o !== occasion))
                                } else {
                                  setSelectedOccasions([...selectedOccasions, occasion])
                                }
                              }}
                            >
                              {occasion}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tags Filter */}
                    {availableTags.length > 0 && (
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">الكلمات المفتاحية</label>
                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-gray-200 rounded bg-white">
                          {availableTags.map((tag) => (
                            <div 
                              key={tag}
                              className={`text-xs cursor-pointer px-2 py-1 rounded-full transition-colors ${selectedTags.includes(tag) 
                                ? 'bg-purple-600 text-white' 
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                              onClick={() => {
                                if (selectedTags.includes(tag)) {
                                  setSelectedTags(selectedTags.filter(t => t !== tag))
                                } else {
                                  setSelectedTags([...selectedTags, tag])
                                }
                              }}
                            >
                              {tag}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

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
                        <option value="relevance">الصلة بالبحث</option>
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

        {/* Results Count and Active Filters */}
        <div className="flex flex-col gap-2 mb-4">
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
          
          {/* Active Filters Display */}
          {(searchQuery || selectedOccasions.length > 0 || selectedTags.length > 0 || ratingFilter > 0) && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-gray-500">الفلاتر النشطة:</span>
              
              {/* Search Query */}
              {searchQuery && (
                <div className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <span>بحث: {searchQuery}</span>
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="hover:text-purple-900 text-purple-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              
              {/* Occasions */}
              {selectedOccasions.map(occasion => (
                <div key={`occasion-${occasion}`} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <span>مناسبة: {occasion}</span>
                  <button 
                    onClick={() => setSelectedOccasions(selectedOccasions.filter(o => o !== occasion))}
                    className="hover:text-blue-900 text-blue-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              
              {/* Tags */}
              {selectedTags.map(tag => (
                <div key={`tag-${tag}`} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <span>كلمة مفتاحية: {tag}</span>
                  <button 
                    onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))}
                    className="hover:text-green-900 text-green-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              
              {/* Rating */}
              {ratingFilter > 0 && (
                <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <span>التقييم: {ratingFilter}+ نجوم</span>
                  <button 
                    onClick={() => setRatingFilter(0)}
                    className="hover:text-yellow-900 text-yellow-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              
              {/* Clear All Button */}
              <button 
                onClick={clearFilters}
                className="text-xs text-red-600 hover:text-red-800 underline"
              >
                مسح الكل
              </button>
            </div>
          )}
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
            <div className="text-gray-500 mb-2 text-lg">لم يتم العثور على هدايا مطابقة</div>
            <Button 
              onClick={clearFilters}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              مسح الفلاتر
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {filteredInspirations.map((gift) => {
              // Find the relevance score for this gift
              const resultItem = searchResults.find(item => item.inspiration.id === gift.id);
              const relevanceScore = resultItem?.score || 0;
              
              return (
                <motion.div
                  key={gift.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <InspirationCard 
                    gift={gift} 
                    getCategoryArabicName={getCategoryArabicName}
                    searchTerms={searchTerms}
                    relevanceScore={relevanceScore}
                    showRelevance={searchTerms.length > 0 && searchMode === "fuzzy"}
                  />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  )
}
