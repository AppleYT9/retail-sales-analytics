'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { apiClient } from '@/lib/api-client'
import { 
  Brain, 
  AlertTriangle, 
  Users, 
  Cpu,
  ArrowRight, 
  Activity, 
  TrendingUp
} from 'lucide-react'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'

const COLORS = ['#8366d5', '#6db85f', '#d9a62d']
const ANOMALY_COLORS = { normal: '#8366d5', anomaly: '#d94545' }

export default function MLHub() {
  const [activeUploadId, setActiveUploadId] = useState<string>('none')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [anomalies, setAnomalies] = useState<any[]>([])
  const [totalAnomalies, setTotalAnomalies] = useState(0)
  const [segmentation, setSegmentation] = useState<Record<string, number>>({})
  const [salesSample, setSalesSample] = useState<any[]>([])

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
    const fetchMLData = async () => {
      if (activeUploadId === 'none') {
        setAnomalies([])
        setTotalAnomalies(0)
        setSegmentation({})
        setSalesSample([])
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Run ML algorithms in parallel on the server
        const [anomalyRes, segRes, salesRes] = await Promise.all([
          apiClient.detectAnomalies(),
          apiClient.segmentCustomers(),
          apiClient.getSalesData({ range: 'all', uploadId: Number(activeUploadId) })
        ])

        if (anomalyRes.success && anomalyRes.data) {
          setAnomalies(anomalyRes.data.anomalies || [])
          setTotalAnomalies(anomalyRes.data.total_anomalies || 0)
        }

        if (segRes.success && segRes.data) {
          setSegmentation(segRes.data.distribution || {})
        }

        if (salesRes.success && salesRes.data) {
          // Take a representative sample of 300 orders to visualize in the scatter plot
          const rawSales = salesRes.data || []
          const sampleSize = Math.min(rawSales.length, 300)
          
          // Map each order to flag if it was marked as an anomaly
          const anomalySet = new Set((anomalyRes.data?.anomalies || []).map((a: any) => String(a.id)))
          
          const mappedSample = rawSales.slice(0, sampleSize).map((s: any) => ({
            id: s.id,
            quantity: s.quantity,
            price: s.price,
            revenue: s.revenue,
            type: anomalySet.has(String(s.id)) ? 'Anomaly' : 'Normal',
            fill: anomalySet.has(String(s.id)) ? ANOMALY_COLORS.anomaly : ANOMALY_COLORS.normal
          }))
          
          setSalesSample(mappedSample)
        }
      } catch (err) {
        setError('Failed to process machine learning models.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchMLData()
  }, [activeUploadId])

  // Process customer clusters data for PieChart
  const clusterData = Object.entries(segmentation).map(([name, count]) => ({
    name,
    value: count
  }))

  const normalPoints = salesSample.filter(p => p.type === 'Normal')
  const anomalyPoints = salesSample.filter(p => p.type === 'Anomaly')

  return (
    <div className="p-6 lg:p-8 w-full max-w-7xl mx-auto">
      <PageHeader 
        title="Machine Learning Hub" 
        description="Run and visualize clustering models and anomaly detection pipelines."
      />

      <main className="py-4">
        {activeUploadId === 'none' ? (
          <div className="mb-6 p-6 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-center max-w-2xl mx-auto mt-12">
            <Brain className="w-12 h-12 mx-auto mb-4 animate-pulse" />
            <h2 className="text-lg font-semibold mb-2">No Active Dataset Selected</h2>
            <p className="text-sm opacity-90 mb-4">
              Select a pre-loaded "try" dataset or upload your own in the sidebar dropdown to run scikit-learn models.
            </p>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-6 h-96 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-8 mt-6">
            
            {/* Top Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card border border-border rounded-lg p-5 flex items-center gap-4">
                <div className="p-3 bg-red-500/10 text-red-500 rounded-lg">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Outliers Found</p>
                  <p className="text-2xl font-bold text-foreground mt-0.5">{totalAnomalies} sales</p>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-5 flex items-center gap-4">
                <div className="p-3 bg-primary/10 text-primary rounded-lg">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Customer Groups</p>
                  <p className="text-2xl font-bold text-foreground mt-0.5">{clusterData.length} active segments</p>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-5 flex items-center gap-4">
                <div className="p-3 bg-green-500/10 text-green-500 rounded-lg">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Active ML Pipeline</p>
                  <p className="text-lg font-bold text-foreground mt-0.5">K-Means + Isolation Forest</p>
                </div>
              </div>
            </div>

            {/* Model Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Anomaly Detection Chart */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Isolation Forest Outliers</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Evaluating Price vs. Quantity anomalies (5% contamination)</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-red-500/10 border border-red-500/20 text-red-500 font-semibold rounded-full">
                    Outlier detection
                  </span>
                </div>

                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis type="number" dataKey="quantity" name="Quantity" stroke="var(--muted-foreground)" />
                      <YAxis type="number" dataKey="price" name="Unit Price" unit="$" stroke="var(--muted-foreground)" />
                      <Tooltip 
                        cursor={{ strokeDasharray: '3 3' }}
                        contentStyle={{
                          backgroundColor: 'var(--card)',
                          border: '1px solid var(--border)',
                          borderRadius: '0.5rem',
                        }}
                      />
                      <Scatter name="Normal Purchases" data={normalPoints} fill={ANOMALY_COLORS.normal} />
                      <Scatter name="Outliers (Anomaly)" data={anomalyPoints} fill={ANOMALY_COLORS.anomaly} />
                      <Legend />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4 p-4 rounded-lg bg-muted/30 border border-border/50 text-xs text-muted-foreground">
                  <p className="font-semibold text-foreground mb-1">🤖 Analyst Insight:</p>
                  Outliers represent transactions with unusually high order volumes or disproportionate pricing metrics. These should be audited for fraud, data-entry errors, or VIP wholesale discounts.
                </div>
              </div>

              {/* Customer Segmentation Chart */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">K-Means Customer Segmentation</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Clustering based on Frequency & Monetary transaction metrics</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary font-semibold rounded-full">
                    Customer clustering
                  </span>
                </div>

                <div className="h-72 flex items-center justify-center">
                  {clusterData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={clusterData}
                          cx="50%"
                          cy="55%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {clusterData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value} customers`} />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm text-muted-foreground">No customer clusters available</p>
                  )}
                </div>

                <div className="mt-4 p-4 rounded-lg bg-muted/30 border border-border/50 text-xs text-muted-foreground">
                  <p className="font-semibold text-foreground mb-1">💡 Data Science Strategy:</p>
                  <ul className="list-disc pl-4 space-y-1 mt-1">
                    <li><strong className="text-foreground">Cluster 0 (VIPs):</strong> High spending & high order frequency. Focus on loyalty rewards.</li>
                    <li><strong className="text-foreground">Cluster 1 (Prospects):</strong> Moderate frequency, low average spend. Engage with discount coupons.</li>
                    <li><strong className="text-foreground">Cluster 2 (Churn Risks):</strong> Single transaction/low spending. Target with win-back email flows.</li>
                  </ul>
                </div>
              </div>

            </div>

            {/* Anomaly Inspection Table */}
            <div className="bg-card border border-border rounded-lg p-6 overflow-x-auto">
              <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Detailed Outlier Log
              </h3>
              <p className="text-xs text-muted-foreground mb-4">Inspection registry of top 10 suspicious records identified by Isolation Forest.</p>
              
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="py-2.5 px-3 font-semibold text-muted-foreground text-xs uppercase">Record ID</th>
                    <th className="py-2.5 px-3 font-semibold text-muted-foreground text-xs uppercase">Quantity</th>
                    <th className="py-2.5 px-3 font-semibold text-muted-foreground text-xs uppercase">Unit Price</th>
                    <th className="py-2.5 px-3 font-semibold text-muted-foreground text-xs uppercase">Suspicious Factors</th>
                  </tr>
                </thead>
                <tbody>
                  {anomalies.slice(0, 10).map((anom, idx) => (
                    <tr key={idx} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 px-3 text-foreground font-mono">#{anom.id}</td>
                      <td className="py-2.5 px-3 text-foreground font-medium">{anom.quantity} units</td>
                      <td className="py-2.5 px-3 text-red-500 font-semibold">${Number(anom.total_price / (anom.quantity || 1)).toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-muted-foreground text-xs">
                        {anom.quantity > 50 ? '⚠️ High-volume bulk purchase outlier' : '💰 Premium pricing anomaly value'}
                      </td>
                    </tr>
                  ))}
                  {anomalies.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-6 text-muted-foreground text-sm">
                        No suspicious anomalies detected in this dataset.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}
      </main>
    </div>
  )
}
