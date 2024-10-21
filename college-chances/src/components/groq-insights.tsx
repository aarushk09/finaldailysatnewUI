'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function GroqInsights() {
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      })
      const data = await res.json()
      setResponse(data.response)
    } catch (error) {
      console.error('Error:', error)
      setResponse('An error occurred while fetching insights.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>AI Insights</CardTitle>
        <CardDescription>Get AI-powered insights about college admissions factors</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
          <Input 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            placeholder="Ask about a college admissions factor"
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Asking AI...' : 'Ask AI'}
          </Button>
        </form>
        {response && (
          <div className="mt-4 p-4 bg-gray-100 rounded-md prose prose-sm max-w-none">
            <ReactMarkdown>{response}</ReactMarkdown>
          </div>
        )}
      </CardContent>
    </Card>
  )
}