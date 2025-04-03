"use client"

import { useState } from "react"
import { Bell, X, Check, Trash2 } from "lucide-react"
import { Button } from "../../components/ui/button"
import { cn } from "../../lib/utils"

// نموذج للإشعارات
const demoNotifications = [
  {
    id: 1,
    title: "تم شحن طلبك",
    message: "تم شحن طلبك رقم #12345 وسيصل خلال 3-5 أيام.",
    time: "منذ 5 دقائق",
    read: false,
    type: "order",
  },
  {
    id: 2,
    title: "خصم 20% على منتجات مختارة",
    message: "استفد من خصم 20% على منتجات مختارة لمدة 24 ساعة فقط!",
    time: "منذ 2 ساعة",
    read: false,
    type: "promo",
  },
  {
    id: 3,
    title: "تم تأكيد طلبك",
    message: "تم تأكيد طلبك رقم #12344 وجاري تجهيزه.",
    time: "منذ 1 يوم",
    read: true,
    type: "order",
  },
  {
    id: 4,
    title: "تقييم المنتجات",
    message: "شاركنا رأيك في المنتجات التي اشتريتها مؤخراً.",
    time: "منذ 3 أيام",
    read: true,
    type: "review",
  },
]

// أنواع الإشعارات وألوانها
const notificationTypes = {
  order: {
    icon: Package,
    bgClass: "bg-blue-100 dark:bg-blue-900/30",
    iconClass: "text-blue-600 dark:text-blue-400",
  },
  promo: {
    icon: Tag,
    bgClass: "bg-purple-100 dark:bg-purple-900/30",
    iconClass: "text-purple-600 dark:text-purple-400",
  },
  review: {
    icon: Star,
    bgClass: "bg-amber-100 dark:bg-amber-900/30",
    iconClass: "text-amber-600 dark:text-amber-400",
  },
}

interface NotificationsPanelProps {
  onClose: () => void
  onClearAll: () => void
}

// استيراد الأيقونات المستخدمة
import { Package, Tag, Star } from "lucide-react"

const NotificationsPanel = ({ onClose, onClearAll }: NotificationsPanelProps) => {
  const [notifications, setNotifications] = useState(demoNotifications)

  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((notification) => ({ ...notification, read: true })))
  }

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter((notification) => notification.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
    onClearAll()
  }

  const unreadCount = notifications.filter((notification) => !notification.read).length

  return (
    <div className="w-full max-h-[80vh] overflow-hidden flex flex-col">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <h3 className="font-bold text-gray-800 dark:text-gray-200">الإشعارات</h3>
          {unreadCount > 0 && (
            <span className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-xs font-medium px-2 py-0.5 rounded-full">
              {unreadCount} جديد
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs h-8 px-2 text-gray-600 dark:text-gray-400 hover:text-purple-700 dark:hover:text-purple-300"
            >
              <Check className="h-3.5 w-3.5 mr-1" />
              تعليم الكل كمقروء
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">إغلاق</span>
          </Button>
        </div>
      </div>

      <div className="overflow-y-auto flex-1">
        {notifications.length > 0 ? (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {notifications.map((notification) => {
              const NotificationIcon = notificationTypes[notification.type].icon
              return (
                <li
                  key={notification.id}
                  className={cn(
                    "p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors",
                    !notification.read && "bg-blue-50/50 dark:bg-blue-900/10",
                  )}
                >
                  <div className="flex gap-3">
                    <div
                      className={cn(
                        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                        notificationTypes[notification.type].bgClass,
                      )}
                    >
                      <NotificationIcon className={cn("h-5 w-5", notificationTypes[notification.type].iconClass)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p
                          className={cn(
                            "text-sm font-medium text-gray-900 dark:text-gray-100",
                            !notification.read && "font-semibold",
                          )}
                        >
                          {notification.title}
                        </p>
                        <div className="flex items-center gap-1">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span className="sr-only">تعليم كمقروء</span>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="sr-only">حذف الإشعار</span>
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-3 mb-4">
              <Bell className="h-6 w-6 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-gray-700 dark:text-gray-300 font-medium mb-1">لا توجد إشعارات</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">ستظهر هنا جميع الإشعارات والتحديثات الخاصة بك</p>
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-100 dark:border-gray-800">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 border-gray-200 dark:border-gray-700"
            onClick={clearAll}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            مسح جميع الإشعارات
          </Button>
        </div>
      )}
    </div>
  )
}

export default NotificationsPanel

