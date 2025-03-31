import type React from "react"
import { Avatar, AvatarFallback } from "../../components/ui/avatar"
import Image from "next/image"

interface UserAvatarProps {
  user: {
    name: string
    image?: string
  }
  size?: "sm" | "md" | "lg"
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user, size = "md" }) => {
  // Determinar el tamaño del avatar
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-16 w-16",
  }

  // Obtener la primera letra del nombre del usuario
  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "U"
  }

  return (
    <Avatar className={`${sizeClasses[size]} bg-purple-100`}>
      {user.image ? (
        <div className="relative h-full w-full">
          <Image src={user.image || "/placeholder.svg"} alt={user.name || "User"} fill className="object-cover" />
        </div>
      ) : (
        <AvatarFallback className="bg-purple-100 text-purple-700 font-medium">{getInitial(user.name)}</AvatarFallback>
      )}
    </Avatar>
  )
}

export default UserAvatar

