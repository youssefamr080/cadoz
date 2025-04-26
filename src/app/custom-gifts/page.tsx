"use client"

import { GiftProvider } from "@/context/gift-context"
import CustomGiftsPage from "@/components/gift/custom-gifts-page"
import { Provider as ReduxProvider } from "react-redux"
import { store } from "@/lib/redux/store"

export default function CustomGifts() {
  return (
    <ReduxProvider store={store}>
      <GiftProvider>
        <CustomGiftsPage />
      </GiftProvider>
    </ReduxProvider>
  )
}
