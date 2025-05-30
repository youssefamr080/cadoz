"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { Send, Loader2, Bot, MoreVertical, ArrowLeft } from "lucide-react"
import BotTypingAnimation from "@/components/chat-bot/BotTypingAnimation"
import FormattedMessage from "@/components/chat-bot/FormattedMessage"
import "@/components/chat-bot/chat-bot.css"

// تحديث واجهة الرسائل لتتوافق مع النموذج الجديد
interface ChatMessage {
  id: string
  text: string
  isBot: boolean
  items?: {
    type: "products" | "gifts" | null
    items?: Array<{
      id: number | string
      name?: string
      image: string
      price: number
      oldPrice?: number | null
      stars?: number
    }>
  }
  isTyping?: boolean
}

// تعريف مفتاح التخزين في localStorage
const CHAT_STORAGE_KEY = "cadoz_chat_messages"

// رسالة الترحيب الافتراضية
const DEFAULT_WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  text: "مرحباً! أنا مساعدك الشخصي في كادوز. كيف يمكنني مساعدتك في إيجاد هدية مثالية أو منتج يناسب احتياجاتك؟",
  isBot: true,
  items: null,
}

// أضف هذه الدالة المساعدة لتصحيح مسارات الصور في البيانات
const fixImagePaths = (items) => {
  if (!items || !Array.isArray(items)) return items

  return items.map((item) => {
    if (!item) return item

    // نسخة جديدة من العنصر
    const newItem = { ...item }

    // إذا كان مسار الصورة لا يبدأ بـ http، أضف المسار الأساسي
    if (newItem.image && typeof newItem.image === "string" && !newItem.image.startsWith("http")) {
      // تأكد من أن المسار يبدأ بـ /
      newItem.image = newItem.image.startsWith("/") ? newItem.image : `/${newItem.image}`
    }

    return newItem
  })
}

export default function ChatBotPage() {
  // استرجاع المحادثات المحفوظة من localStorage أو استخدام رسالة الترحيب الافتراضية
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK_URL

  const [isSlowDevice, setIsSlowDevice] = useState(false)
  const [performanceMode, setPerformanceMode] = useState<"high" | "medium" | "low">("high")
  const shouldReduceMotion = useReducedMotion()
  const [isOnline, setIsOnline] = useState(true)
  const [connectionSpeed, setConnectionSpeed] = useState<"fast" | "slow">("fast")

  const [, setIsMobile] = useState(false)
  const [, setIsKeyboardOpen] = useState(false)
  const [touchStartY, setTouchStartY] = useState(0)
  const [pullToRefresh, setPullToRefresh] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  // استرجاع المحادثات من localStorage عند تحميل الصفحة
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem(CHAT_STORAGE_KEY)
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages) as ChatMessage[]
        setMessages(parsedMessages)
      } else {
        // استخدام رسالة الترحيب الافتراضية إذا لم تكن هناك محادثات محفوظة
        setMessages([DEFAULT_WELCOME_MESSAGE])
      }
    } catch (error) {
      console.error("Error loading chat history:", error)
      setMessages([DEFAULT_WELCOME_MESSAGE])
    }
  }, [])

  // حفظ المحادثات في localStorage عند تغييرها
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages))
    }
  }, [messages])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Detect mobile device and keyboard
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    const handleResize = () => {
      checkMobile()
      // Detect virtual keyboard on mobile
      if (window.innerWidth <= 768) {
        const initialHeight = window.innerHeight
        const currentHeight = window.innerHeight
        setIsKeyboardOpen(initialHeight - currentHeight > 150)
      }
    }

    checkMobile()
    window.addEventListener("resize", handleResize)
    window.addEventListener("orientationchange", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("orientationchange", handleResize)
    }
  }, [])

  // Performance detection and optimization
  useEffect(() => {
    const detectPerformance = () => {
      // Check device memory
      const memory = ('deviceMemory' in navigator ? (navigator as Navigator & { deviceMemory: number }).deviceMemory : 4)
      // Check hardware concurrency
      const cores = navigator.hardwareConcurrency || 2
      // Check connection
      const connection = ('connection' in navigator ? (navigator as Navigator & { connection: { effectiveType: string } }).connection : null)

      let score = 0
      if (memory >= 8) score += 3
      else if (memory >= 4) score += 2
      else score += 1

      if (cores >= 8) score += 3
      else if (cores >= 4) score += 2
      else score += 1

      if (connection) {
        if (connection.effectiveType === "4g") score += 2
        else if (connection.effectiveType === "3g") score += 1
        setConnectionSpeed(connection.effectiveType === "4g" || connection.effectiveType === "3g" ? "fast" : "slow")
      }

      if (score <= 3) {
        setPerformanceMode("low")
        setIsSlowDevice(true)
      } else if (score <= 5) {
        setPerformanceMode("medium")
      } else {
        setPerformanceMode("high")
      }
    }

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    detectPerformance()
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Pull to refresh functionality
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY)
  }, [])

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const touchY = e.touches[0].clientY
      const diff = touchY - touchStartY

      if (diff > 0 && messagesEndRef.current?.scrollTop === 0) {
        setPullToRefresh(diff > 100)
      }
    },
    [touchStartY],
  )

  const handleTouchEnd = useCallback(() => {
    if (pullToRefresh) {
      startNewChat()
    }
    setPullToRefresh(false)
    setTouchStartY(0)
  }, [pullToRefresh])

  // وظيفة لبدء محادثة جديدة
  const startNewChat = () => {
    setMessages([DEFAULT_WELCOME_MESSAGE])
    setInputValue("")
    setShowMenu(false)
    inputRef.current?.focus()
  }

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!inputValue.trim() || isLoading || !isOnline) return

      const userMessage = {
        id: Date.now().toString(),
        text: inputValue,
        isBot: false,
        items: null,
      }

      setMessages((prev) => [...prev, userMessage])
      setInputValue("")
      setIsLoading(true)

      const typingId = `typing-${Date.now()}`

      // Add typing indicator with delay for slow devices
      const typingDelay = isSlowDevice ? 300 : 100
      setTimeout(() => {
        setMessages((prev) => [...prev, { id: typingId, text: "", isBot: true, isTyping: true }])
      }, typingDelay)

      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout

        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: inputValue }),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error("فشل في الاتصال بالخادم")
        }

        const responseText = await response.text()

        if (!responseText || responseText.trim() === "") {
          throw new Error("الاستجابة فارغة من الخادم")
        }

        let data
        try {
          data = JSON.parse(responseText)
        } catch (parseError) {
          console.error("Error parsing JSON:", parseError)
          if (responseText.length > 0) {
            data = { response: { text: responseText } }
          } else {
            throw new Error("تنسيق الاستجابة غير صحيح")
          }
        }

        console.log("🔍 Raw response data:", JSON.stringify(data, null, 2)) // للتأكد من البيانات الخام

        setMessages((prev) => prev.filter((msg) => msg.id !== typingId))

        // Process response with performance considerations
        const processResponse = () => {
          let botResponseText = ""
          let botResponseItems = null

          console.log("🔍 Processing response data:", data)

          // معالجة شاملة لجميع تنسيقات الاستجابة
          let responseData = null

          // استخراج البيانات من التنسيقات المختلفة
          if (data && Array.isArray(data) && data.length > 0) {
            responseData = data[0].response || data[0]
          } else if (data && data.response) {
            responseData = data.response
          } else if (data) {
            responseData = data
          }

          console.log("📦 Extracted response data:", responseData)

          if (responseData) {
            // استخراج النص
            botResponseText = responseData.text || responseData.message || ""

            // استخراج العناصر
            if (responseData.type && responseData.items && Array.isArray(responseData.items)) {
              console.log("🎯 Found items:", responseData.items)

              // التأكد من أن كل عنصر له البيانات المطلوبة
              const validItems = responseData.items.filter(
                (item) => item && (item.id || item.id === 0) && item.price !== undefined && item.image,
              )

              console.log("✅ Valid items:", validItems)

              if (validItems.length > 0) {
                const maxItems = isSlowDevice ? 3 : validItems.length
                const fixedItems = fixImagePaths(validItems.slice(0, maxItems))

                botResponseItems = {
                  type: responseData.type as "products" | "gifts",
                  items: fixedItems,
                }

                console.log("🎉 Final bot response items:", botResponseItems)
              }
            }
          }

          // تنظيف النص
          if (botResponseText) {
            if (typeof botResponseText === "string") {
              botResponseText = botResponseText.replace(/^"|"$/g, "").replace(/\\n/g, "\n")
            } else {
              botResponseText = String(botResponseText)
            }
          } else {
            botResponseText = "عذراً، لم أستطع الحصول على استجابة مناسبة. هل يمكنك إعادة صياغة سؤالك؟"
          }

          console.log("📝 Final processed response:", {
            text: botResponseText.substring(0, 100) + "...",
            hasItems: !!botResponseItems,
            itemsCount: botResponseItems?.items?.length || 0,
          })

          const botResponse: ChatMessage = {
            id: `bot-${Date.now()}`,
            text: botResponseText,
            isBot: true,
            items: botResponseItems,
          }

          setMessages((prev) => [...prev, botResponse])
        }

        // Delay response processing on slow devices to prevent blocking
        if (isSlowDevice) {
          setTimeout(processResponse, 100)
        } else {
          processResponse()
        }
      } catch (error) {
        console.error("Error:", error)
        setMessages((prev) => prev.filter((msg) => msg.id !== typingId))

        const errorMessage =
          error.name === "AbortError"
            ? "انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى."
            : "عذراً، حدث خطأ أثناء الاتصال. يرجى المحاولة مرة أخرى."

        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            text: errorMessage,
            isBot: true,
            items: null,
          },
        ])
      } finally {
        setIsLoading(false)
      }
    },
    [inputValue, isLoading, isOnline, webhookUrl, isSlowDevice],
  )

  const getMotionProps = useMemo(() => {
    if (shouldReduceMotion || isSlowDevice) {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2 },
      }
    }

    return performanceMode === "low"
      ? {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -10 },
          transition: { duration: 0.3 },
        }
      : {
          initial: { opacity: 0, y: 20, scale: 0.95 },
          animate: { opacity: 1, y: 0, scale: 1 },
          exit: { opacity: 0, y: -20, scale: 0.95 },
          transition: { duration: 0.4, ease: "easeOut" },
        }
  }, [shouldReduceMotion, isSlowDevice, performanceMode])

  return (
    <div
      className={`h-full bg-gray-50 flex flex-col ${
        isSlowDevice ? "slow-device memory-optimized cpu-light" : ""
      } ${performanceMode === "low" ? "performance-mode-low battery-saver" : ""} ${
        connectionSpeed === "slow" ? "slow-connection" : "fast-connection"
      }`}
    >
      {/* Chat Header - مثل WhatsApp */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors md:hidden">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                  isOnline ? "bg-green-500" : "bg-gray-400"
                }`}
              />
            </div>

            <div>
              <h1 className="font-semibold text-gray-900 text-lg">مساعد كادوز</h1>
              <p className="text-xs text-gray-500">
                {isOnline ? "متاح الآن" : "غير متصل"}
                {isSlowDevice && " • وضع محسن"}
              </p>
            </div>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute left-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[160px] z-50"
              >
                <button
                  onClick={startNewChat}
                  className="w-full px-4 py-2 text-right text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  محادثة جديدة
                </button>
                <button className="w-full px-4 py-2 text-right text-gray-700 hover:bg-gray-50 transition-colors">
                  مسح المحادثة
                </button>
                <button className="w-full px-4 py-2 text-right text-gray-700 hover:bg-gray-50 transition-colors">
                  الإعدادات
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Messages Container */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => setShowMenu(false)}
      >
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              {...getMotionProps}
              className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}
            >
              <div className={`flex items-end gap-2 max-w-[85%] ${message.isBot ? "" : "flex-row-reverse"}`}>
                {/* Avatar - فقط للبوت */}
                {message.isBot && (
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center flex-shrink-0 mb-1">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`rounded-2xl px-4 py-3 max-w-full ${
                    message.isBot
                      ? "bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100"
                      : "bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-br-md shadow-lg"
                  }`}
                >
                  {message.isTyping ? (
                    <BotTypingAnimation />
                  ) : (
                    <div>
                      <div className={`leading-relaxed ${message.isBot ? "text-sm" : "text-base font-medium"}`}>
                        {message.isBot ? (
                          <FormattedMessage
                            text={message.text}
                            items={message.items?.items}
                            type={message.items?.type}
                          />
                        ) : (
                          <div className="text-white font-medium">{message.text}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="اكتب رسالة..."
              className="w-full bg-gray-100 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all resize-none"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="w-10 h-10 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : (
              <Send className="w-5 h-5 text-white" />
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
