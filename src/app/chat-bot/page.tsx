"use client"

import type React from "react"
import { Loader2, Bot } from "lucide-react"
import "@/components/chat-bot/chat-bot.css"

export default function ChatBotPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-gray-50">
      <div className="w-full max-w-2xl mx-auto px-4 py-8 text-center">
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Bot className="w-12 h-12 text-white" />
          </div>
          
          {/* Construction animation circles */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32">
            <div className="absolute inset-0 border-4 border-purple-300 rounded-full animate-ping opacity-75"></div>
            <div className="absolute inset-0 border-4 border-purple-400 rounded-full animate-pulse"></div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">مساعد كادوز الذكي</h1>
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-purple-100 mb-8">
          <p className="text-xl text-gray-600 mb-4">🚧 قيد التطوير 🚧</p>
          <p className="text-gray-500 leading-relaxed">
            نحن نعمل على تطوير مساعد ذكي سيساعدك في العثور على الهدايا المثالية.
            قريباً سيكون بإمكانك التحدث معه واكتشاف أفضل الخيارات المناسبة لك.
          </p>
        </div>
        
        <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
          <div className="flex items-center">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            جاري العمل على التطوير
          </div>
        </div>
      </div>
    </main>
  )
}
