import type { Metadata } from "next"
import GiftPageClient from "./GiftPageClient"

// تعريف البيانات الوصفية للصفحة
export const metadata: Metadata = {
  title: "اصنع هديتك المميزة | Cadoz",
  description: "صمم هدية فريدة من نوعها تناسب مناسبتك الخاصة مع مجموعة متنوعة من الخيارات المميزة",
  keywords: ["هدايا", "تخصيص الهدايا", "هدايا مخصصة", "شوكولاتة", "حلويات", "تغليف هدايا"],
}

const GiftPage = () => {
  return <GiftPageClient />
}

export default GiftPage
