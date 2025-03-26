'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const runTests = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/test')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Test failed')
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">API Test Page</h1>

      <Card>
        <CardHeader>
          <CardTitle>Backend API Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={runTests}
            disabled={loading}
            className="mb-4"
          >
            {loading ? 'Running Tests...' : 'Run Tests'}
          </Button>

          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded mb-4">
              {error}
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="p-4 bg-green-100 text-green-700 rounded">
                {result.message}
              </div>
              <pre className="bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
} 