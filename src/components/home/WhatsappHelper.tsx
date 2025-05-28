"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { PhoneIcon as WhatsApp, X, Phone, Volume2, VolumeX, Settings, Sun, Moon, Languages, Gift } from 'lucide-react'
import Image from "next/image"
import { useRouter } from "next/navigation"

interface WhatsappHelperProps {
  phoneNumber: string
  storeName?: string
  welcomeMessage?: string
  agentName?: string
  agentAvatar?: string
  primaryColor?: string
  secondaryColor?: string
  darkMode?: boolean
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left"
  collectUserInfo?: boolean
  enableAnalytics?: boolean
}

interface UserInfo {
  name?: string
  email?: string
  location?: string
}

interface AnalyticsData {
  interactions: number
  whatsappClicks: number
  openTime: number
}

// تحويل لون hex إلى rgb
const hexToRgb = (hex: string): string => {
  hex = hex.replace("#", "")
  const r = Number.parseInt(hex.substring(0, 2), 16)
  const g = Number.parseInt(hex.substring(2, 4), 16)
  const b = Number.parseInt(hex.substring(4, 6), 16)
  return `${r}, ${g}, ${b}`
}

const WhatsappHelper: React.FC<WhatsappHelperProps> = ({
  phoneNumber,
  storeName = "متجرنا",
  welcomeMessage = "مرحباً! كيف يمكنني مساعدتك اليوم؟",
  agentName = "فريق خدمة العملاء",
  agentAvatar = "https://cdn-icons-png.flaticon.com/512/4712/4712035.png",
  primaryColor = "#10b981",
  secondaryColor = "#059669",
  darkMode = false,
  position = "bottom-right",
  collectUserInfo = false,
  enableAnalytics = false,
}) => {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [userInfo, setUserInfo] = useState<UserInfo>({})
  const [showUserInfoForm, setShowUserInfoForm] = useState(false)
  const [formStep, setFormStep] = useState<"name" | "email" | "location">("name")
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    interactions: 0,
    whatsappClicks: 0,
    openTime: 0,
  })
  const [currentTime, setCurrentTime] = useState<string>("")
  const [greetingMessage, setGreetingMessage] = useState<string>("")
  const [, setIsFirstVisit] = useState(true)
  const [currentLanguage, setCurrentLanguage] = useState<"ar" | "en">("ar")
  const [isDarkMode, setIsDarkMode] = useState(darkMode)

  const openTimeRef = useRef<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // تحديث الوقت والتحية
  useEffect(() => {
    const updateTimeAndGreeting = () => {
      const now = new Date()
      const hours = now.getHours()
      const minutes = now.getMinutes()
      const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
      setCurrentTime(formattedTime)

      let greeting = ""
      if (hours >= 5 && hours < 12) {
        greeting = currentLanguage === "ar" ? "صباح الخير" : "Good morning"
      } else if (hours >= 12 && hours < 17) {
        greeting = currentLanguage === "ar" ? "مساء الخير" : "Good afternoon"
      } else {
        greeting = currentLanguage === "ar" ? "مساء الخير" : "Good evening"
      }
      setGreetingMessage(greeting)
    }

    updateTimeAndGreeting()
    const interval = setInterval(updateTimeAndGreeting, 60000)
    return () => clearInterval(interval)
  }, [currentLanguage])

  // تحقق من الزيارة الأولى
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasVisitedBefore = localStorage.getItem("hasVisitedBefore")
      if (hasVisitedBefore) {
        setIsFirstVisit(false)
      } else {
        localStorage.setItem("hasVisitedBefore", "true")
      }
    }
  }, [])

  // تطبيق الوضع المظلم
  useEffect(() => {
    if (containerRef.current) {
      if (isDarkMode) {
        containerRef.current.classList.add('dark')
      } else {
        containerRef.current.classList.remove('dark')
      }
    }
  }, [isDarkMode])

  // تحميل الصوت
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio()

      const testAudio = (url: string) => {
        return new Promise<boolean>((resolve) => {
          const audio = new Audio()
          audio.oncanplaythrough = () => resolve(true)
          audio.onerror = () => resolve(false)
          audio.src = url
        })
      }

      const testAudioFiles = async () => {
        const soundFiles = ["/sounds/open.mp3", "/sounds/message.mp3", "/sounds/click.mp3"]
        for (const file of soundFiles) {
          const exists = await testAudio(file)
          if (!exists) {
            console.log(`Audio file ${file} not found. Sound effects may not work.`)
          }
        }
      }

      testAudioFiles()
    }
  }, [])

  // تتبع وقت فتح المساعد
  useEffect(() => {
    if (isOpen && enableAnalytics) {
      openTimeRef.current = Date.now()
      setAnalyticsData((prev) => ({
        ...prev,
        interactions: prev.interactions + 1,
      }))
    } else if (!isOpen && openTimeRef.current && enableAnalytics) {
      const timeSpent = Date.now() - openTimeRef.current
      setAnalyticsData((prev) => ({
        ...prev,
        openTime: prev.openTime + timeSpent,
      }))
      openTimeRef.current = null
    }
  }, [isOpen, enableAnalytics])

  // تأثيرات الحركة
  const popupVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: 20, scale: 0.9, transition: { duration: 0.2 } },
  }

  const optionVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.3 },
    }),
    hover: {
      scale: 1.03,
      boxShadow: "0 3px 8px rgba(0, 0, 0, 0.1)",
      backgroundColor: `rgba(${hexToRgb(primaryColor)}, 0.1)`,
    },
  }

  const settingsVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: "auto", transition: { duration: 0.3 } },
    exit: { opacity: 0, height: 0, transition: { duration: 0.2 } },
  }

  // تشغيل الصوت
  const playSound = (type: "open" | "message" | "click") => {
    if (isMuted || !audioRef.current) return

    if (typeof window === "undefined") return

    const soundMap = {
      open: "/sounds/open.mp3",
      message: "/sounds/message.mp3",
      click: "/sounds/click.mp3",
    }

    try {
      audioRef.current.src = soundMap[type]
      const playPromise = audioRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch((error: Error) => {
          console.log("Audio not available:", error.message)
          if (audioRef.current) {
            audioRef.current.src = ""
          }
        })
      }
    } catch (error) {
      console.log("Error playing sound:", error)
    }
  }

  // فتح الواتساب مباشرة
  const openWhatsapp = () => {
    playSound("click")

    let messageText =
      currentLanguage === "ar" ? `السلام عليكم، أحتاج إلى مساعدة من فضلك.` : `Hello, I need some assistance please.`

    if (userInfo.name) {
      messageText += currentLanguage === "ar" ? `\nالاسم: ${userInfo.name}` : `\nName: ${userInfo.name}`
    }
    if (userInfo.email) {
      messageText += currentLanguage === "ar" ? `\nالبريد الإلكتروني: ${userInfo.email}` : `\nEmail: ${userInfo.email}`
    }

    const encodedMessage = encodeURIComponent(messageText)
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`

    if (enableAnalytics) {
      setAnalyticsData((prev) => ({
        ...prev,
        whatsappClicks: prev.whatsappClicks + 1,
      }))
    }

    if (typeof window !== "undefined") {
      window.open(whatsappUrl, "_blank")
    }
    setIsOpen(false)
  }

  // تبديل اللغة
  const toggleLanguage = () => {
    playSound("click")
    setCurrentLanguage((prev) => (prev === "ar" ? "en" : "ar"))
  }

  // تبديل الوضع المظلم
  const toggleDarkMode = () => {
    playSound("click")
    setIsDarkMode((prev) => !prev)
  }

  // تبديل الصوت
  const toggleMute = () => {
    setIsMuted((prev) => !prev)
  }

  // تقديم معلومات المستخدم
  const handleUserInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    playSound("click")

    if (formStep === "name") {
      setFormStep("email")
    } else if (formStep === "email") {
      setFormStep("location")
    } else {
      setShowUserInfoForm(false)
    }
  }

  // تحديث معلومات المستخدم
  const updateUserInfo = (field: keyof UserInfo, value: string) => {
    setUserInfo((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // تحديد موضع المساعد
  const getPositionClasses = () => {
    switch (position) {
      case "bottom-left":
        return "bottom-6 left-6"
      case "top-right":
        return "top-6 right-6"
      case "top-left":
        return "top-6 left-6"
      default:
        return "bottom-6 right-6"
    }
  }

  // تحديد اتجاه النافذة المنبثقة
  const getPopupPositionClasses = () => {
    switch (position) {
      case "bottom-left":
        return "bottom-20 left-0"
      case "top-right":
        return "top-20 right-0"
      case "top-left":
        return "top-20 left-0"
      default:
        return "bottom-20 right-0"
    }
  }

  // تحديد اتجاه النص
  const getTextDirection = () => {
    return currentLanguage === "ar" ? "rtl" : "ltr"
  }

  // ترجمة النصوص
  const t = (ar: string, en: string) => {
    return currentLanguage === "ar" ? ar : en
  }

  // إضافة دالة للانتقال إلى المساعد الذكي
  const goToSmartGiftFinder = () => {
    playSound("click")
    router.push("/chat-bot")
    setIsOpen(false)
  }

  return (
    <div 
      ref={containerRef}
      className={`fixed ${getPositionClasses()} z-50 font-sans`} 
      dir={getTextDirection()}
    >
      <motion.button
        initial="initial"
        animate="animate"
        whileHover="hover"
        whileTap="tap"
        onClick={() => {
          setIsOpen(true)
          playSound("open")
        }}
        className="relative rounded-full shadow-lg hover:shadow-xl transition-all"
        style={{ backgroundColor: primaryColor }}
        aria-label={t("فتح محادثة المساعدة", "Open help chat")}
      >
        <div className="text-white p-4">
          <WhatsApp className="w-6 h-6" />
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={popupVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`absolute ${getPopupPositionClasses()} bg-white dark:bg-gray-800 rounded-xl shadow-xl w-80 md:w-96 overflow-hidden`}
            style={{ maxWidth: "90vw" }}
          >
            <div
              className="text-white p-4 flex items-center justify-between"
              style={{
                background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
              }}
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full overflow-hidden mr-3 ml-3 relative">
                  <Image 
                    src={agentAvatar || "/placeholder.svg"} 
                    alt={agentName} 
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-sm">{agentName}</h3>
                  <div className="flex items-center text-xs text-white/80">
                    <span>{currentTime}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1 space-x-reverse">
                <button
                  onClick={() => {
                    playSound("click")
                    setShowSettings(!showSettings)
                  }}
                  className="text-white/80 hover:text-white focus:outline-none transition-colors p-1"
                  aria-label={t("الإعدادات", "Settings")}
                >
                  <Settings className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    playSound("click")
                    setIsOpen(false)
                  }}
                  className="text-white/80 hover:text-white focus:outline-none transition-colors p-1"
                  aria-label={t("إغلاق", "Close")}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <AnimatePresence>
              {showSettings && (
                <motion.div
                  variants={settingsVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600"
                >
                  <div className="p-3 grid grid-cols-3 gap-2">
                    <button
                      onClick={toggleLanguage}
                      className="flex flex-col items-center justify-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Languages className="w-5 h-5 text-gray-600 dark:text-gray-300 mb-1" />
                      <span className="text-xs text-gray-600 dark:text-gray-300">{t("اللغة", "Language")}</span>
                    </button>

                    <button
                      onClick={toggleDarkMode}
                      className="flex flex-col items-center justify-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      {isDarkMode ? (
                        <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300 mb-1" />
                      ) : (
                        <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300 mb-1" />
                      )}
                      <span className="text-xs text-gray-600 dark:text-gray-300">{t("المظهر", "Theme")}</span>
                    </button>

                    <button
                      onClick={toggleMute}
                      className="flex flex-col items-center justify-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      {isMuted ? (
                        <VolumeX className="w-5 h-5 text-gray-600 dark:text-gray-300 mb-1" />
                      ) : (
                        <Volume2 className="w-5 h-5 text-gray-600 dark:text-gray-300 mb-1" />
                      )}
                      <span className="text-xs text-gray-600 dark:text-gray-300">{t("الصوت", "Sound")}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="p-4 bg-gray-50 dark:bg-gray-800">
              {showUserInfoForm ? (
                <form onSubmit={handleUserInfoSubmit} className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("الرجاء تقديم بعض المعلومات", "Please provide some information")}
                  </h3>

                  {formStep === "name" && (
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        {t("الاسم", "Name")}
                      </label>
                      <input
                        type="text"
                        value={userInfo.name || ""}
                        onChange={(e) => updateUserInfo("name", e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-700 dark:text-white"
                        placeholder={t("أدخل اسمك", "Enter your name")}
                        required
                      />
                    </div>
                  )}

                  {formStep === "email" && (
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        {t("البريد الإلكتروني", "Email")}
                      </label>
                      <input
                        type="email"
                        value={userInfo.email || ""}
                        onChange={(e) => updateUserInfo("email", e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-700 dark:text-white"
                        placeholder={t("أدخل بريدك الإلكتروني", "Enter your email")}
                        required
                      />
                    </div>
                  )}

                  {formStep === "location" && (
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        {t("الموقع", "Location")}
                      </label>
                      <input
                        type="text"
                        value={userInfo.location || ""}
                        onChange={(e) => updateUserInfo("location", e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-700 dark:text-white"
                        placeholder={t("أدخل موقعك", "Enter your location")}
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2 px-4 text-white rounded-md text-sm font-medium transition-colors"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {formStep === "location" ? t("إنهاء", "Finish") : t("التالي", "Next")}
                  </button>
                </form>
              ) : (
                <>
                  <div className="mb-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">{greetingMessage}!</span> {welcomeMessage}
                    </p>
                  </div>

                  {collectUserInfo && !userInfo.name && (
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md">
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        {t(
                          "تقديم معلوماتك سيساعدنا على خدمتك بشكل أفضل",
                          "Providing your information will help us serve you better",
                        )}
                      </p>
                      <button
                        onClick={() => {
                          playSound("click")
                          setShowUserInfoForm(true)
                        }}
                        className="mt-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {t("إضافة معلوماتي", "Add my information")}
                      </button>
                    </div>
                  )}

                  <div className="space-y-3">
                    <motion.button
                      variants={optionVariants}
                      initial="hidden"
                      animate="visible"
                      custom={0}
                      whileHover="hover"
                      onClick={openWhatsapp}
                      className="flex items-center justify-between w-full bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm py-3 px-4 rounded-md shadow-sm transition-colors duration-200 border border-gray-100 dark:border-gray-600"
                    >
                      <span className="flex items-center">
                        <Phone
                          className={`w-5 h-5 ${currentLanguage === "ar" ? "ml-3" : "mr-3"}`}
                          style={{ color: primaryColor }}
                        />
                        <span>{t("التحدث عبر الواتساب", "Chat via WhatsApp")}</span>
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                        {t("مباشر", "Live")}
                      </span>
                    </motion.button>

                    <motion.button
                      variants={optionVariants}
                      initial="hidden"
                      animate="visible"
                      custom={1}
                      whileHover="hover"
                      onClick={goToSmartGiftFinder}
                      className="flex items-center justify-between w-full bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm py-3 px-4 rounded-md shadow-sm transition-colors duration-200 border border-gray-100 dark:border-gray-600"
                    >
                      <span className="flex items-center">
                        <Gift
                          className={`w-5 h-5 ${currentLanguage === "ar" ? "ml-3" : "mr-3"}`}
                          style={{ color: primaryColor }}
                        />
                        <span>{t("المساعد الذكي للهدايا", "Smart Gift Finder")}</span>
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200">
                        {t("ذكي", "Smart")}
                      </span>
                    </motion.button>
                  </div>

                  {enableAnalytics && (
                    <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>
                          {t("التفاعلات", "Interactions")}: {analyticsData.interactions}
                        </span>
                        <span>
                          {t("واتساب", "WhatsApp")}: {analyticsData.whatsappClicks}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="p-2 bg-gray-100 dark:bg-gray-700 text-center text-xs text-gray-500 dark:text-gray-400">
              {t("بواسطة", "Powered by")} {storeName} © {new Date().getFullYear()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default WhatsappHelper