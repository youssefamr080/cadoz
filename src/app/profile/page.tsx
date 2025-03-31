"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../context/AuthContext"
import Header from "../../components/layout/Header"
import Footer from "../../components/layout/Footer"
import { User, Package, Heart, Settings, LogOut, Edit, Phone, Mail, Calendar, MapPin } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import UserAvatar from "../../components/user/UserAvatar"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const ProfilePage = () => {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [recentOrders, setRecentOrders] = useState([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)

  // التحقق من تسجيل الدخول
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
      toast.error("يرجى تسجيل الدخول للوصول إلى صفحة الملف الشخصي")
    }
  }, [user, isLoading, router])

  // جلب آخر الطلبات
  useEffect(() => {
    const fetchRecentOrders = async () => {
      if (user) {
        setIsLoadingOrders(true)
        try {
          const response = await fetch(`/api/orders?customerId=${user.id}&limit=3`)
          const data = await response.json()

          if (data.success) {
            setRecentOrders(data.orders)
          }
        } catch (error) {
          console.error("Error fetching recent orders:", error)
        } finally {
          setIsLoadingOrders(false)
        }
      }
    }

    fetchRecentOrders()
  }, [user])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-purple-600 text-xl">جاري التحميل...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 rtl">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* القائمة الجانبية */}
          <div className="md:col-span-1">
            <Card className="sticky top-24">
              <CardHeader className="text-center pb-2">
                <div className="flex justify-center mb-4">
                  <UserAvatar user={user} size="lg" />
                </div>
                <CardTitle className="text-xl">{user.name}</CardTitle>
                <CardDescription className="text-gray-500">{user.phone}</CardDescription>
              </CardHeader>

              <CardContent className="p-0">
                <nav className="mt-2">
                  <ul className="space-y-1">
                    <li>
                      <Button
                        variant={activeTab === "overview" ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setActiveTab("overview")}
                      >
                        <User className="mr-2 h-5 w-5" />
                        <span>نظرة عامة</span>
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant={activeTab === "orders" ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => router.push("/profile/orders")}
                      >
                        <Package className="mr-2 h-5 w-5" />
                        <span>طلباتي</span>
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant={activeTab === "wishlist" ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setActiveTab("wishlist")}
                      >
                        <Heart className="mr-2 h-5 w-5" />
                        <span>المفضلة</span>
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant={activeTab === "settings" ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => router.push("/profile/settings")}
                      >
                        <Settings className="mr-2 h-5 w-5" />
                        <span>الإعدادات</span>
                      </Button>
                    </li>
                  </ul>
                </nav>
              </CardContent>

              <CardFooter className="pt-2">
                <Button variant="destructive" className="w-full" onClick={handleLogout}>
                  <LogOut className="mr-2 h-5 w-5" />
                  <span>تسجيل الخروج</span>
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* المحتوى الرئيسي */}
          <div className="md:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
                <TabsTrigger value="wishlist">المفضلة</TabsTrigger>
                <TabsTrigger value="settings">الإعدادات</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="space-y-6">
                  {/* بطاقة المعلومات الشخصية */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>المعلومات الشخصية</CardTitle>
                        <CardDescription>معلوماتك الأساسية وبيانات الاتصال</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => router.push("/profile/settings")}>
                        <Edit className="h-4 w-4 mr-2" />
                        تعديل
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="bg-purple-100 p-2 rounded-full">
                            <User className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">الاسم</p>
                            <p className="font-medium">{user.name}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <Phone className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">رقم الهاتف</p>
                            <p className="font-medium">{user.phone}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="bg-green-100 p-2 rounded-full">
                            <Mail className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                            <p className="font-medium">{user.email || "غير متوفر"}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="bg-amber-100 p-2 rounded-full">
                            <Calendar className="h-5 w-5 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">تاريخ التسجيل</p>
                            <p className="font-medium">
                              {user && "createdAt" in user
                                ? format(new Date(user.createdAt as string), "PPP", { locale: ar })
                                : "غير متوفر"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* آخر الطلبات */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>آخر الطلبات</CardTitle>
                        <CardDescription>آخر 3 طلبات قمت بها</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => router.push("/profile/orders")}>
                        عرض الكل
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {isLoadingOrders ? (
                        <div className="text-center py-8">
                          <div className="animate-pulse text-purple-600">جاري تحميل الطلبات...</div>
                        </div>
                      ) : recentOrders.length > 0 ? (
                        <div className="space-y-4">
                          {recentOrders.map((order: any) => (
                            <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">طلب #{order.id.substring(0, 8)}</span>
                                  <span
                                    className={`text-xs px-2 py-1 rounded-full ${
                                      order.status === "delivered"
                                        ? "bg-green-100 text-green-700"
                                        : order.status === "shipped"
                                          ? "bg-blue-100 text-blue-700"
                                          : order.status === "processing"
                                            ? "bg-amber-100 text-amber-700"
                                            : order.status === "cancelled"
                                              ? "bg-red-100 text-red-700"
                                              : "bg-purple-100 text-purple-700"
                                    }`}
                                  >
                                    {order.status === "delivered"
                                      ? "تم التوصيل"
                                      : order.status === "shipped"
                                        ? "تم الشحن"
                                        : order.status === "processing"
                                          ? "قيد المعالجة"
                                          : order.status === "cancelled"
                                            ? "ملغي"
                                            : "قيد الانتظار"}
                                  </span>
                                </div>
                                <span className="text-sm text-gray-500">
                                  {format(new Date(order.createdAt), "PPP", { locale: ar })}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                <MapPin className="h-4 w-4" />
                                <span>{order.shipping.governorate}</span>
                              </div>

                              <div className="flex justify-between items-center">
                                <div className="text-sm">
                                  <span className="text-gray-500">عدد المنتجات: </span>
                                  <span className="font-medium">{order.items.length}</span>
                                </div>
                                <div>
                                  <span className="font-bold text-purple-600">{order.totals.total.toFixed(2)} ج.م</span>
                                </div>
                              </div>

                              <Button
                                variant="link"
                                className="p-0 h-auto mt-2"
                                onClick={() => router.push(`/profile/orders/${order.id}`)}
                              >
                                عرض التفاصيل
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                          <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">لا توجد طلبات سابقة</p>
                          <Button variant="link" className="mt-2" onClick={() => router.push("/")}>
                            تصفح المنتجات
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="wishlist">
                <Card>
                  <CardHeader>
                    <CardTitle>المفضلة</CardTitle>
                    <CardDescription>المنتجات التي أضفتها إلى قائمة المفضلة</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <Heart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">سيتم عرض المنتجات المفضلة هنا</p>
                      <Button variant="link" className="mt-2" onClick={() => router.push("/")}>
                        تصفح المنتجات
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>الإعدادات</CardTitle>
                    <CardDescription>إدارة حسابك وتفضيلاتك</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => router.push("/profile/settings")}>الانتقال إلى صفحة الإعدادات</Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <ToastContainer rtl={true} />
      <Footer />
    </div>
  )
}

export default ProfilePage

