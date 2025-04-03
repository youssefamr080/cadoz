// إضافة تعريفات عالمية للـ TypeScript

// تعريف نوع gtag للتحليلات
interface Window {
  gtag?: (command: string, action: string, params: object) => void
}

// تعريف نوع GiftOption للتوافق مع الواجهات
interface GiftOption {
  id: string | number
  name: string
  price: number
  image: string
  category: string
  tags: string[]
}

