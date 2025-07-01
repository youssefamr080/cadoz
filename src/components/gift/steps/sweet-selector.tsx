"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useDispatch, useSelector } from "react-redux"
import { addSelectedSweet, removeSelectedSweet, updateSelectedSweetQuantity } from "@/lib/redux/slices/giftSlice"
import type { RootState, AppDispatch } from "@/lib/redux/store"
import { Button } from "@/components/ui/button"
import { Plus, Minus, Search } from "lucide-react"
import { getAllSweets } from "@/lib/actions/sweet-actions"
import type { Sweet } from "@/types/database"
import Image from "next/image"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"

const sweetCategories = [
  { id: "chocolate", name: "شوكولاتة", description: "شوكولاتة بأنواعها المختلفة" },
  { id: "candy", name: "كاندي", description: "حلويات ملونة ولذيذة" },
  { id: "chips", name: "شيبس", description: "شيبس ومقرمشات متنوعة" },
]

export default function SweetSelector() {
  const dispatch = useDispatch<AppDispatch>()
  const selectedSweets = useSelector((state: RootState) => state.gift.selectedSweets) || []
  const [category, setCategory] = useState("chocolate")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({})
  const [sweets, setSweets] = useState<Sweet[]>([])
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSweets = async () => {
      try {
        setIsPageLoading(true)
        const data = await getAllSweets()
        console.log('🍬 Loaded sweets data:', data)
        console.log('📊 Total sweets:', data.length)
        console.log('📁 Categories found:', [...new Set(data.map(s => s.category))])
        setSweets(data)
        setError(null)
      } catch (err) {
        console.error("Error loading sweets:", err)
        setError("حدث خطأ أثناء تحميل الحلويات. يرجى المحاولة مرة أخرى.")
      } finally {
        setIsPageLoading(false)
      }
    }

    fetchSweets()
  }, [])

  const handleAddSweet = (sweet: Sweet) => {
    setIsLoading((prev: Record<string, boolean>) => ({ ...prev, [sweet.id]: true }))
    setTimeout(() => {
      dispatch(addSelectedSweet(sweet))
      setIsLoading((prev: Record<string, boolean>) => ({ ...prev, [sweet.id]: false }))
    }, 300)
  }

  const handleRemoveSweet = (sweetId: string) => {
    dispatch(removeSelectedSweet(sweetId))
  }

  const handleQuantityChange = (sweetId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveSweet(sweetId)
    } else {
      dispatch(updateSelectedSweetQuantity({ id: sweetId, quantity }))
    }
  }

  const getSelectedSweetQuantity = (sweetId: string) => {
    const selectedSweet = selectedSweets?.find(s => s.id === sweetId)
    return selectedSweet?.quantity || 0
  }

  // دالة فلترة الحلويات حسب النوع والبحث
  const getFilteredSweets = () => {
    console.log('🔍 Starting getFilteredSweets')
    console.log('🔍 Total sweets:', sweets?.length || 0)
    console.log('🔍 Selected category:', category)
    console.log('🔍 Search term:', searchTerm)
    
    if (!sweets || sweets.length === 0) {
      console.log('❌ No sweets available')
      return []
    }
    
    const filtered = sweets.filter((sweet) => {
      const sweetCategory = sweet.category?.trim() || ""
      const sweetName = sweet.name?.toLowerCase() || ""
      const sweetDesc = sweet.description?.toLowerCase() || ""
      const searchLower = searchTerm.toLowerCase().trim()
      
      // Log each sweet for debugging
      console.log(`🍬 Checking: ${sweet.name} | Category: "${sweetCategory}" | Stock: ${sweet.stock}`)
      
      // فلترة حسب الفئة (مطابقة دقيقة للقيم العربية)
      let categoryMatch = false
      if (category === "chocolate") {
        categoryMatch = sweetCategory === "شوكولاتة" || sweetCategory === "شوكولاته"
      } else if (category === "candy") {
        categoryMatch = sweetCategory === "حلوى" || sweetCategory === "كاندي" || sweetCategory === "حلويات"
      } else if (category === "chips") {
        categoryMatch = sweetCategory === "شيبس"
      } else {
        categoryMatch = true // للحالات غير المتوقعة
      }
      
      // فلترة حسب البحث (إذا كان هناك نص بحث)
      let searchMatch = true
      if (searchLower) {
        searchMatch = sweetName.includes(searchLower) || 
                     sweetDesc.includes(searchLower) ||
                     sweetCategory.toLowerCase().includes(searchLower)
      }
      
      const matches = categoryMatch && searchMatch && sweet.stock > 0
      console.log(`   → Category match: ${categoryMatch}, Search match: ${searchMatch}, Stock: ${sweet.stock}, Final: ${matches}`)
      
      return matches
    })
    
    console.log(`✅ Filtered result: ${filtered.length} sweets`)
    console.log('📝 Filtered sweets:', filtered.map(s => `${s.name} (${s.category})`))
    
    return filtered
  }

  // دالة للحصول على عدد الحلويات في كل فئة (مع مراعاة البحث)
  const getSweetCountForCategory = (categoryId: string) => {
    if (!sweets || sweets.length === 0) return 0
    
    const count = sweets.filter((sweet) => {
      const sweetCategory = sweet.category?.trim() || ""
      const sweetName = sweet.name?.toLowerCase() || ""
      const sweetDesc = sweet.description?.toLowerCase() || ""
      const searchLower = searchTerm.toLowerCase().trim()
      
      // فلترة حسب الفئة (مطابقة دقيقة للقيم العربية)
      let categoryMatch = false
      if (categoryId === "chocolate") {
        categoryMatch = sweetCategory === "شوكولاتة" || sweetCategory === "شوكولاته"
      } else if (categoryId === "candy") {
        categoryMatch = sweetCategory === "كاندي" || sweetCategory === "حلويات"
      } else if (categoryId === "chips") {
        categoryMatch = sweetCategory === "شيبس"
      } else {
        categoryMatch = true
      }
      
      // فلترة حسب البحث (إذا كان هناك نص بحث)
      let searchMatch = true
      if (searchLower) {
        searchMatch = sweetName.includes(searchLower) || 
                     sweetDesc.includes(searchLower) ||
                     sweetCategory.toLowerCase().includes(searchLower)
      }
      
      return categoryMatch && searchMatch && sweet.stock > 0
    }).length
    
    console.log(`📊 Count for ${categoryId}: ${count}`)
    return count
  }

  const filteredSweets = getFilteredSweets()
  
  // تسجيل معلومات للتشخيص
  console.log('🔍 Filter Debug:', {
    totalSweets: sweets.length,
    selectedCategory: category,
    searchTerm: searchTerm,
    filteredCount: filteredSweets.length,
    categoryCounts: {
      chocolate: getSweetCountForCategory('chocolate'),
      candy: getSweetCountForCategory('candy'),
      chips: getSweetCountForCategory('chips')
    }
  })

  return (
    <div className="space-y-8">
      {/* العنوان والوصف */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-pink-600 mb-4 shadow-lg">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent mb-3">
          اختر الحلويات والسناكس
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
          أضف حلويات لذيذة ومتنوعة لهديتك لتجعلها أكثر حلاوة وجاذبية
        </p>
      </motion.div>

      {/* فئات الحلويات */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tabs value={category} onValueChange={setCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100/50 p-1 rounded-2xl border border-gray-200 shadow-sm">
            {sweetCategories.map((cat) => (
              <TabsTrigger
                key={cat.id}
                value={cat.id}
                className="rounded-xl py-4 px-6 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-pink-600 transition-all duration-300 relative overflow-hidden"
              >
                <div className="flex flex-col items-center gap-1 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{cat.name}</span>
                    <span className="bg-pink-100 text-pink-600 text-xs px-2 py-0.5 rounded-full font-medium">
                      {getSweetCountForCategory(cat.id)}
                    </span>
                  </div>
                  <span className="text-xs opacity-70">{cat.description}</span>
                </div>
                {category === cat.id && (
                  <motion.div
                    layoutId="activeSweetCategory"
                    className="absolute inset-0 bg-gradient-to-r from-pink-50 to-orange-50 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </motion.div>

      {/* مربع البحث */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative"
      >
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="ابحث عن حلوى معينة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all duration-300"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </motion.div>

      {isPageLoading ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center min-h-[300px] space-y-4"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-orange-500 rounded-full animate-spin animation-delay-75"></div>
          </div>
          <div className="text-center">
            <p className="text-gray-600 font-medium">جاري تحميل الحلويات...</p>
            <p className="text-gray-400 text-sm mt-1">الرجاء الانتظار</p>
          </div>
        </motion.div>
      ) : error ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 bg-red-50 rounded-2xl border border-red-200"
        >
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-600 font-medium">{error}</p>
        </motion.div>
      ) : sweets.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 bg-gray-50 rounded-2xl border border-gray-200"
        >
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium mb-2">لا توجد حلويات متاحة حالياً</p>
          <p className="text-gray-400 text-sm">سيتم إضافة المزيد من الحلويات قريباً</p>
        </motion.div>
      ) : filteredSweets.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 bg-gray-50 rounded-2xl border border-gray-200"
        >
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium mb-2">
            {searchTerm ? 
              `لا توجد نتائج للبحث "${searchTerm}" في فئة ${sweetCategories.find(c => c.id === category)?.name}` :
              `لا توجد حلويات بهذا التصنيف`
            }
          </p>
          <p className="text-gray-400 text-sm">
            {searchTerm ? 'جرب كلمات بحث أخرى أو غير الفئة' : 'جرب تصنيف آخر'}
          </p>
        </motion.div>
      ) : (
        <>
          {/* مؤشر النتائج */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center mb-6 p-4 bg-pink-50 rounded-xl border border-pink-200"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">{filteredSweets.length}</span>
              </div>
              <span className="text-pink-800 font-medium">
                {filteredSweets.length === 1 ? 'حلوى متاحة' : `حلويات متاحة`}
                {searchTerm && <span className="text-pink-600"> للبحث &quot;{searchTerm}&quot;</span>}
              </span>
            </div>
            <div className="text-pink-600 text-sm">
              التصنيف: <span className="font-semibold">{sweetCategories.find(c => c.id === category)?.name}</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
          <AnimatePresence mode="wait">
            {filteredSweets.map((sweet: Sweet, sweetIndex) => {
              const selectedQuantity = getSelectedSweetQuantity(sweet.id)
              
              return (
                <motion.div
                  key={`${category}-${sweet.id}`}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  transition={{ duration: 0.4, delay: sweetIndex * 0.1 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                >
                  <div className={`group rounded-2xl border-2 overflow-hidden transition-all duration-300 hover:shadow-2xl transform hover:scale-[1.02] bg-white ${
                    selectedQuantity > 0 
                      ? "border-pink-400 ring-4 ring-pink-100 shadow-xl bg-gradient-to-br from-pink-50 to-orange-50"
                      : "border-gray-200 hover:border-pink-300"
                  }`}>
                    <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                      {/* شريط خصم في الزاوية */}
                      {sweet.old_price && sweet.old_price > sweet.price && (
                        <div className="absolute top-0 left-0 z-10">
                          <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 transform -rotate-45 -translate-x-2 translate-y-2 shadow-lg">
                            -{Math.round(((sweet.old_price - sweet.price) / sweet.old_price) * 100)}%
                          </div>
                        </div>
                      )}
                      
                      {selectedQuantity > 0 && (
                        <div className="absolute top-3 right-3 z-10">
                          <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center shadow-lg">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                      {isLoading[sweet.id] ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                          <div className="w-10 h-10 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin"></div>
                        </div>
                      ) : (
                        <Image 
                          src={sweet.image || "/placeholder.svg"} 
                          alt={sweet.name} 
                          fill 
                          sizes="(max-width: 480px) 90vw, (max-width: 768px) 45vw, 30vw"
                          className="object-cover p-6 group-hover:scale-110 transition-transform duration-300" 
                          priority={sweetIndex < 3}
                        />
                      )}
                    </div>
                    
                    <div className="p-5">
                      {/* شريط الخصم */}
                      {sweet.old_price && sweet.old_price > sweet.price && (
                        <div className="mb-3">
                          <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full inline-flex items-center gap-1 shadow-lg">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            خصم {Math.round(((sweet.old_price - sweet.price) / sweet.old_price) * 100)}%
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg leading-tight">{sweet.name}</h3>
                          <p className={`text-sm font-medium mt-1 ${sweet.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                            {sweet.stock > 0 ? `متوفر (${sweet.stock})` : "غير متوفر"}
                          </p>
                        </div>
                        <div className="text-right">
                          {/* عرض السعر القديم والجديد */}
                          {sweet.old_price && sweet.old_price > sweet.price && (
                            <div className="text-right mb-1">
                              <span className="text-sm text-gray-400 line-through">{sweet.old_price} جنيه</span>
                            </div>
                          )}
                          <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
                            {sweet.price}
                          </span>
                          <span className="text-sm text-gray-500 block">جنيه</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        {selectedQuantity > 0 ? (
                          <div className="flex items-center justify-between bg-gradient-to-r from-pink-100 to-orange-100 rounded-xl p-3 w-full">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleQuantityChange(sweet.id, selectedQuantity - 1)}
                              className="w-8 h-8 p-0 rounded-full bg-gradient-to-r from-pink-500 to-pink-600 text-white border-0 hover:from-pink-600 hover:to-pink-700 transform hover:scale-110 transition-all duration-300"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="font-bold text-lg text-pink-800 mx-4">{selectedQuantity}</span>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleQuantityChange(sweet.id, selectedQuantity + 1)}
                              disabled={selectedQuantity >= sweet.stock}
                              className="w-8 h-8 p-0 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 hover:from-orange-600 hover:to-orange-700 transform hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:transform-none"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            size="default"
                            disabled={sweet.stock <= 0}
                            onClick={() => handleAddSweet(sweet)}
                            className="w-full bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg rounded-xl py-3"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            إضافة للهدية
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      </>
      )}

      {selectedSweets && selectedSweets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-pink-50 to-orange-50 rounded-2xl p-6 border-2 border-pink-200 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg text-pink-800">
              الحلويات المختارة ({selectedSweets.length})
            </h3>
          </div>
          <div className="space-y-3">
            {selectedSweets.map((sweet) => (
              <div key={sweet.id} className="flex justify-between items-center bg-white rounded-xl p-3 shadow-sm">
                <span className="font-medium text-gray-900">{sweet.name} × {sweet.quantity}</span>
                <span className="font-bold text-pink-600">{(sweet.price * sweet.quantity).toFixed(2)} جنيه</span>
              </div>
            ))}
          </div>
          <div className="border-t-2 border-pink-300 mt-4 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-pink-800">الإجمالي:</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
                {selectedSweets.reduce((total, sweet) => total + (sweet.price * (sweet.quantity || 0)), 0).toFixed(2)} جنيه
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
