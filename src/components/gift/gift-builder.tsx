"use client"

import { useState } from "react"
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
import { ChevronLeft, ChevronRight, Gift } from "lucide-react"
import InspirationGallery from "@/components/gift/inspiration-gallery"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const steps = [
  { id: "box", title: "اختيار الصندوق" },
  { id: "products", title: "اختيار المنتجات" },
  { id: "decorations", title: "اختيار الزينة" },
  { id: "bags", title: "اختيار التغليف" },
  { id: "summary", title: "ملخص الهدية" },
]

export default function GiftBuilder() {
  const [currentStep, setCurrentStep] = useState("box")
  const [showSaved, setShowSaved] = useState(false)
  const { savedItems } = useGift()
  const [isLoading, setIsLoading] = useState(false)

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
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-6 lg:px-8 rtl">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">اصنع هديتك المميزة</h1>
          <p className="text-gray-600 mt-2">قم بتخصيص هديتك المثالية خطوة بخطوة</p>

          <div className="mt-4">
            <Link href="/custom-gifts">
              <Button variant="outline" className="gap-2">
                <Gift className="w-4 h-4" />
                الهدايا المخصصة
              </Button>
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Gift Preview - Fixed at the top */}
          <div className="lg:col-span-5 xl:col-span-4 lg:order-1 order-1">
            <div className="sticky top-8 z-10">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <GiftPreview />

                {savedItems.length > 0 && (
                  <div className="mt-4">
                    <button
                      onClick={() => setShowSaved(!showSaved)}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center"
                    >
                      {showSaved ? "إخفاء المحفوظة مؤخراً" : "عرض المحفوظة مؤخراً"}({savedItems.length})
                    </button>

                    <AnimatePresence>
                      {showSaved && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
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
            <div className="mb-8">
              <InspirationGallery />
            </div>

            {/* Gift Builder Steps */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
              <div className="p-4 border-b">
                <Tabs value={currentStep} onValueChange={handleStepChange} className="w-full">
                  <TabsList className="w-full justify-between bg-gray-100 p-1">
                    {steps.map((step, index) => (
                      <TabsTrigger
                        key={step.id}
                        value={step.id}
                        className="data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-purple-500 data-[state=active]:text-purple-600 rounded-none px-4 py-2"
                      >
                        <span className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 text-xs font-medium">
                          {index + 1}
                        </span>
                        <span className="hidden sm:inline">{step.title}</span>
                      </TabsTrigger>
                    ))}
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
                      <div className="w-10 h-10 border-4 border-gray-200 border-t-purple-500 rounded-full animate-spin"></div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      {renderStepContent()}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="p-4 border-t bg-gray-50 flex justify-between">
                <button
                  onClick={goToPreviousStep}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 rounded-lg border bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>السابق</span>
                </button>

                <button
                  onClick={goToNextStep}
                  disabled={currentIndex === steps.length - 1}
                  className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <span>التالي</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
