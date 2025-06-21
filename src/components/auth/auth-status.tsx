"use client"

import { useState } from "react"
import { useAuth } from "@/providers/AuthProvider"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, LogOut, Settings, ShoppingBag } from "lucide-react"
import { LogoutConfirmationDialog } from "./logout-confirmation-dialog"

export default function AuthStatus() {
  const { user, logout, loading: authLoading } = useAuth()
  const router = useRouter()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogoutClick = () => {
    setShowLogoutDialog(true)
  }

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      router.push("/")
    } finally {
      setIsLoggingOut(false)
      setShowLogoutDialog(false)
    }
  }

  if (authLoading) {
    return <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
  }

  if (!user) {
    return (
      <Button variant="outline" onClick={() => router.push("/login")}>
        تسجيل الدخول
      </Button>
    )
  }

  // الحصول على الحرف الأول من اسم المستخدم
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : "U"

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.image || ""} alt={user.name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.phone || user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/profile")}>
            <User className="ml-2 h-4 w-4" />
            <span>الملف الشخصي</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/orders")}>
            <ShoppingBag className="ml-2 h-4 w-4" />
            <span>طلباتي</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/settings")}>
            <Settings className="ml-2 h-4 w-4" />
            <span>الإعدادات</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogoutClick} disabled={isLoggingOut}>
            <LogOut className="ml-2 h-4 w-4" />
            <span>
              {isLoggingOut ? "جاري تسجيل الخروج..." : "تسجيل الخروج"}
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <LogoutConfirmationDialog
        isOpen={showLogoutDialog}
        isLoading={isLoggingOut}
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutDialog(false)}
      />
    </>
  )
}

