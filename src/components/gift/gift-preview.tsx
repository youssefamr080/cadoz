"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, useDragControls } from "framer-motion"
import { useGift } from "@/context/gift-context"
import { X, RefreshCw, ZoomIn, ZoomOut, Move, Gift } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import Image from "next/image"

export default function GiftPreview() {
  const { selectedBox, selectedProducts, selectedDecorations, selectedBag, removeProduct, removeDecoration } = useGift()
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [touchStartDistance, setTouchStartDistance] = useState<number | null>(null)
  const [initialScale, setInitialScale] = useState<number>(1)
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [isAnimating, setIsAnimating] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const dragControls = useDragControls()

  const handleZoomIn = useCallback(() => {
    setScale((prevScale) => Math.min(prevScale + 0.1, 3))
  }, [])

  const handleZoomOut = useCallback(() => {
    setScale((prevScale) => Math.max(prevScale - 0.1, 0.5))
  }, [])

  const handleReset = useCallback(() => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }, [])

  const getPositionBounds = useCallback(() => {
    if (!containerRef.current || !contentRef.current) return { minX: 0, maxX: 0, minY: 0, maxY: 0 }
    
    const containerRect = containerRef.current.getBoundingClientRect()
    const contentRect = contentRef.current.getBoundingClientRect()
    
    const scaledContentWidth = contentRect.width * scale
    const scaledContentHeight = contentRect.height * scale
    
    const maxX = Math.max(0, (scaledContentWidth - containerRect.width) / 2)
    const maxY = Math.max(0, (scaledContentHeight - containerRect.height) / 2)
    
    return { minX: -maxX, maxX, minY: -maxY, maxY }
  }, [scale])

  const constrainPosition = useCallback((pos: { x: number, y: number }) => {
    const { minX, maxX, minY, maxY } = getPositionBounds()
    return {
      x: Math.min(Math.max(pos.x, minX), maxX),
      y: Math.min(Math.max(pos.y, minY), maxY)
    }
  }, [getPositionBounds])

  // Handle wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    if (e.deltaY < 0) {
      handleZoomIn()
    } else {
      handleZoomOut()
    }
  }, [handleZoomIn, handleZoomOut])

  // Handle touch gestures for pinch zoom
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      setTouchStartDistance(dist)
      setInitialScale(scale)
    }
  }, [scale])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDistance !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      
      const newScale = Math.max(0.5, Math.min(3, initialScale * (dist / touchStartDistance)))
      setScale(newScale)
    }
  }, [touchStartDistance, initialScale])

  const handleTouchEnd = useCallback(() => {
    setTouchStartDistance(null)
  }, [])

  // Handle keyboard shortcuts
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

  // Update loading state
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [selectedBox, selectedProducts, selectedDecorations, selectedBag])

  // Constrain position when scale changes
  useEffect(() => {
    setPosition(prevPosition => constrainPosition(prevPosition))
  }, [scale, constrainPosition])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setPosition(prevPosition => constrainPosition(prevPosition))
    }
    
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [constrainPosition])

  // Add a celebration effect
  const handleCelebrate = useCallback(() => {
    if (isAnimating) return
    setIsAnimating(true)
    setShowConfetti(true)
    
    // Reset after animation completes
    setTimeout(() => {
      setIsAnimating(false)
      setShowConfetti(false)
    }, 3000)
  }, [isAnimating])

  // Subtle box rotation on mouse/touch move for 3D effect
  const handleBoxMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current || isAnimating) return
    
    const containerRect = containerRef.current.getBoundingClientRect()
    const centerX = containerRect.width / 2
    const centerY = containerRect.height / 2
    
    let clientX, clientY
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX - containerRect.left
      clientY = e.touches[0].clientY - containerRect.top
    } else {
      clientX = e.clientX - containerRect.left
      clientY = e.clientY - containerRect.top
    }
    
    const rotateY = ((clientX - centerX) / centerX) * 5 // Max 5 degrees
    const rotateX = ((centerY - clientY) / centerY) * 5 // Max 5 degrees
    
    setRotation({ x: rotateX, y: rotateY })
  }, [containerRef, isAnimating])

  // Reset rotation when not hovering
  const handleBoxLeave = useCallback(() => {
    setRotation({ x: 0, y: 0 })
  }, [])

  // Add a shake effect
  const handleShake = useCallback(() => {
    if (isAnimating) return
    setIsAnimating(true)
    
    // Reset after animation completes
    setTimeout(() => {
      setIsAnimating(false)
    }, 1000)
  }, [isAnimating])

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-3 sm:p-4 border-b flex justify-between items-center">
        <h2 className="font-semibold text-gray-900 text-sm sm:text-base">معاينة الهدية</h2>
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={handleZoomOut}
            className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors"
            aria-label="تصغير"
          >
            <ZoomOut className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <span className="text-xs font-medium">{Math.round(scale * 100)}%</span>
          <button
            onClick={handleZoomIn}
            className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors"
            aria-label="تكبير"
          >
            <ZoomIn className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={handleReset}
            className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors"
            aria-label="إعادة تعيين"
          >
            <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <button
            onPointerDown={(e) => {
              dragControls.start(e)
              setIsDragging(true)
            }}
            className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors"
            aria-label="تحريك"
          >
            <Move className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={handleShake}
            className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full bg-purple-100 hover:bg-purple-200 active:bg-purple-300 transition-colors"
            aria-label="رج الهدية"
            disabled={isAnimating}
          >
            <Gift className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
          </button>
        </div>
      </div>

      <div
        className="relative overflow-hidden bg-gray-50 p-2 sm:p-4 h-[250px] sm:h-[350px] flex items-center justify-center touch-none"
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        ref={containerRef}
      >
        {isLoading ? (
          <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 border-3 sm:border-4 border-gray-200 border-t-purple-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div 
            className="relative transition-all"
            onMouseMove={handleBoxMove}
            onTouchMove={handleBoxMove}
            onMouseLeave={handleBoxLeave}
            onTouchEnd={handleBoxLeave}
            onDoubleClick={handleCelebrate}
          >
            {showConfetti && (
              <div className="absolute inset-0 z-10 pointer-events-none">
                {Array.from({ length: 50 }).map((_, i) => {
                  const size = Math.random() * 8 + 5
                  const color = ['#FFD700', '#FF6347', '#7B68EE', '#3CB371', '#FF69B4'][Math.floor(Math.random() * 5)]
                  const left = `${Math.random() * 100}%`
                  const animationDuration = `${Math.random() * 2 + 1}s`
                  const animationDelay = `${Math.random() * 0.5}s`
                  
                  return (
                    <div 
                      key={i}
                      className="absolute animate-confetti opacity-80"
                      style={{
                        width: size,
                        height: size,
                        backgroundColor: color,
                        borderRadius: '2px',
                        left,
                        top: '-20px',
                        animationDuration,
                        animationDelay,
                      }}
                    />
                  )
                })}
              </div>
            )}
            
            <motion.div 
              ref={contentRef}
              initial={{ opacity: 0 }} 
              animate={{ 
                opacity: 1,
                rotateX: isAnimating ? [0, -5, 5, -3, 3, 0] : rotation.x,
                rotateY: isAnimating ? [0, 5, -5, 3, -3, 0] : rotation.y,
                x: isAnimating ? [0, -10, 10, -7, 7, 0] : position.x,
                y: isAnimating ? [0, 0, 0, 0, 0, 0] : position.y,
                scale: isAnimating ? [1, 1.05, 0.95, 1.03, 0.98, 1] : scale
              }}
              drag={isDragging}
              dragControls={dragControls}
              onDragEnd={() => setIsDragging(false)}
              dragConstraints={{
                top: getPositionBounds().minY,
                bottom: getPositionBounds().maxY,
                left: getPositionBounds().minX,
                right: getPositionBounds().maxX
              }}
              dragElastic={0.1}
              dragTransition={{ power: 0.1, timeConstant: 200 }}
              transition={isAnimating ? 
                { duration: 0.8, times: [0, 0.2, 0.4, 0.6, 0.8, 1] } : 
                { type: "spring", stiffness: 300, damping: 30 }
              }
              className="relative touch-none will-change-transform"
            >
              {selectedBox ? (
                <div className="relative">
                  <div 
                    className="relative border-2 border-gray-300 bg-white rounded-lg p-2 min-w-[180px] sm:min-w-[200px] min-h-[180px] sm:min-h-[200px] shadow-md transition-shadow duration-300 hover:shadow-xl"
                    style={{
                      backgroundImage: selectedBox.texture ? `url(${selectedBox.texture})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                      transformStyle: 'preserve-3d',
                      transition: 'transform 0.1s ease-out',
                    }}
                  >
                    {/* Box ribbon - decorative element */}
                    {selectedBox.hasRibbon && (
                      <div className="absolute -top-4 -left-4 -right-4 h-8 overflow-hidden">
                        <div className="w-full h-full bg-purple-500 shadow-md transform -rotate-2 origin-top-right"></div>
                      </div>
                    )}
                    
                    <div className="absolute top-0 right-0 -mt-2 -mr-2 text-[10px] sm:text-xs bg-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full shadow-md border border-gray-200 font-medium">
                      {selectedBox.dimensions}
                    </div>

                    <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center items-center">
                      {selectedProducts.map((product) => (
                        <motion.div
                          key={product.id}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          whileTap={{ scale: 0.95 }}
                          className="relative group"
                        >
                          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded overflow-hidden shadow-md transform transition-transform hover:rotate-1 hover:scale-105">
                            <Image
                              src={product.image || "/placeholder.svg"}
                              alt={product.name}
                              fill
                              sizes="(max-width: 768px) 56px, 64px"
                              className="object-cover"
                              loading="eager"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200"></div>
                          </div>
                          <button
                            onClick={() => removeProduct(product.id)}
                            className="absolute -top-2 -right-2 w-4 h-4 sm:w-5 sm:h-5 bg-purple-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100 active:opacity-100 transition-opacity shadow-md"
                            aria-label={`إزالة ${product.name}`}
                          >
                            <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          </button>
                          <div className="absolute -bottom-1 -right-1 bg-white text-[10px] sm:text-xs font-medium px-1 rounded-full border shadow-sm">
                            {product.quantity}
                          </div>
                        </motion.div>
                      ))}

                      {selectedDecorations.map((decoration) => (
                        <motion.div
                          key={decoration.id}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          whileTap={{ scale: 0.95 }}
                          className="relative group"
                        >
                          <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded overflow-hidden shadow-md transform transition-transform hover:rotate-3 hover:scale-110">
                            <Image
                              src={decoration.image || "/placeholder.svg"}
                              alt={decoration.name}
                              fill
                              sizes="(max-width: 768px) 40px, 48px"
                              className="object-cover"
                              loading="eager"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200"></div>
                          </div>
                          <button
                            onClick={() => removeDecoration(decoration.id)}
                            className="absolute -top-2 -right-2 w-4 h-4 sm:w-5 sm:h-5 bg-purple-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100 active:opacity-100 transition-opacity shadow-md"
                            aria-label={`إزالة ${decoration.name}`}
                          >
                            <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          </button>
                        </motion.div>
                      ))}
                    </div>

                    {/* Box inner shadow effect */}
                    <div className="absolute inset-0 rounded-lg shadow-inner pointer-events-none"></div>
                  </div>

                  {selectedBag && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      className="absolute -bottom-6 -left-5 -right-5 top-[80%] rounded-b-xl shadow-lg overflow-hidden"
                      style={{
                        backgroundColor: selectedBag.color || "#f3f4f6",
                        backgroundImage: selectedBag.pattern ? `url(${selectedBag.pattern})` : "none",
                        backgroundSize: "cover",
                        backgroundRepeat: "no-repeat",
                      }}
                    >
                      {/* Bag handle */}
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-20 h-4 border-t-2 border-l-2 border-r-2 rounded-t-full border-gray-400"></div>
                      
                      {/* Bag texture/shine */}
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/5"></div>
                      
                      {/* Bag bottom fold */}
                      <div className="absolute bottom-0 inset-x-0 h-3 bg-black/10"></div>
                    </motion.div>
                  )}
                  
                  {/* 3D shadow effect */}
                  <div className="absolute -bottom-2 left-4 right-4 h-6 bg-black/5 blur-md rounded-full"></div>
                </div>
              ) : (
                <div className="text-center p-6 sm:p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50/50 shadow-inner">
                  <p className="text-gray-500 text-sm sm:text-base">يرجى اختيار صندوق لبدء تخصيص هديتك</p>
                  <p className="text-gray-400 text-xs mt-2">Select a box to start customizing your gift</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4 border-t">
        <Slider
          value={[scale * 100]}
          min={50}
          max={300}
          step={5}
          onValueChange={(value) => setScale(value[0] / 100)}
          className="w-full"
        />
      </div>
    </div>
  )
}
