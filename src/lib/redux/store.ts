import { configureStore } from "@reduxjs/toolkit"
import { setupListeners } from "@reduxjs/toolkit/query"
import { apiSlice } from "./api/apiSlice"
import giftReducer from "./slices/giftSlice"
import cartReducer from "./slices/cartSlice"
import inspirationReducer from "./slices/inspirationSlice"
import customGiftReducer from "./slices/customGiftSlice"
import wishlistReducer from "./slices/wishlistSlice"
import searchReducer from "./slices/searchSlice"

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    gift: giftReducer,
    cart: cartReducer,
    inspiration: inspirationReducer,
    customGift: customGiftReducer,
    wishlist: wishlistReducer,
    search: searchReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Desactivar para manejar objetos no serializables como ObjectId
    }).concat(apiSlice.middleware),
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
