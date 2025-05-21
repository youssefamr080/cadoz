import { groq } from "@ai-sdk/groq"

// Export the configured Groq model
export const groqModel = groq("llama-3.1-8b-instant")

// You can add more models as needed
export const groqModels = {
  default: groq("llama-3.1-8b-instant"),
  fast: groq("llama-3.1-8b-instant"),
  advanced: groq("llama-3.3-70b-versatile"),
}
