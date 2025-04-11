"use client"

import { GiftProvider } from "@/context/gift-context"
import GiftBuilder from "@/components/gift/gift-builder"

export default function GiftPage() {
  return (
    <GiftProvider>
      <GiftBuilder />
    </GiftProvider>
  )
}


