"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { useGift } from "@/context/gift-context"
import { X, RefreshCw, ZoomIn, ZoomOut } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import Image from "next/image"

export default function GiftPreview() {
  const { selectedBox, selectedProducts, selectedDecorations, selectedBag, removeProduct, removeDecoration } = useGift()
  const [scale, setScale] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleZoomIn = useCallback(() => {
    setScale((prevScale) => Math.min(prevScale + 0.1, 2))
  }, [])

  const handleZoomOut = useCallback(() => {
    setScale((prevScale) => Math.max(prevScale - 0.1, 0.5))
  }, [])

  const handleReset = useCallback(() => {
    setScale(1)
  }, [])

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY < 0) {
      handleZoomIn()
    } else {
      handleZoomOut()
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "+" || e.key === "=") {
        handleZoomIn()
      } else if (e.key === "-" || e.key === "_") {
        handleZoomOut()
      } else if (e.key === "0") {
        handleReset()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleZoomIn, handleZoomOut, handleReset])

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [selectedBox, selectedProducts, selectedDecorations, selectedBag])

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="font-semibold text-gray-900">معاينة الهدية</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
            aria-label="تصغير"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-medium">{Math.round(scale * 100)}%</span>
          <button
            onClick={handleZoomIn}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
            aria-label="تكبير"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
            aria-label="إعادة تعيين"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        className="relative overflow-hidden bg-gray-50 p-4 h-[350px] flex items-center justify-center"
        onWheel={handleWheel}
        ref={containerRef}
      >
        {isLoading ? (
          <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-purple-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ scale }} className="relative">
            {selectedBox ? (
              <div className="relative">
                <div className="relative border-2 border-gray-300 bg-white rounded-lg p-2 min-w-[200px] min-h-[200px]">
                  <div className="absolute top-0 right-0 -mt-2 -mr-2 text-xs bg-gray-100 px-2 py-1 rounded-full">
                    {selectedBox.dimensions}
                  </div>

                  <div className="flex flex-wrap gap-2 justify-center items-center">
                    {selectedProducts.map((product) => (
                      <motion.div
                        key={product.id}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative group"
                      >
                        <div className="relative w-16 h-16 rounded overflow-hidden">
                          <Image
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200"></div>
                        </div>
                        <button
                          onClick={() => removeProduct(product.id)}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-purple-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label={`إزالة ${product.name}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <div className="absolute -bottom-1 -right-1 bg-white text-xs font-medium px-1 rounded-full border shadow-sm">
                          {product.quantity}
                        </div>
                      </motion.div>
                    ))}

                    {selectedDecorations.map((decoration) => (
                      <motion.div
                        key={decoration.id}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative group"
                      >
                        <div className="relative w-12 h-12 rounded overflow-hidden">
                          <Image
                            src={decoration.image || "/placeholder.svg"}
                            alt={decoration.name}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200"></div>
                        </div>
                        <button
                          onClick={() => removeDecoration(decoration.id)}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-purple-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label={`إزالة ${decoration.name}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {selectedBag && (
                  <div
                    className="absolute -bottom-3 -left-3 -right-3 h-6 rounded-b-lg"
                    style={{
                      backgroundColor: selectedBag.color || "#f3f4f6",
                      backgroundImage: selectedBag.pattern ? `url(${selectedBag.pattern})` : "none",
                      backgroundSize: "cover",
                      backgroundRepeat: "no-repeat",
                    }}
                  ></div>
                )}
              </div>
            ) : (
              <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500">يرجى اختيار صندوق لبدء تخصيص هديتك</p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      <div className="p-4 border-t">
        <Slider
          value={[scale * 100]}
          min={50}
          max={200}
          step={5}
          onValueChange={(value) => setScale(value[0] / 100)}
          className="w-full"
        />
      </div>
    </div>
  )
}
