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

// Thunk to add a gift to the current cart
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
      // Validate at least one product
      if (selectedProducts.length === 0) {
        return rejectWithValue("يرجى إضافة منتج واحد على الأقل للهدية")
      }

      // Create cart item
      const cartItem = await createGiftCartItem(
        selectedBox,
        selectedProducts,
        selectedDecorations,
        selectedBag,
        personalMessage,
      )

      // Get existing cart and add new item
      const existingCart = localStorage.getItem("cadoz-cart")
      const cart = existingCart ? JSON.parse(existingCart) : []
      cart.push(cartItem)

      // Update localStorage immediately
      localStorage.setItem("cadoz-cart", JSON.stringify(cart))

      // Dispatch a custom event to notify cart context
      const cartUpdateEvent = new CustomEvent("cartUpdated", { detail: cart })
      window.dispatchEvent(cartUpdateEvent)

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
        state.error = null
      })
      .addCase(addGiftToCart.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export default cartSlice.reducer
