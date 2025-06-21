"use client"

import GiftBuilderDynamic from "@/components/dynamic/GiftBuilderDynamic"
import { Provider as ReduxProvider } from "react-redux"
import { store } from "@/lib/redux/store"

export default function GiftPage() {
  return (
    <ReduxProvider store={store}>
      <div className="h-full bg-gray-50">
        <GiftBuilderDynamic />
      </div>
    </ReduxProvider>
  )
}


