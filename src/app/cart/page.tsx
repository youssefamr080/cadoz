"use client"
import React, { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { FiShoppingBag, FiGift, FiArrowLeft, FiTrash2, FiPlus, FiMinus, FiTag, FiUser } from "react-icons/fi"
import { FaWhatsapp } from "react-icons/fa"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import ShippingProgress from "../../components/cart/shipping-progress"
import CouponInput from "../../components/cart/coupon-input"
import LoginModal from "../../components/auth/login-modal"
import {
  selectIsCartEmpty,
  selectShipping,
  selectAvailableGovernorates,
  selectPromoCode,
  selectCartTotals,
  removeItem,
  incrementQuantity,
  decrementQuantity,
  clearCart,
  updateShipping,
  setPromoCode,
  clearPromoCode,
  selectCartTotalItems,
} from "@/lib/redux/slices/cartSlice"
import type { RootState } from "@/lib/redux/store"
import { useSession } from 'next-auth/react'
import { useCreateOrderMutation } from '@/lib/redux/api/apiSlice'
import type { CreateOrderResponse } from '@/lib/redux/api/apiSlice'

// تعريف واجهات البيانات
interface CartItemType {
  id: string
  name: string
  image: string
  price: number
  quantity: number
  stock?: number
  category?: string
  variant?: string
  discount?: number
  originalPrice?: number
  giftDetails?: string
  giftData?: {
    items: Array<{
      name: string
      quantity: number
      image: string
      price: number
    }>
    box: {
      name: string
      image: string
      price: number
    } | null
    wrap: {
      name: string
      image: string
      price: number
    } | null
    message?: string
    recipient?: string
    decorations?: Array<{
      name: string
      image: string
      price: number
    }>
    sweets?: Array<{
      name: string
      image: string
      price: number
    }>
  }
}

const CartPage = () => {
  const router = useRouter()
  const cart = useSelector((state: RootState) => state.cart.cart)
  const itemCount = useSelector(selectCartTotalItems)
  const isCartEmpty = useSelector(selectIsCartEmpty)
  const shipping = useSelector(selectShipping)
  const availableGovernorates = useSelector(selectAvailableGovernorates)
  const promoCode = useSelector(selectPromoCode)
  const { subtotal, shippingFees, discount, tax, total } = useSelector(selectCartTotals)
  const dispatch = useDispatch()
  const { data: session } = useSession()
  const user = session?.user

  const [isSending, setIsSending] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation()

  // الحد الأدنى للشحن المجاني
  const FREE_SHIPPING_THRESHOLD = 500

  // إنشاء طلب جديد في قاعدة البيانات باستخدام RTK Query
  const handleCreateOrder = async () => {
    if (isCartEmpty) {
      toast.error("السلة فارغة!")
      return null
    }
    if (!shipping.governorate) {
      toast.error("الرجاء اختيار المحافظة أولاً")
      return null
    }
    const orderData = {
      items: cart,
      shipping,
      totals: {
        subtotal,
        shippingFees,
        discount,
        tax,
        total,
      },
      promoCode: promoCode.isValid
        ? {
            code: promoCode.code,
            discountPercentage: promoCode.discountPercentage,
          }
        : undefined,
      customerId: user?.id,
      customerName: user?.name,
      customerPhone: user?.phone,
      customerEmail: user?.email,
    }
    try {
      const result: CreateOrderResponse = await createOrder(orderData).unwrap()
      if (result.success) {
        return result.orderId
      } else {
        toast.error(result.message || "حدث خطأ أثناء إنشاء الطلب")
        return null
      }
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } }
      toast.error(err?.data?.message || "حدث خطأ أثناء إنشاء الطلب")
      return null
    }
  }

  const sendInvoiceWhatsApp = async () => {
    if (isCartEmpty) {
      toast.error("السلة فارغة!")
      return
    }

    if (!shipping.governorate) {
      toast.error("الرجاء اختيار المحافظة أولاً")
      return
    }

    setIsSending(true)
    try {
      // إنشاء الطلب في قاعدة البيانات
      const orderId = await handleCreateOrder()

      if (!orderId) {
        return
      }

      // إنشاء رسالة واتساب
      const message = generateWhatsAppMessage(orderId)
      const whatsappUrl = `https://wa.me/201026972523?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, "_blank")

      setTimeout(() => {
        dispatch(clearCart())
        toast.success("تم إرسال الطلب بنجاح!")

        // إذا كان المستخدم مسجل دخوله، انتقل إلى صفحة تفاصيل الطلب
        if (user) {
          router.push(`/profile/orders/${orderId}`)
        }
      }, 2000)
    } finally {
      setIsSending(false)
    }
  }

  const generateWhatsAppMessage = (orderId?: string) => {
    let message = `🛒 *فاتورة طلب من CADOZ* 🛍️\n\n`

    if (orderId) {
      message += `🔢 *رقم الطلب:* ${orderId}\n`
    }

    message += `📍 *المحافظة:* ${shipping.governorate}\n`

    if (shipping.address) message += `📍 *العنوان:* ${shipping.address}\n`

    if (shipping.phone) message += `📞 *رقم الهاتف:* ${shipping.phone}\n`

    message += `----------------------------------------\n`
    message += `📋 *تفاصيل الطلب:*\n\n`

    cart.forEach((item, index) => {
      message += `📌 *${index + 1}.* ${item.name} (ID: ${item.id})\n`
      message += `   ✨ السعر: ${item.price.toFixed(2)} ج.م × ${item.quantity} = ${(item.price * item.quantity).toFixed(
        2,
      )} ج.م\n`

      // إضافة معلومات اللون إذا كانت متوفرة
      if (item.variant) {
        message += `   🎨 ${item.variant}\n`
      }

      // تفاصيل الهدية
      if (item.giftData) {
        message += `   🎁 *تفاصيل الهدية:*\n`

        // منتجات الهدية
        if (item.giftData.items && item.giftData.items.length > 0) {
          message += `      📦 *المنتجات:*\n`
          item.giftData.items.forEach((giftItem) => {
            message += `         - ${giftItem.name} × ${giftItem.quantity} (${giftItem.price.toFixed(2)} ج.م للقطعة)\n`
          })
        }

        // صندوق الهدية
        if (item.giftData.box) {
          message += `      📦 *صندوق:* ${item.giftData.box.name} (${item.giftData.box.price.toFixed(2)} ج.م)\n`
        }

        // تغليف الهدية
        if (item.giftData.wrap) {
          message += `      🎀 *تغليف:* ${item.giftData.wrap.name} (${item.giftData.wrap.price.toFixed(2)} ج.م)\n`
        }

        // المستلم والرسالة
        if (item.giftData.recipient) {
          message += `      👤 *المستلم:* ${item.giftData.recipient}\n`
        }

        if (item.giftData.message) {
          message += `      💌 *رسالة:* "${item.giftData.message}"\n`
        }
      } else if (item.giftDetails) {
        message += `   🎁 *محتويات الهدية:* ${item.giftDetails}\n`
      }

      message += `\n`
    })

    message += `----------------------------------------\n`
    message += `💵 المجموع الفرعي: ${subtotal.toFixed(2)} ج.م\n`
    message += `🚚 رسوم التوصيل: ${shippingFees.toFixed(2)} ج.م\n`

    if (discount > 0) message += `🎟️ الخصم: ${discount.toFixed(2)} ج.م\n`

    if (tax > 0) message += `💰 الضريبة: ${tax.toFixed(2)} ج.م\n`

    message += `💰 الإجمالي: ${total.toFixed(2)} ج.م\n\n`

    if (promoCode.isValid) message += `🏷️ كود الخصم المستخدم: ${promoCode.code}\n\n`

    message += `🔗 شكراً لتسوقك معنا! ❤️`

    return message
  }

  const handleApplyPromoCode = async (code: string) => {
    if (!code) {
      toast.error("الرجاء إدخال كود الخصم")
      return false
    }
    dispatch(setPromoCode(code))
    // TODO: أضف منطق التحقق من الكوبون عبر thunk لاحقاً
    toast.success("تم تطبيق كود الخصم (تحقق فعلي سيتم لاحقاً)")
    return true
  }

  const handleQuantityChange = (id: string, change: number) => {
    if (change > 0) {
      dispatch(incrementQuantity({ id }))
    } else {
      dispatch(decrementQuantity({ id }))
    }
  }

  const handleCheckout = () => {
    if (!user) {
      // إذا لم يكن المستخدم مسجل دخوله، اعرض نافذة تسجيل الدخول
      setIsLoginModalOpen(true)
      toast.info("يرجى تسجيل الدخول لإكمال عملية الشراء")
      return
    }

    // إذا كان المستخدم مسجل دخوله، أكمل عملية الشراء
    sendInvoiceWhatsApp()
  }

  const handleGiftSetup = () => {
    const selectedItems = cart.filter(item => !item.giftData); // فقط المنتجات غير المضافة للهدايا
    if (selectedItems.length > 0) {
      // حفظ المنتجات المحددة في localStorage لاستخدامها في صفحة الهدية
      localStorage.setItem('cart-to-gift-items', JSON.stringify(selectedItems));
      router.push('/gift');
    } else {
      toast.info('يرجى إضافة منتجات للسلة أولاً');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 rtl">
     

      <div className="container mx-auto px-2 sm:px-4 py-6 max-w-4xl">
        <div className="flex items-center mb-4">
          <button
            onClick={() => router.back()}
            className="p-2 bg-white rounded-lg shadow-sm mr-2 hover:bg-gray-50 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold flex items-center">
            <FiShoppingBag className="mr-2 text-purple-600" />
            سلة التسوق ({itemCount})
          </h1>
        </div>

        <AnimatePresence>
          {isCartEmpty ? (
            <EmptyCart />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* عناصر السلة */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-2">
                {/* قسم ترويجي للهدايا */}
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 mb-4 border border-amber-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-100 p-2 rounded-full">
                      <FiGift className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-amber-800">حول مشترياتك إلى هدايا مميزة!</h3>
                      <p className="text-sm text-amber-700">أضف تغليف هدايا فاخر وبطاقة إهداء شخصية</p>
                    </div>
                    <button
                      onClick={handleGiftSetup}
                      className="mr-auto bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-md transition-shadow"
                    >
                      تجهيز كهدية
                    </button>
                  </div>
                </div>

                {/* شريط تقدم الشحن المجاني */}
                <ShippingProgress subtotal={subtotal} freeShippingThreshold={FREE_SHIPPING_THRESHOLD} />

                <div className="bg-white rounded-xl shadow-sm">
                  <div className="divide-y divide-gray-100">
                    <AnimatePresence>
                      {cart.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          {item.giftData ? (
                            <GiftCartItem
                              item={item}
                              onQuantityChange={handleQuantityChange}
                              onRemove={() => dispatch(removeItem({ id: item.id }))}
                            />
                          ) : (
                            <CartItem item={item} onQuantityChange={handleQuantityChange} onRemove={() => dispatch(removeItem({ id: item.id }))} />
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>

              {/* ملخص الطلب */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-1">
                <div className="bg-white rounded-xl shadow-sm sticky top-4">
                  <div className="p-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold">ملخص الطلب</h2>
                  </div>

                  <div className="p-4 space-y-4">
                    {/* معلومات المستخدم */}
                    <div className="mb-4">
                      {user ? (
                        <div className="flex items-center gap-2 bg-purple-50 p-3 rounded-lg">
                          <div className="bg-purple-100 p-2 rounded-full">
                            <FiUser className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-purple-800">{user.name}</p>
                            <p className="text-xs text-purple-600">{user.phone}</p>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setIsLoginModalOpen(true)}
                          className="w-full flex items-center justify-center gap-2 bg-purple-50 p-3 rounded-lg hover:bg-purple-100 transition-colors"
                        >
                          <FiUser className="w-5 h-5 text-purple-600" />
                          <span className="text-purple-700 font-medium">تسجيل الدخول</span>
                        </button>
                      )}
                    </div>

                    {/* كوبون الخصم */}
                    <div className="mb-4">
                      <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
                        <FiTag className="text-blue-600" />
                        كوبون الخصم
                      </h3>
                      <CouponInput
                        onApply={handleApplyPromoCode}
                        onClear={() => dispatch(clearPromoCode())}
                        currentCode={promoCode.code}
                        isValid={promoCode.isValid}
                        discountPercentage={promoCode.discountPercentage}
                      />
                    </div>

                    {/* اختيار المحافظة */}
                    <div>
                      <h3 className="text-sm font-medium mb-2">المحافظة</h3>
                      <select
                        value={shipping.governorate}
                        onChange={(e) => dispatch(updateShipping({ governorate: e.target.value }))}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                        required
                      >
                        <option value="">اختر المحافظة</option>
                        {availableGovernorates.map((governorate) => (
                          <option key={governorate} value={governorate}>
                            {governorate}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* ملخص الأسعار */}
                    <div className="space-y-2 pt-4 border-t border-gray-100">
                      <div className="flex justify-between">
                        <span className="text-gray-600">المجموع الفرعي</span>
                        <span>{subtotal.toFixed(2)} ج.م</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">رسوم التوصيل</span>
                        <span>{shippingFees.toFixed(2)} ج.م</span>
                      </div>
                      {promoCode.isValid && (
                        <div className="flex justify-between text-green-600">
                          <span>الخصم</span>
                          <span>-{discount.toFixed(2)} ج.م</span>
                        </div>
                      )}
                      {tax > 0 && (
                        <div className="flex justify-between">
                          <span>الضريبة (14%)</span>
                          <span>{tax.toFixed(2)} ج.م</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold border-t pt-2 text-lg">
                        <span>الإجمالي</span>
                        <span className="text-purple-600">{total.toFixed(2)} ج.م</span>
                      </div>
                    </div>

                    {/* أزرار العمليات */}
                    <div className="flex flex-col gap-3 pt-4">
                      <button
                        onClick={handleGiftSetup}
                        className="bg-gradient-to-r from-purple-600 to-pink-500 text-white p-3 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        <FiGift className="text-xl" />
                        <span>تجهيز كهدية</span>
                      </button>

                      <button
                        onClick={handleCheckout}
                        disabled={isSending || isCreatingOrder || !shipping.governorate}
                        className={`bg-green-500 text-white p-3 rounded-lg flex items-center justify-center gap-2 transition-all
                          ${isSending || isCreatingOrder || !shipping.governorate ? "opacity-75 cursor-not-allowed" : "hover:bg-green-600 hover:shadow-md"}`}
                      >
                        <FaWhatsapp className="text-xl" />
                        <span>{isSending || isCreatingOrder ? "جاري المعالجة..." : "إرسال الطلب عبر واتساب"}</span>
                      </button>

                      <button
                        onClick={() => dispatch(clearCart())}
                        className="text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <FiTrash2 className="w-4 h-4" />
                        <span>مسح السلة</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => {
          setIsLoginModalOpen(false)
          // بعد تسجيل الدخول، استمر في عملية الشراء
          sendInvoiceWhatsApp()
        }}
      />

    </div>
  )
}

// مكون السلة الفارغة
const EmptyCart = () => (
  <div className="space-y-6">
    <div className="bg-white rounded-2xl p-8 text-center shadow-xl hover:shadow-2xl transition-shadow duration-300">
      <div className="max-w-md mx-auto">
        <div className="mb-6 flex justify-center">
          <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center">
            <FiShoppingBag className="w-12 h-12 text-purple-500" />
          </div>
        </div>

        <h3 className="text-2xl font-bold text-gray-800 mb-3 font-[Tajawal]">سلتك فارغة!</h3>
        <p className="text-gray-600 mb-8 text-lg">ابدأ رحلة التسوق لاكتشاف عالم الهدايا الساحر</p>

        <div className="grid gap-4">
          <button
            onClick={() => (window.location.href = "/gift")}
            className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-8 py-4 rounded-xl 
            flex items-center justify-center gap-2 text-lg font-semibold shadow-lg hover:shadow-purple-200"
          >
            <FiGift className="w-6 h-6" />
            <span> شراء ملحقات الهدية</span>
          </button>

          <button
            onClick={() => (window.location.href = "/")}
            className="border-2 border-purple-500 text-purple-600 px-8 py-4 rounded-xl 
            flex items-center justify-center gap-2 text-lg font-medium hover:bg-purple-50"
          >
            <FiShoppingBag className="w-6 h-6" />
            <span>تصفح المتجر</span>
          </button>
        </div>
      </div>
    </div>

    {/* قسم ترويجي للهدايا */}
    <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="w-full md:w-1/3 flex justify-center">
          <div className="relative w-48 h-48">
            <div className="absolute inset-0 bg-pink-200 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute inset-4 bg-purple-200 rounded-full opacity-30 animate-pulse delay-300"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FiGift className="w-24 h-24 text-purple-500" />
            </div>
          </div>
        </div>
        <div className="w-full md:w-2/3 text-center md:text-right">
          <h2 className="text-2xl md:text-3xl font-bold text-purple-800 mb-3">أرسل هدية مميزة لمن تحب</h2>
          <p className="text-purple-700 mb-6 text-lg">
            يمكنك الآن تحويل أي منتج إلى هدية مميزة مع إضافة تغليف فاخر وبطاقة إهداء شخصية
          </p>
          <button
            onClick={() => (window.location.href = "/gift")}
            className="bg-white text-purple-600 border-2 border-purple-200 px-6 py-3 rounded-lg 
            flex items-center justify-center gap-2 text-lg font-medium hover:bg-purple-50 mx-auto md:mr-0"
          >
            <FiGift className="w-5 h-5" />
            <span>استكشف خيارات الهدايا</span>
          </button>
        </div>
      </div>
    </div>
  </div>
)

interface CartItemProps {
  item: CartItemType
  onQuantityChange: (id: string, change: number) => void
  onRemove: (id: string) => void
}

const CartItem: React.FC<CartItemProps> = ({ item, onQuantityChange, onRemove }) => {
  // حساب السعر مع الخصم إن وجد
  const displayPrice =
    item.discount && item.originalPrice ? item.originalPrice - item.originalPrice * item.discount : item.price

  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3 flex-1">
        <div className="relative w-16 h-16 rounded-lg overflow-hidden border">
          <Image 
            src={item.image || "/placeholder.svg"} 
            alt={item.name} 
            fill
            className="object-cover"
            sizes="64px"
            quality={85} 
          />
        </div>
        <div className="flex-1">
          <h3 className="font-medium line-clamp-1">{item.name}</h3>
          <div className="flex items-center gap-2">
            <p className="text-purple-600 font-bold">{displayPrice.toFixed(2)} ج.م</p>
            {item.discount && item.originalPrice && (
              <p className="text-gray-500 text-sm line-through">{item.originalPrice.toFixed(2)} ج.م</p>
            )}
          </div>
          {item.variant && <p className="text-gray-500 text-sm">{item.variant}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center bg-gray-100 rounded-lg border">
          <button
            onClick={() => onQuantityChange(item.id, -1)}
            aria-label="تقليل الكمية"
            className="p-1 px-2 text-gray-500 hover:text-purple-600 transition-colors"
          >
            <FiMinus className="w-4 h-4" />
          </button>
          <span className="px-2 min-w-[30px] text-center">{item.quantity}</span>
          <button
            onClick={() => onQuantityChange(item.id, 1)}
            aria-label="زيادة الكمية"
            disabled={item.stock !== undefined && item.quantity >= item.stock}
            className={`p-1 px-2 transition-colors ${
              item.stock !== undefined && item.quantity >= item.stock
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-500 hover:text-purple-600"
            }`}
          >
            <FiPlus className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={() => onRemove(item.id)}
          aria-label="حذف من السلة"
          className="text-red-500 p-2 hover:text-red-600 transition-colors"
        >
          <FiTrash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

// مكون عناصر الهدايا
interface GiftCartItemProps {
  item: CartItemType
  onQuantityChange: (id: string, change: number) => void
  onRemove: (id: string) => void
}

const GiftCartItem: React.FC<GiftCartItemProps> = ({ item, onQuantityChange, onRemove }) => {
  const [expanded, setExpanded] = React.useState(false)

  const toggleExpand = () => {
    setExpanded(!expanded)
  }

  return (
    <div className="hover:bg-gray-50 transition-colors divide-y divide-gray-100">
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden border bg-gradient-to-br from-purple-50 to-pink-50">
            <Image
              src={item.image || "/placeholder.svg"}
              alt={item.name}
              fill
              className="object-cover"
              sizes="64px"
              quality={85}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <FiGift className="text-2xl text-purple-600" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium line-clamp-1">{item.name}</h3>
              <span className="bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded-full">هدية</span>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-purple-600 font-bold">{item.price.toFixed(2)} ج.م</p>
            </div>
            {item.variant && <p className="text-gray-500 text-sm">{item.variant}</p>}
            <button
              onClick={toggleExpand}
              className="text-xs text-purple-600 mt-1 flex items-center gap-1 hover:underline"
            >
              {expanded ? "إخفاء التفاصيل" : "عرض تفاصيل الهدية"}
              <span className={`transform transition-transform ${expanded ? "rotate-180" : ""}`}>▼</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-100 rounded-lg border">
            <button
              onClick={() => onQuantityChange(item.id, -1)}
              aria-label="تقليل الكمية"
              className="p-1 px-2 text-gray-500 hover:text-purple-600 transition-colors"
            >
              <FiMinus className="w-4 h-4" />
            </button>
            <span className="px-2 min-w-[30px] text-center">{item.quantity}</span>
            <button
              onClick={() => onQuantityChange(item.id, 1)}
              aria-label="زيادة الكمية"
              disabled={item.stock !== undefined && item.quantity >= item.stock}
              className={`p-1 px-2 transition-colors ${
                item.stock !== undefined && item.quantity >= item.stock
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-500 hover:text-purple-600"
              }`}
            >
              <FiPlus className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => onRemove(item.id)}
            aria-label="حذف من السلة"
            className="text-red-500 p-2 hover:text-red-600 transition-colors"
          >
            <FiTrash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {expanded && item.giftData && (
        <div className="bg-gray-50 p-4 space-y-4 text-sm">
          {/* المستلم والرسالة */}
          {(item.giftData.recipient || item.giftData.message) && (
            <div className="bg-white p-3 rounded-lg border border-purple-100 shadow-sm">
              <h3 className="font-medium text-purple-700 mb-2 flex items-center gap-1">
                <FiUser className="w-4 h-4" />
                معلومات الإهداء
              </h3>
              {item.giftData.recipient && (
                <div className="mb-2">
                  <span className="font-medium text-gray-700">المستلم:</span> {item.giftData.recipient}
                </div>
              )}
              {item.giftData.message && (
                <div>
                  <span className="font-medium text-gray-700">الرسالة:</span>
                  <p className="italic mt-1 text-gray-600 border-r-2 border-purple-300 pr-2 bg-purple-50 p-2 rounded">
                    &ldquo;{item.giftData.message}&rdquo;
                  </p>
                </div>
              )}
            </div>
          )}

          {/* المنتجات الأساسية */}
          {item.giftData.items && item.giftData.items.length > 0 && (
            <div className="bg-white p-3 rounded-lg border shadow-sm">
              <h3 className="font-medium text-purple-700 mb-3 flex items-center gap-1">
                <FiGift className="w-4 h-4" />
                المنتجات
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {item.giftData.items.map((giftItem, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border bg-white">
                      <Image
                        src={giftItem.image || "/placeholder.svg"}
                        alt={giftItem.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{giftItem.name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <span>{typeof giftItem.price === 'number' ? giftItem.price.toFixed(2) : '0.00'} ج.م</span>
                        <span className="text-gray-400">×</span>
                        <span className="bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full text-xs">
                          {giftItem.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* صندوق الهدية والتغليف */}
          {(item.giftData.box || item.giftData.wrap) && (
            <div className="bg-white p-3 rounded-lg border shadow-sm">
              <h3 className="font-medium text-purple-700 mb-3 flex items-center gap-1">
                <FiGift className="w-4 h-4" />
                التغليف والصندوق
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {item.giftData.box && (
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden border bg-white">
                        <Image
                          src={item.giftData.box.image || "/placeholder.svg"}
                          alt={item.giftData.box.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{item.giftData.box.name}</div>
                        <div className="text-xs text-gray-500">
                          {typeof item.giftData.box.price === 'number' ? item.giftData.box.price.toFixed(2) : '0.00'} ج.م
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {item.giftData.wrap && (
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden border bg-white">
                        <Image
                          src={item.giftData.wrap.image || "/placeholder.svg"}
                          alt={item.giftData.wrap.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{item.giftData.wrap.name}</div>
                        <div className="text-xs text-gray-500">
                          {typeof item.giftData.wrap.price === 'number' ? item.giftData.wrap.price.toFixed(2) : '0.00'} ج.م
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* الحلويات */}
          {item.giftData.sweets && item.giftData.sweets.length > 0 && (
            <div className="bg-white p-3 rounded-lg border shadow-sm">
              <h3 className="font-medium text-orange-700 mb-3 flex items-center gap-1">
                <FiGift className="w-4 h-4" />
                الحلويات
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {item.giftData.sweets.map((sweet, idx) => (
                  <div key={idx} className="bg-gray-50 p-2 rounded-lg border">
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden border bg-white mb-2">
                      <Image
                        src={sweet.image || "/placeholder.svg"}
                        alt={sweet.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-xs">{sweet.name}</div>
                      <div className="text-xs text-gray-500">
                        {typeof sweet.price === 'number' ? sweet.price.toFixed(2) : '0.00'} ج.م
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CartPage
