"use client"

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Dynamic import for ChatBot components
const BotCard = dynamic(
  () => import('@/components/chat-bot/BotCard'),
  {
    loading: () => (
      <div className="w-full mt-3">
        <div className="bg-gradient-to-r from-purple-50/50 to-blue-50/50 rounded-xl p-3 border border-purple-100/30">
          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
            <LoadingSpinner message="جاري تحميل البطاقة..." />
          </div>
        </div>
      </div>
    ),
    ssr: false,
  }
)

const FormattedMessage = dynamic(
  () => import('@/components/chat-bot/FormattedMessage'),
  {
    loading: () => (
      <div className="space-y-1">
        <div className="bg-gray-100 rounded-lg p-3 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    ),
    ssr: false,
  }
)

const BotTypingAnimation = dynamic(
  () => import('@/components/chat-bot/BotTypingAnimation'),
  {
    loading: () => (
      <div className="flex items-center space-x-3 rtl:space-x-reverse py-2">
        <div className="flex items-center space-x-1 rtl:space-x-reverse">
          {[1, 2, 3].map((dot) => (
            <div
              key={dot}
              className="w-3 h-3 bg-gray-300 rounded-full animate-pulse"
              style={{ animationDelay: `${dot * 0.1}s` }}
            />
          ))}
        </div>
        <span className="text-sm text-gray-500">جاري الكتابة...</span>
      </div>
    ),
    ssr: false,
  }
)

export { BotCard, FormattedMessage, BotTypingAnimation } 