'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Filter } from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { SalesData, apiClient } from '@/lib/api-client'

const COLORS = ['#8366d5', '#6db85f', '#d9a62d', '#d94545', '#5b7dd6']

export default function Analytics() {
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState('30days')

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setLoading(true)
        const response = await apiClient.getSalesData()
        if (response.success && response.data) {
          setSalesData(response.data)
        } else {
          setError(response.error || 'Failed to load sales data')
        }
      } catch (err) {
        setError('Failed to load sales data')
      } finally {
        setLoading(false)
      }
    }

    fetchSalesData()
  }, [dateRange])

  // Process data for charts
  const dailyTrend = salesData.reduce(
    (acc, item) => {
      const date = new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const existing = acc.find((d) => d.date === date)
      if (existing) {
        existing.revenue += item.revenue
        existing.orders += 1
      } else {
        acc.push({ date, revenue: item.revenue, orders: 1 })
      }
      return acc
    },
    [] as Array<{ date: string; revenue: number; orders: number }>
  )

  const categoryBreakdown = salesData.reduce(
    (acc, item) => {
      const existing = acc.find((c) => c.name === item.category)
      if (existing) {
        existing.value += item.revenue
      } else {
        acc.push({ name: item.category, value: item.revenue })
      }
      return acc
    },
    [] as Array<{ name: string; value: number }>
  )

  const topProducts = salesData
    .reduce(
      (acc, item) => {
        const existing = acc.find((p) => p.name === item.product)
        if (existing) {
          existing.quantity += item.quantity
          existing.revenue += item.revenue
        } else {
          acc.push({ name: item.product, quantity: item.quantity, revenue: item.revenue })
        }
        return acc
      },
      [] as Array<{ name: string; quantity: number; revenue: number }>
    )
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Sales Analytics</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-8 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-3 mb-8">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="1year">Last year</option>
          </select>
        </div>

        {/* Charts Grid */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-6 h-80 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Daily Revenue Trend */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Daily Revenue Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8366d5"
                    strokeWidth={2}
                    dot={{ fill: '#8366d5' }}
                    name="Revenue ($)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Category Breakdown and Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Pie Chart */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Revenue by Category</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name} $${(value / 1000).toFixed(1)}k`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Top Products Bar Chart */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Top 10 Products</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={topProducts}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 200 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis type="number" stroke="var(--muted-foreground)" />
                    <YAxis dataKey="name" type="category" stroke="var(--muted-foreground)" width={190} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '0.5rem',
                      }}
                      formatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <Bar dataKey="revenue" fill="#8366d5" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sales Data Table */}
            <div className="bg-card border border-border rounded-lg p-6 overflow-x-auto">
              <h2 className="text-lg font-semibold text-foreground mb-4">Recent Sales</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Product</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Category</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Quantity</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Revenue</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Region</th>
                  </tr>
                </thead>
                <tbody>
                  {salesData.slice(0, 15).map((sale) => (
                    <tr key={sale.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 text-foreground">
                        {new Date(sale.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-foreground">{sale.product}</td>
                      <td className="py-3 px-4 text-foreground">{sale.category}</td>
                      <td className="py-3 px-4 text-foreground">{sale.quantity}</td>
                      <td className="py-3 px-4 font-medium text-foreground">${sale.revenue.toLocaleString()}</td>
                      <td className="py-3 px-4 text-foreground">{sale.region}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
