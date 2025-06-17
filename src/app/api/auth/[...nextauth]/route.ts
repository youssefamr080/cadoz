import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth.config"

const handler = NextAuth({
  ...authOptions,
  session: {
    ...authOptions.session,
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    ...authOptions.callbacks,
    async session({ session, token }) {
      try {
        if (session.user) {
          session.user.id = token.id
          session.user.name = token.name
          session.user.email = token.email
          session.user.phone = token.phone
          session.user.role = token.role
          session.user.image = token.image
          session.user.needsPhoneUpdate = token.needsPhoneUpdate
        }
        return session
      } catch (error) {
        console.error("[AUTH] Session callback error:", error)
        return session
      }
    }
  }
})

export { handler as GET, handler as POST }

