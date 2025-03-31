"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Header from "../../../components/layout/Header"
import Footer from "../../../components/layout/Footer"
import { useGetProductsQuery } from "../../../lib/redux/api/apiSlice"
import LoadingSpinner from "../../../components/ui/LoadingSpinner"
import Image from "next/image"
import Link from "next/link"
import { Tag, SlidersHorizontal, Check } from "lucide-react"
import { Button } from "../../../components/ui/button"

import { useSortOptions } from "../../../lib/hooks/use-sort-options"

const SalePage = () => {
  const [isPageLoaded, setIsPageLoaded] = useState(false)

  // Solo usamos el hook de ordenación
  const { sortOption, showSortOptions, setShowSortOptions, handleSortChange } = useSortOptions("discount")

  // Parámetros simplificados para la API
  const queryParams = {
    sale: true,
    limit: 50,
    sort: sortOption,
  }

  // Consulta de productos
  const {
    data: productsResponse,
    isLoading: isProductsLoading,
    refetch,
    isFetching,
    isError,
  } = useGetProductsQuery(queryParams)

  // Recargar datos cuando cambie la ordenación
  useEffect(() => {
    refetch()
  }, [sortOption, refetch])

  // Efecto para simular carga
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Cerrar menú de ordenación al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = () => {
      if (showSortOptions) {
        setShowSortOptions(false)
      }
    }

    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [showSortOptions, setShowSortOptions])

  // Animaciones
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  // Estado de carga
  const isLoading = isProductsLoading || !isPageLoaded || isFetching

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <LoadingSpinner message="جاري تحميل العروض..." />
      </div>
    )
  }

  // Productos
  const products = productsResponse?.data || []

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="pb-16">
        {/* بانر الصفحة */}
        <div className="relative h-48 md:h-64 lg:h-80 bg-gradient-to-r from-rose-500 to-red-700 overflow-hidden">
          <div className="absolute inset-0 bg-pattern opacity-10"></div>
          <div className="container mx-auto px-4 h-full flex flex-col justify-center items-center text-white relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4">
                <Tag className="w-8 h-8" />
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">العروض والخصومات</h1>
              <p className="text-white/80 max-w-xl mx-auto">
                اكتشف أفضل العروض والخصومات الحصرية على منتجاتنا المميزة لفترة محدودة
              </p>
            </motion.div>
          </div>
        </div>

        {/* قسم المنتجات */}
        <div className="container mx-auto px-4 py-6">
          {/* خيارات الترتيب فقط */}
          <div className="flex justify-end mb-6">
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowSortOptions(!showSortOptions)
                }}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>ترتيب حسب</span>
              </Button>

              {/* قائمة خيارات الترتيب */}
              {showSortOptions && (
                <div
                  className="absolute top-full right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-slate-200 z-50 overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="py-1">
                    <button
                      className={`w-full text-right px-4 py-2 text-sm ${
                        sortOption === "discount" ? "bg-slate-100 text-rose-600" : "text-slate-700 hover:bg-slate-50"
                      }`}
                      onClick={() => handleSortChange("discount")}
                    >
                      <div className="flex items-center justify-between">
                        <span>نسبة الخصم</span>
                        {sortOption === "discount" && <Check className="w-4 h-4" />}
                      </div>
                    </button>
                    <button
                      className={`w-full text-right px-4 py-2 text-sm ${
                        sortOption === "price_asc" ? "bg-slate-100 text-rose-600" : "text-slate-700 hover:bg-slate-50"
                      }`}
                      onClick={() => handleSortChange("price_asc")}
                    >
                      <div className="flex items-center justify-between">
                        <span>السعر: من الأقل للأعلى</span>
                        {sortOption === "price_asc" && <Check className="w-4 h-4" />}
                      </div>
                    </button>
                    <button
                      className={`w-full text-right px-4 py-2 text-sm ${
                        sortOption === "price_desc" ? "bg-slate-100 text-rose-600" : "text-slate-700 hover:bg-slate-50"
                      }`}
                      onClick={() => handleSortChange("price_desc")}
                    >
                      <div className="flex items-center justify-between">
                        <span>السعر: من الأعلى للأقل</span>
                        {sortOption === "price_desc" && <Check className="w-4 h-4" />}
                      </div>
                    </button>
                    <button
                      className={`w-full text-right px-4 py-2 text-sm ${
                        sortOption === "newest" ? "bg-slate-100 text-rose-600" : "text-slate-700 hover:bg-slate-50"
                      }`}
                      onClick={() => handleSortChange("newest")}
                    >
                      <div className="flex items-center justify-between">
                        <span>الأحدث</span>
                        {sortOption === "newest" && <Check className="w-4 h-4" />}
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* عرض المنتجات */}
          {isError ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                <Tag className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-medium text-slate-700 mb-2">حدث خطأ أثناء تحميل المنتجات</h3>
              <p className="text-slate-500 max-w-md mx-auto">يرجى المحاولة مرة أخرى لاحقاً أو الاتصال بالدعم الفني.</p>
              <button
                onClick={() => refetch()}
                className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition-colors"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : products.length > 0 ? (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
            >
              {products.map((product) => (
                <motion.div key={product.id} variants={fadeInUp}>
                  <Link
                    href={`/product/${product.id}`}
                    className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col h-full border border-slate-200"
                  >
                    <div className="relative pt-[100%] overflow-hidden bg-slate-100">
                      <Image
                        src={product.image || "/placeholder.svg?height=300&width=300"}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-110 duration-700"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      />
                      {product.old_price && (
                        <div className="absolute top-2 left-2 bg-gradient-to-r from-rose-500 to-red-700 text-white py-0.5 px-2 text-xs font-semibold rounded-full shadow-sm">
                          {Math.round(((product.old_price - product.price) / product.old_price) * 100)}%
                        </div>
                      )}
                    </div>
                    <div className="p-3 flex-1 flex flex-col">
                      <h3 className="font-medium text-sm line-clamp-2 mb-1 flex-1 group-hover:text-rose-600 transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between mt-auto">
                        <p className="text-slate-900 font-bold text-base">
                          {product.price} <span className="text-xs">ج.م</span>
                        </p>
                        {product.old_price && (
                          <p className="text-slate-500 line-through text-xs">{product.old_price} ج.م</p>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                <Tag className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-medium text-slate-700 mb-2">لا توجد منتجات متاحة</h3>
              <p className="text-slate-500 max-w-md mx-auto">
                لم نتمكن من العثور على منتجات في هذه الفئة. يرجى المحاولة مرة أخرى لاحقاً.
              </p>
            </div>
          )}
        </div>
      </main>



      <Footer />
    </div>
  )
}

export default SalePage
