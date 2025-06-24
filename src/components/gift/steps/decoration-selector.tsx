"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useDispatch, useSelector } from "react-redux"
import { addDecoration, removeDecoration } from "@/lib/redux/slices/giftSlice"
import { addSavedItemThunk } from "@/lib/redux/slices/giftSlice"
import type { RootState, AppDispatch } from "@/lib/redux/store"
import { Button } from "@/components/ui/button"
import { Heart, AlertTriangle } from "lucide-react"
import { getAllDecorations } from "@/lib/actions/decoration-actions"
import type { Decoration } from "../../../../prisma/generated/client"
import Image from "next/image"

export default function DecorationSelector() {
  const dispatch = useDispatch<AppDispatch>()
  const selectedDecorations = useSelector((state: RootState) => state.gift.selectedDecorations) as Decoration[]
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({})
  const [decorations, setDecorations] = useState<Decoration[]>([])
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDecorations = async () => {
      try {
        setIsPageLoading(true)
        const data = await getAllDecorations()
        setDecorations(data)
        setError(null)
      } catch (err) {
        console.error("Error loading decorations:", err)
        setError("حدث خطأ أثناء تحميل الزينة. يرجى المحاولة مرة أخرى.")      } finally {
        setIsPageLoading(false)
      }
    }

    fetchDecorations()
  }, [])

  const handleAddDecoration = (decoration: Decoration) => {
    setIsLoading((prev: Record<string, boolean>) => ({ ...prev, [decoration.id]: true }))
    setTimeout(() => {
      // تمرير الـ decoration object كاملاً مع createdAt و updatedAt
      dispatch(addDecoration(decoration))
      setIsLoading((prev: Record<string, boolean>) => ({ ...prev, [decoration.id]: false }))
    }, 300)
  }
  
  const handleSaveForLater = (decoration: Decoration, e: React.MouseEvent) => {
    e.stopPropagation()
    dispatch(addSavedItemThunk({
      productId: decoration.id,
      name: decoration.name,
      price: decoration.price,
      image: decoration.image || "",
      type: "decoration",
    }) as any)
  }

  const isDecorationSelected = (decorationId: string) => {
    return selectedDecorations.some((d: Decoration) => d.id === decorationId)
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">اختر زينة الهدية</h2>
        <p className="text-gray-600">أضف لمسات جمالية لهديتك مع مجموعة متنوعة من الزينة</p>
      </div>

      {isPageLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-purple-500 rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="text-center p-8 text-red-500">{error}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {decorations.map((decoration: Decoration) => (
              <motion.div
                key={decoration.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className={`rounded-lg border-2 overflow-hidden transition-all ${
                    isDecorationSelected(decoration.id)
                      ? "border-purple-500 ring-2 ring-purple-200"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="relative aspect-square bg-gray-100">
                    {isLoading[decoration.id] ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-gray-200 border-t-purple-500 rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <>
                        <Image
                          src={decoration.image || "/placeholder.svg"}
                          alt={decoration.name}
                          fill
                          className="object-cover p-4"
                        />
                        {decoration.stock <= 5 && (
                          <div className="absolute top-2 right-2 bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full flex items-center">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {decoration.stock > 0 ? `تبقى ${decoration.stock} فقط!` : "نفذ المخزون"}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium text-gray-900">{decoration.name}</h3>
                        <p className="text-sm text-gray-500">{decoration.stock > 0 ? "متوفر" : "غير متوفر"}</p>
                      </div>
                      <span className="font-bold text-purple-600">{decoration.price} جنيه</span>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => handleSaveForLater(decoration, e)}
                        className="text-xs"
                      >
                        <Heart className="w-3 h-3 mr-1" />
                        حفظ
                      </Button>

                      {isDecorationSelected(decoration.id) ? (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => dispatch(removeDecoration(decoration.id))}
                          className="text-xs"
                        >
                          إزالة
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          disabled={decoration.stock <= 0}
                          onClick={() => handleAddDecoration(decoration)}
                          className="text-xs"
                        >
                          إضافة
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
