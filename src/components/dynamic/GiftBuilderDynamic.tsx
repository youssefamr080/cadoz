"use client"

import dynamic from 'next/dynamic'
import { Suspense, useEffect } from 'react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { trackComponentLoad } from '@/lib/utils/performance-monitor'

// Dynamic import for GiftBuilder with loading fallback
const GiftBuilder = dynamic(
  () => import('@/components/gift/gift-builder'),
  {
    loading: () => (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner message="جاري تحميل منشئ الهدايا..." />
        </div>
      </div>
    ),
    ssr: false, // Disable SSR for this component since it uses browser APIs
  }
)

export default function GiftBuilderDynamic() {
  const trackLoad = trackComponentLoad('GiftBuilder')

  useEffect(() => {
    // Track when component is fully loaded
    const timer = setTimeout(trackLoad, 100)
    return () => clearTimeout(timer)
  }, [trackLoad])

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner message="جاري تحميل منشئ الهدايا..." />
        </div>
      </div>
    }>
      <GiftBuilder />
    </Suspense>
  )
} 