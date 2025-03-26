import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"
import { createClient } from '@supabase/supabase-js'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, ResponsiveContainer } from 'recharts'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

interface InvestorProfile {
  id: string
  name: string
  email: string
  phone: string
  subscription_status: 'active' | 'inactive'
  subscription_tier: 'basic' | 'premium' | 'enterprise'
  max_deal_value: number
  preferred_property_types: string[]
  preferred_locations: string[]
}

interface BidHistory {
  id: string
  property_id: string
  property_address: string
  property_type: string
  bid_amount: number
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  notes: string
  created_at: string
}

interface BidStats {
  totalBids: number
  pendingBids: number
  approvedBids: number
  rejectedBids: number
  expiredBids: number
  successRate: number
  averageBidAmount: number
  totalBidAmount: number
  highestBidAmount: number
  lowestBidAmount: number
}

interface BidTrend {
  month: string
  averageBid: number
  totalBids: number
}

interface BidComparison {
  propertyType: string
  averageBid: number
  successRate: number
  count: number
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<InvestorProfile | null>(null)
  const [bids, setBids] = useState<BidHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [propertyType, setPropertyType] = useState('')
  const [location, setLocation] = useState('')
  const [bidStats, setBidStats] = useState<BidStats | null>(null)
  const [withdrawing, setWithdrawing] = useState(false)
  const [bidTrends, setBidTrends] = useState<BidTrend[]>([])
  const [bidComparisons, setBidComparisons] = useState<BidComparison[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('investors')
          .select('*')
          .single()

        if (profileError) throw profileError
        setProfile(profileData)

        // Fetch bid history with property details
        const { data: bidData, error: bidError } = await supabase
          .from('deal_claims')
          .select(`
            *,
            properties:property_id (
              address,
              property_type
            )
          `)
          .order('created_at', { ascending: false })

        if (bidError) throw bidError
        setBids(bidData.map(bid => ({
          id: bid.id,
          property_id: bid.property_id,
          property_address: bid.properties.address,
          property_type: bid.properties.property_type,
          bid_amount: bid.bid_amount,
          status: bid.status,
          notes: bid.notes,
          created_at: bid.created_at
        })))

        // Calculate bid statistics
        if (bidData && bidData.length > 0) {
          const stats: BidStats = {
            totalBids: bidData.length,
            pendingBids: bidData.filter(b => b.status === 'pending').length,
            approvedBids: bidData.filter(b => b.status === 'approved').length,
            rejectedBids: bidData.filter(b => b.status === 'rejected').length,
            expiredBids: bidData.filter(b => b.status === 'expired').length,
            successRate: (bidData.filter(b => b.status === 'approved').length / bidData.length) * 100,
            averageBidAmount: bidData.reduce((acc, b) => acc + b.bid_amount, 0) / bidData.length,
            totalBidAmount: bidData.reduce((acc, b) => acc + b.bid_amount, 0),
            highestBidAmount: Math.max(...bidData.map(b => b.bid_amount)),
            lowestBidAmount: Math.min(...bidData.map(b => b.bid_amount))
          }
          setBidStats(stats)
        }

        // Calculate bid trends
        if (bidData && bidData.length > 0) {
          const trends = calculateBidTrends(bidData)
          setBidTrends(trends)

          // Calculate bid comparisons by property type
          const comparisons = calculateBidComparisons(bidData)
          setBidComparisons(comparisons)
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const calculateBidTrends = (bids: any[]) => {
    const monthlyData: { [key: string]: { total: number, count: number } } = {}
    
    bids.forEach(bid => {
      const date = new Date(bid.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { total: 0, count: 0 }
      }
      
      monthlyData[monthKey].total += bid.bid_amount
      monthlyData[monthKey].count++
    })

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        averageBid: data.total / data.count,
        totalBids: data.count
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6) // Last 6 months
  }

  const calculateBidComparisons = (bids: any[]) => {
    const propertyTypeData: { [key: string]: { total: number, successful: number, count: number } } = {}
    
    bids.forEach(bid => {
      const type = bid.properties.property_type
      
      if (!propertyTypeData[type]) {
        propertyTypeData[type] = { total: 0, successful: 0, count: 0 }
      }
      
      propertyTypeData[type].total += bid.bid_amount
      propertyTypeData[type].count++
      if (bid.status === 'approved') {
        propertyTypeData[type].successful++
      }
    })

    return Object.entries(propertyTypeData).map(([type, data]) => ({
      propertyType: type,
      averageBid: data.total / data.count,
      successRate: (data.successful / data.count) * 100,
      count: data.count
    }))
  }

  const handleUpdateProfile = async () => {
    if (!profile) return

    setIsSaving(true)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/investors?id=eq.${profile.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          },
          body: JSON.stringify(profile),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const addPropertyType = () => {
    if (!propertyType || !profile) return
    setProfile({
      ...profile,
      preferred_property_types: [...profile.preferred_property_types, propertyType],
    })
    setPropertyType('')
  }

  const removePropertyType = (type: string) => {
    if (!profile) return
    setProfile({
      ...profile,
      preferred_property_types: profile.preferred_property_types.filter(t => t !== type),
    })
  }

  const addLocation = () => {
    if (!location || !profile) return
    setProfile({
      ...profile,
      preferred_locations: [...profile.preferred_locations, location],
    })
    setLocation('')
  }

  const removeLocation = (loc: string) => {
    if (!profile) return
    setProfile({
      ...profile,
      preferred_locations: profile.preferred_locations.filter(l => l !== loc),
    })
  }

  const getBidStatusColor = (status: BidHistory['status']) => {
    switch (status) {
      case 'approved':
        return 'text-green-600'
      case 'rejected':
        return 'text-red-600'
      case 'expired':
        return 'text-gray-600'
      default:
        return 'text-yellow-600'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleWithdrawBid = async (bidId: string) => {
    setWithdrawing(true)
    try {
      const { error } = await supabase
        .from('deal_claims')
        .update({ status: 'withdrawn' })
        .eq('id', bidId)

      if (error) throw error

      // Update local state
      setBids(bids.map(bid =>
        bid.id === bidId ? { ...bid, status: 'withdrawn' as any } : bid
      ))

      // Update statistics
      if (bidStats) {
        setBidStats({
          ...bidStats,
          pendingBids: bidStats.pendingBids - 1
        })
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to withdraw bid')
    } finally {
      setWithdrawing(false)
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

  if (!profile) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>No profile found. Please contact support.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Investor Profile</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your contact details and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Investment Preferences</CardTitle>
            <CardDescription>Set your deal preferences and limits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="maxDealValue">Maximum Deal Value</Label>
              <Input
                id="maxDealValue"
                type="number"
                value={profile.max_deal_value}
                onChange={(e) => setProfile({ ...profile, max_deal_value: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="subscriptionTier">Subscription Tier</Label>
              <Select
                value={profile.subscription_tier}
                onValueChange={(value) => setProfile({ ...profile, subscription_tier: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Property Preferences</CardTitle>
            <CardDescription>Manage your preferred property types and locations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Property Types</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  placeholder="Add property type"
                />
                <Button onClick={addPropertyType}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.preferred_property_types.map((type) => (
                  <div key={type} className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2">
                    <span>{type}</span>
                    <button onClick={() => removePropertyType(type)} className="text-red-500">×</button>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label>Preferred Locations</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Add location"
                />
                <Button onClick={addLocation}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.preferred_locations.map((loc) => (
                  <div key={loc} className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2">
                    <span>{loc}</span>
                    <button onClick={() => removeLocation(loc)} className="text-red-500">×</button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bid Statistics</CardTitle>
            <CardDescription>Overview of your bidding activity</CardDescription>
          </CardHeader>
          <CardContent>
            {bidStats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Bid Status</h4>
                  <div className="space-y-1 text-sm">
                    <p>Total Bids: {bidStats.totalBids}</p>
                    <p>Pending: {bidStats.pendingBids}</p>
                    <p>Approved: {bidStats.approvedBids}</p>
                    <p>Rejected: {bidStats.rejectedBids}</p>
                    <p>Expired: {bidStats.expiredBids}</p>
                  </div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Success Metrics</h4>
                  <div className="space-y-1 text-sm">
                    <p>Success Rate: {bidStats.successRate.toFixed(1)}%</p>
                    <p>Average Bid: {formatCurrency(bidStats.averageBidAmount)}</p>
                    <p>Total Amount: {formatCurrency(bidStats.totalBidAmount)}</p>
                  </div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Bid Range</h4>
                  <div className="space-y-1 text-sm">
                    <p>Highest Bid: {formatCurrency(bidStats.highestBidAmount)}</p>
                    <p>Lowest Bid: {formatCurrency(bidStats.lowestBidAmount)}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">No bid statistics available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bid Analytics</CardTitle>
            <CardDescription>Visualize your bidding trends and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-4">Bid Trends (Last 6 Months)</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={bidTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="averageBid"
                      name="Average Bid Amount"
                      stroke="#8884d8"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="totalBids"
                      name="Number of Bids"
                      stroke="#82ca9d"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h4 className="font-medium mb-4">Property Type Performance</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={bidComparisons}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="propertyType" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="averageBid"
                      name="Average Bid Amount"
                      fill="#8884d8"
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="successRate"
                      name="Success Rate (%)"
                      fill="#82ca9d"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bidComparisons.map((comparison) => (
                  <div
                    key={comparison.propertyType}
                    className="p-4 bg-muted rounded-lg"
                  >
                    <h5 className="font-medium mb-2">{comparison.propertyType}</h5>
                    <div className="space-y-1 text-sm">
                      <p>Average Bid: {formatCurrency(comparison.averageBid)}</p>
                      <p>Success Rate: {comparison.successRate.toFixed(1)}%</p>
                      <p>Total Bids: {comparison.count}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bid History</CardTitle>
            <CardDescription>View your past and current property bids</CardDescription>
          </CardHeader>
          <CardContent>
            {bids.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No bids yet</p>
            ) : (
              <div className="space-y-4">
                {bids.map((bid) => (
                  <div
                    key={bid.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{bid.property_address}</h4>
                        <p className="text-sm text-muted-foreground">{bid.property_type}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${getBidStatusColor(bid.status)}`}>
                          {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                        </span>
                        {bid.status === 'pending' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500 hover:text-red-600"
                                disabled={withdrawing}
                              >
                                {withdrawing ? 'Withdrawing...' : 'Withdraw'}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Withdraw Bid</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to withdraw your bid for this property?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleWithdrawBid(bid.id)}
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  Withdraw Bid
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <p>Bid Amount: <span className="font-medium">{formatCurrency(bid.bid_amount)}</span></p>
                      <p className="text-muted-foreground">
                        {new Date(bid.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {bid.notes && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Notes: {bid.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleUpdateProfile} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  )
} 