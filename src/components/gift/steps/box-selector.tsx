"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useDispatch, useSelector } from "react-redux"
import type { RootState, AppDispatch } from "@/lib/redux/store"
import { selectBox } from "@/lib/redux/slices/giftSlice"
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getBoxesByCategory } from "@/lib/actions/box-actions"
import type { Box } from "@/types/database"
import Image from "next/image"
import { Package } from "lucide-react"

const boxCategories = [
  { id: "small", name: "صغير", sizeRange: "مناسب للهدايا الصغيرة" },
  { id: "medium", name: "متوسط", sizeRange: "مناسب للهدايا المتوسطة" },
  { id: "large", name: "كبير", sizeRange: "مناسب للهدايا الكبيرة" },
]

export default function BoxSelector() {
  const dispatch = useDispatch<AppDispatch>()
  const selectedBox = useSelector((state: RootState) => state.gift.selectedBox)
  const [category, setCategory] = useState("small")
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({})
  const [boxes, setBoxes] = useState<Box[]>([])
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBoxes = async () => {
      try {
        setIsPageLoading(true)
        const data = await getBoxesByCategory()
        setBoxes(data)
        setError(null)
      } catch (err) {
        console.error("Error loading boxes:", err)
        setError("حدث خطأ أثناء تحميل الصناديق. يرجى المحاولة مرة أخرى.")
      } finally {
        setIsPageLoading(false)
      }
    }

    fetchBoxes()
  }, []) // إزالة dependency على category لأننا سنفلتر محلياً
  
  const handleBoxSelect = (box: Box) => {
    setIsLoading((prev: Record<string, boolean>) => ({ ...prev, [box.id]: true }))
    setTimeout(() => {
      dispatch(selectBox(box))
      setIsLoading((prev: Record<string, boolean>) => ({ ...prev, [box.id]: false }))
    }, 500)
  }

  // دالة فلترة الصناديق حسب الحجم
  const getFilteredBoxes = () => {
    if (!boxes || boxes.length === 0) return []
    
    return boxes.filter((box) => {
      // إذا لم يكن هناك حقل size، نستخدم منطق افتراضي حسب الاسم أو الوصف
      const boxSize = box.size?.toLowerCase() || ""
      const boxName = box.name?.toLowerCase() || ""
      const boxDesc = box.description?.toLowerCase() || ""
      
      if (category === "small") {
        return boxSize.includes("صغير") || 
               boxName.includes("صغير") || 
               boxDesc.includes("صغير") ||
               boxSize === "small" ||
               // إذا لم يحتوي على أي مؤشر حجم، نعتبره صغير إذا كان السعر أقل من 50
               (!boxSize && !boxName.includes("كبير") && !boxName.includes("متوسط") && box.price < 50)
      } else if (category === "medium") {
        return boxSize.includes("متوسط") || 
               boxName.includes("متوسط") || 
               boxDesc.includes("متوسط") ||
               boxSize === "medium" ||
               // إذا لم يحتوي على أي مؤشر حجم، نعتبره متوسط إذا كان السعر بين 50-80
               (!boxSize && !boxName.includes("كبير") && !boxName.includes("صغير") && box.price >= 50 && box.price <= 80)
      } else if (category === "large") {
        return boxSize.includes("كبير") || 
               boxName.includes("كبير") || 
               boxDesc.includes("كبير") ||
               boxSize === "large" ||
               // إذا لم يحتوي على أي مؤشر حجم، نعتبره كبير إذا كان السعر أكبر من 80
               (!boxSize && !boxName.includes("متوسط") && !boxName.includes("صغير") && box.price > 80)
      } else {
        return true
      }
    })
  }

  // دالة للحصول على عدد الصناديق في كل فئة حجم
  const getBoxCountForCategory = (categoryId: string) => {
    if (!boxes || boxes.length === 0) return 0
    
    return boxes.filter((box) => {
      const boxSize = box.size?.toLowerCase() || ""
      const boxName = box.name?.toLowerCase() || ""
      const boxDesc = box.description?.toLowerCase() || ""
      
      if (categoryId === "small") {
        return boxSize.includes("صغير") || 
               boxName.includes("صغير") || 
               boxDesc.includes("صغير") ||
               boxSize === "small" ||
               (!boxSize && !boxName.includes("كبير") && !boxName.includes("متوسط") && box.price < 50)
      } else if (categoryId === "medium") {
        return boxSize.includes("متوسط") || 
               boxName.includes("متوسط") || 
               boxDesc.includes("متوسط") ||
               boxSize === "medium" ||
               (!boxSize && !boxName.includes("كبير") && !boxName.includes("صغير") && box.price >= 50 && box.price <= 80)
      } else if (categoryId === "large") {
        return boxSize.includes("كبير") || 
               boxName.includes("كبير") || 
               boxDesc.includes("كبير") ||
               boxSize === "large" ||
               (!boxSize && !boxName.includes("متوسط") && !boxName.includes("صغير") && box.price > 80)
      } else {
        return true
      }
    }).length
  }

  const filteredBoxes = getFilteredBoxes()

  return (
    <div className="space-y-8">
      {/* العنوان والوصف */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 mb-4 shadow-lg">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
          اختر صندوق الهدية المثالي
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
          اختر الصندوق المناسب لهديتك من مجموعة متنوعة من الأحجام والتصاميم الأنيقة
        </p>
      </motion.div>

      {/* فئات الصناديق */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tabs value={category} onValueChange={setCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100/50 p-1 rounded-2xl border border-gray-200 shadow-sm">
            {boxCategories.map((cat) => (
              <TabsTrigger
                key={cat.id}
                value={cat.id}
                className="rounded-xl py-4 px-6 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 transition-all duration-300 relative overflow-hidden"
              >
                <div className="flex flex-col items-center gap-1 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{cat.name}</span>
                    <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full font-medium">
                      {getBoxCountForCategory(cat.id)}
                    </span>
                  </div>
                  <span className="text-xs opacity-70">{cat.sizeRange}</span>
                </div>
                {category === cat.id && (
                  <motion.div
                    layoutId="activeCategory"
                    className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl"
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
            <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-500 rounded-full animate-spin animation-delay-75"></div>
          </div>
          <div className="text-center">
            <p className="text-gray-600 font-medium">جاري تحميل الصناديق...</p>
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
      ) : filteredBoxes.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 bg-gray-50 rounded-2xl border border-gray-200"
        >
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Package className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium mb-2">لا توجد صناديق بهذا الحجم</p>
          <p className="text-gray-400 text-sm">جرب حجم آخر</p>
        </motion.div>
      ) : (
        <>
          {/* مؤشر النتائج */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">{filteredBoxes.length}</span>
              </div>
              <span className="text-blue-800 font-medium">
                {filteredBoxes.length === 1 ? 'صندوق متاح' : `صناديق متاحة`}
              </span>
            </div>
            <div className="text-blue-600 text-sm">
              الحجم: <span className="font-semibold">{boxCategories.find(c => c.id === category)?.name}</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <RadioGroup
              value={selectedBox?.id}
              onValueChange={(value) => {
                const box = boxes.find((b) => b.id === value)
                if (box) handleBoxSelect(box)
              }}
            >
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence mode="wait">
                  {filteredBoxes.map((box: Box) => (
                    <motion.div
                      key={`${category}-${box.id}`}
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.9 }}
                      transition={{ duration: 0.4 }}
                      whileHover={{ y: -8, transition: { duration: 0.2 } }}
                    >
                      <Label
                        htmlFor={box.id}
                        className={`group block cursor-pointer rounded-2xl border-2 overflow-hidden transition-all duration-300 hover:shadow-2xl transform hover:scale-[1.02] ${
                          selectedBox?.id === box.id
                            ? "border-blue-400 ring-4 ring-blue-100 shadow-xl bg-gradient-to-br from-blue-50 to-purple-50"
                            : "border-gray-200 hover:border-blue-300 bg-white hover:shadow-lg"
                        }`}
                      >
                        <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                          {selectedBox?.id === box.id && (
                            <div className="absolute top-3 right-3 z-20">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          )}
                          {isLoading[box.id] ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                              <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
                            </div>
                          ) : (
                            <Image 
                              src={box.image || "/placeholder.svg"} 
                              alt={box.name}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-110"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <div className="p-6 relative">
                          <RadioGroupItem value={box.id} id={box.id} className="sr-only" />
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                                {box.name}
                              </h3>
                              <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                  {box.price}
                                </span>
                                <span className="text-sm text-gray-500 block">جنيه</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-600 leading-relaxed">{box.description}</p>
                          <div className="flex justify-between items-center pt-2">
                            <div className="flex items-center gap-2">
                              {box.stock <= 5 && box.stock > 0 && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                  تبقى {box.stock} فقط!
                                </span>
                              )}
                              {box.stock === 0 && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                                  نفذ المخزون
                                </span>
                              )}
                            </div>
                            {selectedBox?.id === box.id && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                مختار
                              </span>
                            )}
                          </div>
                        </div>
                      </Label>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </RadioGroup>
          </motion.div>
        </>
      )}
    </div>
  )
}
