"use client"

import BotCard from "./BotCard"

interface FormattedMessageProps {
  text: string
  items?: Array<{
    id: number | string
    name?: string
    image: string
    price: number
    oldPrice?: number | null
    stars?: number // إضافة حقل النجوم
  }>
  type?: "products" | "gifts" | null
}

export default function FormattedMessage({ text, items, type }: FormattedMessageProps) {
  // للتأكد من البيانات مع تسجيل مفصل
  console.log("🎯 FormattedMessage received:", {
    text: text?.substring(0, 50) + "...",
    items,
    type,
    itemsLength: items?.length,
    hasValidItems: items && Array.isArray(items) && items.length > 0,
  })

  // التحقق من صحة البيانات
  if (!items || !Array.isArray(items) || items.length === 0) {
    console.log("⚠️ No valid items found")
  } else {
    console.log("📦 Items details:")
    items.forEach((item, index) => {
      console.log(`Item ${index}:`, {
        id: item?.id,
        name: item?.name,
        image: item?.image,
        price: item?.price,
        type: type,
        isValid: !!(item?.id !== undefined && item?.price !== undefined && item?.image),
      })
    })
  }

  // قائمة الرموز التعبيرية المدعومة
  const supportedEmojis = [
    "🎁",
    "💎",
    "✨",
    "🌹",
    "💝",
    "🎀",
    "🛍️",
    "📱",
    "💍",
    "👗",
    "🕯️",
    "🧴",
    "💄",
    "👜",
    "🎵",
    "📚",
    "🖼️",
    "🌺",
    "💐",
    "🎂",
    "🍫",
    "🎪",
    "🎨",
    "🎭",
    "🎯",
    "🎲",
    "🎸",
    "🎤",
    "🎧",
    "🎮",
    "❤️",
    "💕",
    "💖",
    "💗",
    "💘",
    "💞",
    "💟",
    "💌",
    "💋",
    "🌸",
    "🌼",
    "🌻",
    "🌷",
    "🥀",
    "🌿",
    "🍀",
    "🌱",
    "🌲",
    "🌳",
    "🌴",
  ]

  // تنظيف النص من علامات الاقتباس الإضافية
  const cleanText = text.replace(/^"|"$/g, "").replace(/\\n/g, "\n")

  // تقسيم النص إلى أجزاء
  const sections = cleanText.split(/\n\n/)

  // استخراج الجزء العام (عادة الجزء الأول)
  const generalText = sections[0] || ""

  // استخراج أوصاف المنتجات (الأجزاء التي تبدأ برموز تعبيرية أو أرقام)
  const productDescriptions = sections.slice(1).filter((section) => {
    const trimmed = section.trim()
    // البحث عن الأجزاء التي تبدأ برموز تعبيرية أو أرقام متبوعة بنقطة
    return (
      trimmed && (supportedEmojis.some((emoji) => trimmed.startsWith(emoji)) || /^\d+\.\s/.test(trimmed)) // يبدأ برقم ونقطة ومسافة
    )
  })

  console.log("Product descriptions found:", productDescriptions)

  // استخراج الجزء الختامي (آخر جزء لا يبدأ برمز تعبيري أو رقم)
  const closingText = sections
    .slice(1)
    .filter((section) => {
      const trimmed = section.trim()
      return trimmed && !supportedEmojis.some((emoji) => trimmed.startsWith(emoji)) && !/^\d+\.\s/.test(trimmed)
    })
    .join("\n\n")

  const formatLine = (line: string, index: number) => {
    // إزالة المسافات الزائدة
    const trimmedLine = line.trim()

    if (!trimmedLine) {
      return <div key={index} className="h-2" />
    }

    // تحويل النص المنسق (النص بين ** إلى bold)
    const formatBoldText = (text: string) => {
      const parts = text.split(/(\*\*.*?\*\*)/g)
      return parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          const boldText = part.slice(2, -2)
          return (
            <span key={i} className="font-bold text-gray-900">
              {boldText}
            </span>
          )
        }
        return part
      })
    }

    // تحديد نوع السطر
    const firstChar = trimmedLine.charAt(0)
    const isListItem = supportedEmojis.includes(firstChar)
    const isNumberedItem = /^\d+\.\s/.test(trimmedLine)
    const isMainTitle = trimmedLine.includes("**") && !isListItem && !isNumberedItem

    if (isListItem) {
      return (
        <div
          key={index}
          className="flex items-start gap-3 my-3 p-3 bg-purple-50/50 rounded-xl border-r-4 border-purple-200"
        >
          <div className="text-2xl flex-shrink-0 mt-0.5">{firstChar}</div>
          <div className="flex-1">
            <div className="text-gray-800 leading-relaxed">{formatBoldText(trimmedLine.slice(1).trim())}</div>
          </div>
        </div>
      )
    }

    if (isNumberedItem) {
      return (
        <div
          key={index}
          className="flex items-start gap-3 my-3 p-3 bg-blue-50/50 rounded-xl border-r-4 border-blue-200"
        >
          <div className="text-lg font-bold text-blue-600 flex-shrink-0 mt-0.5">{trimmedLine.match(/^\d+/)?.[0]}</div>
          <div className="flex-1">
            <div className="text-gray-800 leading-relaxed">{formatBoldText(trimmedLine.replace(/^\d+\.\s/, ""))}</div>
          </div>
        </div>
      )
    }

    if (isMainTitle) {
      return (
        <div key={index} className="my-4">
          <div className="text-base font-semibold text-purple-700 leading-relaxed">{formatBoldText(trimmedLine)}</div>
        </div>
      )
    }

    // النص العادي
    return (
      <div key={index} className="my-2">
        <div className="text-gray-700 leading-relaxed">{formatBoldText(trimmedLine)}</div>
      </div>
    )
  }

  const formatSection = (sectionText: string) => {
    const lines = sectionText.split("\n")
    return lines.map((line, index) => formatLine(line, index))
  }

  return (
    <div className="space-y-1">
      {/* الجزء العام */}
      {generalText && <div className="space-y-1">{formatSection(generalText)}</div>}

      {/* أوصاف المنتجات مع البطاقات */}
      {productDescriptions.map((description, index) => {
        const correspondingItem = items && items[index]
        console.log(`Product ${index}:`, { description, correspondingItem })

        if (correspondingItem) {
          console.log(`🎯 Rendering card for item ${index}:`, {
            id: correspondingItem.id,
            name: correspondingItem.name,
            image: correspondingItem.image,
            type: type,
          })
        }

        return (
          <div key={index} className="my-4">
            {/* وصف المنتج */}
            <div className="space-y-1">{formatSection(description)}</div>

            {/* بطاقة المنتج */}
            {correspondingItem && type && (
              <div className="mt-2">
                <BotCard type={type} item={correspondingItem} />
              </div>
            )}
          </div>
        )
      })}

      {/* النص الختامي */}
      {closingText && (
        <div className="mt-4 space-y-1">
          <div className="space-y-1">{formatSection(closingText)}</div>
        </div>
      )}
    </div>
  )
}
