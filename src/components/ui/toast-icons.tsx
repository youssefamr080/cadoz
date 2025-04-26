import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react"

export const ToastIcons = {
  success: (
    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
  ),
  error: (
    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
  ),
  warning: (
    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0" />
  ),
  info: (
    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
  ),
}