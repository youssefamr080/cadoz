"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from "react"
import type { Product, GiftOption } from "../data/products"
import { useLocalStorage } from "../components/gift/hooks/use-local-storage"
import { useToast } from "../components/gift/hooks/use-toast"

// Type definitions with improved documentation
export type GiftStep = "chocolates" | "candies" | "box" | "decorations" | "wrap" | "summary"

export type GiftCartItem = {
  id: string
  type: "product" | "gift"
  quantity: number
  data: Product | GiftOption
  addedAt: number // Timestamp for sorting and analytics
}

export type GiftState = {
  cart: GiftCartItem[]
  selectedBox: GiftOption | null
  selectedWrap: GiftOption | null
  currentStep: GiftStep
  lastUpdated: number // For tracking state changes
  version: string // For future migrations
}

type GiftAction =
  | { type: "ADD_TO_CART"; payload: Product | GiftOption }
  | { type: "REMOVE_FROM_CART"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "SELECT_BOX"; payload: GiftOption | null }
  | { type: "SELECT_WRAP"; payload: GiftOption | null }
  | { type: "CHANGE_STEP"; payload: GiftStep }
  | { type: "CLEAR_CART" }
  | { type: "RESET_GIFT" }
  | { type: "IMPORT_STATE"; payload: GiftState }

// Constants
const GIFT_STATE_KEY = "giftState"
const GIFT_STATE_VERSION = "1.1" // Updated version for new features

// Initial state creator with version tracking
const createInitialState = (): GiftState => ({
  cart: [],
  selectedBox: null,
  selectedWrap: null,
  currentStep: "chocolates",
  lastUpdated: Date.now(),
  version: GIFT_STATE_VERSION,
})

// Enhanced reducer with better error handling and immutable updates
function giftReducer(state: GiftState, action: GiftAction): GiftState {
  try {
    switch (action.type) {
      case "ADD_TO_CART": {
        if (!action.payload || typeof action.payload !== "object" || !("id" in action.payload)) {
          console.error("Invalid payload for ADD_TO_CART action:", action.payload)
          return state
        }

        const payloadId = String(action.payload.id) // Ensure ID is a string
        const existingItemIndex = state.cart.findIndex((item) => String(item.data.id) === payloadId)
        const now = Date.now()

        let newCart
        if (existingItemIndex >= 0) {
          // Create a new array with the updated item
          newCart = [...state.cart]
          newCart[existingItemIndex] = {
            ...newCart[existingItemIndex],
            quantity: newCart[existingItemIndex].quantity + 1,
            lastUpdated: now,
          }
        } else {
          // Add new item to cart
          newCart = [
            ...state.cart,
            {
              id: `item-${now}-${payloadId}`,
              type: "price" in action.payload ? "product" : "gift",
              quantity: 1,
              data: action.payload,
              addedAt: now,
            },
          ]
        }

        return {
          ...state,
          cart: newCart,
          lastUpdated: now,
        }
      }

      case "REMOVE_FROM_CART":
        return {
          ...state,
          cart: state.cart.filter((item) => item.id !== action.payload),
          lastUpdated: Date.now(),
        }

      case "UPDATE_QUANTITY": {
        const { id, quantity } = action.payload

        // If quantity is 0 or negative, remove the item
        if (quantity <= 0) {
          return {
            ...state,
            cart: state.cart.filter((item) => item.id !== id),
            lastUpdated: Date.now(),
          }
        }

        // Otherwise update the quantity
        return {
          ...state,
          cart: state.cart.map((item) => (item.id === id ? { ...item, quantity } : item)),
          lastUpdated: Date.now(),
        }
      }

      case "SELECT_BOX":
        return {
          ...state,
          selectedBox: action.payload,
          lastUpdated: Date.now(),
        }

      case "SELECT_WRAP":
        return {
          ...state,
          selectedWrap: action.payload,
          lastUpdated: Date.now(),
        }

      case "CHANGE_STEP":
        return {
          ...state,
          currentStep: action.payload,
          lastUpdated: Date.now(),
        }

      case "CLEAR_CART":
        return {
          ...state,
          cart: [],
          lastUpdated: Date.now(),
        }

      case "RESET_GIFT":
        return {
          ...createInitialState(),
          lastUpdated: Date.now(),
        }

      case "IMPORT_STATE":
        return {
          ...action.payload,
          lastUpdated: Date.now(),
          version: GIFT_STATE_VERSION, // Always use current version
        }

      default:
        return state
    }
  } catch (error) {
    console.error("Error in gift reducer:", error, "Action:", action)
    return state // Return unchanged state on error
  }
}

// Context type with additional utility methods
interface GiftContextType {
  state: GiftState
  dispatch: React.Dispatch<GiftAction>
  totalItems: number
  totalPrice: number
  isBoxSelected: boolean
  isWrapSelected: boolean
  isCartEmpty: boolean
  clearCart: () => void
  resetGift: () => void
  addToCart: (item: Product | GiftOption, quantity?: number) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  exportState: () => string
  importState: (stateJson: string) => boolean
}

// Create context with default values
const GiftContext = createContext<GiftContextType>({
  state: createInitialState(),
  dispatch: () => null,
  totalItems: 0,
  totalPrice: 0,
  isBoxSelected: false,
  isWrapSelected: false,
  isCartEmpty: true,
  clearCart: () => null,
  resetGift: () => null,
  addToCart: () => null,
  removeFromCart: () => null,
  updateQuantity: () => null,
  exportState: () => "",
  importState: () => false,
})

// Enhanced Provider with performance optimizations
export const GiftProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast()
  const [savedState, setSavedState] = useLocalStorage<GiftState | null>(GIFT_STATE_KEY, null)

  // Initialize state from localStorage or create new state
  const getInitialState = (): GiftState => {
    if (!savedState) {
      return createInitialState()
    }

    try {
      // Validate structure of the saved state
      if (!savedState || typeof savedState !== "object" || !Array.isArray(savedState.cart)) {
        console.warn("Invalid gift state structure in localStorage, resetting")
        return createInitialState()
      }

      // Check version and handle migrations if needed
      if (savedState.version !== GIFT_STATE_VERSION) {
        console.log(`Migrating gift state from version ${savedState.version} to ${GIFT_STATE_VERSION}`)
        // Perform any necessary migrations here
      }

      // Ensure all expected properties exist
      return {
        cart: Array.isArray(savedState.cart) ? savedState.cart : [],
        selectedBox: savedState.selectedBox || null,
        selectedWrap: savedState.selectedWrap || null,
        currentStep: ["chocolates", "candies", "box", "decorations", "wrap", "summary"].includes(savedState.currentStep)
          ? (savedState.currentStep as GiftStep)
          : "chocolates",
        lastUpdated: savedState.lastUpdated || Date.now(),
        version: GIFT_STATE_VERSION, // Always use current version
      }
    } catch (error) {
      console.error("Failed to parse gift state from localStorage:", error)
      return createInitialState()
    }
  }

  const [state, dispatch] = useReducer(giftReducer, getInitialState())

  // Synchronize with localStorage
  useEffect(() => {
    setSavedState(state)
  }, [state, setSavedState])

  // Calculate derived values with memoization
  const totalItems = useMemo(() => {
    return state.cart.reduce((sum, item) => sum + item.quantity, 0)
  }, [state.cart])

  const totalPrice = useMemo(() => {
    let total = state.cart.reduce((sum, item) => sum + item.data.price * item.quantity, 0)

    // Add box price if selected
    if (state.selectedBox) {
      total += state.selectedBox.price
    }

    // Add wrap price if selected
    if (state.selectedWrap) {
      total += state.selectedWrap.price
    }

    return total
  }, [state.cart, state.selectedBox, state.selectedWrap])

  // Check if box and wrap are selected
  const isBoxSelected = Boolean(state.selectedBox)
  const isWrapSelected = Boolean(state.selectedWrap)
  const isCartEmpty = state.cart.length === 0

  // Memoized utility functions
  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" })
    toast({
      title: "تم مسح السلة",
      description: "تم مسح جميع المنتجات من سلة الهدايا",
      variant: "default",
    })
  }, [toast])

  const resetGift = useCallback(() => {
    dispatch({ type: "RESET_GIFT" })
    toast({
      title: "تم إعادة تعيين الهدية",
      description: "تم إعادة تعيين جميع إعدادات الهدية",
      variant: "default",
    })
  }, [toast])

  const addToCart = useCallback(
    (item: Product | GiftOption, quantity = 1) => {
      // إضافة العنصر للسلة عدة مرات حسب الكمية المطلوبة
      for (let i = 0; i < quantity; i++) {
        dispatch({ type: "ADD_TO_CART", payload: item })
      }

      // عرض رسالة نجاح
      toast({
        title: "تمت الإضافة بنجاح",
        description: `تمت إضافة ${item.name} إلى سلة الهدايا`,
        variant: "default",
      })

      // تتبع حدث إضافة منتج (يمكن استخدامه مع أدوات التحليلات)
      if (typeof window !== "undefined" && "gtag" in window) {
        const gtag = window.gtag
        gtag("event", "add_to_cart", {
          item_id: item.id,
          item_name: item.name,
          item_category: item.category,
          price: item.price,
          quantity: quantity,
        })
      }
    },
    [toast],
  )

  const removeFromCart = useCallback(
    (id: string) => {
      dispatch({ type: "REMOVE_FROM_CART", payload: id })
      toast({
        title: "تمت الإزالة",
        description: "تم إزالة المنتج من سلة الهدايا",
        variant: "destructive",
      })
    },
    [toast],
  )

  const updateQuantity = useCallback((id: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })
  }, [])

  // وظائف تصدير واستيراد الحالة
  const exportState = useCallback((): string => {
    try {
      return JSON.stringify(state)
    } catch (error) {
      console.error("Failed to export gift state:", error)
      toast({
        title: "خطأ في التصدير",
        description: "حدث خطأ أثناء تصدير بيانات الهدية",
        variant: "destructive",
      })
      return ""
    }
  }, [state, toast])

  const importState = useCallback(
    (stateJson: string): boolean => {
      try {
        const importedState = JSON.parse(stateJson) as GiftState

        // التحقق من صحة البيانات المستوردة
        if (!importedState || typeof importedState !== "object" || !Array.isArray(importedState.cart)) {
          throw new Error("Invalid state format")
        }

        dispatch({ type: "IMPORT_STATE", payload: importedState })

        toast({
          title: "تم الاستيراد بنجاح",
          description: "تم استيراد بيانات الهدية بنجاح",
          variant: "default",
        })

        return true
      } catch (error) {
        console.error("Failed to import gift state:", error)
        toast({
          title: "خطأ في الاستيراد",
          description: "حدث خطأ أثناء استيراد بيانات الهدية",
          variant: "destructive",
        })
        return false
      }
    },
    [toast],
  )

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      state,
      dispatch,
      totalItems,
      totalPrice,
      isBoxSelected,
      isWrapSelected,
      isCartEmpty,
      clearCart,
      resetGift,
      addToCart,
      removeFromCart,
      updateQuantity,
      exportState,
      importState,
    }),
    [
      state,
      dispatch,
      totalItems,
      totalPrice,
      isBoxSelected,
      isWrapSelected,
      isCartEmpty,
      clearCart,
      resetGift,
      addToCart,
      removeFromCart,
      updateQuantity,
      exportState,
      importState,
    ],
  )

  return <GiftContext.Provider value={contextValue}>{children}</GiftContext.Provider>
}

// Enhanced custom hook with error boundary
export const useGift = () => {
  const context = useContext(GiftContext)

  if (!context) {
    throw new Error("useGift must be used within a GiftProvider")
  }

  return context
}
