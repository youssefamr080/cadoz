"use client"

import type React from "react"
import { useEffect, useState } from "react"
import type { Product } from "../../types/product"
import ProductCollection from "./ProductCollection"
import { motion } from "framer-motion"
import LoadingSpinner from "../ui/LoadingSpinner"

interface RecommendationEngineProps {
  title?: string
  subtitle?: string
}

const RecommendationEngine: React.FC<RecommendationEngineProps> = ({
  title = "مقترحة لك",
  subtitle = "منتجات قد تعجبك بناءً على اهتماماتك",
}) => {
  const [recommendations, setRecommendations] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true)

        // استرجاع المنتجات المشاهدة من Local Storage
        const viewedProductsData = localStorage.getItem("viewedProducts")
        let viewedProducts: Product[] = []

        if (viewedProductsData) {
          viewedProducts = JSON.parse(viewedProductsData)
        }

        // استخراج الفئات والعلامات من المنتجات المشاهدة
        const viewedCategories = new Set(viewedProducts.map((p) => p.category).filter(Boolean))
        const viewedTags = new Set(viewedProducts.flatMap((p) => p.tags || []).filter(Boolean))
        const viewedIds = viewedProducts.map((p) => p.id)

        // بناء معلمات الاستعلام
        const params = new URLSearchParams()

        // إضافة الفئات والعلامات إذا كانت متوفرة
        if (viewedCategories.size > 0) {
          const categoriesArray = Array.from(viewedCategories)
          const randomCategory = categoriesArray[Math.floor(Math.random() * categoriesArray.length)]
          params.append("category", randomCategory)
        }

        if (viewedTags.size > 0) {
          const tagsArray = Array.from(viewedTags)
          const randomTags = tagsArray
            .sort(() => 0.5 - Math.random())
            .slice(0, 3)
            .join(",")
          params.append("tags", randomTags)
        }

        // استبعاد المنتجات التي شاهدها المستخدم بالفعل
        if (viewedIds.length > 0) {
          params.append("excludeIds", viewedIds.join(","))
        }

        // إضافة حد للنتائج
        params.append("limit", "8")

        // جلب التوصيات
        const response = await fetch(`/api/products/recommendations?${params.toString()}`)
        const data = await response.json()

        if (data.success && data.data.length > 0) {
          setRecommendations(data.data)
        } else {
          // إذا لم تكن هناك توصيات محددة، جلب منتجات عشوائية ذات تقييم عالٍ
          const fallbackResponse = await fetch("/api/products?rating=4&limit=8&sort=rating_desc")
          const fallbackData = await fallbackResponse.json()

          if (fallbackData.success) {
            setRecommendations(fallbackData.data)
          } else {
            setError("لا يمكن تحميل التوصيات")
          }
        }
      } catch (err) {
        console.error("Error fetching recommendations:", err)
        setError("حدث خطأ أثناء تحميل التوصيات")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecommendations()
  }, [])

  // التأثير الحركي للعناصر عند ظهورها
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  if (isLoading) {
    return <LoadingSpinner message="جاري تحميل التوصيات..." />
  }

  if (error || recommendations.length === 0) {
    return null // لا نعرض أي شيء إذا كان هناك خطأ أو لا توجد توصيات
  }

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeInUp}
      className="py-16 bg-gradient-to-b from-white to-gray-50"
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white mb-4 shadow-lg shadow-purple-200/50">
            <span className="text-2xl">✨</span>
          </div>
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">{title}</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full mb-3"></div>
          <p className="text-center text-gray-600 max-w-2xl">{subtitle}</p>
        </div>

        <ProductCollection products={recommendations} accentColor="violet" />
      </div>
    </motion.section>
  )
}

export default RecommendationEngine

