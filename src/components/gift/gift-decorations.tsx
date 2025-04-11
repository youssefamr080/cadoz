"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import type { GiftDecoration, GiftWrapOption } from "@/types/database"
import Image from "next/image"

// Datos de ejemplo
const decorations: GiftDecoration[] = [
  { id: "1", name: "شريط ساتان أحمر", price: 10, image: "/placeholder.svg", stock: 20 },
  { id: "2", name: "شريط ذهبي", price: 15, image: "/placeholder.svg", stock: 15 },
  { id: "3", name: "زهور اصطناعية", price: 20, image: "/placeholder.svg", stock: 10 },
]

const wrapOptions: GiftWrapOption[] = [
  { id: "1", name: "تغليف كلاسيكي", price: 15, image: "/placeholder.svg", stock: 25 },
  { id: "2", name: "تغليف فاخر", price: 25, image: "/placeholder.svg", stock: 20 },
]

export default function GiftDecorations() {
  const [selectedDecorations, setSelectedDecorations] = useState<string[]>([])
  const [selectedWrap, setSelectedWrap] = useState<string | null>(null)

  const handleDecorationToggle = (id: string) => {
    if (selectedDecorations.includes(id)) {
      setSelectedDecorations(selectedDecorations.filter((item) => item !== id))
    } else {
      setSelectedDecorations([...selectedDecorations, id])
    }
  }

  const handleWrapSelect = (id: string) => {
    setSelectedWrap(id)
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">زينة وتغليف الهدية</h2>

      <div className="space-y-6">
        {/* Decorations */}
        <div>
          <h3 className="font-medium mb-3">اختر الزينة</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {decorations.map((decoration) => (
              <motion.div
                key={decoration.id}
                whileHover={{ scale: 1.03 }}
                className={`border rounded-lg p-3 cursor-pointer ${
                  selectedDecorations.includes(decoration.id) ? "border-purple-500 bg-purple-50" : "border-gray-200"
                }`}
                onClick={() => handleDecorationToggle(decoration.id)}
              >
                <div className="aspect-square bg-gray-100 rounded mb-2 relative">
                  <Image
                    src={decoration.image || "/placeholder.svg"}
                    alt={decoration.name}
                    fill
                    className="object-cover p-2"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">{decoration.name}</p>
                    <p className="text-xs text-gray-500">المخزون: {decoration.stock}</p>
                  </div>
                  <p className="text-purple-600 font-bold">{decoration.price} جنيه</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Wrap Options */}
        <div>
          <h3 className="font-medium mb-3">اختر التغليف</h3>
          <div className="grid grid-cols-2 gap-3">
            {wrapOptions.map((wrap) => (
              <motion.div
                key={wrap.id}
                whileHover={{ scale: 1.03 }}
                className={`border rounded-lg p-3 cursor-pointer ${
                  selectedWrap === wrap.id ? "border-purple-500 bg-purple-50" : "border-gray-200"
                }`}
                onClick={() => handleWrapSelect(wrap.id)}
              >
                <div className="aspect-square bg-gray-100 rounded mb-2 relative">
                  <Image
                    src={wrap.image || "/placeholder.svg"}
                    alt={wrap.name}
                    fill
                    className="object-cover p-2"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">{wrap.name}</p>
                    <p className="text-xs text-gray-500">المخزون: {wrap.stock}</p>
                  </div>
                  <p className="text-purple-600 font-bold">{wrap.price} جنيه</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button className="bg-purple-600 hover:bg-purple-700">تأكيد الاختيار</Button>
        </div>
      </div>
    </div>
  )
}
