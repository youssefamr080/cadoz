"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import GiftPreview from "@/components/gift/gift-preview"
import BoxSelector from "@/components/gift/steps/box-selector"
import CartProductSelector from "@/components/gift/steps/cart-product-selector"
import SweetSelector from "@/components/gift/steps/sweet-selector"
import BagSelector from "@/components/gift/steps/bag-selector"
import GiftSummary from "@/components/gift/steps/gift-summary"

import { 
  ChevronLeft, 
  ChevronRight, 
  Gift, 
  Package, 
  ShoppingCart, 
  Sparkles, 
  Palette, 
  ClipboardList, 
  Zap, 
  ArrowUp,
  Heart,
  Star,
  ChevronDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { cn } from "@/lib/utils"

const steps = [
  { 
    id: "box", 
    title: "اختيار الصندوق", 
    subtitle: "اختر الصندوق المناسب لهديتك",
    icon: Package,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50"
  },
  { 
    id: "products", 
    title: "اختيار المنتجات", 
    subtitle: "أضف المنتجات من سلتك",
    icon: ShoppingCart,
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50"
  },
  { 
    id: "sweets", 
    title: "اختيار الحلويات", 
    subtitle: "أضف الحلويات المفضلة",
    icon: Sparkles,
    color: "from-pink-500 to-pink-600",
    bgColor: "bg-pink-50"
  },
  { 
    id: "bags", 
    title: "اختيار التغليف", 
    subtitle: "اختر تصميم التغليف المناسب",
    icon: Palette,
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50"
  },
  { 
    id: "summary", 
    title: "ملخص الهدية", 
    subtitle: "مراجعة نهائية وإضافة للسلة",
    icon: ClipboardList,
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50"
  },
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
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [showMobileSteps, setShowMobileSteps] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  const handleStepChange = (step: string) => {
    setCurrentStep(step)
    setShowMobileSteps(false)
  }

  const currentIndex = steps.findIndex((step) => step.id === currentStep)
  const currentStepData = steps[currentIndex]
  const progress = ((currentIndex + 1) / steps.length) * 100

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
        return <CartProductSelector />
      case "sweets":
        return <SweetSelector />
      case "bags":
        return <BagSelector />
      case "summary":
        return <GiftSummary />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-20" ref={contentRef}>
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-purple-100 px-4 py-3">
        <div className="max-w-7xl mx-auto">
          {/* Mobile Progress Header */}
          {isMobile && (
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-r shadow-lg",
                  currentStepData.color
                )}>
                  <currentStepData.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">{currentStepData.title}</h2>
                  <p className="text-xs text-gray-500">{currentStepData.subtitle}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileSteps(!showMobileSteps)}
                className="p-2"
              >
                <ChevronDown className={cn(
                  "w-4 h-4 transition-transform",
                  showMobileSteps && "rotate-180"
                )} />
              </Button>
            </div>
          )}

          {/* Progress Bar */}
          <div className="relative">
            <Progress value={progress} className="h-2 bg-purple-100" />
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full transform transition-all duration-500" 
                 style={{ width: `${progress}%` }} />
          </div>
          
          {isMobile && (
            <div className="text-center mt-2">
              <span className="text-xs text-gray-600">
                الخطوة {currentIndex + 1} من {steps.length}
              </span>
            </div>
          )}

          {/* Mobile Steps Dropdown */}
          {isMobile && (
            <AnimatePresence>
              {showMobileSteps && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 grid grid-cols-2 gap-2"
                >
                  {steps.map((step, index) => {
                    const StepIcon = step.icon
                    const isActive = step.id === currentStep
                    const isCompleted = index < currentIndex
                    return (
                      <motion.button
                        key={step.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleStepChange(step.id)}
                        className={cn(
                          "p-3 rounded-xl border-2 transition-all duration-300 text-left",
                          isActive 
                            ? `border-purple-300 ${step.bgColor} shadow-lg transform scale-105`
                            : isCompleted
                            ? "border-green-200 bg-green-50"
                            : "border-gray-200 bg-white hover:border-purple-200 hover:bg-purple-50"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center",
                            isActive 
                              ? `bg-gradient-to-r ${step.color} text-white`
                              : isCompleted
                              ? "bg-green-500 text-white"
                              : "bg-gray-100 text-gray-500"
                          )}>
                            {isCompleted ? (
                              <Star className="w-4 h-4" />
                            ) : (
                              <StepIcon className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-900">{step.title}</p>
                          </div>
                        </div>
                      </motion.button>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-6">
        {/* Desktop Header */}
        {!isMobile && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-3 mb-4 bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-2xl shadow-xl">
              <Gift className="w-8 h-8 text-white" />
              <Heart className="w-6 h-6 text-white animate-pulse" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                اصنع هديتك الشخصية
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
              قم بتخصيص هديتك الخاصة بخطوات بسيطة واختر من مجموعة متنوعة من المنتجات والتصاميم الرائعة
            </p>
            <Link href="/custom-gifts">
              <Button size="lg" className="gap-2 px-8 py-4 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-xl rounded-2xl transform hover:scale-105">
                <Zap className="w-5 h-5" />
                تخصيص الهدايا الشخصية
              </Button>
            </Link>
          </motion.div>
        )}

        <div className={cn(
          "grid gap-6",
          isMobile ? "grid-cols-1" : "lg:grid-cols-12"
        )}>
          {/* Gift Preview */}
          <div className={cn(
            isMobile ? "order-1" : "lg:col-span-5 xl:col-span-4"
          )}>
            <div className={!isMobile ? "sticky top-24 z-10" : ""}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-purple-200"
              >
                <GiftPreview />
              </motion.div>
            </div>
          </div>

          {/* Main Content */}
          <div className={cn(
            isMobile ? "order-2" : "lg:col-span-7 xl:col-span-8"
          )}>
            {/* Desktop Steps Navigation */}
            {!isMobile && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-3xl shadow-xl p-6 mb-6 border border-purple-100"
              >
                <Tabs value={currentStep} onValueChange={handleStepChange} className="w-full">
                  <TabsList className="grid w-full grid-cols-5 bg-gray-50 p-2 rounded-2xl">
                    {steps.map((step, index) => {
                      const StepIcon = step.icon
                      const isActive = step.id === currentStep
                      const isCompleted = index < currentIndex
                      return (
                        <TabsTrigger
                          key={step.id}
                          value={step.id}
                          className={cn(
                            "flex flex-col items-center gap-2 px-4 py-4 rounded-xl transition-all duration-300 relative overflow-hidden",
                            isActive
                              ? `bg-gradient-to-r ${step.color} text-white shadow-lg transform scale-105`
                              : isCompleted
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "hover:bg-white/70 text-gray-600"
                          )}
                        >
                          <div className={cn(
                            "w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300",
                            isActive 
                              ? "bg-white/20 text-white" 
                              : isCompleted
                              ? "bg-green-200 text-green-700"
                              : "bg-gray-200 text-gray-600"
                          )}>
                            {isCompleted ? (
                              <Star className="w-4 h-4" />
                            ) : (
                              <StepIcon className="w-4 h-4" />
                            )}
                          </div>
                          <div className="text-center">
                            <div className="text-xs font-bold">{step.title}</div>
                            <div className="text-xs opacity-70 mt-1">{step.subtitle}</div>
                          </div>
                          {isActive && (
                            <motion.div
                              layoutId="activeStep"
                              className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/20 rounded-xl"
                              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                          )}
                        </TabsTrigger>
                      )
                    })}
                  </TabsList>
                </Tabs>
              </motion.div>
            )}

            {/* Step Content */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-purple-100"
            >
              {/* Step Header */}
              <div className={cn(
                "p-6 bg-gradient-to-r text-white",
                currentStepData.color
              )}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <currentStepData.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{currentStepData.title}</h2>
                    <p className="text-white/80 text-sm">{currentStepData.subtitle}</p>
                  </div>
                </div>
              </div>

              {/* Step Content */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                    className="min-h-[400px]"
                  >
                    {renderStepContent()}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation */}
              <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 rounded-2xl border-purple-200 hover:bg-purple-50"
                  onClick={goToPreviousStep}
                  disabled={currentIndex === 0}
                  size={isMobile ? "sm" : "default"}
                >
                  <ChevronRight className="h-4 w-4" />
                  السابق
                </Button>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all duration-300",
                        index <= currentIndex ? "bg-purple-500" : "bg-gray-300"
                      )}
                    />
                  ))}
                </div>

                <Button
                  className={cn(
                    "flex items-center gap-2 rounded-2xl text-white transition-all duration-300",
                    `bg-gradient-to-r ${currentStepData.color} hover:shadow-lg transform hover:scale-105`
                  )}
                  onClick={goToNextStep}
                  disabled={currentIndex === steps.length - 1}
                  size={isMobile ? "sm" : "default"}
                >
                  التالي
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll to top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-2xl flex items-center justify-center z-50 hover:shadow-3xl transition-all duration-300 transform hover:scale-110"
            aria-label="العودة للأعلى"
          >
            <ArrowUp className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

