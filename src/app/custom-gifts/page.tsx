"use client"

import { GiftProvider } from "@/context/gift-context"
import CustomGiftsPage from "@/components/gift/custom-gifts-page"

export default function CustomGifts() {
  return (
    <GiftProvider>
      <CustomGiftsPage />
    </GiftProvider>
  )
}
