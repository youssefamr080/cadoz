"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface LogoutConfirmationDialogProps {
  isOpen: boolean
  isLoading: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function LogoutConfirmationDialog({
  isOpen,
  isLoading,
  onConfirm,
  onCancel,
}: LogoutConfirmationDialogProps) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>تأكيد تسجيل الخروج</AlertDialogTitle>
          <AlertDialogDescription>
            هل أنت متأكد من رغبتك في تسجيل الخروج؟
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="rtl">
          <AlertDialogCancel onClick={onCancel} disabled={isLoading}>إلغاء</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "جاري تسجيل الخروج..." : "تسجيل الخروج"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
