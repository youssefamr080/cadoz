"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useGift } from "@/context/gift-context"
import { Button } from "@/components/ui/button"
import { Heart, AlertTriangle } from "lucide-react"
import { getAllBags } from "@/lib/actions/bag-actions"
import type { Bag } from "@/types/database"
import Image from "next/image"

export default function BagSelector() {
  const { selectedBag, setSelectedBag, saveForLater } = useGift()
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
    setIsLoading((prev) => ({ ...prev, [bag.id]: true }))

    setTimeout(() => {
      setSelectedBag(bag)
      setIsLoading((prev) => ({ ...prev, [bag.id]: false }))
    }, 300)
  }

  const handleSaveForLater = (bag: Bag, e: React.MouseEvent) => {
    e.stopPropagation()
    saveForLater({
      id: bag.id,
      name: bag.name,
      price: bag.price,
      image: bag.image,
      type: "bag",
    })
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">اختر شنطة الهدية</h2>
        <p className="text-gray-600">اختر شنطة مناسبة لتغليف هديتك بشكل أنيق</p>
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
            {bags.map((bag, bagIndex) => (
              <motion.div
                key={bag.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className={`rounded-lg border-2 overflow-hidden transition-all cursor-pointer ${
                    selectedBag?.id === bag.id
                      ? "border-purple-500 ring-2 ring-purple-200"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleSelectBag(bag)}
                >
                  <div className="relative aspect-square bg-gray-100">
                    {isLoading[bag.id] ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-gray-200 border-t-purple-500 rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <>
                        <Image 
                          src={bag.image || "/placeholder.svg"} 
                          alt={bag.name} 
                          fill 
                          sizes="(max-width: 480px) 80vw, (max-width: 768px) 40vw, 25vw"
                          className="object-cover p-4" 
                          priority={bagIndex === 0} // إعطاء الأولوية للكيس الأول
                        />
                        {bag.stock <= 5 && (
                          <div className="absolute top-2 right-2 bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full flex items-center">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {bag.stock > 0 ? `تبقى ${bag.stock} فقط!` : "نفذ المخزون"}
                          </div>
                        )}
                        <div
                          className="absolute bottom-0 left-0 right-0 h-2"
                          style={{ backgroundColor: bag.color }}
                        ></div>
                      </>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900">{bag.name}</h3>
                        <p className="text-sm text-gray-500">{bag.stock > 0 ? "متوفر" : "غير متوفر"}</p>
                      </div>
                      <span className="font-bold text-purple-600">{bag.price} جنيه</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{bag.description}</p>

                    <div className="flex justify-between items-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => handleSaveForLater(bag, e)}
                        className="text-xs"
                      >
                        <Heart className="w-3 h-3 mr-1" />
                        حفظ لوقت لاحق
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        disabled={bag.stock <= 0}
                        variant={selectedBag?.id === bag.id ? "secondary" : "default"}
                        onClick={() => handleSelectBag(bag)}
                        className="text-xs"
                      >
                        {selectedBag?.id === bag.id ? "تم الاختيار" : "اختيار"}
                      </Button>
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
