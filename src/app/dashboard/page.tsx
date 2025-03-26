import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useEffect, useState } from "react"

interface Deal {
  id: string
  property_address: string
  property_type: string
  owner_name: string
  offer_range: {
    min_offer: number
    max_offer: number
  }
  status: 'available' | 'claimed' | 'expired'
  expires_at: string
}

export default function DashboardPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [bidAmount, setBidAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/properties?status=eq.available&select=*,offer_range(*)`,
          {
            headers: {
              'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
            },
          }
        )

        if (!response.ok) {
          throw new Error('Failed to fetch deals')
        }

        const data = await response.json()
        setDeals(data)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch deals')
      } finally {
        setLoading(false)
      }
    }

    fetchDeals()
  }, [])

  const handleClaimDeal = async (dealId: string) => {
    try {
      const response = await fetch('/api/claim-deal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId: dealId,
          bidAmount: parseFloat(bidAmount),
          notes,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to claim deal')
      }

      // Update local state
      setDeals(deals.map(deal => 
        deal.id === dealId 
          ? { ...deal, status: 'claimed' }
          : deal
      ))
      setSelectedDeal(null)
      setBidAmount('')
      setNotes('')
    } catch (error) {
      console.error('Error claiming deal:', error)
      setError(error instanceof Error ? error.message : 'Failed to claim deal')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Available Deals</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {deals.map((deal) => (
          <Card key={deal.id} className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedDeal(deal)}>
            <CardHeader>
              <CardTitle>{deal.property_address}</CardTitle>
              <CardDescription>{deal.property_type}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>Owner: {deal.owner_name}</p>
                <p>Offer Range: ${deal.offer_range.min_offer.toLocaleString()} - ${deal.offer_range.max_offer.toLocaleString()}</p>
                <p>Status: {deal.status}</p>
                <p>Expires: {new Date(deal.expires_at).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedDeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Claim Deal</CardTitle>
              <CardDescription>{selectedDeal.property_address}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bidAmount">Bid Amount</Label>
                  <Input
                    id="bidAmount"
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder="Enter your bid amount"
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes about your bid"
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <Button variant="outline" onClick={() => setSelectedDeal(null)}>
                    Cancel
                  </Button>
                  <Button onClick={() => handleClaimDeal(selectedDeal.id)}>
                    Submit Claim
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 