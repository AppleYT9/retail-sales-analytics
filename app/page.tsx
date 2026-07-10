'use client'

import { useEffect, useState } from 'react'
import { BarChart3, TrendingUp, Package, ShoppingCart, Activity, Users } from 'lucide-react'
import { KPICard } from '@/components/KPICard'
import { apiClient } from '@/lib/api-client'
import Link from 'next/link'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null)
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeUploadId, setActiveUploadId] = useState<string>('none')

  useEffect(() => {
    const saved = localStorage.getItem('activeUploadId') || 'none'
    setActiveUploadId(saved)

    const handleUploadChange = () => {
      setActiveUploadId(localStorage.getItem('activeUploadId') || 'none')
    }

    window.addEventListener('activeUploadChanged', handleUploadChange)
    return () => window.removeEventListener('activeUploadChanged', handleUploadChange)
  }, [])

  useEffect(() => {
    const fetchAll = async () => {
      if (activeUploadId === 'none') {
        setStats({
          total_revenue: 0,
          total_orders: 0,
          total_customers: 0,
          monthly_growth: 0,
        })
        setRevenueData([])
        setCategoryData([])
        setTopProducts([])
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const uploadId = Number(activeUploadId)

        // Fetch all data in parallel from dedicated server-side aggregation endpoints
        const [kpiRes, dailyRes, catRes, prodRes] = await Promise.all([
          apiClient.getDashboardKPIs(uploadId),
          apiClient.getDailyRevenue(uploadId),
          apiClient.getCategorySales(uploadId),
          apiClient.getTopProducts(uploadId),
        ])

        if (kpiRes.success && kpiRes.data) {
          setStats(kpiRes.data)
        }

        if (dailyRes.success && dailyRes.data && dailyRes.data.length > 0) {
          // Format dates for chart labels
          setRevenueData(dailyRes.data.map((d: any) => ({
            name: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            revenue: d.revenue,
            orders: d.orders,
          })))
        } else {
          setRevenueData([])
        }

        if (catRes.success && catRes.data && catRes.data.length > 0) {
          setCategoryData(catRes.data)
        } else {
          setCategoryData([])
        }

        if (prodRes.success && prodRes.data) {
          setTopProducts(prodRes.data)
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [activeUploadId])

  const totalRevenue = stats?.total_revenue || 0
  const totalOrders = stats?.total_orders || 0
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
  const totalCustomers = stats?.total_customers || 0
  const topCategoryName = categoryData.length > 0 ? categoryData[0].name : 'N/A'
  const topProductName = topProducts.length > 0 ? topProducts[0].name : 'N/A'

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Command Center</h1>
        <p className="text-muted-foreground mt-2">Overview of your retail sales intelligence.</p>
      </div>
        {/* KPI Grid (Horizontal) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Total Revenue"
            value={totalRevenue}
            unit="$"
            change={stats?.monthly_growth || 0}
            isPositive={true}
            icon={<TrendingUp className="w-5 h-5" />}
            loading={loading}
          />
          <KPICard
            title="Average Order Value"
            value={Math.round(avgOrderValue * 100) / 100}
            unit="$"
            change={0}
            isPositive={true}
            icon={<ShoppingCart className="w-5 h-5" />}
            loading={loading}
          />
          <KPICard
            title="Total Customers"
            value={totalCustomers}
            change={0}
            isPositive={true}
            icon={<Users className="w-5 h-5" />}
            loading={loading}
          />
          <KPICard
            title="Total Orders"
            value={totalOrders}
            change={0}
            isPositive={true}
            icon={<Package className="w-5 h-5" />}
            loading={loading}
          />
        </div>

        {/* Main Dashboard Area (Horizontal Split) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Chart Section (Takes up 2 columns) */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Revenue Trend</h2>
                <p className="text-sm text-muted-foreground">Daily revenue from your dataset</p>
              </div>
            </div>
            <div className="h-[350px] w-full">
              {revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value.toLocaleString()}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                      itemStyle={{ color: 'var(--foreground)' }}
                      formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>No revenue data available. Upload a dataset to see trends.</p>
                </div>
              )}
            </div>
          </div>

          {/* Side Section (Takes up 1 column) */}
          <div className="space-y-6">
            {/* Category Chart */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-foreground">Sales by Category</h2>
                <p className="text-sm text-muted-foreground">Top performing segments</p>
              </div>
              <div className="h-[200px] w-full">
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} width={80} />
                      <Tooltip
                        cursor={{ fill: 'var(--muted)' }}
                        contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                        formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Sales']}
                      />
                      <Bar dataKey="sales" fill="var(--primary)" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                    No category data available.
                  </div>
                )}
              </div>
            </div>

            {/* AI Insights Card */}
            <div className="bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <TrendingUp className="w-24 h-24" />
              </div>
              <div className="relative z-10">
                <h3 className="text-sm font-bold text-primary flex items-center gap-2 mb-2">
                  ✨ AI Insights
                </h3>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  Total revenue is <strong>${totalRevenue.toLocaleString()}</strong> across{' '}
                  <strong>{totalOrders.toLocaleString()}</strong> orders.{' '}
                  {topCategoryName !== 'N/A' && (
                    <>The <em>{topCategoryName}</em> category is driving the most growth. </>
                  )}
                  {topProductName !== 'N/A' && (
                    <>Consider increasing inventory for <strong>{topProductName}</strong>.</>
                  )}
                </p>
                <Link href="/forecast" className="inline-block mt-4 text-xs font-semibold text-primary hover:underline">
                  View Full Forecast &rarr;
                </Link>
              </div>
            </div>
        </div>
      </div>
    </div>
  )
}
