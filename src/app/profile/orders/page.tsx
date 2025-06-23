"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/providers/AuthProvider"
import { useGetOrdersQuery } from '@/lib/redux/api/apiSlice'
import { skipToken } from '@reduxjs/toolkit/query'
import type { Order, OrderItem } from "../../../../prisma/generated/client"
import { OrderStatus } from "../../../../prisma/generated/client"

// نوع موسع للطلب يتضمن العناصر
type OrderWithItems = Order & {
  items: OrderItem[];
};

import { Package, Search, Filter, ArrowLeft, Calendar, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { toast } from "react-toastify"

const OrdersPage = () => {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // جلب الطلبات باستخدام RTK Query
  const { data, isLoading: isLoadingOrders } = useGetOrdersQuery(user ? { customerId: user.id } : skipToken, { skip: !user })
  const orders: OrderWithItems[] = data || []

  // التحقق من تسجيل الدخول
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
      toast.error("يرجى تسجيل الدخول للوصول إلى صفحة الطلبات")
    }
  }, [user, isLoading, router])

  // تصفية الطلبات حسب الحالة والبحث
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    const matchesSearch =
      searchTerm === "" ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone?.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesStatus && matchesSearch
  })

  if (isLoading || !user) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-purple-600 text-xl">جاري التحميل...</div>
      </div>
    )
  }

  return (
    <div className="h-full bg-gray-50 rtl">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" className="mr-2" onClick={() => router.push("/profile")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">طلباتي</h1>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>إدارة الطلبات</CardTitle>
            <CardDescription>عرض وتتبع جميع طلباتك السابقة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="البحث عن طلب..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="w-full md:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="جميع الحالات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value={OrderStatus.PENDING}>قيد الانتظار</SelectItem>
                    <SelectItem value={OrderStatus.PROCESSING}>قيد المعالجة</SelectItem>
                    <SelectItem value={OrderStatus.SHIPPED}>تم الشحن</SelectItem>
                    <SelectItem value={OrderStatus.DELIVERED}>تم التوصيل</SelectItem>
                    <SelectItem value={OrderStatus.CANCELLED}>ملغي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoadingOrders ? (
          <div className="text-center py-12">
            <div className="animate-pulse text-purple-600">جاري تحميل الطلبات...</div>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card
                key={order.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/profile/orders/${order.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg">طلب #{order.id.substring(0, 8)}</h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            order.status === OrderStatus.DELIVERED
                              ? "bg-green-100 text-green-700"
                              : order.status === OrderStatus.SHIPPED
                                ? "bg-blue-100 text-blue-700"
                                : order.status === OrderStatus.PROCESSING
                                  ? "bg-amber-100 text-amber-700"
                                  : order.status === OrderStatus.CANCELLED
                                    ? "bg-red-100 text-red-700"
                                    : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {order.status === OrderStatus.DELIVERED
                            ? "تم التوصيل"
                            : order.status === OrderStatus.SHIPPED
                              ? "تم الشحن"
                              : order.status === OrderStatus.PROCESSING
                                ? "قيد المعالجة"
                                : order.status === OrderStatus.CANCELLED
                                  ? "ملغي"
                                  : "قيد الانتظار"}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{format(order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt), "PPP", { locale: ar })}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{order.shippingId ? "عنوان الشحن محدد" : "لم يحدد العنوان"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 md:mt-0 text-right">
                      <div className="text-sm text-gray-500 mb-1">{order.items?.length || 0} منتج</div>
                      <div className="font-bold text-lg text-purple-600">سعر غير محدد</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {order.items?.slice(0, 3).map((item, index) => (
                      <div key={index} className="bg-gray-50 px-3 py-1 rounded-full text-sm">
                        {item.name?.length > 20 ? `${item.name.substring(0, 20)}...` : item.name || 'منتج'}
                      </div>
                    ))}
                    {(order.items?.length || 0) > 3 && (
                      <div className="bg-gray-50 px-3 py-1 rounded-full text-sm">+{(order.items?.length || 0) - 3} أخرى</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">لا توجد طلبات</h3>
            <p className="text-gray-500 mb-6">لم تقم بإجراء أي طلبات حتى الآن</p>
            <Button onClick={() => router.push("/")}>تصفح المنتجات</Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrdersPage
