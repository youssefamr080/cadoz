"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useDispatch, useSelector } from "react-redux"
import { addSelectedSweet, removeSelectedSweet, updateSelectedSweetQuantity } from "@/lib/redux/slices/giftSlice"
import type { RootState, AppDispatch } from "@/lib/redux/store"
import { Button } from "@/components/ui/button"
import { Plus, Minus } from "lucide-react"
import { getAllSweets } from "@/lib/actions/sweet-actions"
import type { Sweet } from "@/types/database"
import Image from "next/image"

export default function SweetSelector() {
  const dispatch = useDispatch<AppDispatch>()
  const selectedSweets = useSelector((state: RootState) => state.gift.selectedSweets) || []
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({})
  const [sweets, setSweets] = useState<Sweet[]>([])
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSweets = async () => {
      try {
        setIsPageLoading(true)
        const data = await getAllSweets()
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
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence>
            {sweets.map((sweet: Sweet, sweetIndex) => {
              const selectedQuantity = getSelectedSweetQuantity(sweet.id)
              
              return (
                <motion.div
                  key={sweet.id}
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
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg leading-tight">{sweet.name}</h3>
                          <p className={`text-sm font-medium mt-1 ${sweet.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                            {sweet.stock > 0 ? `متوفر (${sweet.stock})` : "غير متوفر"}
                          </p>
                        </div>
                        <div className="text-right">
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
