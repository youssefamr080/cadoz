"use server"
import type { Box, GiftProduct, Decoration, Bag, GiftData, CartItem } from "@/types/database"

// وظيفة لإنشاء صورة معاينة للهدية باستخدام Canvas
export async function createGiftPreviewImage(): Promise<string> {
  // في بيئة الخادم، نعيد رابط صورة افتراضية
  return "/placeholder.svg?height=300&width=300"
}

// تأكد من أن وظيفة createGiftCartItem تنتج عنصر سلة متوافق مع نظام السلة الحالي

// تحديث الجزء الخاص بإنشاء عنصر السلة للتأكد من توافقه مع نظام السلة الحالي
export async function createGiftCartItem( // Change this line
  selectedBox: Box | null,
  selectedProducts: GiftProduct[],
  selectedDecorations: Decoration[],
  selectedBag: Bag | null,
  personalMessage?: { message: string; recipient: string; sender: string },
): Promise<CartItem> {
  // تحويل المنتجات المختارة إلى تنسيق GiftItem
  const giftItems = selectedProducts.map((product) => ({
    name: product.name,
    quantity: product.quantity || 1,
    image: product.image,
    price: product.price,
  }))

  // تحويل الصندوق المختار إلى تنسيق GiftBox
  const boxDetail = selectedBox
    ? {
        name: selectedBox.name,
        image: selectedBox.image,
        price: selectedBox.price,
      }
    : null

  // تحويل الشنطة المختارة إلى تنسيق GiftWrap (نستخدم الشنطة كتغليف)
  const wrapDetail = selectedBag
    ? {
        name: selectedBag.name,
        image: selectedBag.image,
        price: selectedBag.price,
      }
    : null

  // حساب السعر الإجمالي للهدية
  const giftItemsTotal = selectedProducts.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0)
  const boxPrice = selectedBox?.price || 0
  const bagPrice = selectedBag?.price || 0
  const decorationsPrice = selectedDecorations.reduce((sum, item) => sum + item.price, 0)
  const totalPrice = giftItemsTotal + boxPrice + bagPrice + decorationsPrice

  // إنشاء بيانات الهدية
  const giftData: GiftData = {
    items: giftItems,
    box: boxDetail,
    wrap: wrapDetail,
    message: personalMessage?.message,
    recipient: personalMessage?.recipient,
    createdAt: new Date().toISOString(),
    totalPrice,
  }

  // إنشاء نص ملخص للهدية
  const itemsNames = giftItems.map((item) => `${item.name} ×${item.quantity}`).join(", ")
  const boxText = boxDetail ? `صندوق: ${boxDetail.name}` : ""
  const wrapText = wrapDetail ? `تغليف: ${wrapDetail.name}` : ""
  const summaryText = [itemsNames, boxText, wrapText].filter(Boolean).join(" | ")

  // إنشاء عنصر السلة متوافق مع نظام السلة الحالي
  return {
    id: Date.now(), // يمكن تغيير هذا حسب متطلبات نظام السلة الحالي
    name: "هدية مميزة",
    image: "/placeholder.svg?height=300&width=300", // سيتم استبدالها بصورة حقيقية في الواجهة
    price: totalPrice,
    quantity: 1,
    category: "هدايا",
    variant: "مخصص",
    stock: 1,
    giftDetails: summaryText,
    giftData: giftData,
  }
}
