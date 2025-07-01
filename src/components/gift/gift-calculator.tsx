"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { Package, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface GiftCalculatorProps {
  box: {
    width?: number
    height?: number
    depth?: number
    price: number
  }
  items: Array<{
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
  }>
}

export default function GiftCalculator({ box, items }: GiftCalculatorProps) {
  // دالة للحصول على الأبعاد الافتراضية بناءً على الفئة (نفس اللي في SimpleGiftBox)
  const getDefaultDimensions = (category?: string, subCategory?: string) => {
    const cat = (subCategory || category)?.toLowerCase().trim() || ""
    
    const dimensions = {
      // === المنتجات ===
      'ساعات': { width: 4, height: 4, depth: 1 },
      'ساعة': { width: 4, height: 4, depth: 1 },
      'محافظ': { width: 10, height: 7, depth: 1.5 },
      'محفظة': { width: 10, height: 7, depth: 1.5 },
      'عطور': { width: 5, height: 10, depth: 5 },
      'عطر': { width: 5, height: 10, depth: 5 },
      'شنط يد': { width: 20, height: 15, depth: 8 },
      'شنط': { width: 20, height: 15, depth: 8 },
      'حقائب': { width: 20, height: 15, depth: 8 },
      'نظارات شمسية': { width: 14, height: 5, depth: 3 },
      'نظارات': { width: 14, height: 5, depth: 3 },
      'سبراي': { width: 4, height: 12, depth: 4 },
      'إكسسوارات': { width: 8, height: 8, depth: 2 },
      'العاب اطفال': { width: 12, height: 12, depth: 8 },
      'العاب': { width: 12, height: 12, depth: 8 },
      'ألعاب': { width: 12, height: 12, depth: 8 },
      'دباديب': { width: 15, height: 20, depth: 10 },
      'دبدوب': { width: 15, height: 20, depth: 10 },
      'ساعات اطفال': { width: 3, height: 3, depth: 1 },
      
      // === الحلويات - أبعاد واقعية ===
      'شوكولاتة': { width: 8, height: 1.5, depth: 12 },
      'شوكولاته': { width: 8, height: 1.5, depth: 12 },
      'حلوى': { width: 6, height: 6, depth: 2 },
      'كاندي': { width: 6, height: 6, depth: 2 },
      'شيبس': { width: 5, height: 12, depth: 5 },
      'بسكويت': { width: 7, height: 10, depth: 3 },
      
      // للتوافق مع الأسماء الإنجليزية
      'chocolate': { width: 8, height: 1.5, depth: 12 },
      'candy': { width: 6, height: 6, depth: 2 },
      'chips': { width: 5, height: 12, depth: 5 },
      'watches': { width: 4, height: 4, depth: 1 },
      'wallets': { width: 10, height: 7, depth: 1.5 },
      'perfumes': { width: 5, height: 10, depth: 5 },
      'handbags': { width: 20, height: 15, depth: 8 },
      'sunglasses': { width: 14, height: 5, depth: 3 },
      'spray': { width: 4, height: 12, depth: 4 },
      'accessories': { width: 8, height: 8, depth: 2 },
      'toys': { width: 12, height: 12, depth: 8 },
      'teddy-bears': { width: 15, height: 20, depth: 10 },
    }
    
    return dimensions[cat as keyof typeof dimensions] || { width: 8, height: 5, depth: 8 }
  }

  // حسابات متقدمة باستخدام الأبعاد الحقيقية من قاعدة البيانات
  const calculations = useMemo(() => {
    const boxVolume = (box.width || 25) * (box.height || 20) * (box.depth || 15)
    
    let totalVolume = 0
    let totalPrice = box.price
    let itemCount = 0
    
    items.forEach(item => {
      // استخدام الأبعاد الحقيقية من قاعدة البيانات أو الافتراضية الذكية
      let itemWidth = item.data.width
      let itemHeight = item.data.height  
      let itemDepth = item.data.depth
      
      // إذا لم تتوفر الأبعاد الحقيقية، استخدم الأبعاد الافتراضية حسب الفئة
      if (!itemWidth || !itemHeight || !itemDepth || itemWidth <= 0 || itemHeight <= 0 || itemDepth <= 0) {
        const defaultDims = getDefaultDimensions(item.data.category, item.data.subCategory)
        itemWidth = itemWidth || defaultDims.width
        itemHeight = itemHeight || defaultDims.height
        itemDepth = itemDepth || defaultDims.depth
        
        console.log(`📏 استخدام أبعاد افتراضية للمنتج ${item.data.name}:`, {
          category: item.data.category,
          subCategory: item.data.subCategory,
          dimensions: defaultDims,
          finalDimensions: { itemWidth, itemHeight, itemDepth }
        })
      } else {
        console.log(`📏 استخدام أبعاد من قاعدة البيانات للمنتج ${item.data.name}:`, {
          width: itemWidth,
          height: itemHeight,
          depth: itemDepth
        })
      }
      
      const itemVolume = itemWidth * itemHeight * itemDepth
      
      totalVolume += itemVolume * item.quantity
      totalPrice += item.data.price * item.quantity
      itemCount += item.quantity
    })
    
    // حساب نسبة الامتلاء بدقة - لا نتجاوز 100%
    const volumePercentage = Math.min((totalVolume / boxVolume) * 100, 100)
    
    // تسجيل مفصل للمراقبة
    console.log('🎁 حسابات GiftCalculator المفصلة:', {
      boxVolume: boxVolume.toFixed(2) + ' سم³',
      totalItemVolume: totalVolume.toFixed(2) + ' سم³',
      utilizationPercentage: volumePercentage.toFixed(1) + '%',
      itemsCount: items.length,
      totalItemsQuantity: itemCount,
      totalPrice: totalPrice.toFixed(2) + ' ج.م',
      itemsBreakdown: items.map(item => ({
        name: item.data.name,
        quantity: item.quantity,
        dimensions: {
          width: item.data.width || 'افتراضي',
          height: item.data.height || 'افتراضي', 
          depth: item.data.depth || 'افتراضي'
        },
        volume: ((item.data.width || getDefaultDimensions(item.data.category, item.data.subCategory).width) *
                (item.data.height || getDefaultDimensions(item.data.category, item.data.subCategory).height) *
                (item.data.depth || getDefaultDimensions(item.data.category, item.data.subCategory).depth) *
                item.quantity).toFixed(2) + ' سم³'
      }))
    })
    
    // تحديد حالة الهدية (بناءً على الحجم فقط)
    let status = "perfect"
    let statusText = "مثالية"
    let statusColor = "text-green-600"
    let statusIcon = CheckCircle2
    
    if (volumePercentage > 85) {
      status = "warning"
      statusText = "ممتلئة قليلاً"
      statusColor = "text-yellow-600"
      statusIcon = AlertTriangle
    }
    
    if (volumePercentage > 95) {
      status = "danger"
      statusText = "ممتلئة جداً"
      statusColor = "text-red-600"
      statusIcon = AlertTriangle
    }
    
    return {
      boxVolume,
      totalVolume,
      totalPrice,
      itemCount,
      volumePercentage,
      status,
      statusText,
      statusColor,
      statusIcon,
      efficiency: Math.min(volumePercentage / 70 * 100, 100) // كفاءة الاستخدام
    }
  }, [box, items])

  const getBarGradient = (percentage: number) => {
    if (percentage <= 70) return "from-green-400 to-green-600"
    if (percentage <= 85) return "from-yellow-400 to-yellow-600"
    return "from-red-400 to-red-600"
  }

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-4">
      {/* حالة الهدية */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <calculations.statusIcon className={`w-5 h-5 ${calculations.statusColor}`} />
          <span className={`font-semibold ${calculations.statusColor}`}>
            {calculations.statusText}
          </span>
        </div>
        <Badge variant={calculations.status === "perfect" ? "default" : calculations.status === "warning" ? "secondary" : "destructive"}>
          {calculations.efficiency.toFixed(0)}% كفاءة
        </Badge>
      </div>

      {/* الإحصائيات الرئيسية */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div 
          className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-700 font-medium">العناصر</span>
          </div>
          <div className="text-xl font-bold text-blue-900">{calculations.itemCount}</div>
        </motion.div>

        <motion.div 
          className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-700 font-medium">السعر</span>
          </div>
          <div className="text-xl font-bold text-green-900">{calculations.totalPrice.toFixed(2)} جنيه</div>
        </motion.div>
      </div>

      {/* مؤشر الحجم فقط */}
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">امتلاء الحجم</span>
            <span className="font-medium">{calculations.volumePercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div 
              className={`h-full bg-gradient-to-r ${getBarGradient(calculations.volumePercentage)}`}
              initial={{ width: 0 }}
              animate={{ width: `${calculations.volumePercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* تفاصيل إضافية */}
      <div className="grid grid-cols-1 gap-3 text-xs text-gray-600">
        <div>
          <span className="block">الحجم المستخدم:</span>
          <span className="font-medium">{calculations.totalVolume.toFixed(1)} سم³</span>
        </div>
      </div>

      {/* نصائح ذكية */}
      {calculations.status !== "perfect" && (
        <motion.div 
          className={`rounded-lg p-3 text-sm ${
            calculations.status === "warning" 
              ? "bg-yellow-50 text-yellow-800 border border-yellow-200" 
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {calculations.status === "warning" ? (
            <p>💡 الصندوق ممتلئ قليلاً. يمكنك إضافة عناصر صغيرة أخرى.</p>
          ) : (
            <p>⚠️ الصندوق ممتلئ جداً. فكر في صندوق أكبر أو تقليل العناصر.</p>
          )}
        </motion.div>
      )}
    </div>
  )
}
