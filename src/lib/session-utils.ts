import { v4 as uuidv4 } from "uuid"
import { ChatSession } from "./types"

export function getSessionId(): string {
  if (typeof window === "undefined") {
    return ""
  }

  let sessionId = localStorage.getItem("giftFinderSessionId")

  if (!sessionId) {
    sessionId = uuidv4()
    localStorage.setItem("giftFinderSessionId", sessionId)
  }

  return sessionId
}

export function clearSession(): void {
  if (typeof window === "undefined") {
    return
  }

  localStorage.removeItem("giftFinderSessionId")
  localStorage.removeItem("giftFinderConversation")
  localStorage.removeItem("giftFinderContext")
}

export function storeConversation(conversation: ChatSession): void {
  if (typeof window === "undefined") {
    return
  }

  localStorage.setItem("giftFinderConversation", JSON.stringify(conversation))
}

export function getStoredConversation(): ChatSession {
  if (typeof window === "undefined") {
    return { messages: [], lastUpdated: new Date() }
  }

  const stored = localStorage.getItem("giftFinderConversation")
  return stored ? JSON.parse(stored) : { messages: [], lastUpdated: new Date() }
}

export function updateSessionContext(context: Partial<ChatSession["context"]>): void {
  if (typeof window === "undefined") {
    return
  }

  const currentContext = getStoredConversation().context || {}
  const updatedContext = { ...currentContext, ...context }
  
  const conversation = getStoredConversation()
  conversation.context = updatedContext
  storeConversation(conversation)
}

export function getSessionContext(): ChatSession["context"] {
  if (typeof window === "undefined") {
    return undefined
  }

  return getStoredConversation().context
}
