"use client"

import CustomGiftsPageContent from "@/components/gift/custom-gifts-page"
import { Provider as ReduxProvider } from "react-redux"
import { store } from "@/lib/redux/store"

export default function CustomGiftsPage() {
  return (
    <ReduxProvider store={store}>
      <CustomGiftsPageContent />
    </ReduxProvider>
  )
}
