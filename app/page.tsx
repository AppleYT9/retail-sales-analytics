'use client'

import { useEffect, useState } from 'react'
import { BarChart3, TrendingUp, Package, ShoppingCart } from 'lucide-react'
import { KPICard } from '@/components/KPICard'
import { DashboardKPI, apiClient } from '@/lib/api-client'
import Link from 'next/link'

export default function Dashboard() {
  const [kpis, setKpis] = useState<DashboardKPI | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        setLoading(true)
        const response = await apiClient.getDashboardKPIs()
        if (response.success && response.data) {
          setKpis(response.data)
        } else {
          setError(response.error || 'Failed to load dashboard')
        }
      } catch (err) {
        setError('Failed to load dashboard data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchKPIs()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">RetailAnalytics</h1>
              <p className="text-sm text-muted-foreground mt-1">Sales Intelligence Platform</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/upload"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                <Package className="w-4 h-4" />
                Upload Data
              </Link>
              <Link
                href="/profile"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
              >
                Profile
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-8 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">
            <p className="font-medium">{error}</p>
            <p className="text-sm text-red-700 mt-1">
              Backend API is not connected. Make sure the backend server is running on{' '}
              <code className="bg-red-100 px-2 py-1 rounded">http://localhost:3001</code>
            </p>
          </div>
        )}

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <KPICard
            title="Total Sales"
            value={kpis?.totalSales}
            unit="$"
            change={12.5}
            isPositive={true}
            icon={<TrendingUp className="w-5 h-5" />}
            loading={loading}
          />
          <KPICard
            title="Average Order Value"
            value={kpis?.averageOrderValue}
            unit="$"
            change={8.3}
            isPositive={true}
            icon={<ShoppingCart className="w-5 h-5" />}
            loading={loading}
          />
          <KPICard
            title="Growth Rate"
            value={kpis?.growthRate}
            unit="%"
            change={5.2}
            isPositive={true}
            icon={<BarChart3 className="w-5 h-5" />}
            loading={loading}
          />
          <KPICard
            title="Total Orders"
            value={kpis?.totalOrders}
            change={15.8}
            isPositive={true}
            icon={<Package className="w-5 h-5" />}
            loading={loading}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/analytics"
            className="group bg-card border border-border rounded-lg p-8 hover:border-primary hover:shadow-md transition-all"
          >
            <div className="text-primary mb-3">
              <BarChart3 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              Sales Analytics
            </h3>
            <p className="text-sm text-muted-foreground mt-2">Explore sales trends and patterns</p>
          </Link>

          <Link
            href="/forecast"
            className="group bg-card border border-border rounded-lg p-8 hover:border-primary hover:shadow-md transition-all"
          >
            <div className="text-accent mb-3">
              <TrendingUp className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              Forecasting
            </h3>
            <p className="text-sm text-muted-foreground mt-2">ML-powered sales predictions</p>
          </Link>

          <Link
            href="/reports"
            className="group bg-card border border-border rounded-lg p-8 hover:border-primary hover:shadow-md transition-all"
          >
            <div className="text-chart-1 mb-3">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              Reports
            </h3>
            <p className="text-sm text-muted-foreground mt-2">Download business reports</p>
          </Link>
        </div>
      </main>
    </div>
  )
}
