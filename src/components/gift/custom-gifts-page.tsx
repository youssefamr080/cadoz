"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
import { getCustomGiftsByCategory } from "@/lib/actions/custom-gift-actions"
import type { CustomGift } from "@/types/database"
import Image from "next/image"
import Link from "next/link"

const categories = [
  { id: "all", name: "الكل" },
  { id: "accessories", name: "إكسسوارات" },
  { id: "art", name: "فن" },
]

export default function CustomGiftsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [customGifts, setCustomGifts] = useState<CustomGift[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCustomGifts = async () => {
      try {
        setIsLoading(true)
        const data = await getCustomGiftsByCategory(selectedCategory)
        setCustomGifts(data)
        setError(null)
      } catch (err) {
        console.error("Error loading custom gifts:", err)
        setError("حدث خطأ أثناء تحميل الهدايا المخصصة. يرجى المحاولة مرة أخرى.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCustomGifts()
  }, [selectedCategory])

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-6 lg:px-8 rtl">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-3xl font-bold text-gray-900">الهدايا المخصصة</h1>
            <p className="text-gray-600 mt-2">اختر من مجموعة الهدايا المخصصة التي يمكن تصميمها حسب طلبك</p>
          </motion.div>

          <Link href="/gift">
            <Button variant="outline" className="gap-2">
              <ArrowRight className="w-4 h-4" />
              العودة للرئيسية
            </Button>
          </Link>
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
          <TabsList className="w-full justify-start border-b rounded-none p-0 h-auto bg-transparent">
            {categories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-purple-500 data-[state=active]:text-purple-600 rounded-none px-4 py-2"
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-purple-500 rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center p-8 text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {customGifts.map((item, itemIndex) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full flex flex-col">
                  <div className="relative aspect-square bg-gray-100">
                    <Image 
                      src={item.image || "/placeholder.svg"} 
                      alt={item.name} 
                      fill 
                      sizes="(max-width: 480px) 80vw, (max-width: 768px) 40vw, 25vw"
                      className="object-cover p-4" 
                      priority={itemIndex < 2} // إعطاء الأولوية للمنتجات الأولى
                    />
                  </div>
                  <CardHeader>
                    <CardTitle>{item.name}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="font-bold text-purple-600">{item.price} جنيه</p>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button className="bg-purple-600 hover:bg-purple-700">طلب تخصيص</Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
