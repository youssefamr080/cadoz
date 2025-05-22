"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Send, Gift, RefreshCw, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LoadingSpinner } from "./loading-spinner"
import { processMessage } from "@/lib/actions/chat-actions"
import { getSessionId, storeConversation, getStoredConversation } from "@/lib/session-utils"
import type { Message, GiftWithDetails } from "@/lib/types"
import { motion, AnimatePresence } from "framer-motion"
import GiftCard from "./gift-card"

export default function SmartGiftFinder() {
  const [sessionId, setSessionId] = useState<string>("")
  const [message, setMessage] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [conversation, setConversation] = useState<Message[]>([])
  const [gifts, setGifts] = useState<GiftWithDetails[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const mainContainerRef = useRef<HTMLDivElement>(null)
  const [scrollPosition, setScrollPosition] = useState(0)

  // Save scroll position before update
  const saveScrollPosition = useCallback(() => {
    if (mainContainerRef.current) {
      setScrollPosition(mainContainerRef.current.scrollTop)
    }
  }, [])

  // Restore scroll position after update
  const restoreScrollPosition = useCallback(() => {
    if (mainContainerRef.current) {
      mainContainerRef.current.scrollTop = scrollPosition
    }
  }, [scrollPosition])

  useEffect(() => {
    // Initialize session ID
    const sid = getSessionId()
    setSessionId(sid)

    // Try to restore conversation from localStorage
    const storedConversation = getStoredConversation()

    if (storedConversation?.messages?.length > 0) {
      setConversation(storedConversation.messages)
    } else {
      // Add initial welcome message if no stored conversation
      setConversation([
        {
          role: "assistant",
          content:
            "أهلاً بيك في مساعد الهدايا الذكي! 🎁 أنا هنا عشان أساعدك تلاقي الهدية المثالية. ممكن تقولي مين اللي عايز تجيب له هدية وأي مناسبة؟",
        },
      ])
    }

    // Focus the input field
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  useEffect(() => {
    // Save scroll position before update
    saveScrollPosition()

    // Store conversation in localStorage
    if (conversation.length > 0) {
      storeConversation({ messages: conversation, lastUpdated: new Date() })
    }

    // Restore scroll position after update
    requestAnimationFrame(restoreScrollPosition)
  }, [conversation, restoreScrollPosition, saveScrollPosition])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || isLoading || !sessionId) return

    const userMessage = message
    setMessage("")
    setIsLoading(true)

    // Add user message to conversation
    setConversation((prev) => [...prev, { role: "user", content: userMessage }])

    try {
      // Process message using server action
      const result = await processMessage(sessionId, userMessage)

      // Add assistant message to conversation
      setConversation((prev) => [...prev, { role: "assistant", content: result.message }])

      // Update gifts
      if (result.gifts && result.gifts.length > 0) {
        // The structure of gift items returned from the backend might not exactly match GiftWithDetails,
        const transformedGifts = result.gifts.map((gift: any) => ({
          _id: gift._id || '',
          name: gift.name || '',
          description: gift.description || '',
          image: gift.image || '',
          box: gift.box || '',
          bag: gift.bag || '',
          products: gift.products || [],
          decorations: gift.decorations || [],
          category: gift.category || 'men',
          Mainproducts: gift.Mainproducts || [],
          occasions: gift.occasions || [],
          tags: gift.tags || [],
          rating: gift.rating || 0,
          reviews: gift.reviews || 0,
          likes: gift.likes || 0,
          dislikes: gift.dislikes || 0,
          updatedAt: gift.updatedAt || new Date(),
          likedBy: gift.likedBy || [],
          dislikedBy: gift.dislikedBy || [],
          comments: gift.comments || [],
          ratings: gift.ratings || [],
          price: gift.price || 0,
          oldPrice: gift.oldPrice || 0,
          discount_percentage: gift.discount_percentage || 0,
          mainProducts: gift.mainProducts || [],
          productDetails: gift.productDetails || [],
          productQuantities: gift.productQuantities || [],
          decorationDetails: gift.decorationDetails || [],
          boxDetails: gift.boxDetails || null,
          bagDetails: gift.bagDetails || null
        } as GiftWithDetails))
        setGifts(transformedGifts)

        // Add gift presentation message
        const giftIntro = `لقد وجدت لك بعض الهدايا المناسبة! إليك اقتراحاتي: 🎁`
        setConversation((prev) => [...prev, { role: "assistant", content: giftIntro }])
      }
    } catch (error) {
      console.error("Error:", error)
      setConversation((prev) => [
        ...prev,
        { role: "assistant", content: "عفواً، حصل مشكلة في النظام. ممكن تحاول تاني؟" },
      ])
    } finally {
      setIsLoading(false)
      // Focus the input field again
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }
  }

  const startNewConversation = () => {
    setConversation([
      {
        role: "assistant",
        content:
          "أهلاً بيك في مساعد الهدايا الذكي! 🎁 أنا هنا عشان أساعدك تلاقي الهدية المثالية. ممكن تقولي مين اللي عايز تجيب له هدية وأي مناسبة؟",
      },
    ])
    setGifts([])
    // Generate a new session ID
    const sid = getSessionId()
    setSessionId(sid)
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-pink-50 to-purple-50">
      <header className="bg-white shadow-sm py-4 px-6 border-b border-pink-100">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-pink-600 text-white p-2 rounded-full">
              <Gift className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-pink-600">مساعد الهدايا الذكي</h1>
          </div>
          {conversation.length > 2 && (
            <Button variant="outline" size="sm" onClick={startNewConversation}>
              <RefreshCw className="h-4 w-4 ml-2" />
              محادثة جديدة
            </Button>
          )}
        </div>
      </header>

      <main className="flex-grow flex flex-col max-w-3xl w-full mx-auto p-4 md:p-6">
        <div 
          ref={mainContainerRef}
          className="bg-white rounded-xl shadow-md flex-grow overflow-y-auto p-4 mb-4 max-h-[calc(100vh-220px)] dir-rtl"
        >
          <div className="space-y-6">
            <AnimatePresence initial={false}>
              {conversation.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className="flex items-start gap-3 max-w-[80%]">
                    {msg.role === "assistant" && (
                      <div className="flex-shrink-0 mt-1">
                        <Avatar className="w-10 h-10 border-2 border-white bg-gradient-to-br from-pink-500 to-purple-600">
                          <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Bot" />
                          <AvatarFallback className="text-white">
                            <Sparkles className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    )}
                    <div
                      className={`p-4 rounded-2xl ${
                        msg.role === "user"
                          ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-br-none shadow-md"
                          : "bg-gray-100 text-gray-800 rounded-bl-none shadow-sm"
                      }`}
                    >
                      <p className="text-sm md:text-base whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                    {msg.role === "user" && (
                      <div className="flex-shrink-0 mt-1">
                        <Avatar className="w-10 h-10 border-2 border-white bg-gradient-to-br from-purple-500 to-indigo-600">
                          <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
                          <AvatarFallback className="text-white">أنت</AvatarFallback>
                        </Avatar>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Display gifts in the chat */}
            {gifts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex justify-start"
              >
                <div className="flex items-start gap-3 max-w-full w-full">
                  <div className="flex-shrink-0 mt-1">
                    <Avatar className="w-10 h-10 border-2 border-white bg-gradient-to-br from-pink-500 to-purple-600">
                      <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Bot" />
                      <AvatarFallback className="text-white">
                        <Sparkles className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="bg-gray-100 rounded-2xl rounded-bl-none shadow-sm p-4 w-full">
                    <div className="grid grid-cols-1 gap-4">
                      {gifts.map((gift, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <GiftCard gift={gift} />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {isLoading && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="flex justify-start"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <Avatar className="w-10 h-10 border-2 border-white bg-gradient-to-br from-pink-500 to-purple-600">
                      <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Bot" />
                      <AvatarFallback className="text-white">
                        <Sparkles className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-100 text-gray-800 rounded-bl-none shadow-sm min-w-[60px] flex items-center justify-center">
                    <div className="flex space-x-2 rtl:space-x-reverse">
                      <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce"></div>
                      <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce delay-75"></div>
                      <div className="w-3 h-3 bg-pink-600 rounded-full animate-bounce delay-150"></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="relative">
          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="اكتب طلبك هنا..."
            className="w-full pr-4 pl-12 py-3 text-right rounded-full border-2 border-pink-100 focus:border-pink-300 shadow-sm"
            dir="rtl"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="absolute left-1 top-1 bg-pink-600 hover:bg-pink-700 rounded-full w-10 h-10 p-0 flex items-center justify-center"
          >
            {isLoading ? <LoadingSpinner size="small" /> : <Send className="h-5 w-5" />}
          </Button>
        </form>
      </main>

      <footer className="bg-white border-t border-pink-100 py-3 px-6 text-center text-sm text-gray-500">
        <p>© 2025 مساعد الهدايا الذكي - جميع الحقوق محفوظة</p>
      </footer>
    </div>
  )
}
