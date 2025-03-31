"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { X } from "lucide-react"

interface ProductZoomProps {
  src: string
  alt: string
  isOpen: boolean
  onClose: () => void
}

export default function ProductZoom({ src, alt, isOpen, onClose }: ProductZoomProps) {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // Reset zoom and position when image changes or modal closes/opens
  useEffect(() => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }, [src, isOpen])

  // Handle keyboard events
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "+" || e.key === "=") handleZoom(0.1)
      if (e.key === "-") handleZoom(-0.1)
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  // Handle zoom
  const handleZoom = (delta: number) => {
    setScale((prevScale) => {
      const newScale = prevScale + delta
      return Math.max(0.5, Math.min(newScale, 3)) // Limit zoom between 0.5x and 3x
    })
  }

  // Handle wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY * -0.01
    handleZoom(delta)
  }

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    setIsDragging(true)

    // Get client position based on event type
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY

    setDragStart({
      x: clientX - position.x,
      y: clientY - position.y,
    })
  }

  // Handle drag
  const handleDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return

    // Get client position based on event type
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY

    setPosition({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y,
    })
  }

  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false)
  }

  // Double click to reset zoom
  const handleDoubleClick = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute top-4 right-4 z-10" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="bg-white rounded-full p-2 hover:bg-gray-200 transition-colors"
          aria-label="إغلاق"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleZoom(-0.2)
          }}
          className="bg-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-200 transition-colors"
          aria-label="تصغير"
        >
          <span className="text-xl font-bold">-</span>
        </button>
        <span className="bg-white rounded-full px-4 py-2 text-sm">{Math.round(scale * 100)}%</span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleZoom(0.2)
          }}
          className="bg-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-200 transition-colors"
          aria-label="تكبير"
        >
          <span className="text-xl font-bold">+</span>
        </button>
      </div>

      <div
        ref={containerRef}
        className="relative w-full h-full overflow-hidden cursor-move"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={handleDragStart}
        onMouseMove={handleDrag}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDrag}
        onTouchEnd={handleDragEnd}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
        style={{ touchAction: "none" }}
      >
        <div
          className="absolute left-1/2 top-1/2 transition-transform duration-100 ease-out"
          style={{
            transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${scale})`,
            willChange: "transform",
          }}
        >
          <Image
            src={src || "/placeholder.svg"}
            alt={alt}
            width={1000}
            height={1000}
            className="pointer-events-none max-w-[90vw] max-h-[90vh] object-contain"
            priority
          />
        </div>
      </div>

      <div className="absolute bottom-4 text-white text-xs text-center w-full opacity-70">
        استخدم عجلة الماوس للتكبير/التصغير • اسحب للتحريك • انقر مرتين لإعادة الضبط
      </div>
    </div>
  )
}

