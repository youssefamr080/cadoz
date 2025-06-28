"use client"

import type React from "react"
import type { GiftProduct } from "@/types/database"
import type { RootState } from "@/lib/redux/store"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSelector, useDispatch } from "react-redux"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingCart, Package, Plus, Minus, AlertTriangle } from "lucide-react"
import Image from "next/image"

import { addSelectedProduct, removeSelectedProduct, updateSelectedProductQuantity } from "@/lib/redux/slices/giftSlice"

const sortOptions = [
  { value: "priceAsc", label: "السعر: من الأقل إلى الأعلى" },
  { value: "priceDesc", label: "السعر: من الأعلى إلى الأقل" },
  { value: "nameAsc", label: "الاسم: أ-ي" },
]

export default function CartProductSelector() {
  const cartItemsRaw = useSelector((state: RootState) => state.cart.cart) || []
  const selectedProducts = useSelector((state: RootState) => state.gift.selectedProducts) || []
  const dispatch = useDispatch()
  
  const [sortBy, setSortBy] = useState("nameAsc")

  // تحويل عناصر السلة إلى منتجات هدايا
  const cartProducts = useMemo(() => {
    const items = cartItemsRaw || []
    return items.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category || "منتجات متنوعة",
      image: item.image || "/placeholder.svg",
      price: item.price,
      old_price: item.originalPrice || undefined,
      stock: item.stock || 999,
      quantity: 1, // الكمية الافتراضية عند إضافة المنتج للهدية
    } as GiftProduct))
  }, [cartItemsRaw])

  // ترتيب المنتجات
  const sortedProducts = useMemo(() => {
    const products = [...cartProducts]
    switch (sortBy) {
      case "priceAsc":
        return products.sort((a, b) => a.price - b.price)
      case "priceDesc":
        return products.sort((a, b) => b.price - a.price)
      case "nameAsc":
        return products.sort((a, b) => a.name.localeCompare(b.name, "ar"))
      default:
        return products
    }
  }, [cartProducts, sortBy])

  // التحقق من إضافة منتج
  const isProductSelected = (productId: string) => {
    return selectedProducts.some(p => p.id === productId)
  }

  // الحصول على كمية المنتج المحدد
  const getSelectedQuantity = (productId: string) => {
    const product = selectedProducts.find(p => p.id === productId)
    return product?.quantity || 0
  }

  // إضافة منتج للهدية
  const handleAddProduct = (product: GiftProduct) => {
    dispatch(addSelectedProduct(product))
  }

  // إزالة منتج من الهدية
  const handleRemoveProduct = (productId: string) => {
    dispatch(removeSelectedProduct(productId))
  }

  // تحديث كمية المنتج
  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveProduct(productId)
    } else {
      dispatch(updateSelectedProductQuantity({ id: productId, quantity }))
    }
  }

  if (cartItemsRaw.length === 0) {
    return (
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-green-400 to-green-500 mb-6 shadow-lg">
            <ShoppingCart className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            السلة فارغة حالياً
          </h3>
          <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto leading-relaxed">
            يجب إضافة منتجات للسلة أولاً لتتمكن من إضافتها لهديتك المخصصة
          </p>
          <Button
            onClick={() => window.location.href = '/'}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300"
            size="lg"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            تصفح المنتجات
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* العنوان والوصف */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-green-600 mb-4 shadow-lg">
          <ShoppingCart className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-3">
          اختر المنتجات لهديتك
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
          اختر المنتجات من سلتك لإضافتها إلى الهدية المخصصة
        </p>
      </motion.div>

      {/* عرض المنتجات المحددة للهدية */}
      {selectedProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-lg text-green-800">
              المنتجات المحددة للهدية ({selectedProducts.length})
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {selectedProducts.map((product, index) => (
              <motion.div 
                key={product.id} 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-4 shadow-md border border-green-100 hover:shadow-lg transition-all duration-300"
              >
                <div className="relative aspect-square bg-gray-50 rounded-lg mb-3 overflow-hidden">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-contain p-2 hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h4 className="font-medium text-sm mb-2 line-clamp-2 min-h-[40px] text-gray-900">
                  {product.name}
                </h4>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-green-600 font-bold text-sm">
                    {product.price} ج.م
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                    × {product.quantity}
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveProduct(product.id)}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white text-sm py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-sm"
                >
                  إزالة من الهدية
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* أدوات الفلترة والترتيب */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
      >
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end">
          <div className="flex-1">
            <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
              </svg>
              ترتيب حسب
            </label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 hover:border-green-300 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-2">
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="rounded-lg">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-green-100 to-blue-100 px-4 py-3 rounded-xl">
              <div className="text-sm font-bold text-gray-800">
                {cartProducts.length} منتج متاح
              </div>
              <div className="text-xs text-gray-600">
                في سلة التسوق
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* قائمة المنتجات */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-bold text-xl text-gray-900">
            المنتجات المتاحة في السلة
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {sortedProducts.map((product, index) => {
              const isSelected = isProductSelected(product.id)
              const selectedQuantity = getSelectedQuantity(product.id)
              const cartItem = cartItemsRaw.find(item => item.id === product.id)
              const maxQuantity = cartItem?.quantity || 1

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className={`group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 overflow-hidden ${
                    isSelected ? "border-green-400 ring-4 ring-green-100 bg-gradient-to-br from-green-50 to-blue-50" : "border-gray-200 hover:border-green-300"
                  }`}
                >
                  <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-contain p-4 group-hover:scale-110 transition-transform duration-300"
                    />
                    {isSelected && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h4 className="font-bold text-gray-900 text-sm mb-3 line-clamp-2 min-h-[40px] leading-tight">
                      {product.name}
                    </h4>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                        {product.price}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        متوفر: {maxQuantity}
                      </span>
                    </div>

                    {isSelected ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-3">
                          <button
                            onClick={() => handleUpdateQuantity(product.id, selectedQuantity - 1)}
                            className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white flex items-center justify-center hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-110 shadow-md"
                            disabled={selectedQuantity <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-bold text-lg text-green-800">
                            {selectedQuantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(product.id, selectedQuantity + 1)}
                            className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white flex items-center justify-center hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-110 shadow-md"
                            disabled={selectedQuantity >= maxQuantity}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemoveProduct(product.id)}
                          className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl text-sm hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                        >
                          إزالة من الهدية
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAddProduct(product)}
                        className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-xl text-sm hover:from-green-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        إضافة للهدية
                      </button>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </motion.div>

      {selectedProducts.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-200 text-center"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-200 rounded-full mb-4">
            <AlertTriangle className="w-6 h-6 text-yellow-700" />
          </div>
          <h4 className="font-bold text-yellow-800 text-lg mb-2">لا توجد منتجات محددة</h4>
          <p className="text-yellow-700 leading-relaxed">
            لم تحدد أي منتجات للهدية بعد. اختر منتجات من السلة لإضافتها لهديتك المخصصة.
          </p>
        </motion.div>
      )}
    </div>
  )
}
