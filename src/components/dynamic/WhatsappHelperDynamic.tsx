"use client"

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Dynamic import for WhatsappHelper with loading fallback
const WhatsappHelper = dynamic(
  () => import('@/components/home/WhatsappHelper'),
  {
    loading: () => (
      <div className="fixed bottom-6 right-6 z-50">
        <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
          <div className="w-6 h-6 bg-white rounded-full"></div>
        </div>
      </div>
    ),
    ssr: false, // Disable SSR since it uses browser APIs and user interactions
  }
)

export default function WhatsappHelperDynamic(props: any) {
  return (
    <Suspense fallback={
      <div className="fixed bottom-6 right-6 z-50">
        <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
          <div className="w-6 h-6 bg-white rounded-full"></div>
        </div>
      </div>
    }>
      <WhatsappHelper {...props} />
    </Suspense>
  )
} 