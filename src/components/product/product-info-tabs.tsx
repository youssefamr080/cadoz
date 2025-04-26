"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { FileText, Package, Truck } from "lucide-react"

interface ProductInfoTabsProps {
  description: string
  brand?: string
  colors?: string[]
  shippingInfo?: string
}

export default function ProductInfoTabs({
  description,
  brand = "غير محدد",
  colors = [],
  shippingInfo = "يتم شحن المنتج خلال 1-3 أيام عمل داخل المدن الرئيسية و3-5 أيام للمناطق الأخرى. الشحن مجاني للطلبات التي تزيد قيمتها عن 500 ج.م.",
}: ProductInfoTabsProps) {
  const [activeTab, setActiveTab] = useState("specifications")

  // تحويل أسماء الألوان إلى قيم CSS
  const getColorValue = (colorName: string): string => {
    const colorMap: Record<string, string> = {
      أحمر: "#ef4444",
      أخضر: "#22c55e",
      أزرق: "#3b82f6",
      أصفر: "#eab308",
      أسود: "#000000",
      أبيض: "#ffffff",
      رمادي: "#6b7280",
      بني: "#92400e",
      برتقالي: "#f97316",
      وردي: "#ec4899",
      بنفسجي: "#8b5cf6",
      ذهبي: "#d4af37",
      فضي: "#c0c0c0",
    }

    return colorMap[colorName] || colorName
  }

  return (
    <Tabs defaultValue="specifications" className="w-full" onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-3 mb-6">
        <TabsTrigger value="specifications" className="flex items-center gap-2">
          <Package className={`w-4 h-4 ${activeTab === "specifications" ? "text-blue-600" : "text-gray-500"}`} />
          <span className="hidden md:inline">المواصفات</span>
        </TabsTrigger>
        <TabsTrigger value="description" className="flex items-center gap-2">
          <FileText className={`w-4 h-4 ${activeTab === "description" ? "text-blue-600" : "text-gray-500"}`} />
          <span className="hidden md:inline">الوصف</span>
        </TabsTrigger>
        <TabsTrigger value="shipping" className="flex items-center gap-2">
          <Truck className={`w-4 h-4 ${activeTab === "shipping" ? "text-blue-600" : "text-gray-500"}`} />
          <span className="hidden md:inline">الشحن</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="specifications" className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="font-medium text-lg mb-3 text-gray-900">المواصفات</h3>

        {/* عرض الماركة */}
        <div className="flex border-b border-gray-100 py-3">
          <span className="font-medium text-gray-700 w-1/3">الماركة:</span>
          <span className="text-gray-600 w-2/3">{brand}</span>
        </div>

        {/* عرض الألوان المتاحة */}
        <div className="flex border-b border-gray-100 py-3">
          <span className="font-medium text-gray-700 w-1/3">الألوان المتاحة:</span>
          <div className="w-2/3">
            {colors && colors.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {colors.map((color, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className="w-8 h-8 rounded-full border border-gray-300"
                      style={{ backgroundColor: getColorValue(color) }}
                      title={color}
                    />
                    <span className="text-xs mt-1">{color}</span>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-gray-500">غير محدد</span>
            )}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="description" className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="font-medium text-lg mb-3 text-gray-900">وصف المنتج</h3>
        <div className="prose prose-sm max-w-none text-gray-700">
          <p>{description}</p>
        </div>
      </TabsContent>

      <TabsContent value="shipping" className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="font-medium text-lg mb-3 text-gray-900">معلومات الشحن</h3>
        <div className="prose prose-sm max-w-none text-gray-700">
          <p>{shippingInfo}</p>
          <ul className="mt-3 space-y-1">
            <li>توصيل سريع للمدن الرئيسية</li>
            <li>إمكانية تتبع الشحنة</li>
            <li>الشحن مجاني للطلبات فوق 500 ج.م</li>
          </ul>
        </div>
      </TabsContent>
    </Tabs>
  )
}
