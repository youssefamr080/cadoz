"use client"
import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Package, Truck, CheckCircle, Clock, XCircle, MapPin, Phone, FileText, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import Image from "next/image"
import { FaWhatsapp } from "react-icons/fa"
import { useGetOrderByIdQuery } from '@/lib/redux/api/apiSlice'
import { useAuth } from "@/providers/AuthProvider"

interface OrderDetailsProps {
  params: {
    orderId: string
  }
}

const OrderDetailsPage = ({ params }: OrderDetailsProps) => {
  const { orderId } = params

  const { user, isLoading } = useAuth()
  const router = useRouter()
  // جلب تفاصيل الطلب باستخدام RTK Query
  const { data: order, isLoading: isLoadingOrder } = useGetOrderByIdQuery(orderId, { skip: !user || !orderId })

  // التحقق من تسجيل الدخول
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
      toast.error("يرجى تسجيل الدخول للوصول إلى صفحة تفاصيل الطلب")
    }
  }, [user, isLoading, router])

  // إنشاء رسالة واتساب للاستفسار عن الطلب
  const sendWhatsAppInquiry = () => {
    if (!order) return

    const message = `استفسار عن الطلب رقم: ${order.id.substring(0, 8)}
تاريخ الطلب: ${format(new Date(order.createdAt), "PPP", { locale: ar })}
حالة الطلب: ${getStatusText(order.status)}

أرغب في الاستفسار عن حالة الطلب.`

    const whatsappUrl = `https://wa.me/201026972523?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  // الحصول على نص حالة الطلب
  const getStatusText = (status: string) => {
    switch (status) {
      case "delivered":
        return "تم التوصيل"
      case "shipped":
        return "تم الشحن"
      case "processing":
        return "قيد المعالجة"
      case "cancelled":
        return "ملغي"
      default:
        return "قيد الانتظار"
    }
  }

  // الحصول على لون حالة الطلب
  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "text-green-600"
      case "shipped":
        return "text-blue-600"
      case "processing":
        return "text-amber-600"
      case "cancelled":
        return "text-red-600"
      default:
        return "text-purple-600"
    }
  }

  // الحصول على أيقونة حالة الطلب
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-6 w-6 text-green-600" />
      case "shipped":
        return <Truck className="h-6 w-6 text-blue-600" />
      case "processing":
        return <Package className="h-6 w-6 text-amber-600" />
      case "cancelled":
        return <XCircle className="h-6 w-6 text-red-600" />
      default:
        return <Clock className="h-6 w-6 text-purple-600" />
    }
  }

  if (isLoading || !user) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-purple-600 text-xl">جاري التحميل...</div>
      </div>
    )
  }

  if (isLoadingOrder) {
    return (
      <div className="min-h-screen bg-gray-50 rtl">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex items-center mb-6">
            <Button variant="ghost" size="sm" className="mr-2" onClick={() => router.push("/profile/orders")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">تفاصيل الطلب</h1>
          </div>

          <div className="text-center py-12">
            <div className="animate-pulse text-purple-600">جاري تحميل تفاصيل الطلب...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 rtl">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex items-center mb-6">
            <Button variant="ghost" size="sm" className="mr-2" onClick={() => router.push("/profile/orders")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">تفاصيل الطلب</h1>
          </div>

          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">الطلب غير موجود</h3>
            <p className="text-gray-500 mb-6">لم يتم العثور على تفاصيل هذا الطلب</p>
            <Button onClick={() => router.push("/profile/orders")}>العودة إلى الطلبات</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-gray-50 rtl">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" className="mr-2" onClick={() => router.push("/profile/orders")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">تفاصيل الطلب #{order.id.substring(0, 8)}</h1>
        </div>

        {/* حالة الطلب */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(order.status)}
                <div>
                  <h3 className="font-bold text-lg">
                    حالة الطلب: <span className={getStatusColor(order.status)}>{getStatusText(order.status)}</span>
                  </h3>
                  <p className="text-gray-500">
                    تاريخ الطلب: {format(new Date(order.createdAt), "PPP", { locale: ar })}
                  </p>
                </div>
              </div>

              <Button variant="outline" className="mt-4 md:mt-0 flex items-center gap-2" onClick={sendWhatsAppInquiry}>
                <FaWhatsapp className="text-green-500 text-lg" />
                <span>استفسار عن الطلب</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* تفاصيل الشحن */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>تفاصيل المنتجات</CardTitle>
              <CardDescription>المنتجات المطلوبة في هذا الطلب</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-start gap-4 p-3 border rounded-lg hover:bg-gray-50">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        layout="fill"
                        objectFit="cover"
                        quality={85}
                      />
                      {item.giftData && (
                        <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs px-1.5 py-0.5 rounded-bl-lg">
                          هدية
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      {item.variant && <p className="text-sm text-gray-500">{item.variant}</p>}
                      
                      {item.giftData && (
                        <div className="mt-2 space-y-3">
                          {/* Gift Products */}
                          {item.giftData.items && item.giftData.items.length > 0 && (
                            <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                              <div className="text-sm font-medium text-purple-700">محتويات الهدية:</div>
                              {item.giftData.items.map((giftItem, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-2">
                                    <div className="relative w-8 h-8 rounded overflow-hidden">
                                      <Image
                                        src={giftItem.image || "/placeholder.svg"}
                                        alt={giftItem.name}
                                        layout="fill"
                                        objectFit="cover"
                                      />
                                    </div>
                                    <span>{giftItem.name}</span>
                                    <span className="text-gray-500">×{giftItem.quantity}</span>
                                  </div>
                                  <span className="font-medium">{giftItem.price.toFixed(2)} ج.م</span>
                                </div>
                              ))}
                              <div className="pt-2 border-t text-sm flex justify-between">
                                <span>إجمالي المحتويات:</span>
                                <span className="font-bold text-purple-600">
                                  {item.giftData.items.reduce((sum, i) => sum + (i.price * i.quantity), 0).toFixed(2)} ج.م
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Gift Box */}
                          {item.giftData.box && (
                            <div className="flex items-center justify-between bg-amber-50 p-2 rounded-lg">
                              <div className="flex items-center gap-2 text-amber-700">
                                <Package className="w-4 h-4" />
                                <span className="text-sm">صندوق: {item.giftData.box.name}</span>
                              </div>
                              <span className="text-sm font-medium">{item.giftData.box.price.toFixed(2)} ج.م</span>
                            </div>
                          )}

                          {/* Gift Wrap */}
                          {item.giftData.wrap && (
                            <div className="flex items-center justify-between bg-pink-50 p-2 rounded-lg">
                              <div className="flex items-center gap-2 text-pink-700">
                                <Gift className="w-4 h-4" />
                                <span className="text-sm">تغليف: {item.giftData.wrap.name}</span>
                              </div>
                              <span className="text-sm font-medium">{item.giftData.wrap.price.toFixed(2)} ج.م</span>
                            </div>
                          )}

                          {/* Recipient & Message */}
                          {(item.giftData.recipient || item.giftData.message) && (
                            <div className="bg-purple-50 p-3 rounded-lg space-y-2 border border-purple-100">
                              {item.giftData.recipient && (
                                <div className="text-sm">
                                  <span className="font-medium text-purple-700">المستلم:</span>
                                  <span className="text-gray-700"> {item.giftData.recipient}</span>
                                </div>
                              )}
                              {item.giftData.message && (
                                <div className="text-sm">
                                  <span className="font-medium text-purple-700">الرسالة:</span>
                                  <p className="mt-1 text-gray-600 italic bg-white p-2 rounded-md border border-purple-100">
                                    &quot;{item.giftData.message}&quot;
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Gift Total */}
                          <div className="flex justify-between items-center pt-2 border-t">
                            <span className="text-sm font-medium text-gray-600">إجمالي الهدية:</span>
                            <span className="font-bold text-purple-600 text-lg">{item.price.toFixed(2)} ج.م</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-3">
                        <span className="text-sm text-gray-600">الكمية: {item.quantity}</span>
                        <span className="font-bold text-gray-900">{(item.price * item.quantity).toFixed(2)} ج.م</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>معلومات الشحن</CardTitle>
              <CardDescription>تفاصيل الشحن والتوصيل</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">المحافظة</p>
                    <p className="font-medium">{order.shipping.governorate}</p>
                  </div>
                </div>

                {order.shipping.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">العنوان</p>
                      <p className="font-medium">{order.shipping.address}</p>
                    </div>
                  </div>
                )}

                {order.shipping.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">رقم الهاتف</p>
                      <p className="font-medium">{order.shipping.phone}</p>
                    </div>
                  </div>
                )}

                {order.shipping.notes && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">ملاحظات</p>
                      <p className="font-medium">{order.shipping.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ملخص الدفع */}
        <Card>
          <CardHeader>
            <CardTitle>ملخص الدفع</CardTitle>
            <CardDescription>تفاصيل المبالغ والدفع</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">المجموع الفرعي</span>
                <span>{order.totals.subtotal.toFixed(2)} ج.م</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">رسوم التوصيل</span>
                <span>{order.totals.shippingFees.toFixed(2)} ج.م</span>
              </div>
              {order.totals.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>الخصم</span>
                  <span>-{order.totals.discount.toFixed(2)} ج.م</span>
                </div>
              )}
              {order.totals.tax > 0 && (
                <div className="flex justify-between">
                  <span>الضريبة</span>
                  <span>{order.totals.tax.toFixed(2)} ج.م</span>
                </div>
              )}
              <div className="flex justify-between font-bold border-t pt-2 text-lg">
                <span>الإجمالي</span>
                <span className="text-purple-600">{order.totals.total.toFixed(2)} ج.م</span>
              </div>
            </div>

            {order.promoCode && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  تم استخدام كوبون خصم: <span className="font-medium">{order.promoCode.code}</span>
                </p>
                <p className="text-sm text-gray-600">
                  نسبة الخصم: <span className="font-medium">{order.promoCode.discountPercentage}%</span>
                </p>
              </div>
            )}

            <div className="mt-6">
              <p className="text-sm text-gray-600 mb-2">طريقة الدفع:</p>
              <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-full">
                  <Package className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">الدفع عند الاستلام</p>
                  <p className="text-xs text-gray-500">سيتم الدفع نقدًا عند استلام الطلب</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default OrderDetailsPage
