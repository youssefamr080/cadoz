import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export interface WishlistItem {
  id: number
  name: string
  price: number
  image: string
  productId: number
  type?: string
}

interface WishlistState {
  wishlist: WishlistItem[]
}

const initialState: WishlistState = {
  wishlist: typeof window !== "undefined" && localStorage.getItem("wishlist")
    ? JSON.parse(localStorage.getItem("wishlist") as string)
    : [],
}

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    addToWishlist: (state, action: PayloadAction<WishlistItem>) => {
      if (!state.wishlist.some((item) => item.id === action.payload.id)) {
        state.wishlist.push(action.payload)
        localStorage.setItem("wishlist", JSON.stringify(state.wishlist))
      }
    },
    removeFromWishlist: (state, action: PayloadAction<number>) => {
      state.wishlist = state.wishlist.filter((item) => item.id !== action.payload)
      localStorage.setItem("wishlist", JSON.stringify(state.wishlist))
    },
    clearWishlist: (state) => {
      state.wishlist = []
      localStorage.removeItem("wishlist")
    },
  },
})

export const selectWishlist = (state: { wishlist: WishlistState }) => state.wishlist.wishlist
export const selectIsInWishlist = (id: number) => (state: { wishlist: WishlistState }) =>
  state.wishlist.wishlist.some((item) => item.id === id)

export const { addToWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions
export default wishlistSlice.reducer 