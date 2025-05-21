"use server"

import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { revalidatePath } from "next/cache"
import { MongoClient, ObjectId } from "mongodb"
import type { Message } from "@/lib/types"
import { SYSTEM_PROMPT } from "@/lib/prompts"
import { expandSearchTerms, buildSearchQuery, buildFallbackQueries, type SearchParams } from "@/lib/search-utils"
import { logSearchQuery, logSearchResults } from "@/lib/debug-utils"

// MongoDB connection
const uri = process.env.MONGODB_URI!
const dbName = process.env.MONGODB_DB!
const client = new MongoClient(uri)

// Enhanced session storage with context tracking
interface EnhancedSession {
  messages: Message[]
  lastUpdated: Date
  context: {
    recipientGender?: string
    recipientAge?: number
    occasion?: string
    budget?: number
    interests?: string[]
    previousGifts?: string[]
  }
}

const sessions: Record<string, EnhancedSession> = {}

// Helper function to safely convert string to ObjectId
function safeObjectId(id: string) {
  try {
    return new ObjectId(id)
  } catch (error) {
    console.error(`Invalid ObjectId: ${id}`, error)
    return null
  }
}

interface BoxDetails {
  _id: ObjectId
  name: string
  description: string
  image: string
  price: number
}

interface BagDetails {
  _id: ObjectId
  name: string
  description: string
  image: string
  price: number
}

interface ProductDetails {
  _id: ObjectId
  name: string
  description: string
  price: number
  image: string
  category: string
}

interface ProductQuantity {
  quantity: number
}

interface DecorationDetails {
  _id: ObjectId
  name: string
  description: string
  image: string
  price: number
}

interface GiftDetails {
  _id: ObjectId
  name: string
  boxDetails: BoxDetails | null
  bagDetails: BagDetails | null
  mainProducts: ProductDetails[]
  productDetails: ProductDetails[]
  productQuantities: ProductQuantity[]
  decorationDetails: DecorationDetails[]
}

// Helper function to convert MongoDB objects to plain objects
function convertToPlainObject<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (obj instanceof ObjectId) {
    return obj.toString() as unknown as T;
  }

  if (obj instanceof Date) {
    return obj.toISOString() as unknown as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => convertToPlainObject(item)) as unknown as T;
  }

  if (typeof obj === 'object') {
    const plainObj = {} as Record<string, unknown>;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        plainObj[key] = convertToPlainObject((obj as Record<string, unknown>)[key]);
      }
    }
    return plainObj as T;
  }

  return obj;
}

export async function processMessage(sessionId: string, message: string) {
  try {
    // Initialize or get session with enhanced context
    if (!sessions[sessionId]) {
      sessions[sessionId] = {
        messages: [],
        lastUpdated: new Date(),
        context: {}
      }
    }

    // Update session
    const session = sessions[sessionId]
    session.lastUpdated = new Date()

    // Add user message to history
    session.messages.push({ role: "user", content: message })

    // Keep only the last 10 messages (pairs of user + assistant)
    if (session.messages.length > 10) {
      session.messages = session.messages.slice(session.messages.length - 10)
    }

    // Update context based on message
    updateSessionContext(session, message)

    // Prepare conversation history for Groq with context
    const conversationMessages: Message[] = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "system", content: `Context: ${JSON.stringify(session.context)}` },
      ...session.messages
    ]

    // Generate response with Groq using AI SDK
    const { text: groqResponse } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      messages: conversationMessages,
    })

    // Extract search parameters
    const searchParams: SearchParams = {
      category: "",
      occasions: [],
      tags: [],
    }

    const searchParamsMatch = groqResponse.match(/---SEARCH_PARAMS---([\s\S]*?)---END_SEARCH_PARAMS---/)

    if (searchParamsMatch && searchParamsMatch[1]) {
      const paramsText = searchParamsMatch[1].trim()

      const categoryMatch = paramsText.match(/category:\s*\[(.*?)\]/)
      if (categoryMatch && categoryMatch[1]) {
        searchParams.category = categoryMatch[1].trim()
      }

      const occasionsMatch = paramsText.match(/occasions:\s*\[(.*?)\]/)
      if (occasionsMatch && occasionsMatch[1]) {
        searchParams.occasions = occasionsMatch[1].split(",").map((item) => item.trim())
      }

      const tagsMatch = paramsText.match(/tags:\s*\[(.*?)\]/)
      if (tagsMatch && tagsMatch[1]) {
        searchParams.tags = tagsMatch[1].split(",").map((item) => item.trim())
      }
    }

    // Clean response for user (remove search params)
    const cleanResponse = groqResponse.replace(/---SEARCH_PARAMS---[\s\S]*?---END_SEARCH_PARAMS---/, "").trim()

    // Add assistant message to history
    session.messages.push({ role: "assistant", content: cleanResponse })

    // Connect to MongoDB
    await client.connect()
    const database = client.db(dbName)
    const giftInspirations = database.collection("gift_inspirations")

    // Expand search terms and build query with context
    const expandedParams = expandSearchTerms(searchParams)
    const searchQuery = buildSearchQuery(expandedParams, message)

    // Add context-based filters to search query
    if (session.context.budget) {
      searchQuery.price = { $lte: session.context.budget * 1.2 }
    }
    if (session.context.recipientAge && searchParams.category === "kids") {
      searchQuery.ageRange = {
        $gte: Math.max(0, session.context.recipientAge - 2),
        $lte: session.context.recipientAge + 2
      }
    }
    if (session.context.interests && session.context.interests.length > 0) {
      searchQuery.tags = {
        ...searchQuery.tags,
        $in: [...(searchQuery.tags?.$in || []), ...session.context.interests]
      }
    }

    // Log the search query for debugging
    logSearchQuery(searchQuery, "server-action")

    // Find matching gifts
    const gifts = await giftInspirations.find(searchQuery).limit(3).toArray()

    // Log the search results
    logSearchResults(gifts, "server-action-primary")

    // If no gifts found, try fallback queries
    let giftsWithFallback = [...gifts]
    if (gifts.length === 0) {
      const fallbackQueries = buildFallbackQueries(message)

      for (const fallbackQuery of fallbackQueries) {
        if (giftsWithFallback.length >= 3) break

        logSearchQuery(fallbackQuery, "server-action-fallback")

        const fallbackGifts = await giftInspirations
          .find(fallbackQuery)
          .limit(3 - giftsWithFallback.length)
          .toArray()

        logSearchResults(fallbackGifts, "server-action-fallback")

        if (fallbackGifts.length > 0) {
          giftsWithFallback = [...giftsWithFallback, ...fallbackGifts]
        }
      }
    }

    // Get all collections needed for gift details
    const productsCollection = database.collection("gift_products")
    const boxesCollection = database.collection("gift_boxes")
    const bagsCollection = database.collection("gift_bags")
    const decorationsCollection = database.collection("gift_decorations")

    const giftsWithDetails = await Promise.all(
      giftsWithFallback.map(async (gift) => {
        // Get box details if available
        let boxDetails = null
        if (gift.box) {
          try {
            boxDetails = await boxesCollection.findOne({ _id: safeObjectId(gift.box) })
          } catch (error) {
            console.error("Error fetching box details:", error)
          }
        }

        // Get bag details if available
        let bagDetails = null
        if (gift.bag) {
          try {
            bagDetails = await bagsCollection.findOne({ _id: safeObjectId(gift.bag) })
          } catch (error) {
            console.error("Error fetching bag details:", error)
          }
        }

        // Get main products - IMPORTANT: These are in the products collection
        const mainProductIds = (gift.Mainproducts || []).map((id: string) => safeObjectId(id)).filter(Boolean)

        const mainProducts =
          mainProductIds.length > 0 ? await productsCollection.find({ _id: { $in: mainProductIds } }).toArray() : []

        // Handle products based on structure (array of objects with id and quantity OR array of strings)
        let productDetails = []
        let productQuantities = []

        if (Array.isArray(gift.products)) {
          if (gift.products.length > 0) {
            if (typeof gift.products[0] === "string") {
              // Case: products is array of strings (product IDs)
              const productIds = gift.products.map((id: string) => safeObjectId(id)).filter(Boolean)

              productDetails =
                productIds.length > 0 ? await productsCollection.find({ _id: { $in: productIds } }).toArray() : []

              // Set default quantity of 1 for each product
              productQuantities = productDetails.map(() => ({ quantity: 1 }))
            } else if (gift.products[0].id) {
              // Case: products is array of objects with id and quantity
              const productIds = gift.products
                .map((product: { id: string }) => safeObjectId(product.id))
                .filter(Boolean)

              productDetails =
                productIds.length > 0 ? await productsCollection.find({ _id: { $in: productIds } }).toArray() : []

              // Store quantities
              productQuantities = gift.products
            }
          }
        }

        // Get decorations
        let decorationDetails = []
        if (Array.isArray(gift.decorations)) {
          const decorationIds = gift.decorations.map((id: string) => safeObjectId(id)).filter(Boolean)

          decorationDetails =
            decorationIds.length > 0 ? await decorationsCollection.find({ _id: { $in: decorationIds } }).toArray() : []
        }

        return {
          ...gift,
          boxDetails,
          bagDetails,
          mainProducts,
          productDetails,
          productQuantities,
          decorationDetails,
        }
      }),
    )

    // Update context with found gifts
    if (giftsWithDetails.length > 0) {
      session.context.previousGifts = (giftsWithDetails as GiftDetails[]).map(gift => gift.name)
    }

    revalidatePath("/smart-gift-finder")

    return {
      message: cleanResponse,
      gifts: giftsWithDetails.map(gift => convertToPlainObject(gift))
    }
  } catch (error) {
    console.error("Error processing message:", error)
    
    // Handle specific MongoDB errors
    if (error instanceof Error) {
      if (error.message.includes("MongoServerError")) {
        return {
          message: "عذراً، حدث خطأ في قاعدة البيانات. يرجى المحاولة مرة أخرى لاحقاً.",
          gifts: []
        }
      }
    }
    
    // Handle other errors
    return {
      message: "عذراً، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
      gifts: []
    }
  } finally {
    // Close MongoDB connection
    await client.close()
  }
}

// Helper function to update session context
function updateSessionContext(session: EnhancedSession, message: string) {
  // Extract gender
  const genderTerms = {
    "امرأة": ["بنت", "زوجة", "أم", "أخت", "صديقة"],
    "رجل": ["ولد", "زوج", "أب", "أخ", "صديق"],
    "طفل": ["طفل", "طفلة", "صغير", "صغيرة"]
  }

  Object.entries(genderTerms).forEach(([gender, terms]) => {
    if (terms.some(term => message.includes(term))) {
      session.context.recipientGender = gender
    }
  })

  // Extract age
  const ageMatch = message.match(/(\d+)\s*سنة|(\d+)\s*سنين/)
  if (ageMatch) {
    const age = parseInt(ageMatch[1] || ageMatch[2])
    if (age) {
      session.context.recipientAge = age
    }
  }

  // Extract budget
  const budgetMatch = message.match(/(\d+)\s*جنيها?|(\d+)\s*جنيه/)
  if (budgetMatch) {
    const budget = parseInt(budgetMatch[1] || budgetMatch[2])
    if (budget) {
      session.context.budget = budget
    }
  }

  // Extract interests
  const interestTerms = ["يحب", "بتحب", "مهتم", "مهتمة", "عايز", "عايزة"]
  const interests = message
    .split(/[.,،]/)
    .filter(phrase => interestTerms.some(term => phrase.includes(term)))
    .map(phrase => phrase.trim())
    .filter(Boolean)

  if (interests.length > 0) {
    session.context.interests = interests
  }

  // Extract occasion
  const occasionTerms = {
    "عيد ميلاد": ["عيد ميلاد", "بورثداي", "يوم ميلاد"],
    "عيد الحب": ["عيد الحب", "فالنتاين", "فالنتين"],
    "تخرج": ["تخرج", "جامعة", "كلية"],
    "خطوبة": ["خطوبة", "خاتم"],
    "زفاف": ["زفاف", "عرس", "عرائس"],
    "عيد أم": ["عيد أم", "ماما"],
    "عيد أب": ["عيد أب", "بابا"]
  }

  Object.entries(occasionTerms).forEach(([occasion, terms]) => {
    if (terms.some(term => message.includes(term))) {
      session.context.occasion = occasion
    }
  })
}
