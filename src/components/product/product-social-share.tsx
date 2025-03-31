"use client"

import { useState } from "react"
import { Share, Copy, Check, Facebook, MessageCircle, Send } from 'lucide-react'
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from "../ui/popover"
import { Button } from "../ui/button"
import { toast } from "react-toastify"

interface ProductSocialShareProps {
  url: string
  title: string
  image?: string
  price?: number
}

export default function ProductSocialShare({ url, title, price }: ProductSocialShareProps) {
  const [copied, setCopied] = useState(false)
  
  // Prepare share message
  const shareMessage = `✨ تحقق من هذا المنتج: ${title}${price ? ` 📌 السعر: ${price} ج.م` : ''}`
  
  // Copy link to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success("تم نسخ رابط المنتج!", { position: "bottom-right" })
    
    setTimeout(() => setCopied(false), 2000)
  }
  
  // Share on social media
  const shareOn = (platform: string) => {
    let shareUrl = ""
    
    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(shareMessage)}`
        break
      case "messenger":
        shareUrl = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}&app_id=291494419107518&redirect_uri=${encodeURIComponent(url)}`
        break
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage + " 🔗 " + url)}`
        break
      case "telegram":
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareMessage)}`
        break
      default:
        return
    }
    
    window.open(shareUrl, "_blank")
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full bg-white hover:bg-gray-50 border-gray-200 shadow-sm">
          <Share className="w-4 h-4 text-gray-700" />
          <span className="sr-only">مشاركة</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0 overflow-hidden border-0 shadow-xl rounded-xl" align="end">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 text-white">
          <h3 className="font-bold text-center text-base">مشاركة المنتج</h3>
          <p className="text-xs text-center text-blue-100 mt-1">شارك هذا المنتج مع أصدقائك</p>
        </div>
        
        <div className="p-3 bg-white">
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={() => shareOn("facebook")}
              className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-blue-50 transition-all duration-200 border border-gray-100 hover:shadow-sm"
              aria-label="مشاركة على فيسبوك"
            >
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mb-2 shadow-md">
                <Facebook className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-medium text-gray-700">فيسبوك</span>
            </button>
            
            <button
              onClick={() => shareOn("messenger")}
              className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-blue-50 transition-all duration-200 border border-gray-100 hover:shadow-sm"
              aria-label="مشاركة على ماسنجر"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-2 shadow-md">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-medium text-gray-700">ماسنجر</span>
            </button>
            
            <button
              onClick={() => shareOn("whatsapp")}
              className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-green-50 transition-all duration-200 border border-gray-100 hover:shadow-sm"
              aria-label="مشاركة على واتساب"
            >
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mb-2 shadow-md">
                <Send className="w-5 h-5 text-white rotate-[-45deg]" />
              </div>
              <span className="text-xs font-medium text-gray-700">واتساب</span>
            </button>
            
            <button
              onClick={() => shareOn("telegram")}
              className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-blue-50 transition-all duration-200 border border-gray-100 hover:shadow-sm"
              aria-label="مشاركة على تيليجرام"
            >
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mb-2 shadow-md">
                <Send className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-medium text-gray-700">تيليجرام</span>
            </button>
          </div>
          
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-gray-500">أو</span>
            </div>
          </div>
          
          <button
            onClick={copyToClipboard}
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg hover:bg-gray-50 transition-all duration-200 border border-gray-200 hover:border-blue-500 hover:shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-xs font-medium text-gray-700">تم نسخ الرابط!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-gray-600" />
                <span className="text-xs font-medium text-gray-700">نسخ رابط المنتج</span>
              </>
            )}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
