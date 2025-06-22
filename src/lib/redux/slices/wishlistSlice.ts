import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export interface WishlistItem {
  id: string
  name: string
  price: number
  image: string
  productId: string
  type?: string
}

interface WishlistState {
  wishlist: WishlistItem[]
}

const initialState: WishlistState = {
  wishlist: [],
}

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    hydrateWishlist: (state, action: PayloadAction<WishlistState>) => {
      state.wishlist = action.payload.wishlist
    },
    addToWishlist: (state, action: PayloadAction<WishlistItem>) => {
      if (!state.wishlist.some((item) => item.id === action.payload.id)) {
        state.wishlist.push(action.payload)
      }
    },
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.wishlist = state.wishlist.filter((item) => item.id !== action.payload)
    },
    clearWishlist: (state) => {
      state.wishlist = []
    },
  },
})

export const selectWishlist = (state: { wishlist: WishlistState }) => state.wishlist.wishlist
export const selectIsInWishlist = (id: string) => (state: { wishlist: WishlistState }) =>
  state.wishlist.wishlist.some((item) => item.id === id)

export const { addToWishlist, removeFromWishlist, clearWishlist, hydrateWishlist } = wishlistSlice.actions
export default wishlistSlice.reducer 