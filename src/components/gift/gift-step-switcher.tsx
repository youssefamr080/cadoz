"use client"

import type React from "react"
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { useGift } from "../../context/GiftContext"
import {
  ChevronLeft,
  ChevronRight,
  Candy,
  Package,
  Sparkles,
  Bookmark,
  CheckSquare,
  ShoppingBag,
  Loader2,
  HelpCircle,
} from "lucide-react"
import { giftTheme } from "../../components/gift/lib/gift-theme"
import { useLocalStorage } from "../../components/gift/hooks/use-local-storage"

// Lazy load step components for better performance
import dynamic from "next/dynamic"

const GiftStepChocolates = dynamic(() => import("../../components/gift/gift-step-chocolates"), {
  loading: () => <StepLoader title="جاري تحميل الشوكولاتة" />,
  ssr: false,
})
const GiftStepCandies = dynamic(() => import("../../components/gift/gift-step-candies"), {
  loading: () => <StepLoader title="جاري تحميل الحلويات" />,
  ssr: false,
})
const GiftStepBox = dynamic(() => import("../../components/gift/gift-step-box"), {
  loading: () => <StepLoader title="جاري تحميل الصندوق" />,
  ssr: false,
})
const GiftStepDecorations = dynamic(() => import("../../components/gift/gift-step-decorations"), {
  loading: () => <StepLoader title="جاري تحميل الزينة" />,
  ssr: false,
})
const GiftStepWrap = dynamic(() => import("../../components/gift/gift-step-wrap"), {
  loading: () => <StepLoader title="جاري تحميل التغليف" />,
  ssr: false,
})
const GiftSummary = dynamic(() => import("../../components/gift/gift-summary"), {
  loading: () => <StepLoader title="جاري تحميل الملخص" />,
  ssr: false,
})

// Simple loader component for step transitions
const StepLoader = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-64" role="status" aria-live="polite">
    <Loader2 className={`w-10 h-10 ${giftTheme.colors.primary.text} animate-spin mb-4`} aria-hidden="true" />
    <p className="text-gray-600 text-sm">{title}</p>
  </div>
)

// Types
type GiftStep = "chocolates" | "candies" | "box" | "decorations" | "wrap" | "summary"
type Direction = "left" | "right"
type TouchState = {
  startX: number
  startY: number
  startTime: number
  isTracking: boolean
  minSwipeDistance: number
  maxSwipeTime: number
  verticalThreshold: number
}

// Step configuration
const stepsConfig = [
  {
    id: "chocolates",
    title: "الشوكولاتة",
    fullTitle: "اختيار الشوكولاتة",
    icon: <Candy className="w-5 h-5" />,
    emoji: "🍫",
    color: "accent",
    description: "اختر الشوكولاتة المفضلة لديك لإضافتها إلى الهدية",
  },
  {
    id: "candies",
    title: "الحلويات",
    fullTitle: "اختيار الحلويات",
    icon: <Candy className="w-5 h-5" />,
    emoji: "🍬",
    color: "secondary",
    description: "أضف الحلويات اللذيذة لتكمل هديتك",
  },
  {
    id: "box",
    title: "الصندوق",
    fullTitle: "اختيار الصندوق",
    icon: <Package className="w-5 h-5" />,
    emoji: "🎁",
    color: "primary",
    description: "اختر صندوقًا مناسبًا لهديتك",
  },
  {
    id: "decorations",
    title: "الزينة",
    fullTitle: "اختيار الزينة",
    icon: <Sparkles className="w-5 h-5" />,
    emoji: "✨",
    color: "secondary",
    description: "أضف لمسات جمالية مع إكسسوارات الزينة",
  },
  {
    id: "wrap",
    title: "التغليف",
    fullTitle: "اختيار التغليف",
    icon: <Bookmark className="w-5 h-5" />,
    emoji: "🎀",
    color: "accent",
    description: "اختر تغليفًا مميزًا لهديتك",
  },
  {
    id: "summary",
    title: "الملخص",
    fullTitle: "ملخص الهدية",
    icon: <CheckSquare className="w-5 h-5" />,
    emoji: "✅",
    color: "primary",
    description: "راجع هديتك قبل إضافتها إلى السلة",
  },
] as const

// Animation variants with improved transitions
const stepVariants = {
  hidden: (direction: Direction) => ({
    x: direction === "left" ? "100%" : "-100%",
    opacity: 0,
  }),
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1], // Improved easing curve
    },
  },
  exit: (direction: Direction) => ({
    x: direction === "left" ? "-100%" : "100%",
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
    },
  }),
}

// Local state reducer for better state management
type State = {
  currentStep: GiftStep
  direction: Direction
  activeTabIndex: number
  isLoading: boolean
  touchState: TouchState
  helpVisible: boolean
}

type Action =
  | { type: "SET_STEP"; payload: { step: GiftStep; direction: Direction } }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "TOUCH_START"; payload: { x: number; y: number } }
  | { type: "TOUCH_END"; payload: { x: number; y: number } }
  | { type: "TOUCH_CANCEL" }
  | { type: "KEYBOARD_NAVIGATE"; payload: "next" | "prev" }
  | { type: "TOGGLE_HELP" }

const initialState: State = {
  currentStep: "chocolates",
  direction: "right",
  activeTabIndex: 0,
  isLoading: false,
  touchState: {
    startX: 0,
    startY: 0,
    startTime: 0,
    isTracking: false,
    minSwipeDistance: 50, // Minimum distance for a swipe to register
    maxSwipeTime: 300, // Maximum time for a swipe to register (ms)
    verticalThreshold: 30, // Maximum vertical movement to still consider a horizontal swipe
  },
  helpVisible: false,
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_STEP":
      return {
        ...state,
        currentStep: action.payload.step,
        direction: action.payload.direction,
        activeTabIndex: stepsConfig.findIndex((s) => s.id === action.payload.step),
      }
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      }
    case "TOUCH_START":
      return {
        ...state,
        touchState: {
          ...state.touchState,
          startX: action.payload.x,
          startY: action.payload.y,
          startTime: Date.now(),
          isTracking: true,
        },
      }
    case "TOUCH_END": {
      if (!state.touchState.isTracking) return state

      const diffX = action.payload.x - state.touchState.startX
      const diffY = action.payload.y - state.touchState.startY
      const elapsedTime = Date.now() - state.touchState.startTime

      // Reset touch tracking
      const newTouchState = {
        ...state.touchState,
        isTracking: false,
      }

      // Check if this is a valid horizontal swipe
      const isHorizontalSwipe =
        Math.abs(diffX) > state.touchState.minSwipeDistance &&
        Math.abs(diffY) < state.touchState.verticalThreshold &&
        elapsedTime < state.touchState.maxSwipeTime

      if (!isHorizontalSwipe) {
        return { ...state, touchState: newTouchState }
      }

      // Determine new step based on swipe direction
      const currentIndex = stepsConfig.findIndex((s) => s.id === state.currentStep)
      const newIndex = diffX > 0 ? currentIndex - 1 : currentIndex + 1

      // Boundary checks
      if (newIndex < 0 || newIndex >= stepsConfig.length) {
        return { ...state, touchState: newTouchState }
      }

      return {
        ...state,
        currentStep: stepsConfig[newIndex].id as GiftStep,
        direction: diffX > 0 ? "right" : "left",
        activeTabIndex: newIndex,
        touchState: newTouchState,
      }
    }
    case "TOUCH_CANCEL":
      return {
        ...state,
        touchState: {
          ...state.touchState,
          isTracking: false,
        },
      }
    case "KEYBOARD_NAVIGATE": {
      const currentIndex = stepsConfig.findIndex((s) => s.id === state.currentStep)
      const newIndex = action.payload === "next" ? currentIndex + 1 : currentIndex - 1

      // Boundary checks
      if (newIndex < 0 || newIndex >= stepsConfig.length) {
        return state
      }

      return {
        ...state,
        currentStep: stepsConfig[newIndex].id as GiftStep,
        direction: action.payload === "next" ? "left" : "right",
        activeTabIndex: newIndex,
      }
    }
    case "TOGGLE_HELP":
      return {
        ...state,
        helpVisible: !state.helpVisible,
      }
    default:
      return state
  }
}

const GiftStepSwitcher = () => {
  // Use reducer for complex state management
  const [state, dispatch] = useReducer(reducer, initialState)
  const { state: giftState, totalItems, isBoxSelected, isWrapSelected, dispatch: giftDispatch } = useGift()
  const shouldReduceMotion = useReducedMotion()

  // Refs
  const containerRef = useRef<HTMLDivElement>(null)

  // Client-side only state
  const [selectedItemsCount, setSelectedItemsCount] = useState(0)
  const [savedStep, setSavedStep] = useLocalStorage<GiftStep>("currentGiftStep", "chocolates")
  const [isMounted, setIsMounted] = useState(false)

  // Initialize from localStorage and set up event listeners
  useEffect(() => {
    setIsMounted(true)

    // Load saved step from localStorage
    if (savedStep) {
      const stepIndex = stepsConfig.findIndex((s) => s.id === savedStep)
      if (stepIndex !== -1) {
        dispatch({
          type: "SET_STEP",
          payload: {
            step: savedStep,
            direction: "right",
          },
        })

        // Also update the gift context
        giftDispatch({ type: "CHANGE_STEP", payload: savedStep })
      }
    }

    // Set up keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        document.activeElement?.tagName === "SELECT"
      )
        return

      if (e.key === "ArrowRight") {
        dispatch({ type: "KEYBOARD_NAVIGATE", payload: "prev" })
      } else if (e.key === "ArrowLeft") {
        dispatch({ type: "KEYBOARD_NAVIGATE", payload: "next" })
      } else if (e.key === "?") {
        dispatch({ type: "TOGGLE_HELP" })
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [giftDispatch, savedStep])

  // Save current step to localStorage whenever it changes
  useEffect(() => {
    if (isMounted) {
      setSavedStep(state.currentStep)
    }
  }, [state.currentStep, isMounted, setSavedStep])

  // Update selected items count
  useEffect(() => {
    if (isMounted) {
      let count = totalItems
      if (isBoxSelected) count++
      if (isWrapSelected) count++
      setSelectedItemsCount(count)
    }
  }, [
    giftState.selectedBox,
    giftState.selectedWrap,
    giftState.cart,
    totalItems,
    isBoxSelected,
    isWrapSelected,
    isMounted,
  ])

  // Memoized navigation handler
  const navigate = useCallback(
    (dir: "next" | "prev") => {
      const currentIndex = stepsConfig.findIndex((s) => s.id === state.currentStep)
      let newIndex = dir === "next" ? currentIndex + 1 : currentIndex - 1

      if (newIndex < 0) {
        newIndex = 0
      } else if (newIndex >= stepsConfig.length) {
        newIndex = stepsConfig.length - 1
      }

      const newStep = stepsConfig[newIndex].id as GiftStep

      dispatch({
        type: "SET_STEP",
        payload: {
          step: newStep,
          direction: dir === "next" ? "left" : "right",
        },
      })

      // Update gift context
      giftDispatch({ type: "CHANGE_STEP", payload: newStep })

      // تتبع تغيير الخطوة (يمكن استخدامه مع أدوات التحليلات)
      if (typeof window !== "undefined" && "gtag" in window) {
        const gtag = window.gtag
        gtag("event", "change_step", {
          from_step: state.currentStep,
          to_step: newStep,
          direction: dir,
        })
      }
    },
    [state.currentStep, giftDispatch],
  )

  // Memoized tab selection handler
  const handleTabSelect = useCallback(
    (index: number) => {
      const newStep = stepsConfig[index].id as GiftStep
      const oldIndex = stepsConfig.findIndex((s) => s.id === state.currentStep)

      dispatch({
        type: "SET_STEP",
        payload: {
          step: newStep,
          direction: index > oldIndex ? "left" : "right",
        },
      })

      // Update gift context
      giftDispatch({ type: "CHANGE_STEP", payload: newStep })
    },
    [state.currentStep, giftDispatch],
  )

  // Touch event handlers with improved precision
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    dispatch({
      type: "TOUCH_START",
      payload: {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      },
    })
  }, [])

  const handleTouchMove = useCallback(() => {
    // Optional: Add logic here if you need to track movement
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    dispatch({
      type: "TOUCH_END",
      payload: {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
      },
    })
  }, [])

  const handleTouchCancel = useCallback(() => {
    dispatch({ type: "TOUCH_CANCEL" })
  }, [])

  // Memoized step renderer for better performance
  const renderStep = useMemo(() => {
    switch (state.currentStep) {
      case "chocolates":
        return <GiftStepChocolates />
      case "candies":
        return <GiftStepCandies />
      case "box":
        return <GiftStepBox />
      case "decorations":
        return <GiftStepDecorations />
      case "wrap":
        return <GiftStepWrap />
      case "summary":
        return <GiftSummary />
      default:
        return <div>خطوة غير معروفة</div>
    }
  }, [state.currentStep])

  // Get current step info
  const currentStepInfo = useMemo(() => stepsConfig.find((s) => s.id === state.currentStep), [state.currentStep])

  // Help dialog content
  const HelpDialog = () => (
    <motion.div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => dispatch({ type: "TOGGLE_HELP" })}
    >
      <motion.div
        className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-indigo-800 mb-4">مساعدة سريعة</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-bold text-indigo-700 mb-1">التنقل بين الخطوات</h4>
            <ul className="text-sm space-y-2">
              <li className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">←</kbd>
                <span>الانتقال إلى الخطوة التالية</span>
              </li>
              <li className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">→</kbd>
                <span>الانتقال إلى الخطوة السابقة</span>
              </li>
              <li className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">?</kbd>
                <span>إظهار/إخفاء المساعدة</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-indigo-700 mb-1">اختصارات إضافية</h4>
            <ul className="text-sm space-y-2">
              <li className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Enter</kbd>
                <span>اختيار العنصر المحدد</span>
              </li>
              <li className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Tab</kbd>
                <span>التنقل بين العناصر</span>
              </li>
            </ul>
          </div>
        </div>
        <button
          className="mt-6 w-full py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
          onClick={() => dispatch({ type: "TOGGLE_HELP" })}
        >
          إغلاق
        </button>
      </motion.div>
    </motion.div>
  )

  return (
    <motion.div
      ref={containerRef}
      className="bg-white rounded-xl shadow-xl overflow-hidden flex flex-col h-full border-t-4 border-indigo-500 transition-colors duration-300 w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Mobile tabs with icons */}
      <div className="overflow-x-auto scrollbar-hide md:hidden">
        <div className="flex px-2 py-3 border-b relative">
          {stepsConfig.map((step, index) => (
            <button
              key={step.id}
              onClick={() => handleTabSelect(index)}
              className={`relative flex flex-col items-center justify-center px-2 py-2 mx-1 rounded-lg font-medium transition-all duration-300 flex-1 min-w-0 ${
                state.currentStep === step.id
                  ? `${giftTheme.colors.primary.text} ${giftTheme.colors.primary.light}`
                  : "text-gray-500 hover:bg-gray-100"
              }`}
              aria-label={step.fullTitle}
              aria-current={state.currentStep === step.id ? "step" : undefined}
              aria-describedby={`step-desc-mobile-${step.id}`}
            >
              <div
                className={`p-1.5 rounded-full mb-1 ${state.currentStep === step.id ? giftTheme.colors.primary.medium : "bg-gray-100"}`}
              >
                {step.icon}
              </div>
              <span className="text-xs truncate w-full text-center">{step.title}</span>
              <span id={`step-desc-mobile-${step.id}`} className="sr-only">
                {step.description}
              </span>
              {state.currentStep === step.id && (
                <motion.div
                  className={`absolute bottom-0 left-0 h-1 w-full rounded-lg ${giftTheme.colors.primary.default}`}
                  layoutId="mobileIndicator"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop tabs with full titles */}
      <div className="hidden md:block overflow-x-auto scrollbar-hide">
        <div className="flex px-2 py-3 border-b relative min-w-max">
          {stepsConfig.map((step, index) => (
            <button
              key={step.id}
              onClick={() => handleTabSelect(index)}
              className={`flex items-center justify-center px-3 py-2 mx-1 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                state.currentStep === step.id
                  ? `${giftTheme.colors.primary.text} ${giftTheme.colors.primary.light}`
                  : "text-gray-500 hover:bg-gray-100"
              }`}
              aria-label={step.fullTitle}
              aria-current={state.currentStep === step.id ? "step" : undefined}
              aria-describedby={`step-desc-desktop-${step.id}`}
            >
              <div
                className={`p-1.5 rounded-full mr-2 ${state.currentStep === step.id ? giftTheme.colors.primary.medium : "bg-gray-100"}`}
              >
                {step.icon}
              </div>
              {step.fullTitle}
              <span id={`step-desc-desktop-${step.id}`} className="sr-only">
                {step.description}
              </span>
              {index < stepsConfig.length - 1 && (
                <ChevronLeft className="w-4 h-4 mr-2 text-gray-400" aria-hidden="true" />
              )}
            </button>
          ))}

          {/* Active tab indicator with smooth animation */}
          <motion.div
            className={`absolute bottom-0 h-1 rounded-t-lg transition-colors ${giftTheme.colors.primary.default}`}
            layoutId="desktopIndicator"
            initial={false}
            animate={{
              left: `calc(${state.activeTabIndex * (100 / stepsConfig.length)}% + ${state.activeTabIndex * 3}px)`,
              width: `calc(${100 / stepsConfig.length}% - 6px)`,
            }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
            }}
          />
        </div>
      </div>

      {/* Current step info header */}
      <div className={`px-4 py-3 flex justify-between items-center border-b ${giftTheme.colors.primary.light}`}>
        <div className="flex items-center">
          <div className={`p-2 rounded-full mr-3 bg-white shadow-sm`} aria-hidden="true">
            {currentStepInfo?.icon}
          </div>
          <div>
            <h3 className={`flex items-center text-base md:text-lg font-bold ${giftTheme.colors.primary.text}`}>
              {currentStepInfo?.fullTitle}
            </h3>
            <div className="text-xs text-gray-500">
              الخطوة {state.activeTabIndex + 1} من {stepsConfig.length}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`bg-white px-3 py-1.5 rounded-full text-xs font-medium shadow-sm flex items-center border ${giftTheme.colors.primary.border}`}
            aria-label={`عدد العناصر المختارة: ${isMounted ? selectedItemsCount : 0}`}
          >
            <ShoppingBag className={`w-3.5 h-3.5 mr-1.5 ${giftTheme.colors.primary.text}`} aria-hidden="true" />
            <span className={`font-bold ${giftTheme.colors.primary.text}`}>{isMounted ? selectedItemsCount : 0}</span>
            <span className="text-gray-500 mr-1 whitespace-nowrap">عناصر</span>
          </div>
          <button
            onClick={() => dispatch({ type: "TOGGLE_HELP" })}
            className="p-2 rounded-full bg-white shadow-sm text-gray-500 hover:text-indigo-500 transition-colors"
            aria-label="مساعدة"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Step content with improved touch handling */}
      <div
        className="flex-grow overflow-y-auto overscroll-contain"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
      >
        <AnimatePresence initial={false} custom={state.direction} mode="wait">
          <motion.div
            key={state.currentStep}
            custom={state.direction}
            variants={stepVariants}
            initial={shouldReduceMotion ? "visible" : "hidden"}
            animate="visible"
            exit={shouldReduceMotion ? { opacity: 0 } : "exit"}
            className="p-3 md:p-5"
          >
            {renderStep}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      <div className="px-4 pt-3 pb-2">
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden shadow-inner">
          <motion.div
            className={`h-full ${giftTheme.gradients.primary}`}
            initial={{ width: 0 }}
            animate={{
              width: `${((state.activeTabIndex + 1) / stepsConfig.length) * 100}%`,
            }}
            transition={{
              type: shouldReduceMotion ? "tween" : "spring",
              stiffness: 300,
              damping: 30,
            }}
          />
        </div>
        <div className="flex justify-between mt-1.5 text-xs text-gray-500 px-1">
          <span>البداية</span>
          <span>النهاية</span>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="p-4 flex border-t sticky bottom-0 bg-white shadow-inner">
        <button
          onClick={() => navigate("prev")}
          disabled={state.activeTabIndex === 0}
          className={`flex items-center justify-center bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 mr-2 w-1/3 ${state.activeTabIndex === 0 ? "invisible" : "visible"}`}
          aria-label="الخطوة السابقة"
        >
          <ChevronLeft className="w-5 h-5 ml-1.5" aria-hidden="true" />
          <span>السابق</span>
        </button>

        <button
          onClick={() => navigate("next")}
          disabled={state.activeTabIndex === stepsConfig.length - 1}
          className={`flex items-center justify-center ${giftTheme.gradients.primary} ${giftTheme.colors.primary.hover} text-white px-4 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-md flex-1`}
          aria-label="الخطوة التالية"
        >
          <span>{state.activeTabIndex === stepsConfig.length - 1 ? "إنهاء" : "التالي"}</span>
          <ChevronRight className="w-5 h-5 mr-1.5" aria-hidden="true" />
        </button>
      </div>

      {/* Help dialog */}
      <AnimatePresence>{state.helpVisible && <HelpDialog />}</AnimatePresence>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @media (max-width: 640px) {
          body {
            overscroll-behavior-y: contain;
            touch-action: pan-y;
          }
        }
        
        /* تحسين الوصولية للتركيز */
        button:focus-visible {
          outline: 2px solid #6366f1;
          outline-offset: 2px;
        }
        
        /* تحسين أداء الرسوم المتحركة */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </motion.div>
  )
}

export default GiftStepSwitcher
