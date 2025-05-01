"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useGift } from "@/context/gift-context"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import GiftPreview from "@/components/gift/gift-preview"
import BoxSelector from "@/components/gift/steps/box-selector"
import ProductSelector from "@/components/gift/steps/product-selector"
import DecorationSelector from "@/components/gift/steps/decoration-selector"
import BagSelector from "@/components/gift/steps/bag-selector"
import GiftSummary from "@/components/gift/steps/gift-summary"
import SavedItems from "@/components/gift/saved-items"
import { ChevronLeft, ChevronRight, Gift, Package, ShoppingCart, Sparkles, Palette, ClipboardList, Bookmark, User } from "lucide-react"
import InspirationGallery from "@/components/gift/inspiration-gallery"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"

const steps = [
  { id: "box", title: "اختيار الصندوق", icon: Package },
  { id: "products", title: "اختيار المنتجات", icon: ShoppingCart },
  { id: "decorations", title: "اختيار الزينة", icon: Sparkles },
  { id: "bags", title: "اختيار التغليف", icon: Palette },
  { id: "summary", title: "ملخص الهدية", icon: ClipboardList },
]

// Custom hook for media query
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }
    const listener = () => setMatches(media.matches)
    media.addEventListener("change", listener)
    return () => media.removeEventListener("change", listener)
  }, [matches, query])

  return matches
}

export default function GiftBuilder() {
  const [currentStep, setCurrentStep] = useState("box")
  const [showSaved, setShowSaved] = useState(false)
  const { savedItems } = useGift()
  const [isLoading, setIsLoading] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)

  const handleStepChange = (step: string) => {
    setIsLoading(true)
    setTimeout(() => {
      setCurrentStep(step)
      setIsLoading(false)
    }, 300)
  }

  const currentIndex = steps.findIndex((step) => step.id === currentStep)

  const goToNextStep = () => {
    if (currentIndex < steps.length - 1) {
      handleStepChange(steps[currentIndex + 1].id)
    }
  }

  const goToPreviousStep = () => {
    if (currentIndex > 0) {
      handleStepChange(steps[currentIndex - 1].id)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case "box":
        return <BoxSelector />
      case "products":
        return <ProductSelector />
      case "decorations":
        return <DecorationSelector />
      case "bags":
        return <BagSelector />
      case "summary":
        return <GiftSummary />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-gray-50 py-8 px-4 md:px-6 lg:px-8 rtl">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-block mb-4 bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-full">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">اصنع هديتك الشخصية</h1>
          <p className="text-gray-600 mt-3 max-w-lg mx-auto">قم بتخصيص هديتك الخاصة بخطوات بسيطة واختر من مجموعة متنوعة من المنتجات والتصاميم</p>

          <div className="mt-6">
            <Link href="/custom-gifts">
              <Button variant="outline" size="lg" className=" gap-2 px-8 py-4 text-lg md:text-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg rounded-full">
                <User className="w-4 h-4" />
                تخصيص الهدايا الشخصية
              </Button>
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Gift Preview - Fixed at the top or side */}
          <div className="lg:col-span-5 xl:col-span-4 lg:order-1 order-1">
            <div className="sticky top-8 z-10">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg border border-purple-100"
              >
                <GiftPreview />

                {savedItems.length > 0 && (
                  <div className="mt-2 px-4 pb-4">
                    <button
                      onClick={() => setShowSaved(!showSaved)}
                      className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm text-purple-600 hover:text-purple-800 font-medium bg-purple-50 hover:bg-purple-100 transition-all duration-200"
                    >
                      <Bookmark className="w-4 h-4" />
                      {showSaved ? "إخفاء المحفوظة مؤخراً" : "عرض المحفوظة مؤخراً"}
                      <span className="inline-flex items-center justify-center bg-purple-600 text-white rounded-full w-5 h-5 text-xs">
                        {savedItems.length}
                      </span>
                    </button>

                    <AnimatePresence>
                      {showSaved && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden mt-3"
                        >
                          <SavedItems />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-7 xl:col-span-8 lg:order-2 order-2">
            {/* Inspiration Gallery */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-8"
            >
              <InspirationGallery />
            </motion.div>

            {/* Gift Builder Steps */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 border border-purple-100"
            >
              <div className="p-4 border-b">
                <Tabs value={currentStep} onValueChange={handleStepChange} className="w-full">
                  <TabsList className="w-full justify-between bg-gray-100 p-1 rounded-xl">
                    {steps.map((step, index) => {
                      const StepIcon = step.icon;
                      const isActive = step.id === currentStep;
                      return (
                        <TabsTrigger
                          key={step.id}
                          value={step.id}
                          className={cn(
                            "flex flex-col md:flex-row items-center gap-1 md:gap-2 px-2 md:px-4 py-2 md:py-3 rounded-lg transition-all duration-300",
                            isActive
                              ? "bg-white shadow-md text-purple-600 border-b-2 border-purple-500 translate-y-[-2px]"
                              : "hover:bg-white/50"
                          )}
                          onMouseEnter={() => setActiveTooltip(step.id)}
                          onMouseLeave={() => setActiveTooltip(null)}
                        >
                          <div className={cn(
                            "w-8 h-8 flex items-center justify-center rounded-full text-xs transition-all duration-300",
                            isActive 
                              ? "bg-purple-100 text-purple-600" 
                              : "bg-gray-200 text-gray-700"
                          )}>
                            {isMobile ? index + 1 : <StepIcon className="w-4 h-4" />}
                          </div>
                          <span className={cn(
                            "text-xs md:text-sm font-medium transition-all duration-300",
                            isActive ? "text-purple-600" : "text-gray-700"
                          )}>
                            {isMobile ? "" : step.title}
                          </span>
                          {isMobile && activeTooltip === step.id && (
                            <div className="absolute top-full mt-2 bg-gray-800 text-white text-xs rounded px-2 py-1 z-50">
                              {step.title}
                            </div>
                          )}
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                </Tabs>
              </div>

              <div className="p-6">
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="min-h-[400px] flex items-center justify-center"
                    >
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center text-purple-600 text-sm font-medium">
                          جاري...
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.4 }}
                      className="min-h-[400px]"
                    >
                      {renderStepContent()}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="p-5 border-t bg-gradient-to-r from-purple-50 to-pink-50 flex justify-between items-center">
                <Button
                  onClick={goToPreviousStep}
                  disabled={currentIndex === 0}
                  variant="outline"
                  size="lg"
                  className="px-6 py-2 rounded-full border-2 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-sm hover:shadow"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>السابق</span>
                </Button>

                <div className="hidden md:flex items-center">
                  {steps.map((step, idx) => (
                    <div 
                      key={step.id} 
                      className={`w-2 h-2 mx-1 rounded-full ${currentIndex === idx ? 'bg-purple-600' : 'bg-gray-300'}`}
                    />
                  ))}
                </div>

                <Button
                  onClick={goToNextStep}
                  disabled={currentIndex === steps.length - 1}
                  size="lg"
                  className="px-6 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <span>{currentIndex === steps.length - 2 ? "اكمال الهدية" : "التالي"}</span>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

