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

export default function BagSelector() {
  const dispatch = useDispatch<AppDispatch>()
  const selectedBag = useSelector((state: RootState) => state.gift.selectedBag)
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
      // إرسال الحقيبة مباشرة للـ Redux بدون تحويل
      dispatch(selectBag(bag))
      setIsLoading((prev: Record<string, boolean>) => ({ ...prev, [bag.id]: false }))
    }, 300)
  }

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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
          اختر شنطة الهدية الأنيقة
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
          اختر شنطة مناسبة لتغليف هديتك بشكل أنيق وجذاب يعكس اهتمامك بالتفاصيل
        </p>
      </motion.div>

      {isPageLoading ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center min-h-[300px] space-y-4"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-100 border-t-purple-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-indigo-500 rounded-full animate-spin animation-delay-75"></div>
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
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {bags.map((bag: Bag, bagIndex) => (
              <motion.div
                key={bag.id}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{ duration: 0.4, delay: bagIndex * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
              >
                <div
                  className={`group rounded-2xl border-2 overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-2xl transform hover:scale-[1.02] bg-white ${
                    selectedBag?.id === bag.id
                      ? "border-purple-400 ring-4 ring-purple-100 shadow-xl bg-gradient-to-br from-purple-50 to-indigo-50"
                      : "border-gray-200 hover:border-purple-300"
                  }`}
                  onClick={() => handleSelectBag(bag)}
                >
                  <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                    {selectedBag?.id === bag.id && (
                      <div className="absolute top-3 right-3 z-10">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
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
                        sizes="(max-width: 480px) 90vw, (max-width: 768px) 45vw, 30vw"
                        className="object-cover p-6 group-hover:scale-110 transition-transform duration-300" 
                        priority={bagIndex < 3}
                      />
                    )}
                    {bag.stock <= 5 && bag.stock > 0 && (
                      <div className="absolute top-3 left-3 bg-amber-500 text-white text-xs px-3 py-1 rounded-full flex items-center shadow-lg">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        تبقى {bag.stock}
                      </div>
                    )}
                    {bag.stock === 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium">
                          نفذ المخزون
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg leading-tight">{bag.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{bag.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                          {bag.price}
                        </span>
                        <span className="text-sm text-gray-500 block">جنيه</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${
                          bag.stock > 5 
                            ? "bg-green-100 text-green-800"
                            : bag.stock > 0
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {bag.stock > 0 ? `متوفر (${bag.stock})` : "غير متوفر"}
                        </span>
                        {selectedBag?.id === bag.id && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            محدد
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
