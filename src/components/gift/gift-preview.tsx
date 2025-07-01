"use client"

import React from "react"
import { useMemo } from "react"
import { motion } from "framer-motion"
import { useSelector, useDispatch } from "react-redux"
import { Package, Gift, ShoppingBag, Trash2, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import { removeSelectedProduct, removeSelectedSweet, updateSelectedProductQuantity, updateSelectedSweetQuantity } from "@/lib/redux/slices/giftSlice"
import type { RootState } from "@/lib/redux/store"
import SimpleGiftBox from "@/components/gift/simple-gift-box"
import GiftCalculator from "@/components/gift/gift-calculator"
import type { GiftProduct, Sweet } from "@/types/database"

export default function GiftPreview() {
  const selectedBox = useSelector((state: RootState) => state.gift.selectedBox)
  const selectedProductsRaw = useSelector((state: RootState) => state.gift.selectedProducts)
  const selectedSweetsRaw = useSelector((state: RootState) => state.gift.selectedSweets)
  const selectedBag = useSelector((state: RootState) => state.gift.selectedBag)
  const dispatch = useDispatch()

  // تحويل البيانات لضمان عدم null
  const selectedProducts = useMemo(() => selectedProductsRaw || [], [selectedProductsRaw])
  const selectedSweets = useMemo(() => selectedSweetsRaw || [], [selectedSweetsRaw])

  // تحضير البيانات للـ GiftCalculator
  const calculatorItems = useMemo(() => {
    const items: Array<{
      type: "product" | "sweet"
      data: {
        name: string
        price: number
        width?: number
        height?: number
        depth?: number
        category: string
        subCategory?: string
      }
      quantity: number
    }> = []
    
    // إضافة المنتجات
    selectedProducts.forEach((product: GiftProduct & { quantity?: number }) => {
      items.push({
        type: "product",
        data: {
          name: product.name,
          price: product.price,
          width: product.width,
          height: product.height,
          depth: product.depth,
          category: product.category,
          subCategory: product.subCategory
        },
        quantity: product.quantity || 1
      })
    })
    
    // إضافة الحلويات
    selectedSweets.forEach((sweet: Sweet & { quantity?: number }) => {
      items.push({
        type: "sweet",
        data: {
          name: sweet.name,
          price: sweet.price,
          width: sweet.width,
          height: sweet.height,
          depth: sweet.depth,
          category: sweet.category,
          subCategory: sweet.category
        },
        quantity: sweet.quantity || 1
      })
    })
    
    return items
  }, [selectedProducts, selectedSweets])

  // حساب إحصائيات موحدة
  const giftStats = useMemo(() => {
    const productItems = selectedProducts.reduce((sum, item) => sum + (item.quantity || 1), 0)
    const sweetItems = selectedSweets.reduce((sum, item) => sum + (item.quantity || 1), 0)
    const totalItems = productItems + sweetItems + (selectedBox ? 1 : 0) + (selectedBag ? 1 : 0)
    
    const productValue = selectedProducts.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0)
    const sweetValue = selectedSweets.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0)
    const totalValue = productValue + sweetValue + (selectedBox?.price || 0) + (selectedBag?.price || 0)
    
    return { 
      totalItems, 
      totalValue, 
      productItems, 
      sweetItems,
      productValue,
      sweetValue
    }
  }, [selectedProducts, selectedSweets, selectedBox, selectedBag])

  const handleRemoveItem = (item: { type: string; data: { id: string } }) => {
    if (item.type === 'product') {
      dispatch(removeSelectedProduct(item.data.id))
    } else if (item.type === 'sweet') {
      dispatch(removeSelectedSweet(item.data.id))
    }
  }

  const handleUpdateQuantity = (item: { type: string; data: { id: string } }, newQuantity: number) => {
    if (newQuantity < 1) return
    
    if (item.type === 'product') {
      dispatch(updateSelectedProductQuantity({ id: item.data.id, quantity: newQuantity }))
    } else if (item.type === 'sweet') {
      dispatch(updateSelectedSweetQuantity({ id: item.data.id, quantity: newQuantity }))
    }
  }

  // جمع العناصر القابلة للتعديل فقط (المنتجات والحلويات)
  const editableItems = useMemo(() => {
    const items = []
    
    selectedProducts.forEach(product => {
      items.push({ type: 'product', data: product, quantity: product.quantity || 1 })
    })
    
    selectedSweets.forEach(sweet => {
      items.push({ type: 'sweet', data: sweet, quantity: sweet.quantity || 1 })
    })
    
    return items
  }, [selectedProducts, selectedSweets])

  if (giftStats.totalItems === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
        <div className="text-center p-8">
          <Gift className="w-16 h-16 text-purple-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">لا توجد عناصر بعد</h3>
          <p className="text-gray-500">ابدأ بإضافة العناصر إلى هديتك</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <Tabs defaultValue="preview" className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-2 rounded-none border-b bg-gray-50">
          <TabsTrigger value="preview" className="data-[state=active]:bg-white">
            معاينة البوكس
          </TabsTrigger>
          <TabsTrigger value="details" className="data-[state=active]:bg-white">
            المحتويات والتفاصيل
          </TabsTrigger>
        </TabsList>

        {/* معاينة البوكس */}
        <TabsContent value="preview" className="flex-1 p-4">
          {selectedBox ? (
            <div className="space-y-4">
              {/* العرض البسيط للصندوق */}
              <SimpleGiftBox 
                boxColor={selectedBox.color}
                boxDimensions={{
                  width: selectedBox.width || 25,
                  height: selectedBox.height || 20,
                  depth: selectedBox.depth || 15
                }}
              />
              
              {/* حاسبة الهدية المدمجة */}
              <GiftCalculator 
                box={{
                  width: selectedBox.width || 25,
                  height: selectedBox.height || 20,
                  depth: selectedBox.depth || 15,
                  price: selectedBox.price
                }}
                items={calculatorItems}
              />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center">
              <div>
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">اختر صندوقاً أولاً</h3>
                <p className="text-gray-500">يجب اختيار صندوق لرؤية معاينة البوكس</p>
              </div>
            </div>
          )}
        </TabsContent>

        {/* تفاصيل المحتويات */}
        <TabsContent value="details" className="flex-1 overflow-auto">
          <div className="p-4 space-y-4">
            {/* ملخص مفصل */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
              <h3 className="font-bold text-gray-900 mb-3">ملخص الهدية</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">المنتجات:</span>
                    <span className="font-semibold">{giftStats.productItems} × {giftStats.productValue.toLocaleString()} ج.م</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">الحلويات:</span>
                    <span className="font-semibold">{giftStats.sweetItems} × {giftStats.sweetValue.toLocaleString()} ج.م</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">الصندوق:</span>
                    <span className="font-semibold">{selectedBox?.price?.toLocaleString() || 0} ج.م</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-800 font-bold">الإجمالي:</span>
                    <span className="font-bold text-purple-600">{giftStats.totalValue.toLocaleString()} ج.م</span>
                  </div>
                </div>
              </div>
            </div>

            {/* قائمة المنتجات والحلويات القابلة للتعديل */}
            {editableItems.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">المحتويات القابلة للتعديل</h4>
                {editableItems.map((item, index) => (
                  <motion.div
                    key={`${item.type}-${item.data.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl p-3 border border-gray-200 hover:border-purple-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {item.data.image && (
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image
                            src={item.data.image}
                            alt={item.data.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold text-gray-900 text-sm truncate">
                          {item.data.name}
                        </h5>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-sm text-gray-600">
                            {item.data.price} ج.م
                          </span>
                          <span className="text-sm font-semibold text-purple-600">
                            {(item.data.price * item.quantity).toLocaleString()} ج.م
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                            className="w-6 h-6 p-0"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-sm font-medium px-2 min-w-[20px] text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                            className="w-6 h-6 p-0"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item)}
                          className="w-6 h-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* عناصر إضافية غير قابلة للتعديل */}
            {(selectedBag || selectedBox) && (
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">عناصر إضافية</h4>
                {selectedBox && (
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <Package className="w-8 h-8 text-purple-600" />
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-900">{selectedBox.name}</h5>
                        <span className="text-sm text-gray-600">{selectedBox.price} ج.م</span>
                      </div>
                    </div>
                  </div>
                )}
                {selectedBag && (
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="w-8 h-8 text-purple-600" />
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-900">{selectedBag.name}</h5>
                        <span className="text-sm text-gray-600">{selectedBag.price} ج.م</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
