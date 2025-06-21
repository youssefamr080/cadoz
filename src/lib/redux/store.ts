import { configureStore, combineReducers } from "@reduxjs/toolkit"
import { setupListeners } from "@reduxjs/toolkit/query"
import { apiSlice } from "./api/apiSlice"
import giftReducer from "./slices/giftSlice"
import cartReducer from "./slices/cartSlice"
import inspirationReducer from "./slices/inspirationSlice"
import customGiftReducer from "./slices/customGiftSlice"
import wishlistReducer from "./slices/wishlistSlice"
import searchReducer from "./slices/searchSlice"

// redux-persist imports
import storage from "redux-persist/lib/storage"
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist"

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["cart", "wishlist", "gift", "inspiration", "customGift"],
  // استبعاد RTK Query من الـ persist
  blacklist: [apiSlice.reducerPath],
}

const rootReducer = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
  gift: giftReducer,
  cart: cartReducer,
  inspiration: inspirationReducer,
  customGift: customGiftReducer,
  wishlist: wishlistReducer,
  search: searchReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }).concat(apiSlice.middleware) as any,
})

export const persistor = persistStore(store)

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
