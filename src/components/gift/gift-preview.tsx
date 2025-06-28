"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { motion, useDragControls, AnimatePresence } from "framer-motion"
import { useSelector, useDispatch } from "react-redux"
import { X, RefreshCw, ZoomIn, ZoomOut, Move, Gift, Sparkles, Package, Star, ArrowRight, ArrowLeft } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { removeSelectedProduct, removeSelectedSweet } from "@/lib/redux/slices/giftSlice"
import type { RootState } from "@/lib/redux/store"

interface FloatingParticle {
  id: number
  x: number
  y: number
  color: string
  size: number
  duration: number
  delay: number
}

export default function GiftPreview() {
  const selectedBox = useSelector((state: RootState) => state.gift.selectedBox)
  const selectedProductsRaw = useSelector((state: RootState) => state.gift.selectedProducts)
  const selectedSweetsRaw = useSelector((state: RootState) => state.gift.selectedSweets)
  const selectedBag = useSelector((state: RootState) => state.gift.selectedBag)
  
  const selectedProducts = useMemo(() => selectedProductsRaw || [], [selectedProductsRaw])
  const selectedSweets = useMemo(() => selectedSweetsRaw || [], [selectedSweetsRaw])
  const dispatch = useDispatch()

  // Enhanced state management
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [touchStartDistance, setTouchStartDistance] = useState<number | null>(null)
  const [initialScale, setInitialScale] = useState<number>(1)
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [isAnimating, setIsAnimating] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [currentView, setCurrentView] = useState<'overview' | 'details' | '3d'>('overview')
  const [particles, setParticles] = useState<FloatingParticle[]>([])
  const [showStats, setShowStats] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const dragControls = useDragControls()

  // Calculate gift statistics
  const giftStats = useMemo(() => {
    const totalItems = selectedProducts.length + selectedSweets.length
    const totalValue = [
      ...(selectedProducts || []).map(p => p.price * (p.quantity || 1)),
      ...(selectedSweets || []).map(s => s.price),
      selectedBox?.price || 0,
      selectedBag?.price || 0
    ].reduce((sum, price) => sum + price, 0)
    
    const completionPercentage = Math.min(100, (
      (selectedBox ? 25 : 0) +
      (selectedProducts.length > 0 ? 25 : 0) +
      (selectedSweets.length > 0 ? 25 : 0) +
      (selectedBag ? 25 : 0)
    ))

    return { totalItems, totalValue, completionPercentage }
  }, [selectedBox, selectedProducts, selectedSweets, selectedBag])

  // Enhanced zoom controls
  const handleZoomIn = useCallback(() => {
    setScale((prevScale) => Math.min(prevScale + 0.2, 4))
  }, [])

  const handleZoomOut = useCallback(() => {
    setScale((prevScale) => Math.max(prevScale - 0.2, 0.3))
  }, [])

  const handleReset = useCallback(() => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
    setRotation({ x: 0, y: 0 })
    setCurrentView('overview')
  }, [])

  // Enhanced particle system
  const createParticles = useCallback(() => {
    const newParticles: FloatingParticle[] = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: ['#FFD700', '#FF6347', '#7B68EE', '#3CB371', '#FF69B4', '#FFA500'][Math.floor(Math.random() * 6)],
      size: Math.random() * 8 + 4,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 1
    }))
    setParticles(newParticles)
  }, [])

  // Enhanced bounds calculation
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

  // Enhanced wheel handling
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setScale(prev => Math.max(0.3, Math.min(4, prev + delta)))
  }, [])

  // Enhanced touch gestures
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
      
      const newScale = Math.max(0.3, Math.min(4, initialScale * (dist / touchStartDistance)))
      setScale(newScale)
    }
  }, [touchStartDistance, initialScale])

  // Enhanced celebration effect
  const handleCelebrate = useCallback(() => {
    if (isAnimating) return
    setIsAnimating(true)
    setShowConfetti(true)
    createParticles()
    
    setTimeout(() => {
      setIsAnimating(false)
      setShowConfetti(false)
      setParticles([])
    }, 4000)
  }, [isAnimating, createParticles])

  // Enhanced 3D rotation
  const handleBoxMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current || isAnimating || currentView !== '3d') return
    
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
    
    const rotateY = ((clientX - centerX) / centerX) * 15 // Enhanced rotation
    const rotateX = ((centerY - clientY) / centerY) * 15
    
    setRotation({ x: rotateX, y: rotateY })
  }, [isAnimating, currentView])

  // View switching
  const switchView = useCallback((newView: 'overview' | 'details' | '3d') => {
    setCurrentView(newView)
    if (newView === 'overview') {
      setScale(1)
      setRotation({ x: 0, y: 0 })
    } else if (newView === '3d') {
      setScale(1.2)
    }
  }, [])

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen)
  }, [isFullscreen])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "+" || e.key === "=") handleZoomIn()
      else if (e.key === "-" || e.key === "_") handleZoomOut()
      else if (e.key === "0") handleReset()
      else if (e.key === "f" || e.key === "F") toggleFullscreen()
      else if (e.key === "1") switchView('overview')
      else if (e.key === "2") switchView('details')
      else if (e.key === "3") switchView('3d')
      else if (e.key === " ") {
        e.preventDefault()
        handleCelebrate()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleZoomIn, handleZoomOut, handleReset, toggleFullscreen, switchView, handleCelebrate])

  // Update loading state
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => setIsLoading(false), 300)
    return () => clearTimeout(timer)
  }, [selectedBox, selectedProducts, selectedSweets, selectedBag])

  // Constrain position when scale changes
  useEffect(() => {
    setPosition(prevPosition => constrainPosition(prevPosition))
  }, [scale, constrainPosition])

  const renderGiftContent = () => {
    if (!selectedBox) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-8 border-2 border-dashed border-purple-300 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50"
        >
          <Package className="w-16 h-16 mx-auto text-purple-400 mb-4" />
          <h3 className="text-lg font-semibold text-purple-800 mb-2">ابدأ بناء هديتك المميزة</h3>
          <p className="text-purple-600 text-sm">اختر صندوق جميل لتبدأ رحلة إنشاء هدية لا تُنسى</p>
        </motion.div>
      )
    }

    return (
      <motion.div
        className="relative"
        onMouseMove={handleBoxMove}
        onTouchMove={handleBoxMove}
        onMouseLeave={() => setRotation({ x: 0, y: 0 })}
        onTouchEnd={() => setRotation({ x: 0, y: 0 })}
      >
        {/* Enhanced Gift Box */}
        <motion.div
          className="relative bg-white rounded-2xl shadow-2xl overflow-hidden"
          style={{
            minWidth: currentView === 'details' ? 280 : 220,
            minHeight: currentView === 'details' ? 280 : 220,
            transform: `perspective(1200px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transformStyle: 'preserve-3d',
          }}
          whileHover={{ scale: currentView === 'overview' ? 1.02 : 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Box Background */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-white to-gray-50"
            style={{
              backgroundImage: selectedBox.image ? `url(${selectedBox.image})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />

          {/* Enhanced Box Ribbon */}
          <div className="absolute -top-6 -left-6 -right-6 h-12 overflow-hidden">
            <motion.div 
              className="w-full h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 shadow-lg transform -rotate-2"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                backgroundSize: "200% 200%"
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -rotate-2" />
          </div>

          {/* Box Label */}
          <motion.div 
            className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg border border-purple-200"
            whileHover={{ scale: 1.05 }}
          >
            <span className="text-xs font-semibold text-purple-800">{selectedBox.name}</span>
          </motion.div>

          {/* Box Content Area */}
          <div className="relative z-10 p-6 h-full flex flex-col">
            {/* Products Grid */}
            <div className="flex-1 flex flex-wrap gap-3 justify-center items-center">
              <AnimatePresence>
                {selectedProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ scale: 0, rotate: -180, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    exit={{ scale: 0, rotate: 180, opacity: 0 }}
                    transition={{ 
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 500,
                      damping: 25
                    }}
                    className="relative group"
                    onMouseEnter={() => setHoveredItem(product.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shadow-lg border-2 border-white">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    
                    {/* Enhanced Remove Button */}
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: hoveredItem === product.id ? 1 : 0 }}
                      onClick={() => dispatch(removeSelectedProduct(product.id))}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </motion.button>

                    {/* Quantity Badge */}
                    <motion.div 
                      className="absolute -bottom-1 -right-1 bg-purple-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.3 }}
                    >
                      {product.quantity}
                    </motion.div>

                    {/* Product Info Tooltip */}
                    <AnimatePresence>
                      {hoveredItem === product.id && currentView === 'details' && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-20"
                        >
                          {product.name} - {product.price} ج.م
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Sweets */}
              <AnimatePresence>
                {selectedSweets.map((sweet, index) => (
                  <motion.div
                    key={sweet.id}
                    initial={{ scale: 0, rotate: 180, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    exit={{ scale: 0, rotate: -180, opacity: 0 }}
                    transition={{ 
                      delay: (selectedProducts.length + index) * 0.1,
                      type: "spring",
                      stiffness: 500,
                      damping: 25
                    }}
                    className="relative group"
                    onMouseEnter={() => setHoveredItem(sweet.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden shadow-md border border-pink-200">
                      <Image
                        src={sweet.image || "/placeholder.svg"}
                        alt={sweet.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-110"
                      />
                    </div>
                    
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: hoveredItem === sweet.id ? 1 : 0 }}
                      onClick={() => dispatch(removeSelectedSweet(sweet.id))}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md"
                    >
                      <X className="w-2 h-2" />
                    </motion.button>

                    <div className="absolute -bottom-1 -right-1 bg-pink-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                      <Sparkles className="w-2 h-2" />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Empty State for Products */}
            {selectedProducts.length === 0 && selectedSweets.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-gray-400"
              >
                <Gift className="w-12 h-12 mb-2" />
                <p className="text-sm">أضف منتجات وحلويات لهديتك</p>
              </motion.div>
            )}
          </div>

          {/* Box Glow Effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10 pointer-events-none" />
        </motion.div>

        {/* Enhanced Gift Bag */}
        {selectedBag && (
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.3 }}
            className="absolute -bottom-8 -left-8 -right-8 top-[70%] rounded-b-2xl overflow-hidden shadow-2xl"
            style={{
              background: selectedBag.image 
                ? `url(${selectedBag.image})` 
                : 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Bag Handles */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 flex gap-8">
              <div className="w-6 h-8 border-l-4 border-r-4 border-t-4 border-gray-600 rounded-t-full bg-transparent" />
              <div className="w-6 h-8 border-l-4 border-r-4 border-t-4 border-gray-600 rounded-t-full bg-transparent" />
            </div>
            
            {/* Bag Label */}
            <motion.div 
              className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-md"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-xs font-medium text-gray-700">{selectedBag.name}</span>
            </motion.div>

            {/* Bag Shine Effect */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            />
          </motion.div>
        )}

        {/* 3D Shadow */}
        <motion.div 
          className="absolute -bottom-4 left-8 right-8 h-8 bg-black/10 blur-xl rounded-full"
          animate={{ 
            scaleX: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </motion.div>
    )
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 ${
      isFullscreen ? 'fixed inset-4 z-50' : ''
    }`}>
      {/* Enhanced Header */}
      <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Gift className="w-6 h-6 text-purple-600" />
            <h2 className="font-bold text-gray-900 text-lg">معاينة الهدية المتقدمة</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowStats(!showStats)}
              className="text-purple-600 hover:text-purple-700"
            >
              <Star className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-purple-600 hover:text-purple-700"
            >
              {isFullscreen ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Stats Bar */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-3 gap-4 mb-3 text-center"
            >
              <div className="bg-white rounded-lg p-2 shadow-sm">
                <div className="text-lg font-bold text-purple-600">{giftStats.totalItems}</div>
                <div className="text-xs text-gray-600">عنصر</div>
              </div>
              <div className="bg-white rounded-lg p-2 shadow-sm">
                <div className="text-lg font-bold text-green-600">{giftStats.totalValue} ج.م</div>
                <div className="text-xs text-gray-600">القيمة</div>
              </div>
              <div className="bg-white rounded-lg p-2 shadow-sm">
                <div className="text-lg font-bold text-blue-600">{giftStats.completionPercentage}%</div>
                <div className="text-xs text-gray-600">مكتملة</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* View Controls */}
        <div className="flex items-center justify-between">
          <div className="flex bg-white rounded-lg p-1 shadow-sm">
            {(['overview', 'details', '3d'] as const).map((view) => (
              <button
                key={view}
                onClick={() => switchView(view)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  currentView === view
                    ? 'bg-purple-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                {view === 'overview' ? 'عام' : view === 'details' ? 'تفاصيل' : '3D'}
              </button>
            ))}
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white hover:bg-gray-50 shadow-sm transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium min-w-[50px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white hover:bg-gray-50 shadow-sm transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white hover:bg-gray-50 shadow-sm transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onPointerDown={(e) => {
                dragControls.start(e)
                setIsDragging(true)
              }}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white hover:bg-gray-50 shadow-sm transition-colors"
            >
              <Move className="w-4 h-4" />
            </button>
            <button
              onClick={handleCelebrate}
              disabled={isAnimating}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-100 hover:bg-purple-200 shadow-sm transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-purple-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Preview Area */}
      <div
        className={`relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-purple-50 touch-none ${
          isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-[400px] sm:h-[500px]'
        }`}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => setTouchStartDistance(null)}
        onDoubleClick={handleCelebrate}
        ref={containerRef}
      >
        {/* Floating Particles */}
        <AnimatePresence>
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{ opacity: 0, scale: 0, y: 100 }}
              animate={{ 
                opacity: [0, 1, 1, 0],
                scale: [0, 1, 1, 0],
                y: [100, -100],
                x: [particle.x, particle.x + (Math.random() - 0.5) * 100]
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                ease: "easeOut"
              }}
              className="absolute pointer-events-none rounded-full"
              style={{
                backgroundColor: particle.color,
                width: particle.size,
                height: particle.size,
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                filter: 'blur(1px)',
                zIndex: 10
              }}
            />
          ))}
        </AnimatePresence>

        {/* Confetti Effect */}
        <AnimatePresence>
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
              {Array.from({ length: 100 }).map((_, i) => {
                const delay = Math.random() * 2
                const duration = Math.random() * 3 + 2
                const xStart = Math.random() * 100
                const rotation = Math.random() * 360
                
                return (
                  <motion.div
                    key={i}
                    initial={{ 
                      opacity: 0,
                      y: -20,
                      x: `${xStart}%`,
                      rotate: 0,
                      scale: 0
                    }}
                    animate={{ 
                      opacity: [0, 1, 1, 0],
                      y: '100vh',
                      rotate: rotation,
                      scale: [0, 1, 1, 0]
                    }}
                    transition={{
                      duration,
                      delay,
                      ease: "easeOut"
                    }}
                    className="absolute w-3 h-3 rounded-sm"
                    style={{
                      backgroundColor: ['#FFD700', '#FF6347', '#7B68EE', '#3CB371', '#FF69B4', '#FFA500'][i % 6],
                    }}
                  />
                )
              })}
            </div>
          )}
        </AnimatePresence>

        {/* Loading Overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-30"
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto mb-4"
                />
                <p className="text-purple-600 font-medium">جاري تحديث الهدية...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="h-full flex items-center justify-center p-8">
          <motion.div
            ref={contentRef}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1,
              scale: isAnimating ? [1, 1.05, 0.95, 1.02, 0.98, 1] : scale,
              x: position.x,
              y: position.y,
            }}
            drag={isDragging}
            dragControls={dragControls}
            onDragEnd={() => setIsDragging(false)}
            dragConstraints={containerRef}
            dragElastic={0.1}
            dragTransition={{ power: 0.1, timeConstant: 200 }}
            transition={
              isAnimating 
                ? { duration: 1, times: [0, 0.2, 0.4, 0.6, 0.8, 1] }
                : { type: "spring", stiffness: 300, damping: 30 }
            }
            className="touch-none will-change-transform"
          >
            {renderGiftContent()}
          </motion.div>
        </div>
      </div>

      {/* Enhanced Footer */}
      <div className="p-4 border-t bg-gray-50">
        <div className="space-y-3">
          {/* Zoom Slider */}
          <div className="flex items-center gap-3">
            <ZoomOut className="w-4 h-4 text-gray-400" />
            <Slider
              value={[scale * 100]}
              min={30}
              max={400}
              step={10}
              onValueChange={(value) => setScale(value[0] / 100)}
              className="flex-1"
            />
            <ZoomIn className="w-4 h-4 text-gray-400" />
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
              animate={{ width: `${giftStats.completionPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Quick Actions */}
          <div className="flex justify-center gap-2 text-xs text-gray-500">
            <span>مساحة: احتفال</span>
            <span>•</span>
            <span>F: ملء الشاشة</span>
            <span>•</span>
            <span>1-3: تغيير العرض</span>
          </div>
        </div>
      </div>
    </div>
  )
}
