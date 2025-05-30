"use client"

import { GiftProvider } from "@/context/gift-context"
import GiftBuilder from "@/components/gift/gift-builder"
import { Provider as ReduxProvider } from "react-redux"
import { store } from "@/lib/redux/store"
export default function GiftPage() {
  return (
    <ReduxProvider store={store}>
      <GiftProvider>
        <div className="h-full bg-gray-50">
          <GiftBuilder />
        </div>
      </GiftProvider>
    </ReduxProvider>
  )
}


