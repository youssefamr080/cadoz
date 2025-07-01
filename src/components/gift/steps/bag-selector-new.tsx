"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useDispatch, useSelector } from "react-redux"
import { selectBag } from "@/lib/redux/slices/giftSlice"
import type { RootState, AppDispatch } from "@/lib/redux/store"
import { AlertTriangle } from "lucide-react"
import { getAllBags } from "@/lib/actions/bag-actions"
import type { Bag } from "@/types/database"
import Image from "next/image"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const bagCategories = [
  { id: "small", name: "صغير", sizeRange: "مناسب للهدايا الصغيرة" },
  { id: "medium", name: "متوسط", sizeRange: "مناسب للهدايا المتوسطة" },
  { id: "large", name: "كبير", sizeRange: "مناسب للهدايا الكبيرة" },
]

export default function BagSelector() {
  const dispatch = useDispatch<AppDispatch>()
  const selectedBag = useSelector((state: RootState) => state.gift.selectedBag)
  const [category, setCategory] = useState("small")
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({})
  const [bags, setBags] = useState<Bag[]>([])
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBags = async () => {
      try {
        setIsPageLoading(true)
        const data = await getAllBags()
        setBags(data)
        setError(null)
      } catch (err) {
        console.error("Error loading bags:", err)
        setError("حدث خطأ أثناء تحميل الشنط. يرجى المحاولة مرة أخرى.")
      } finally {
        setIsPageLoading(false)
      }
    }

    fetchBags()
  }, [])

  const handleSelectBag = (bag: Bag) => {
    setIsLoading((prev: Record<string, boolean>) => ({ ...prev, [bag.id]: true }))
    setTimeout(() => {
      dispatch(selectBag(bag))
      setIsLoading((prev: Record<string, boolean>) => ({ ...prev, [bag.id]: false }))
    }, 300)
  }

  // دالة فلترة الشنط حسب الحجم
  const getFilteredBags = () => {
    if (!bags || bags.length === 0) return []
    
    return bags.filter((bag) => {
      const bagSize = bag.size?.toLowerCase() || ""
      const bagName = bag.name?.toLowerCase() || ""
      const bagDesc = bag.description?.toLowerCase() || ""
      
      if (category === "small") {
        return bagSize.includes("صغير") || 
               bagName.includes("صغير") || 
               bagDesc.includes("صغير") ||
               bagSize === "small" ||
               (!bagSize && !bagName.includes("كبير") && !bagName.includes("متوسط") && bag.price < 25)
      } else if (category === "medium") {
        return bagSize.includes("متوسط") || 
               bagName.includes("متوسط") || 
               bagDesc.includes("متوسط") ||
               bagSize === "medium" ||
               (!bagSize && !bagName.includes("كبير") && !bagName.includes("صغير") && bag.price >= 25 && bag.price <= 35)
      } else if (category === "large") {
        return bagSize.includes("كبير") || 
               bagName.includes("كبير") || 
               bagDesc.includes("كبير") ||
               bagSize === "large" ||
               (!bagSize && !bagName.includes("متوسط") && !bagName.includes("صغير") && bag.price > 35)
      } else {
        return true
      }
    })
  }

  // دالة للحصول على عدد الشنط في كل فئة حجم
  const getBagCountForCategory = (categoryId: string) => {
    if (!bags || bags.length === 0) return 0
    
    return bags.filter((bag) => {
      const bagSize = bag.size?.toLowerCase() || ""
      const bagName = bag.name?.toLowerCase() || ""
      const bagDesc = bag.description?.toLowerCase() || ""
      
      if (categoryId === "small") {
        return bagSize.includes("صغير") || 
               bagName.includes("صغير") || 
               bagDesc.includes("صغير") ||
               bagSize === "small" ||
               (!bagSize && !bagName.includes("كبير") && !bagName.includes("متوسط") && bag.price < 25)
      } else if (categoryId === "medium") {
        return bagSize.includes("متوسط") || 
               bagName.includes("متوسط") || 
               bagDesc.includes("متوسط") ||
               bagSize === "medium" ||
               (!bagSize && !bagName.includes("كبير") && !bagName.includes("صغير") && bag.price >= 25 && bag.price <= 35)
      } else if (categoryId === "large") {
        return bagSize.includes("كبير") || 
               bagName.includes("كبير") || 
               bagDesc.includes("كبير") ||
               bagSize === "large" ||
               (!bagSize && !bagName.includes("متوسط") && !bagName.includes("صغير") && bag.price > 35)
      } else {
        return true
      }
    }).length
  }

  const filteredBags = getFilteredBags()

  return (
    <div className="space-y-8">
      {/* العنوان والوصف */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 mb-4 shadow-lg">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
          اختر كيس الهدية المناسب
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
          اختر الكيس المثالي لهديتك من مجموعة متنوعة من الأحجام والألوان الجميلة
        </p>
      </motion.div>

      {/* فئات الأحجام */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tabs value={category} onValueChange={setCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100/50 p-1 rounded-2xl border border-gray-200 shadow-sm">
            {bagCategories.map((cat) => (
              <TabsTrigger
                key={cat.id}
                value={cat.id}
                className="rounded-xl py-4 px-6 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-purple-600 transition-all duration-300 relative overflow-hidden"
              >
                <div className="flex flex-col items-center gap-1 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{cat.name}</span>
                    <span className="bg-purple-100 text-purple-600 text-xs px-2 py-0.5 rounded-full font-medium">
                      {getBagCountForCategory(cat.id)}
                    </span>
                  </div>
                  <span className="text-xs opacity-70">{cat.sizeRange}</span>
                </div>
                {category === cat.id && (
                  <motion.div
                    layoutId="activeBagCategory"
                    className="absolute inset-0 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </motion.div>

      {isPageLoading ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center min-h-[300px] space-y-4"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-100 border-t-purple-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-pink-500 rounded-full animate-spin animation-delay-75"></div>
          </div>
          <div className="text-center">
            <p className="text-gray-600 font-medium">جاري تحميل الشنط...</p>
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
      ) : filteredBags.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 bg-gray-50 rounded-2xl border border-gray-200"
        >
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium mb-2">لا توجد شنط بهذا الحجم</p>
          <p className="text-gray-400 text-sm">جرب حجم آخر</p>
        </motion.div>
      ) : (
        <>
          {/* مؤشر النتائج */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center mb-6 p-4 bg-purple-50 rounded-xl border border-purple-200"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">{filteredBags.length}</span>
              </div>
              <span className="text-purple-800 font-medium">
                {filteredBags.length === 1 ? 'شنطة متاحة' : `شنط متاحة`}
              </span>
            </div>
            <div className="text-purple-600 text-sm">
              الحجم: <span className="font-semibold">{bagCategories.find(c => c.id === category)?.name}</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <AnimatePresence mode="wait">
              {filteredBags.map((bag: Bag, bagIndex) => (
                <motion.div
                  key={`${category}-${bag.id}`}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  transition={{ duration: 0.4, delay: bagIndex * 0.1 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                >
                  <div
                    className={`group cursor-pointer rounded-2xl border-2 overflow-hidden transition-all duration-300 hover:shadow-2xl transform hover:scale-[1.02] ${
                      selectedBag?.id === bag.id
                        ? "border-purple-400 ring-4 ring-purple-100 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50"
                        : "border-gray-200 hover:border-purple-300 bg-white hover:shadow-lg"
                    }`}
                    onClick={() => handleSelectBag(bag)}
                  >
                    <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                      {selectedBag?.id === bag.id && (
                        <div className="absolute top-3 right-3 z-20">
                          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                      {isLoading[bag.id] ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                          <div className="w-10 h-10 border-4 border-purple-100 border-t-purple-500 rounded-full animate-spin"></div>
                        </div>
                      ) : (
                        <Image 
                          src={bag.image || "/placeholder.svg"} 
                          alt={bag.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="p-6 relative">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
                            {bag.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                              {bag.price}
                            </span>
                            <span className="text-sm text-gray-500 block">جنيه</span>
                          </div>
                        </div>
                      </div>
                      {bag.description && (
                        <p className="text-gray-600 leading-relaxed mb-3">{bag.description}</p>
                      )}
                      <div className="flex justify-between items-center pt-2">
                        <div className="flex items-center gap-2">
                          {bag.stock <= 5 && bag.stock > 0 && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                              <AlertTriangle className="w-3 h-3" />
                              تبقى {bag.stock} فقط!
                            </span>
                          )}
                          {bag.stock === 0 && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                              نفذ المخزون
                            </span>
                          )}
                        </div>
                        {selectedBag?.id === bag.id && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            مختار
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </div>
  )
}
