"use client"

import { createContext, useContext, useState, useEffect, useCallback, useReducer, type ReactNode } from "react"
import { toast } from "react-toastify"

/* ====================================================
  تعريف واجهات بيانات الهدية
==================================================== */
export interface GiftItem {
  name: string
  quantity: number
  image: string
  price: number
}

export interface GiftBox {
  name: string
  image: string
  price: number
}

export interface GiftWrap {
  name: string
  image: string
  price: number
}

export interface GiftData {
  items: GiftItem[]
  box: GiftBox | null
  wrap: GiftWrap | null
  message?: string
  recipient?: string
}

/* ====================================================
  تعريف واجهة الصنف في السلة
==================================================== */
export interface CartItem {
  id: number
  name: string
  image: string
  price: number
  quantity: number
  category?: string
  variant?: string // يستخدم لتخزين اللون المختار
  color?: string // لون المنتج المحدد
  discount?: number
  originalPrice?: number
  stock?: number
  giftDetails?: string // تفاصيل الهدية القديمة (في حال كانت غير مُخصصة)
  giftData?: GiftData // بيانات الهدية المُفصلة
}

/* ====================================================
  واجهات بيانات الشحن وكوبونات الخصم وحسابات السلة
==================================================== */
export interface ShippingDetails {
  governorate: string
  city?: string
  address?: string
  postalCode?: string
  phone?: string
}

export interface PromoCodeDetails {
  code: string
  isValid: boolean
  discountPercentage: number
  errorMessage?: string
}

export interface CartTotals {
  subtotal: number
  shippingFees: number
  discount: number
  tax: number
  total: number
  itemCount: number
}

/* ====================================================
  أنواع الإجراءات (Actions) للمخزن (Reducer)
==================================================== */
type CartAction =
  | { type: "ADD_ITEM"; payload: { item: CartItem; quantity?: number } }
  | { type: "REMOVE_ITEM"; payload: { id: number } }
  | { type: "UPDATE_QUANTITY"; payload: { id: number; quantity: number } }
  | { type: "INCREMENT_QUANTITY"; payload: { id: number } }
  | { type: "DECREMENT_QUANTITY"; payload: { id: number } }
  | { type: "CLEAR_CART" }
  | { type: "INITIALIZE_CART"; payload: { items: CartItem[] } }

/* ====================================================
  تعريف واجهة سياق عربة التسوق مع جميع الوظائف
==================================================== */
interface CartContextType {
  // بيانات عربة التسوق
  cart: CartItem[]
  itemCount: number
  isCartEmpty: boolean

  // عمليات العناصر
  addToCart: (item: CartItem, quantity?: number) => void
  removeFromCart: (id: number) => void
  updateQuantity: (id: number, quantity: number) => void
  incrementQuantity: (id: number) => void
  decrementQuantity: (id: number) => void
  clearCart: () => void

  // التعامل مع معلومات الشحن
  shipping: ShippingDetails
  updateShipping: (details: Partial<ShippingDetails>) => void
  availableGovernorates: string[]
  getShippingFees: () => number

  // التعامل مع كوبونات الخصم
  promoCode: PromoCodeDetails
  setPromoCode: (code: string) => void
  applyPromoCode: () => Promise<boolean>
  clearPromoCode: () => void

  // حسابات المجاميع
  getCartTotals: () => CartTotals

  // وظائف مساعدة
  isItemInCart: (id: number) => boolean
  getItemQuantity: (id: number) => number
  saveCart: () => void
}

/* ====================================================
  ثوابت التطبيق
==================================================== */
const STORAGE_KEYS = {
  CART: "cadoz-cart",
  SHIPPING: "cadoz-shipping",
  PROMO: "cadoz-promo",
}

const TAX_RATE = 0.0 // ملاحظة: يمكن تعديل الضريبة بالنسبة المطلوبة (مثلاً 14%)
const VALID_PROMO_CODES = {
  CADOZ10: { discountPercentage: 0.1, message: "خصم 10%" },
  WELCOME15: { discountPercentage: 0.15, message: "خصم ترحيبي 15%" },
  FREESHIP: { discountPercentage: 0, message: "شحن مجاني", freeShipping: true },
}

const GOVERNORATES = [
  "القاهرة",
  "الإسكندرية",
  "الجيزة",
  "الشرقية",
  "الغربية",
  "المنوفية",
  "القليوبية",
  "البحيرة",
  "بورسعيد",
  "دمياط",
  "الإسماعيلية",
  "السويس",
  "كفر الشيخ",
  "الفيوم",
  "بني سويف",
  "المنيا",
  "أسيوط",
  "سوهاج",
  "قنا",
  "أسوان",
  "الأقصر",
  "البحر الأحمر",
  "الوادي الجديد",
  "مطروح",
  "شمال سيناء",
  "جنوب سيناء",
]

/* ====================================================
  دالة المخزن (Reducer) لإدارة حالة السلة
==================================================== */
const cartReducer = (state: CartItem[], action: CartAction): CartItem[] => {
  switch (action.type) {
    case "ADD_ITEM": {
      const { item, quantity = 1 } = action.payload
      const existingItemIndex = state.findIndex(
        (cartItem) => cartItem.id === item.id && cartItem.variant === item.variant,
      )

      if (existingItemIndex > -1) {
        // التأكد من عدم تجاوز المخزون المتاح
        const newQuantity = state[existingItemIndex].quantity + quantity
        const stockLimit = item.stock || Number.POSITIVE_INFINITY

        return state.map((cartItem, index) =>
          index === existingItemIndex ? { ...cartItem, quantity: Math.min(newQuantity, stockLimit) } : cartItem,
        )
      } else {
        // إضافة عنصر جديد للسلة
        const stockLimit = item.stock || Number.POSITIVE_INFINITY
        return [...state, { ...item, quantity: Math.min(quantity, stockLimit) }]
      }
    }

    case "REMOVE_ITEM":
      return state.filter((item) => item.id !== action.payload.id)

    case "UPDATE_QUANTITY": {
      const { id, quantity } = action.payload
      if (quantity <= 0) {
        return state.filter((item) => item.id !== id)
      }
      return state.map((item) =>
        item.id === id ? { ...item, quantity: Math.min(quantity, item.stock || Number.POSITIVE_INFINITY) } : item,
      )
    }

    case "INCREMENT_QUANTITY":
      return state.map((item) =>
        item.id === action.payload.id
          ? { ...item, quantity: Math.min(item.quantity + 1, item.stock || Number.POSITIVE_INFINITY) }
          : item,
      )

    case "DECREMENT_QUANTITY": {
      const updatedItems = state.map((item) =>
        item.id === action.payload.id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item,
      )
      return updatedItems.filter((item) => item.quantity > 0)
    }

    case "CLEAR_CART":
      return []

    case "INITIALIZE_CART":
      return action.payload.items

    default:
      return state
  }
}

/* ====================================================
  إنشاء سياق عربة التسوق
==================================================== */
const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider = ({ children }: { children: ReactNode }) => {
  // استخدام useReducer لإدارة السلة
  const [cart, dispatch] = useReducer(cartReducer, [])

  // معلومات الشحن
  const [shipping, setShipping] = useState<ShippingDetails>({
    governorate: "",
  })

  // معلومات كود الخصم
  const [promoCode, setPromoCodeState] = useState<PromoCodeDetails>({
    code: "",
    isValid: false,
    discountPercentage: 0,
  })

  // إحصاء عناصر السلة
  const itemCount = cart.reduce((count, item) => count + item.quantity, 0)
  const isCartEmpty = cart.length === 0

  // ========== تحميل البيانات من التخزين المحلي ==========
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(STORAGE_KEYS.CART)
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart)
        if (Array.isArray(parsedCart)) {
          dispatch({ type: "INITIALIZE_CART", payload: { items: parsedCart } })
        }
      }

      const savedShipping = localStorage.getItem(STORAGE_KEYS.SHIPPING)
      if (savedShipping) {
        setShipping(JSON.parse(savedShipping))
      }

      const savedPromo = localStorage.getItem(STORAGE_KEYS.PROMO)
      if (savedPromo) {
        setPromoCodeState(JSON.parse(savedPromo))
      }
    } catch (error) {
      console.error("Error loading cart data from localStorage:", error)
      localStorage.removeItem(STORAGE_KEYS.CART)
      localStorage.removeItem(STORAGE_KEYS.SHIPPING)
      localStorage.removeItem(STORAGE_KEYS.PROMO)
    }
  }, [])

  // Listen for cart updates from gift additions
  useEffect(() => {
    const handleCartUpdate = (event: CustomEvent<CartItem[]>) => {
      dispatch({ type: "INITIALIZE_CART", payload: { items: event.detail } })
    }

    window.addEventListener("cartUpdated", handleCartUpdate as EventListener)
    
    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate as EventListener)
    }
  }, [])

  // ========== حفظ البيانات في التخزين المحلي ==========
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart))
    } else {
      localStorage.removeItem(STORAGE_KEYS.CART)
    }
  }, [cart])

  useEffect(() => {
    if (shipping.governorate) {
      localStorage.setItem(STORAGE_KEYS.SHIPPING, JSON.stringify(shipping))
    }
  }, [shipping])

  useEffect(() => {
    if (promoCode.code) {
      localStorage.setItem(STORAGE_KEYS.PROMO, JSON.stringify(promoCode))
    } else {
      localStorage.removeItem(STORAGE_KEYS.PROMO)
    }
  }, [promoCode])

  // إضافة تأثير لمراقبة تأهل الشحن المجاني
  useEffect(() => {
    const FREE_SHIPPING_THRESHOLD = 500
    const cartSubtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
    
    if (cartSubtotal >= FREE_SHIPPING_THRESHOLD) {
      toast.success("تم تطبيق الشحن المجاني تلقائياً لتجاوز الطلب 500 ج.م! 🎉", {
        toastId: 'free-shipping-notification'
      })
    }
  }, [cart])

  // ========== وظائف التعامل مع السلة ==========
  const addToCart = useCallback((item: CartItem, quantity = 1) => {
    dispatch({ type: "ADD_ITEM", payload: { item, quantity } })
    // إزالة الإشعار المكرر هنا لأن الإشعار يظهر في صفحة المنتج
  }, [])

  const removeFromCart = useCallback(
    (id: number) => {
      const itemToRemove = cart.find((item) => item.id === id)
      if (itemToRemove) {
        dispatch({ type: "REMOVE_ITEM", payload: { id } })
        toast.info(`تم حذف ${itemToRemove.name} من السلة`)
      }
    },
    [cart],
  )

  const updateQuantity = useCallback((id: number, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })
  }, [])

  const incrementQuantity = useCallback(
    (id: number) => {
      const item = cart.find((item) => item.id === id)
      if (item && (item.stock === undefined || item.quantity < item.stock)) {
        dispatch({ type: "INCREMENT_QUANTITY", payload: { id } })
      } else if (item && item.stock !== undefined && item.quantity >= item.stock) {
        toast.warning(`عذراً، الكمية المتوفرة لـ ${item.name} هي ${item.stock} فقط`)
      }
    },
    [cart],
  )

  const decrementQuantity = useCallback((id: number) => {
    dispatch({ type: "DECREMENT_QUANTITY", payload: { id } })
  }, [])

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" })
    toast.info("تم مسح السلة بالكامل")
  }, [])

  const saveCart = useCallback(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart))
    toast.success("تم حفظ السلة بنجاح")
  }, [cart])

  // ========== وظائف التعامل مع الشحن ==========
  const updateShipping = useCallback((details: Partial<ShippingDetails>) => {
    setShipping((prev) => {
      const updated = { ...prev, ...details }
      localStorage.setItem(STORAGE_KEYS.SHIPPING, JSON.stringify(updated))
      return updated
    })
  }, [])

  const getShippingFees = useCallback(() => {
    if (!shipping.governorate) return 0

    const promoDetails = VALID_PROMO_CODES[promoCode.code as keyof typeof VALID_PROMO_CODES]
    const promoFreeShipping =
      promoCode.isValid && promoDetails && ("freeShipping" in promoDetails ? promoDetails.freeShipping : false)

    // التحقق من الحد الأدنى للشحن المجاني
    const FREE_SHIPPING_THRESHOLD = 500
    const cartSubtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
    if (cartSubtotal >= FREE_SHIPPING_THRESHOLD) {
      return 0
    }

    if (promoFreeShipping) return 0

    const fees = {
      القاهرة: 50,
      الجيزة: 50,
      الإسكندرية: 75,
      بورسعيد: 100,
      السويس: 100,
      الإسماعيلية: 100,
      دمياط: 125,
    }

    return fees[shipping.governorate as keyof typeof fees] || 150
  }, [shipping.governorate, promoCode, cart])

  // ========== وظائف التعامل مع كوبونات الخصم ==========
  const setPromoCode = useCallback((code: string) => {
    setPromoCodeState((prev) => ({
      ...prev,
      code,
      isValid: false,
      discountPercentage: 0,
      errorMessage: undefined,
    }))
  }, [])

  const applyPromoCode = useCallback(async (): Promise<boolean> => {
    if (!promoCode.code) {
      setPromoCodeState((prev) => ({
        ...prev,
        isValid: false,
        errorMessage: "يرجى إدخال كود الخصم",
      }))
      toast.error("يرجى إدخال كود الخصم")
      return false
    }

    // التحقق من تسجيل الدخول
    const userData = localStorage.getItem("userData")
    if (!userData) {
      toast.error("يجب تسجيل الدخول لاستخدام كود الخصم")
      setPromoCodeState((prev) => ({
        ...prev,
        isValid: false,
        errorMessage: "يجب تسجيل الدخول",
      }))
      return false
    }

    const user = JSON.parse(userData)
    
    return new Promise((resolve) => {
      setTimeout(async () => {
        const normalizedCode = promoCode.code.toUpperCase()
        const promoDetails = VALID_PROMO_CODES[normalizedCode as keyof typeof VALID_PROMO_CODES]

        if (promoDetails) {
          try {
            // التحقق من صلاحية استخدام الكود
            const response = await fetch("/api/promo-codes/validate", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                code: normalizedCode,
                userId: user.id,
              }),
            })

            const data = await response.json()

            if (!data.success) {
              setPromoCodeState((prev) => ({
                ...prev,
                isValid: false,
                discountPercentage: 0,
                errorMessage: data.message,
              }))
              toast.error(data.message)
              resolve(false)
              return
            }

            setPromoCodeState((prev) => ({
              ...prev,
              code: normalizedCode,
              isValid: true,
              discountPercentage: promoDetails.discountPercentage,
              errorMessage: undefined,
            }))
            toast.success(`تم تطبيق كود الخصم: ${promoDetails.message}`)
            resolve(true)
          } catch (error) {
            console.error("Error validating promo code:", error)
            toast.error("حدث خطأ أثناء التحقق من كود الخصم")
            resolve(false)
          }
        } else {
          setPromoCodeState((prev) => ({
            ...prev,
            isValid: false,
            discountPercentage: 0,
            errorMessage: "كود الخصم غير صالح",
          }))
          toast.error("كود الخصم غير صالح")
          resolve(false)
        }
      }, 800)
    })
  }, [promoCode.code])

  const clearPromoCode = useCallback(() => {
    setPromoCodeState({
      code: "",
      isValid: false,
      discountPercentage: 0,
    })
    localStorage.removeItem(STORAGE_KEYS.PROMO)
  }, [])

  // ========== وظائف حسابات السلة ==========
  const getCartTotals = useCallback((): CartTotals => {
    const subtotal = cart.reduce((total, item) => {
      const itemPrice =
        item.discount && item.originalPrice ? item.originalPrice - item.originalPrice * item.discount : item.price
      return total + itemPrice * item.quantity
    }, 0)

    const shippingFees = getShippingFees()
    const discount = promoCode.isValid ? subtotal * promoCode.discountPercentage : 0
    const taxableAmount = subtotal - discount
    const tax = taxableAmount * TAX_RATE
    const total = taxableAmount + shippingFees + tax

    return {
      subtotal,
      shippingFees,
      discount,
      tax,
      total,
      itemCount,
    }
  }, [cart, getShippingFees, promoCode, itemCount])

  // ========== وظائف مساعدة ==========
  const isItemInCart = useCallback(
    (id: number) => {
      return cart.some((item) => item.id === id)
    },
    [cart],
  )

  const getItemQuantity = useCallback(
    (id: number) => {
      const item = cart.find((item) => item.id === id)
      return item ? item.quantity : 0
    },
    [cart],
  )

  /* ====================================================
    تجميع قيم السياق
  ===================================================== */
  const contextValue: CartContextType = {
    cart,
    itemCount,
    isCartEmpty,
    addToCart,
    removeFromCart,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    shipping,
    updateShipping,
    availableGovernorates: GOVERNORATES,
    getShippingFees,
    promoCode,
    setPromoCode,
    applyPromoCode,
    clearPromoCode,
    getCartTotals,
    isItemInCart,
    getItemQuantity,
    saveCart,
  }

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
}

// Hook لاستخدام السلة داخل مكونات التطبيق
export const useCart = (): CartContextType => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("يجب استخدام useCart داخل CartProvider")
  }
  return context
}
