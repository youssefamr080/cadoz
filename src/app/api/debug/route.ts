import { type NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import { logSearchQuery, logSearchResults } from "@/lib/debug-utils"

// MongoDB connection
const uri = process.env.MONGODB_URI!
const dbName = process.env.MONGODB_DB!

export async function POST(request: NextRequest) {
  const client = new MongoClient(uri)

  try {
    const { query } = await request.json()

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    await client.connect()
    const database = client.db(dbName)
    const giftInspirations = database.collection("gift_inspirations")

    logSearchQuery(query, "debug-api")

    // Execute the query
    const results = await giftInspirations.find(query).limit(10).toArray()

    logSearchResults(results, "debug-api")

    return NextResponse.json({
      count: results.length,
      results: results.map((gift) => ({
        id: gift._id,
        name: gift.name,
        category: gift.category,
        occasions: gift.occasions,
        tags: gift.tags,
      })),
    })
  } catch (error) {
    console.error("Debug API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  } finally {
    await client.close()
  }
}
