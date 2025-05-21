import { MongoQuery } from './search-utils'
import { Document } from 'mongodb'

interface SearchResult extends Document {
  _id: string
  name: string
  category: string
  occasions: string[]
  tags: string[]
}

export function logSearchQuery(query: MongoQuery, source: string) {
  console.log(`[${source}] Search query:`, JSON.stringify(query, null, 2))
}

export function logSearchResults(results: Document[], source: string) {
  console.log(`[${source}] Found ${results.length} results`)
  if (results.length > 0) {
    const firstResult = results[0] as SearchResult
    console.log(`[${source}] First result:`, {
      id: firstResult._id,
      name: firstResult.name,
      category: firstResult.category,
      occasions: firstResult.occasions,
      tags: firstResult.tags,
    })
  } else {
    console.log(`[${source}] No results found`)
  }
}
  