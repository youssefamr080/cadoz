import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "lucide-react"

interface UserAvatarProps {
  src?: string | null
  name?: string | null
  className?: string
}

export function UserAvatar({ src, name, className }: UserAvatarProps) {
  // الحصول على الحرف الأول من اسم المستخدم
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : ""

  return (
    <Avatar className={className}>
      <AvatarImage src={src || ""} alt={name || "User"} />
      <AvatarFallback>{initials || <User className="h-4 w-4" />}</AvatarFallback>
    </Avatar>
  )
}

