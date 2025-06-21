"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/lib/redux/store"
import { setSelectedBox } from "@/lib/redux/slices/giftSlice"
import { addSavedItemThunk } from "@/lib/redux/slices/giftSlice"
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { getBoxesByCategory } from "@/lib/actions/box-actions"
import type { Box } from "@/types/database"
import Image from "next/image"

const boxCategories = [
  { id: "basic", name: "أساسي", priceRange: "50-100 جنيه" },
  { id: "premium", name: "مميز", priceRange: "101-200 جنيه" },
  { id: "luxury", name: "فاخر", priceRange: "201-250 جنيه" },
]

export default function BoxSelector() {
  const dispatch = useDispatch<AppDispatch>()
  const selectedBox = useSelector((state: RootState) => state.gift.selectedBox)
  const [category, setCategory] = useState("basic")
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({})
  const [boxes, setBoxes] = useState<Box[]>([])
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBoxes = async () => {
      try {
        setIsPageLoading(true)
        const data = await getBoxesByCategory(category)
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
  }, [category])

  const handleBoxSelect = (box: Box) => {
    setIsLoading((prev: Record<string, boolean>) => ({ ...prev, [box.id]: true }))
    setTimeout(() => {
      dispatch(setSelectedBox(box))
      setIsLoading((prev: Record<string, boolean>) => ({ ...prev, [box.id]: false }))
    }, 500)
  }

  const handleSaveForLater = (box: Box, e: React.MouseEvent) => {
    e.stopPropagation()
    dispatch(addSavedItemThunk({
      id: box.id,
      name: box.name,
      price: box.price,
      image: box.image,
      type: "box",
    }))
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">اختر صندوق الهدية</h2>
        <p className="text-gray-600">اختر الصندوق المناسب لهديتك من مجموعة متنوعة من الأحجام والأسعار</p>
      </div>

      <Tabs value={category} onValueChange={setCategory} className="mb-6">
        <TabsList className="w-full justify-start border-b rounded-none p-0 h-auto bg-transparent">
          {boxCategories.map((cat) => (
            <TabsTrigger
              key={cat.id}
              value={cat.id}
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-purple-500 data-[state=active]:text-purple-600 rounded-none px-4 py-2"
            >
              <div className="flex flex-col items-center">
                <span>{cat.name}</span>
                <span className="text-xs text-gray-500">{cat.priceRange}</span>
              </div>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isPageLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-purple-500 rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="text-center p-8 text-red-500">{error}</div>
      ) : (
        <RadioGroup
          value={selectedBox?.id}
          onValueChange={(value) => {
            const box = boxes.find((b) => b.id === value)
            if (box) handleBoxSelect(box)
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {boxes.map((box: Box, boxIndex) => (
              <motion.div
                key={box.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Label
                  htmlFor={box.id}
                  className={`block cursor-pointer rounded-lg border-2 overflow-hidden transition-all ${
                    selectedBox?.id === box.id
                      ? "border-purple-500 ring-2 ring-purple-200"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="relative aspect-square bg-gray-100">
                    {isLoading[box.id] ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-gray-200 border-t-purple-500 rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <Image 
                        src={box.image || "/placeholder.svg"} 
                        alt={box.name} 
                        fill 
                        sizes="(max-width: 480px) 80vw, (max-width: 768px) 40vw, 25vw"
                        className="object-cover p-4" 
                        priority={boxIndex < 2} // إعطاء الأولوية للصناديق الأولى
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900">{box.name}</h3>
                        <p className="text-sm text-gray-500">{box.dimensions}</p>
                      </div>
                      <RadioGroupItem id={box.id} value={box.id} className="sr-only" />
                      <span className="font-bold text-purple-600">{box.price} جنيه</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{box.description}</p>
                    <div className="flex justify-between items-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => handleSaveForLater(box, e)}
                        className="text-xs"
                      >
                        <Heart className="w-3 h-3 mr-1" />
                        حفظ لوقت لاحق
                      </Button>
                      {box.stock <= 5 && (
                        <span className="text-xs text-amber-600">
                          {box.stock > 0 ? `تبقى ${box.stock} فقط!` : "نفذ المخزون"}
                        </span>
                      )}
                    </div>
                  </div>
                </Label>
              </motion.div>
            ))}
          </div>
        </RadioGroup>
      )}
    </div>
  )
}
