import { type NextRequest, NextResponse } from "next/server"
import { MongoClient, ObjectId, type WithId, type Document } from "mongodb"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { SYSTEM_PROMPT } from "@/lib/prompts"
import { expandSearchTerms, buildSearchQuery, buildFallbackQueries, type SearchParams } from "@/lib/search-utils"
import { logSearchQuery, logSearchResults } from "@/lib/debug-utils"

// Constants
const SESSION_EXPIRY_HOURS = 24
const MAX_MESSAGES = 10

// MongoDB connection
const uri = process.env.MONGODB_URI!
const dbName = process.env.MONGODB_DB!
const client = new MongoClient(uri)

// Types
type Message = {
  role: "user" | "assistant" | "system"
  content: string
}

type Session = {
  messages: Message[]
  lastUpdated: Date
}

interface ApiError extends Error {
  statusCode?: number
}

interface Gift extends Document {
  _id: ObjectId
  name: string
  box?: string
  bag?: string
  Mainproducts?: string[]
  products?: Array<string | { id: string; quantity: number }>
  decorations?: string[]
}

interface Database {
  collection: (name: string) => {
    find: (query: object) => {
      limit: (n: number) => {
        toArray: () => Promise<WithId<Gift>[]>
      }
    }
    findOne: (query: object) => Promise<WithId<Gift> | null>
  }
}

// Session management
const sessions: Record<string, Session> = {}

const cleanupSessions = () => {
  const now = new Date()
  Object.keys(sessions).forEach((sessionId) => {
    const lastUpdated = sessions[sessionId].lastUpdated
    const hoursSinceLastUpdate = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60)
    if (hoursSinceLastUpdate > SESSION_EXPIRY_HOURS) {
      delete sessions[sessionId]
    }
  })
}

const createSession = (sessionId: string): Session => {
  cleanupSessions()
  const session: Session = {
    messages: [],
    lastUpdated: new Date(),
  }
  sessions[sessionId] = session
  return session
}

const updateSession = (session: Session) => {
  session.lastUpdated = new Date()
  if (session.messages.length > MAX_MESSAGES) {
    session.messages = session.messages.slice(-MAX_MESSAGES)
  }
}

// Database utilities
const getDatabase = async () => {
  try {
    await client.connect()
    return client.db(dbName)
  } catch (error) {
    console.error("Database connection error:", error)
    throw new Error("Failed to connect to database")
  }
}

function safeObjectId(id: string) {
  try {
    return new ObjectId(id)
  } catch (error) {
    console.error(`Invalid ObjectId: ${id}`, error)
    return null
  }
}

// Error handling
const handleError = (error: unknown): ApiError => {
  if (error instanceof Error) {
    return { ...error, statusCode: 500 }
  }
  return new Error("An unexpected error occurred")
}

// Request validation
const validateRequest = (message: string, sessionId: string) => {
  if (!message?.trim()) {
    throw new Error("Message is required")
  }
  if (!sessionId?.trim()) {
    throw new Error("Session ID is required")
  }
}

// Search parameters extraction
const extractSearchParams = (response: string): SearchParams => {
  const searchParams: SearchParams = {
    category: "",
    occasions: [],
    tags: [],
  }

  const searchParamsMatch = response.match(/---SEARCH_PARAMS---([\s\S]*?)---END_SEARCH_PARAMS---/)
  if (!searchParamsMatch?.[1]) return searchParams

  const paramsText = searchParamsMatch[1].trim()
  
  const extractArray = (text: string, key: string) => {
    const match = text.match(new RegExp(`${key}:\\s*\\[(.*?)\\]`))
    return match?.[1]?.split(",").map(item => item.trim()) || []
  }

  searchParams.category = extractArray(paramsText, "category")[0] || ""
  searchParams.occasions = extractArray(paramsText, "occasions")
  searchParams.tags = extractArray(paramsText, "tags")

  return searchParams
}

// Type guards
const isProductWithQuantity = (product: string | { id: string; quantity: number }): product is { id: string; quantity: number } => {
  return typeof product === 'object' && 'id' in product
}

// Gift details fetching
const fetchMainProducts = async (database: Database, gift: Gift) => {
  const mainProductIds = (gift.Mainproducts || [])
    .map((id: string) => safeObjectId(id))
    .filter(Boolean)

  return mainProductIds.length > 0
    ? await database.collection("gift_products").find({ _id: { $in: mainProductIds } }).limit(mainProductIds.length).toArray()
    : []
}

const fetchProductDetails = async (database: Database, gift: Gift) => {
  let productDetails: WithId<Gift>[] = []
  let productQuantities: { quantity: number }[] = []

  if (Array.isArray(gift.products) && gift.products.length > 0) {
    if (typeof gift.products[0] === "string") {
      const productIds = gift.products.map((id: string) => safeObjectId(id)).filter(Boolean)
      productDetails = productIds.length > 0
        ? await database.collection("gift_products").find({ _id: { $in: productIds } }).limit(productIds.length).toArray()
        : []
      productQuantities = productDetails.map(() => ({ quantity: 1 }))
    } else if (gift.products[0] && isProductWithQuantity(gift.products[0])) {
      const productIds = gift.products
        .filter(isProductWithQuantity)
        .map((product) => safeObjectId(product.id))
        .filter(Boolean)
      productDetails = productIds.length > 0
        ? await database.collection("gift_products").find({ _id: { $in: productIds } }).limit(productIds.length).toArray()
        : []
      productQuantities = gift.products.filter(isProductWithQuantity)
    }
  }

  return { productDetails, productQuantities }
}

const fetchDecorationDetails = async (database: Database, gift: Gift) => {
  if (!Array.isArray(gift.decorations)) return []

  const decorationIds = gift.decorations
    .map((id: string) => safeObjectId(id))
    .filter(Boolean)

  return decorationIds.length > 0
    ? await database.collection("gift_decorations").find({ _id: { $in: decorationIds } }).limit(decorationIds.length).toArray()
    : []
}

const fetchGiftDetails = async (database: Database, gift: Gift) => {
  const [boxDetails, bagDetails] = await Promise.all([
    gift.box ? database.collection("gift_boxes").findOne({ _id: safeObjectId(gift.box) }) : null,
    gift.bag ? database.collection("gift_bags").findOne({ _id: safeObjectId(gift.bag) }) : null
  ])

  const mainProducts = await fetchMainProducts(database, gift)
  const { productDetails, productQuantities } = await fetchProductDetails(database, gift)
  const decorationDetails = await fetchDecorationDetails(database, gift)

  return {
    ...gift,
    boxDetails,
    bagDetails,
    mainProducts,
    productDetails,
    productQuantities,
    decorationDetails,
  }
}

// Main API handler
export async function POST(request: NextRequest) {
  try {
    const { message, sessionId } = await request.json()
    validateRequest(message, sessionId)

    // Initialize or get session
    if (!sessions[sessionId]) {
      sessions[sessionId] = createSession(sessionId)
    }
    const session = sessions[sessionId]
    updateSession(session)

    // Add user message to history
    session.messages.push({ role: "user", content: message })

    // Generate AI response
    const conversationMessages: Message[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...session.messages
    ]

    const { text: groqResponse } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      messages: conversationMessages,
    })

    // Extract and process search parameters
    const searchParams = extractSearchParams(groqResponse)
    const cleanResponse = groqResponse.replace(/---SEARCH_PARAMS---[\s\S]*?---END_SEARCH_PARAMS---/, "").trim()
    session.messages.push({ role: "assistant", content: cleanResponse })

    // Search for gifts
    const database = await getDatabase()
    const giftInspirations = database.collection("gift_inspirations")

    const expandedParams = expandSearchTerms(searchParams)
    const searchQuery = buildSearchQuery(expandedParams, message)
    logSearchQuery(searchQuery, "api-route")

    let gifts = await giftInspirations.find(searchQuery).limit(3).toArray() as WithId<Gift>[]
    logSearchResults(gifts, "api-route-primary")

    // Try fallback queries if no results found
    if (gifts.length === 0) {
      const fallbackQueries = buildFallbackQueries(message)
      for (const fallbackQuery of fallbackQueries) {
        if (gifts.length >= 3) break

        logSearchQuery(fallbackQuery, "api-route-fallback")
        const fallbackGifts = await giftInspirations
          .find(fallbackQuery)
          .limit(3 - gifts.length)
          .toArray() as WithId<Gift>[]

        logSearchResults(fallbackGifts, "api-route-fallback")
        if (fallbackGifts.length > 0) {
          gifts = [...gifts, ...fallbackGifts]
        }
      }
    }

    // Enrich gifts with details
    const giftsWithDetails = await Promise.all(
      gifts.map(gift => fetchGiftDetails(database, gift as Gift))
    )

    return NextResponse.json({
      message: cleanResponse,
      gifts: giftsWithDetails,
    })
  } catch (error) {
    const apiError = handleError(error)
    console.error("Error processing request:", error)
    return NextResponse.json(
      { error: apiError.message },
      { status: apiError.statusCode || 500 }
    )
  } finally {
    await client.close()
  }
}
