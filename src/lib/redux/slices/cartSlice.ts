import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { createGiftCartItem } from "@/lib/actions/cart-integration"
import type { Box, GiftProduct, Decoration, Bag } from "@/types/database"

interface PersonalMessage {
  message: string
  recipient: string
  sender: string
}

interface CartState {
  isLoading: boolean
  error: string | null
}

const initialState: CartState = {
  isLoading: false,
  error: null,
}

// Thunk لإضافة هدية إلى السلة الحالية
export const addGiftToCart = createAsyncThunk(
  "cart/addGiftToCart",
  async (
    {
      selectedBox,
      selectedProducts,
      selectedDecorations,
      selectedBag,
      personalMessage,
    }: {
      selectedBox: Box | null
      selectedProducts: GiftProduct[]
      selectedDecorations: Decoration[]
      selectedBag: Bag | null
      personalMessage?: PersonalMessage
    },
    { rejectWithValue },
  ) => {
    try {
      // التحقق من وجود منتج واحد على الأقل
      if (selectedProducts.length === 0) {
        return rejectWithValue("يرجى إضافة منتج واحد على الأقل للهدية")
      }

      // إنشاء عنصر السلة
      const cartItem = createGiftCartItem(
        selectedBox,
        selectedProducts,
        selectedDecorations,
        selectedBag,
        personalMessage,
      )

      // إضافة العنصر إلى السلة الحالية
      const existingCart = localStorage.getItem("cadoz-cart")
      const cart = existingCart ? JSON.parse(existingCart) : []
      cart.push(cartItem)
      localStorage.setItem("cadoz-cart", JSON.stringify(cart))

      return cartItem
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  },
)

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addGiftToCart.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(addGiftToCart.fulfilled, (state) => {
        state.isLoading = false
      })
      .addCase(addGiftToCart.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export default cartSlice.reducer
