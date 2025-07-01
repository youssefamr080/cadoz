'use client'

import Image from "next/image"
import { useSelector } from "react-redux"
import type { RootState } from "@/lib/redux/store"
import type { GiftProduct, Sweet } from "@/types/database"

interface GiftItem {
  type: 'product' | 'candy'
  product?: GiftProduct
  candy?: Sweet
  quantity: number
  width?: number
  height?: number
  depth?: number
}

interface SimpleGiftBoxProps {
  boxColor: string
  boxDimensions: {
    width: number
    height: number
    depth: number
  }
}

// دالة للحصول على الأبعاد الافتراضية بناءً على الفئة
function getDefaultDimensions(category?: string): { width: number; height: number; depth: number } {
  const categoryDimensions: { [key: string]: { width: number; height: number; depth: number } } = {
    // منتجات
    'ساعات': { width: 5, height: 1, depth: 5 },
    'إكسسوارات': { width: 3, height: 1, depth: 3 },
    'عطور': { width: 4, height: 8, depth: 4 },
    'مجوهرات': { width: 2, height: 1, depth: 2 },
    'حقائب': { width: 20, height: 15, depth: 8 },
    'ألعاب أطفال': { width: 10, height: 10, depth: 10 },
    
    // حلويات
    'شوكولاتة': { width: 8, height: 2, depth: 12 },
    'حلوى': { width: 6, height: 4, depth: 6 },
    'كيك': { width: 15, height: 8, depth: 15 },
    'بسكويت': { width: 10, height: 3, depth: 15 },
    'مكسرات': { width: 8, height: 6, depth: 8 },
  }

  return categoryDimensions[category || ''] || { width: 8, height: 5, depth: 8 }
}

export default function SimpleGiftBox({ boxColor }: SimpleGiftBoxProps) {
  // الحصول على البيانات من Redux
  const selectedProductsRaw = useSelector((state: RootState) => state.gift.selectedProducts)
  const selectedSweetsRaw = useSelector((state: RootState) => state.gift.selectedSweets)
  const selectedBox = useSelector((state: RootState) => state.gift.selectedBox)

  // فحص البيانات المطلوبة
  if (!selectedBox) {
    return (
      <div className="w-full max-w-md mx-auto space-y-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5 text-center">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    )
  }

  // تحويل البيانات إلى تنسيق موحد
  const items: GiftItem[] = [
    ...(selectedProductsRaw || []).map(p => ({
      type: 'product' as const,
      product: p as GiftProduct,
      quantity: (p as GiftProduct & { quantity?: number }).quantity || 1, // قراءة الكمية الصحيحة
      width: p.width,
      height: p.height,
      depth: p.depth
    })),
    ...(selectedSweetsRaw || []).map(c => ({
      type: 'candy' as const,
      candy: c as Sweet,
      quantity: (c as Sweet & { quantity?: number }).quantity || 1, // قراءة الكمية الصحيحة
      width: c.width,
      height: c.height,
      depth: c.depth
    }))
  ]

  // تحويل العناصر إلى تنسيق موحد
  const allItems = (items || []).map(item => {
    const baseItem = item.product || item.candy
    if (!baseItem) return null

    // استخدام الأبعاد الحقيقية من قاعدة البيانات أو الافتراضية
    const realDimensions = {
      width: item.width || baseItem.width,
      height: item.height || baseItem.height,
      depth: item.depth || baseItem.depth
    }

    // إذا لم تتوفر أبعاد حقيقية، استخدم الأبعاد الافتراضية حسب الفئة
    const finalDimensions = realDimensions.width && realDimensions.height && realDimensions.depth
      ? realDimensions
      : getDefaultDimensions(baseItem.category)

    return {
      id: baseItem.id,
      name: baseItem.name,
      price: baseItem.price,
      image: baseItem.image,
      quantity: item.quantity,
      ...finalDimensions
    }
  }).filter(Boolean) as Array<{
    id: string
    name: string
    price: number
    image: string
    quantity: number
    width: number
    height: number
    depth: number
  }>

  // حساب نسبة الامتلاء بدقة
  const boxVolume = selectedBox.width * selectedBox.height * selectedBox.depth
  const totalItemsVolume = allItems.reduce((total, item) => {
    const itemVolume = item.width * item.height * item.depth
    return total + (itemVolume * item.quantity)
  }, 0)
  const utilizationPercentage = boxVolume > 0 ? Math.min((totalItemsVolume / boxVolume) * 100, 100) : 0

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* عرض المنتجات في بوكس واحد */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {/* هيدر البوكس */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold flex items-center gap-2">
              🎁 {selectedBox.name}
            </h4>
            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
              {allItems.length} منتج
            </span>
          </div>
          
          {/* شريط نسبة الامتلاء */}
          <div className="mt-3">
            <div className="flex justify-between items-center text-sm mb-1">
              <span>نسبة الامتلاء</span>
              <span className="font-bold">
                {utilizationPercentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-700 ${
                  utilizationPercentage > 90 ? 'bg-red-300' : 
                  utilizationPercentage > 70 ? 'bg-yellow-300' : 
                  'bg-green-300'
                }`}
                style={{ width: `${utilizationPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* محتويات البوكس */}
        <div className="p-4 min-h-[200px]" style={{ backgroundColor: `${boxColor}10` }}>
          {allItems.length > 0 ? (
            <div className="grid grid-cols-4 gap-3">
              {allItems.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="relative group"
                >
                  {/* صورة المنتج - صغيرة */}
                  <div className="aspect-square bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 hover:scale-105">
                    <Image
                      src={item.image || "/images/candy.png"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                    
                    {/* رقم الكمية - ظاهر دائماً */}
                    {item.quantity > 1 && (
                      <div className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg border border-white z-10">
                        {item.quantity}
                      </div>
                    )}
                  </div>
                  
                  {/* اسم المنتج عند التمرير */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/75 text-white text-xs p-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="truncate text-center">
                      {item.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl">📦</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                الصندوق فارغ
              </h3>
              <p className="text-sm text-gray-500">
                أضف المنتجات لرؤيتها هنا
              </p>
            </div>
          )}
        </div>

        {/* إجمالي السعر */}
        {allItems.length > 0 && (
          <div className="bg-gray-50 border-t p-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-800">الإجمالي</span>
              <span className="text-xl font-bold text-purple-600">
                {allItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()} ج.م
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
