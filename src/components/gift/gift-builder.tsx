"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSelector } from "react-redux"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import GiftPreview from "@/components/gift/gift-preview"
import BoxSelector from "@/components/gift/steps/box-selector"
import ProductSelector from "@/components/gift/steps/product-selector"
import DecorationSelector from "@/components/gift/steps/decoration-selector"
import BagSelector from "@/components/gift/steps/bag-selector"
import GiftSummary from "@/components/gift/steps/gift-summary"
import SavedItems from "@/components/gift/saved-items"
import { ChevronLeft, ChevronRight, Gift, Package, ShoppingCart, Sparkles, Palette, ClipboardList, Bookmark, Zap, ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"
import type { RootState } from "@/lib/redux/store"

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
  const savedItems = useSelector((state: RootState) => state.gift.savedItems)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  const handleStepChange = (step: string) => {
    setCurrentStep(step)
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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-gray-50 pb-20 px-4 md:px-6 lg:px-8 rtl" ref={contentRef}>
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
          className="text-center mb-6 pt-6 md:mb-8 md:pt-8"
        >
          <div className="inline-block mb-3 md:mb-4 bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-full shadow-lg">
            <Gift className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">اصنع هديتك الشخصية</h1>
          <p className="text-sm md:text-base text-gray-600 mt-2 md:mt-3 max-w-lg mx-auto">قم بتخصيص هديتك الخاصة بخطوات بسيطة واختر من مجموعة متنوعة من المنتجات والتصاميم</p>

          <div className="mt-4 md:mt-6">
            <Link href="/custom-gifts">
              <Button variant="outline" size="sm" className="gap-2 px-4 py-2 md:px-8 md:py-4 md:text-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg rounded-full">
                <Zap className="w-3 h-3 md:w-4 md:h-4" />
                تخصيص الهدايا الشخصية
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Mobile Layout - Reordering for mobile */}
        {isMobile && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-6"
          >

          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          {/* Gift Preview - Fixed at the top for mobile, side for desktop */}
          <div className={`${isMobile ? 'order-1' : 'lg:col-span-5 xl:col-span-4 lg:order-1 order-1'}`}>
            <div className={`${!isMobile && 'sticky top-8 z-10'}`}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-2xl overflow-hidden shadow-xl border border-purple-100"
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
          <div className={`${isMobile ? 'order-2' : 'lg:col-span-7 xl:col-span-8 lg:order-2 order-2'}`}>
            {/* Inspiration Gallery - Only show on desktop */}
            {!isMobile && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mb-8"
              >

              </motion.div>
            )}

            {/* Gift Builder Steps */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 border border-purple-100"
            >
              <div className="p-3 md:p-4 border-b bg-gradient-to-r from-white to-purple-50">
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
                            "flex flex-col md:flex-row items-center gap-1 md:gap-2 px-1 md:px-4 py-1.5 md:py-3 rounded-lg transition-all duration-300",
                            isActive
                              ? "bg-white shadow-md text-purple-600 border-b-2 border-purple-500 translate-y-[-2px]"
                              : "hover:bg-white/50"
                          )}
                          onMouseEnter={() => setActiveTooltip(step.id)}
                          onMouseLeave={() => setActiveTooltip(null)}
                        >
                          <div className={cn(
                            "w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full text-xs transition-all duration-300",
                            isActive 
                              ? "bg-purple-100 text-purple-600" 
                              : "bg-gray-200 text-gray-700"
                          )}>
                            {isMobile ? index + 1 : <StepIcon className="w-3 h-3 md:w-4 md:h-4" />}
                          </div>
                          <span className={cn(
                            "text-xs md:text-sm font-medium transition-all duration-300",
                            isActive ? "text-purple-600" : "text-gray-700"
                          )}>
                            {isMobile ? "" : step.title}
                          </span>
                          {isMobile && activeTooltip === step.id && (
                            <div className="absolute top-full mt-2 bg-gray-800 text-white text-xs rounded px-2 py-1 z-50 w-max">
                              {step.title}
                            </div>
                          )}
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                </Tabs>
              </div>

              <div className="p-4 md:p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                    className={`min-h-[${isMobile ? '300px' : '400px'}]`}
                  >
                    {renderStepContent()}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="p-3 md:p-4 border-t bg-gradient-to-r from-purple-50 to-white">
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 rounded-xl border-purple-200"
                    onClick={goToPreviousStep}
                    disabled={currentIndex === 0}
                  >
                    <ChevronRight className="h-4 w-4" />
                    <span className="hidden sm:inline">السابق</span>
                  </Button>

                  <Button
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 rounded-xl"
                    onClick={goToNextStep}
                    disabled={currentIndex === steps.length - 1}
                  >
                    <span className="hidden sm:inline">التالي</span>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll to top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-purple-600 text-white shadow-lg flex items-center justify-center z-50 hover:bg-purple-700 transition-colors"
            aria-label="العودة للأعلى"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

