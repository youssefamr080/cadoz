"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Gift {
  id: string;
  name: string;
  category: string;
  occasions?: string[];
  tags?: string[];
}

export default function DebugPage() {
  const [query, setQuery] = useState<string>('{"occasions": {"$in": ["عيد الحب"]}}')
  const [results, setResults] = useState<Gift[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const parsedQuery = JSON.parse(query)

      const response = await fetch("/api/debug", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: parsedQuery }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Unknown error")
      }

      setResults(data.results)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setError(errorMessage)
      setResults(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Database Query Debugger</h1>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label htmlFor="query" className="block mb-2 font-medium">
            MongoDB Query (JSON format):
          </label>
          <Textarea
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={5}
            className="w-full font-mono"
          />
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Running Query..." : "Run Query"}
        </Button>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {results && (
        <div>
          <h2 className="text-xl font-bold mb-4">Results ({results.length})</h2>

          {results.length === 0 ? (
            <p>No results found</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((gift, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{gift.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p>
                        <strong>ID:</strong> {gift.id}
                      </p>
                      <p>
                        <strong>Category:</strong> {gift.category}
                      </p>
                      <p>
                        <strong>Occasions:</strong> {gift.occasions?.join(", ") || "None"}
                      </p>
                      <p>
                        <strong>Tags:</strong> {gift.tags?.join(", ") || "None"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
