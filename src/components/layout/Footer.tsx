"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Send, CheckCircle, Phone, MessageSquare, User } from "lucide-react"
import { FaFacebook, FaInstagram, FaWhatsapp, FaTiktok, FaFacebookMessenger } from "react-icons/fa"
import { saveSubscription, saveWhatsAppContact } from "../../lib/actions"

export default function CompactFooter() {
  // State for form handling
  const [email, setEmail] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [name, setName] = useState("")
  const [contactMethod, setContactMethod] = useState<"whatsapp" | "email">("whatsapp")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      let response

      if (contactMethod === "email") {
        if (!email) {
          setError("يرجى إدخال البريد الإلكتروني")
          setIsLoading(false)
          return
        }
        response = await saveSubscription(email, name || undefined)
      } else {
        if (!whatsapp) {
          setError("يرجى إدخال رقم الواتساب")
          setIsLoading(false)
          return
        }
        response = await saveWhatsAppContact(whatsapp, name || undefined)
      }

      if (response.success) {
        setIsSubmitted(true)
        setEmail("")
        setWhatsapp("")
        setName("")
        // Reset form after 5 seconds
        setTimeout(() => setIsSubmitted(false), 5000)
      } else {
        setError(response.error || "حدث خطأ أثناء التسجيل")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      setError("حدث خطأ غير متوقع")
    } finally {
      setIsLoading(false)
    }
  }

  const socialPlatforms = [
    {
      name: "whatsapp",
      icon: <FaWhatsapp className="text-white" />,
      url: "https://wa.me/01055594040",
      color: "bg-green-500",
      label: "تواصل عبر واتساب",
    },
    {
      name: "facebook",
      icon: <FaFacebook className="text-white" />,
      url: "https://facebook.com/cadoz",
      color: "bg-blue-600",
      label: "تابعنا على فيسبوك",
    },
    {
      name: "messenger",
      icon: <FaFacebookMessenger className="text-white" />,
      url: "https://m.me/cadoz",
      color: "bg-gradient-to-r from-blue-500 to-indigo-600",
      label: "راسلنا على ماسنجر",
    },
    {
      name: "instagram",
      icon: <FaInstagram className="text-white" />,
      url: "https://instagram.com/cadoz",
      color: "bg-gradient-to-tr from-purple-600 via-pink-500 to-orange-400",
      label: "تابعنا على انستجرام",
    },
    {
      name: "tiktok",
      icon: <FaTiktok className="text-white" />,
      url: "https://tiktok.com/@cadoz",
      color: "bg-black",
      label: "تابعنا على تيك توك",
    },
  ]

  const quickLinks = [
    { name: "الرئيسية", url: "/" },
    { name: "من نحن", url: "/about" },
    { name: "خدماتنا", url: "/services" },
    { name: "المدونة", url: "/blog" },
    { name: "اتصل بنا", url: "/contact" },
  ]

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Main Footer Content */}
        <div className="flex flex-col gap-6">
          {/* Title and Social Media Section */}
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">تواصل معنا</h2>
            <div className="flex justify-center flex-wrap gap-4 mb-4">
              {socialPlatforms.map((platform) => (
                <Link
                  key={platform.name}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${platform.color} p-3 rounded-full hover:opacity-90 transition-all hover:scale-110 shadow-lg`}
                  aria-label={platform.label}
                >
                  <span className="text-xl">{platform.icon}</span>
                </Link>
              ))}
            </div>

            <div className="flex justify-center gap-6 mt-3">
              <a
                href="tel:01055594040"
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group"
              >
                <div className="bg-gray-800 p-1.5 rounded-full group-hover:bg-green-500 transition-colors">
                  <Phone className="w-4 h-4 text-green-400 group-hover:text-white" />
                </div>
                <span className="text-sm group-hover:underline">01055594040</span>
              </a>
              <a
                href="mailto:info@cadoz.com"
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group"
              >
                <div className="bg-gray-800 p-1.5 rounded-full group-hover:bg-teal-500 transition-colors">
                  <Mail className="w-4 h-4 text-teal-400 group-hover:text-white" />
                </div>
                <span className="text-sm group-hover:underline">info@cadoz.com</span>
              </a>
            </div>
          </div>

          {/* Quick Links - Horizontal on Mobile, Vertical on Desktop */}
          <div className="md:hidden">
            <div className="flex justify-center flex-wrap gap-x-4 gap-y-2 mt-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.url}
                  className="text-gray-300 hover:text-white transition-colors text-sm bg-gray-800 px-3 py-1.5 rounded-full"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Two Column Layout for Desktop */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-4">
            {/* Column 1: Quick Links (Desktop Only) */}
            <div className="hidden md:block md:col-span-2 bg-gray-800 p-5 rounded-xl shadow-lg">
              <h3 className="text-lg font-bold mb-3 border-b border-gray-700 pb-2">روابط سريعة</h3>
              <div className="grid grid-cols-2 gap-2">
                {quickLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.url}
                    className="text-gray-300 hover:text-white transition-colors flex items-center gap-1.5 py-1.5"
                  >
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Column 2: Subscription Form */}
            <div className="md:col-span-3 bg-gray-800 p-5 rounded-xl shadow-lg">
              <div className="flex items-center gap-2 mb-4 justify-center">
                <MessageSquare className="w-5 h-5 text-green-400" />
                <h3 className="text-lg font-bold">اشترك معنا</h3>
              </div>

              <AnimatePresence mode="wait">
                {isSubmitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-emerald-500/20 text-emerald-300 p-4 rounded-lg flex items-center gap-2 justify-center"
                  >
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">
                      {contactMethod === "email" ? "تم تسجيل بريدك الإلكتروني بنجاح!" : "تم تسجيل رقم الواتساب بنجاح!"}
                    </span>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onSubmit={handleSubmit}
                    className="space-y-3"
                  >
                    <div className="flex rounded-lg overflow-hidden p-1 bg-gray-700 mb-3">
                      <button
                        type="button"
                        onClick={() => setContactMethod("whatsapp")}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                          contactMethod === "whatsapp" ? "bg-green-500 text-white" : "text-gray-300 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <FaWhatsapp />
                          <span>واتساب</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setContactMethod("email")}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                          contactMethod === "email" ? "bg-teal-500 text-white" : "text-gray-300 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>البريد الإلكتروني</span>
                        </div>
                      </button>
                    </div>

                    {/* Name field - always visible but optional */}
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="الاسم (اختياري)"
                        className="w-full p-2.5 pl-10 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent text-sm"
                      />
                    </div>

                    {contactMethod === "email" ? (
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="البريد الإلكتروني"
                          className="w-full p-2.5 pl-10 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-transparent text-sm"
                        />
                      </div>
                    ) : (
                      <div className="relative">
                        <FaWhatsapp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="tel"
                          value={whatsapp}
                          onChange={(e) => setWhatsapp(e.target.value)}
                          placeholder="رقم الواتساب"
                          className="w-full p-2.5 pl-10 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent text-sm"
                        />
                      </div>
                    )}

                    {error && (
                      <div className="text-red-400 text-xs py-2 bg-red-500/10 px-3 rounded-md flex items-center gap-1">
                        <span className="inline-block w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full p-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
                        contactMethod === "email" ? "bg-teal-500 hover:bg-teal-600" : "bg-green-500 hover:bg-green-600"
                      } text-white disabled:opacity-70 text-sm shadow-lg hover:shadow-xl`}
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          {contactMethod === "email" ? "اشترك الآن" : "سجل رقم الواتساب"}
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="bg-black py-3 text-center text-sm">
        <div className="container mx-auto px-4">
          <p className="text-gray-400">© {new Date().getFullYear()} Cadoz. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  )
}

