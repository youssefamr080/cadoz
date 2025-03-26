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
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeInUp}
      className="bg-gray-50 py-12"
    >
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">
          <span className="text-purple-500">✨</span> {title}
        </h2>
        <p className="text-center text-gray-600 mb-8">{subtitle}</p>
        <ProductCollection products={recommendations} />
      </div>
    </motion.div>
  )
}

export default RecommendationEngine

