"use client"

import type React from "react"
import type { Product } from "@/types/database"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useGift } from "@/context/gift-context"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, Search, Plus, Minus, AlertTriangle, ShoppingCart } from "lucide-react"
import { getAllProducts, filterProducts, searchProducts } from "@/lib/actions/product-actions"
import Image from "next/image"
import { Swiper, SwiperSlide } from "swiper/react"
import { FreeMode, Navigation } from "swiper/modules"
import "swiper/css"
import "swiper/css/free-mode"

const categories = ["الكل", "شوكولاتة", "حلويات", "شيبسي"]

const sortOptions = [
  { value: "popular", label: "الأكثر شيوعاً" },
  { value: "priceAsc", label: "السعر: من الأقل إلى الأعلى" },
  { value: "priceDesc", label: "السعر: من الأعلى إلى الأقل" },
  { value: "nameAsc", label: "الاسم: أ-ي" },
]


// Add occasion options
const occasionOptions = [
  { value: "all", label: "جميع المناسبات" },
  { value: "birthday", label: "أعياد الميلاد" },
  { value: "wedding", label: "الزفاف" },
  { value: "graduation", label: "التخرج" },
  { value: "anniversary", label: "الذكرى السنوية" },
]

export default function ProductSelector() {
  const { 
    selectedProducts, 
    addProduct, 
    updateProductQuantity, 
    cartItems, 
    addCartItemToGift, 
    saveForLater 
  } = useGift()
  
  // Render cart items section at the start of the component
  const renderCartItems = () => {
    return (
      <div className="mb-6">
        {cartItems.length > 0 ? (
          <>
            <h3 className="font-medium text-lg mb-4 text-purple-800 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              منتجات من السلة
            </h3>
            <Swiper
              modules={[FreeMode, Navigation]}
              spaceBetween={12}
              slidesPerView="auto"
              freeMode={true}
              className="cart-items-swiper"
              dir="rtl"
            >
              {cartItems.map((item) => (
                <SwiperSlide key={item.id} className="!w-[160px] sm:!w-[180px]">
                  <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-purple-100 h-full">
                    <div className="relative aspect-square bg-gray-50 rounded-t-lg">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                    <div className="p-3">
                      <h4 className="font-medium text-sm mb-2 line-clamp-2 min-h-[40px]">{item.name}</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-purple-600 font-medium text-sm">{item.price} ج.م</span>
                        <button
                          onClick={() => addCartItemToGift(item)}
                          className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs hover:bg-purple-200 transition-colors"
                        >
                          إضافة
                        </button>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </>
        ) : (
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <p className="text-purple-600 text-sm">لا توجد منتجات في السلة حالياً</p>
          </div>
        )}
      </div>
    );
  };

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("الكل")
  const [sortBy, setSortBy] = useState("popular")
  const [availabilityFilter, setAvailabilityFilter] = useState(false)
  const [flavorFilter, setFlavorFilter] = useState<string[]>([])
  const [occasionFilter, setOccasionFilter] = useState<string>("")

  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({})
  const [, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all products on initial load
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsPageLoading(true)
        const data = await getAllProducts()
        setProducts(data)
        setError(null)
      } catch (err) {
        console.error("Error loading products:", err)
        setError("حدث خطأ أثناء تحميل المنتجات. يرجى المحاولة مرة أخرى.")
      } finally {
        setIsPageLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Apply sorting
  const applySorting = useCallback((productsToSort: Product[]): Product[] => {
    const sorted = [...productsToSort]

    switch (sortBy) {
      case "priceAsc":
        sorted.sort((a, b) => a.price - b.price)
        break
      case "priceDesc":
        sorted.sort((a, b) => b.price - a.price)
        break
      case "nameAsc":
        sorted.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "popular":
        sorted.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0))
        break
    }

    return sorted
  }, [sortBy])

  // Client side filtering for search results
  const applyClientSideFilters = useCallback((productsToFilter: Product[]) => {
    let result = productsToFilter

    if (selectedCategory !== "الكل") {
      result = result.filter((p) => p.category === selectedCategory)
    }

    if (flavorFilter.length > 0) {
      result = result.filter((p) => p.flavor && flavorFilter.includes(p.flavor))
    }

    if (occasionFilter && occasionFilter !== "all") {
      result = result.filter((p) => p.occasion === occasionFilter)
    }

    if (availabilityFilter) {
      result = result.filter((p) => p.stock > 0)
    }

    return applySorting(result)
  }, [selectedCategory, flavorFilter, occasionFilter, availabilityFilter, applySorting])

  // Apply filters whenever they change
  useEffect(() => {
    const applyFilters = async () => {
      try {
        setIsPageLoading(true)

        // If searching, use search function
        if (searchTerm.trim()) {
          const searchResults = await searchProducts(searchTerm)
          const filtered = applyClientSideFilters(searchResults)
          setFilteredProducts(filtered)
        } else {
          // Otherwise use regular filtering
          const filters: {
            category?: string
            flavor?: string[]
            occasion?: string
            inStock?: boolean
          } = {}

          if (selectedCategory !== "الكل") {
            filters.category = selectedCategory
          }

          if (flavorFilter.length > 0) {
            filters.flavor = flavorFilter
          }

          if (occasionFilter && occasionFilter !== "all") {
            filters.occasion = occasionFilter
          }

          if (availabilityFilter) {
            filters.inStock = true
          }

          const filteredData = await filterProducts(filters)
          const sortedData = applySorting(filteredData)
          setFilteredProducts(sortedData)
        }

        setError(null)
      } catch (err) {
        console.error("Error filtering products:", err)
        setError("حدث خطأ أثناء تصفية المنتجات. يرجى المحاولة مرة أخرى.")
      } finally {
        setIsPageLoading(false)
      }
    }

    applyFilters()
  }, [searchTerm, selectedCategory, availabilityFilter, flavorFilter, occasionFilter, sortBy, applyClientSideFilters, applySorting])

  const initializeQuantities = useCallback(() => {
    const initialQuantities: Record<string, number> = {}
    selectedProducts.forEach((product) => {
      initialQuantities[product.id] = product.quantity || 1
    })
    setQuantities(initialQuantities)
  }, [selectedProducts])

  useEffect(() => {
    initializeQuantities()
  }, [initializeQuantities])

  const handleQuantityChange = (productId: string, newQuantity: number, stock: number) => {
    if (newQuantity < 1 || newQuantity > stock) return

    setQuantities((prev) => ({ ...prev, [productId]: newQuantity }))

    const existingProductIndex = selectedProducts.findIndex((p) => p.id === productId)
    if (existingProductIndex >= 0) {
      updateProductQuantity(productId, newQuantity)
    }
  }

  const handleAddToGift = (product: Product) => {
    setIsLoading((prev) => ({ ...prev, [product.id]: true }))

    setTimeout(() => {
      const quantity = quantities[product.id] || 1
      addProduct({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        stock: product.stock,
        popular: product.popular,
        quantity,
      })
      setIsLoading((prev) => ({ ...prev, [product.id]: false }))
    }, 300)
  }

  const handleSaveForLater = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation()
    saveForLater({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      type: "product",
    })
  }

  const isProductSelected = (productId: string) => {
    return selectedProducts.some((p) => p.id === productId)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  return (
    <div className="space-y-6">
      {renderCartItems()}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">اختر محتويات الهدية</h2>
        <p className="text-gray-600">أضف المنتجات التي تريد وضعها في صندوق الهدية</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="ابحث عن المنتجات..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10 pr-4"
          />
        </div>

        <div className="flex gap-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="التصنيف" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="ترتيب حسب" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex items-center space-x-2 space-x-reverse">
          <Checkbox
            id="availability"
            checked={availabilityFilter}
            onCheckedChange={(checked) => setAvailabilityFilter(checked as boolean)}
          />
          <Label htmlFor="availability">عرض المنتجات المتوفرة فقط</Label>
        </div>

        <div>
          <Label className="block mb-2">المناسبة</Label>
          <Select value={occasionFilter} onValueChange={setOccasionFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="اختر المناسبة" />
            </SelectTrigger>
            <SelectContent>
              {occasionOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isPageLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-purple-500 rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="text-center p-8 text-red-500">{error}</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                layout
              >
                <div
                  className={`rounded-lg border-2 overflow-hidden transition-all ${
                    isProductSelected(product.id)
                      ? "border-purple-500 ring-2 ring-purple-200"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="relative aspect-square bg-gray-100">
                    {isLoading[product.id] ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-gray-200 border-t-purple-500 rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <>
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover p-4"
                        />
                        {product.stock <= 5 && (
                          <div className="absolute top-2 right-2 bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full flex items-center">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {product.stock > 0 ? `تبقى ${product.stock} فقط!` : "نفذ المخزون"}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm">{product.name}</h3>
                        <p className="text-xs text-gray-500">{product.category}</p>
                      </div>
                      <span className="font-bold text-purple-600 text-sm">{product.price} جنيه</span>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center border rounded-md">
                        <button
                          type="button"
                          disabled={!quantities[product.id] || quantities[product.id] <= 1}
                          onClick={() =>
                            handleQuantityChange(product.id, (quantities[product.id] || 1) - 1, product.stock)
                          }
                          className="px-1 py-0.5 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-1 py-0.5 text-xs font-medium">{quantities[product.id] || 1}</span>
                        <button
                          type="button"
                          disabled={product.stock <= 0 || (quantities[product.id] || 1) >= product.stock}
                          onClick={() =>
                            handleQuantityChange(product.id, (quantities[product.id] || 1) + 1, product.stock)
                          }
                          className="px-1 py-0.5 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => handleSaveForLater(product, e)}
                          className="text-xs h-7 w-7 p-0"
                        >
                          <Heart className="w-3 h-3" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          disabled={product.stock <= 0}
                          onClick={() => handleAddToGift(product)}
                          className="text-xs h-7"
                        >
                          {isProductSelected(product.id) ? "تحديث" : "إضافة"}
                        </Button>
                      </div>
                    </div>

                    <div className="mt-1 text-xs text-gray-600">
                      الإجمالي: {product.price * (quantities[product.id] || 1)} جنيه
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {filteredProducts.length === 0 && !isPageLoading && !error && (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-gray-500">لم يتم العثور على منتجات مطابقة للبحث</p>
        </div>
      )}
    </div>
  )
}
