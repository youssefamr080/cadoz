import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit"
import { createGiftCartItem } from "@/lib/actions/cart-integration"
import type { Box, GiftProduct, Decoration, Bag } from "@/types/database"

// =====================
// تعريف الواجهات (Interfaces)
// =====================
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

export interface CartItem {
  id: number
  name: string
  image: string
  price: number
  quantity: number
  category?: string
  variant?: string
  color?: string
  discount?: number
  originalPrice?: number
  stock?: number
  giftDetails?: string
  giftData?: GiftData
}

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

// =====================
// ثوابت التطبيق
// =====================
const STORAGE_KEYS = {
  CART: "cadoz-cart",
  SHIPPING: "cadoz-shipping",
  PROMO: "cadoz-promo",
}

const TAX_RATE = 0.0
const VALID_PROMO_CODES: Record<string, { discountPercentage: number; message: string; freeShipping?: boolean }> = {
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

// =====================
// الحالة الأولية (Initial State)
// =====================
interface CartState {
  cart: CartItem[]
  shipping: ShippingDetails
  promoCode: PromoCodeDetails
}

const initialState: CartState = {
  cart: [],
  shipping: { governorate: "" },
  promoCode: { code: "", isValid: false, discountPercentage: 0 },
}

// =====================
// Reducers
// =====================
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    hydrateCart: (state, action: PayloadAction<CartState>) => {
      state.cart = action.payload.cart
      state.shipping = action.payload.shipping
      state.promoCode = action.payload.promoCode
    },
    addItem: (state, action: PayloadAction<{ item: CartItem; quantity?: number }>) => {
      const { item, quantity = 1 } = action.payload
      const existingItemIndex = state.cart.findIndex(
        (cartItem) => cartItem.id === item.id && cartItem.variant === item.variant,
      )
      if (existingItemIndex > -1) {
        const newQuantity = state.cart[existingItemIndex].quantity + quantity
        const stockLimit = item.stock || Number.POSITIVE_INFINITY
        state.cart[existingItemIndex].quantity = Math.min(newQuantity, stockLimit)
      } else {
        const stockLimit = item.stock || Number.POSITIVE_INFINITY
        state.cart.push({ ...item, quantity: Math.min(quantity, stockLimit) })
      }
    },
    removeItem: (state, action: PayloadAction<{ id: number }>) => {
      state.cart = state.cart.filter((item) => item.id !== action.payload.id)
    },
    updateItemQuantity: (state, action: PayloadAction<{ id: number; quantity: number }>) => {
      const { id, quantity } = action.payload
      if (quantity <= 0) {
        state.cart = state.cart.filter((item) => item.id !== id)
      } else {
        state.cart = state.cart.map((item) =>
          item.id === id ? { ...item, quantity: Math.min(quantity, item.stock || Number.POSITIVE_INFINITY) } : item,
        )
      }
    },
    incrementQuantity: (state, action: PayloadAction<{ id: number }>) => {
      state.cart = state.cart.map((item) =>
        item.id === action.payload.id
          ? { ...item, quantity: Math.min(item.quantity + 1, item.stock || Number.POSITIVE_INFINITY) }
          : item,
      )
    },
    decrementQuantity: (state, action: PayloadAction<{ id: number }>) => {
      state.cart = state.cart.map((item) =>
        item.id === action.payload.id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item,
      )
      state.cart = state.cart.filter((item) => item.quantity > 0)
    },
    clearCart: (state) => {
      state.cart = []
    },
    updateShipping: (state, action: PayloadAction<Partial<ShippingDetails>>) => {
      state.shipping = { ...state.shipping, ...action.payload }
    },
    setPromoCode: (state, action: PayloadAction<string>) => {
      state.promoCode = {
        ...state.promoCode,
        code: action.payload,
        isValid: false,
        discountPercentage: 0,
        errorMessage: undefined,
      }
    },
    clearPromoCode: (state) => {
      state.promoCode = { code: "", isValid: false, discountPercentage: 0 }
    },
    setPromoCodeState: (state, action: PayloadAction<PromoCodeDetails>) => {
      state.promoCode = action.payload
    },
    saveCart: (state) => {
      // احذف أي localStorage هنا
    },
  },
})

// Selectors
export const selectCart = (state: { cart: CartState }) => state.cart.cart
export const selectItemCount = (state: { cart: CartState }) => state.cart.cart.reduce((count, item) => count + item.quantity, 0)
export const selectIsCartEmpty = (state: { cart: CartState }) => state.cart.cart.length === 0
export const selectShipping = (state: { cart: CartState }) => state.cart.shipping
export const selectPromoCode = (state: { cart: CartState }) => state.cart.promoCode
export const selectAvailableGovernorates = () => GOVERNORATES

// حساب المجاميع
export const selectCartTotals = (state: { cart: CartState }): CartTotals => {
  const cart = state.cart.cart
  const promoCode = state.cart.promoCode
  const subtotal = cart.reduce((total, item) => {
    const itemPrice =
      item.discount && item.originalPrice ? item.originalPrice - item.originalPrice * item.discount : item.price
    return total + itemPrice * item.quantity
  }, 0)
  // حساب الشحن
  const shipping = state.cart.shipping
  const promoDetails = VALID_PROMO_CODES[promoCode.code as keyof typeof VALID_PROMO_CODES]
  const promoFreeShipping =
    promoCode.isValid && promoDetails && ("freeShipping" in promoDetails ? promoDetails.freeShipping : false)
  const FREE_SHIPPING_THRESHOLD = 500
  if (subtotal >= FREE_SHIPPING_THRESHOLD || promoFreeShipping) {
    var shippingFees = 0
  } else {
    const fees: Record<string, number> = {
      القاهرة: 50,
      الجيزة: 50,
      الإسكندرية: 75,
      بورسعيد: 100,
      السويس: 100,
      الإسماعيلية: 100,
      دمياط: 125,
    }
    shippingFees = fees[shipping.governorate as keyof typeof fees] || 150
  }
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
    itemCount: cart.reduce((count, item) => count + item.quantity, 0),
  }
}

export const {
  addItem,
  removeItem,
  updateItemQuantity,
  incrementQuantity,
  decrementQuantity,
  clearCart,
  updateShipping,
  setPromoCode,
  clearPromoCode,
  setPromoCodeState,
  saveCart,
  hydrateCart,
} = cartSlice.actions

export default cartSlice.reducer
