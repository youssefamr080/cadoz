import React from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Image from "next/image"
import { User as UserIcon } from "lucide-react"

interface UserAvatarProps {
  src?: string | null
  name?: string | null
  user?: {
    name: string
    image?: string
  }
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-16 w-16",
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name,
  user,
  size = "md",
  className = "",
}) => {
  // استخدم user إذا توفر، وإلا src/name
  const avatarSrc = user?.image || src || undefined
  const avatarName = user?.name || name || "User"

  // الحروف الأولى من الاسم
  const initials = avatarName
    ? avatarName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : ""

  return (
    <Avatar className={`${sizeClasses[size]} ${className} bg-purple-100`}>
      {avatarSrc ? (
        <div className="relative h-full w-full">
          {/* استخدم next/image إذا كان src يبدأ بـ / أو http */}
          <Image
            src={avatarSrc}
            alt={avatarName}
            fill
            sizes="(max-width: 768px) 40px, 60px"
            className="object-cover"
          />
        </div>
      ) : (
        <AvatarFallback className="bg-purple-100 text-purple-700 font-medium">
          {initials || <UserIcon className="h-4 w-4" />}
        </AvatarFallback>
      )}
    </Avatar>
  )
}

export default UserAvatar 