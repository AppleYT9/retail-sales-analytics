'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Zap } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceDot,
  ComposedChart,
  Area,
  AreaChart,
} from 'recharts'
import { Forecast, apiClient } from '@/lib/api-client'

export default function ForecastPage() {
  const [forecasts, setForecasts] = useState<Forecast[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [horizon, setHorizon] = useState(30)
  const [generating, setGenerating] = useState(false)

  const generateForecast = async () => {
    try {
      setGenerating(true)
      setError(null)
      const response = await apiClient.generateForecast({ horizon, method: 'arima' })
      if (response.success && response.data) {
        setForecasts(response.data)
      } else {
        setError(response.error || 'Failed to generate forecast')
      }
    } catch (err) {
      setError('Failed to generate forecast')
      console.error(err)
    } finally {
      setGenerating(false)
    }
  }

  useEffect(() => {
    generateForecast()
  }, [])

  const forecastStats = {
    averageForecast: forecasts.reduce((sum, f) => sum + f.predicted, 0) / forecasts.length || 0,
    maxForecast: Math.max(...forecasts.map((f) => f.predicted), 0),
    minForecast: Math.min(...forecasts.map((f) => f.predicted), 0),
    confidence: 95,
  }

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
            <h1 className="text-2xl font-bold text-foreground">Sales Forecasting</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-8 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Forecast Controls */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Forecast Horizon (days)</label>
              <input
                type="number"
                min="7"
                max="180"
                value={horizon}
                onChange={(e) => setHorizon(Number(e.target.value))}
                className="px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              onClick={generateForecast}
              disabled={generating}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Zap className="w-4 h-4" />
              {generating ? 'Generating...' : 'Generate Forecast'}
            </button>
          </div>
        </div>

        {/* Forecast Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Average Forecast</p>
            <p className="text-2xl font-bold text-foreground">${forecastStats.averageForecast.toLocaleString()}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Maximum Forecast</p>
            <p className="text-2xl font-bold text-foreground">${forecastStats.maxForecast.toLocaleString()}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Minimum Forecast</p>
            <p className="text-2xl font-bold text-foreground">${forecastStats.minForecast.toLocaleString()}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Confidence Level</p>
            <p className="text-2xl font-bold text-accent">{forecastStats.confidence}%</p>
          </div>
        </div>

        {/* Forecast Chart */}
        {forecasts.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Sales Forecast with Confidence Interval</h2>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={forecasts}>
                <defs>
                  <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8366d5" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#8366d5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                  }}
                  formatter={(value) => `$${typeof value === 'number' ? value.toLocaleString() : value}`}
                />
                <Legend />
                {forecasts[0]?.confidence_lower && (
                  <Area
                    type="monotone"
                    dataKey="confidence_lower"
                    fill="none"
                    stroke="none"
                    isAnimationActive={false}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="predicted"
                  fill="url(#colorConfidence)"
                  stroke="#8366d5"
                  strokeWidth={2}
                  name="Predicted Sales"
                  dot={{ fill: '#8366d5', r: 3 }}
                  activeDot={{ r: 6 }}
                />
                {forecasts[0]?.actual && (
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#6db85f"
                    strokeWidth={2}
                    name="Actual Sales"
                    dot={{ fill: '#6db85f', r: 3 }}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Forecast Table */}
        {forecasts.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-6 overflow-x-auto">
            <h2 className="text-lg font-semibold text-foreground mb-4">Detailed Forecast</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Date</th>
                  {forecasts[0]?.actual && (
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Actual</th>
                  )}
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Predicted</th>
                  {forecasts[0]?.confidence_lower && (
                    <>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Lower Bound (95%)</th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Upper Bound (95%)</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {forecasts.slice(0, 20).map((forecast, idx) => (
                  <tr key={idx} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 text-foreground">{forecast.date}</td>
                    {forecast.actual && (
                      <td className="py-3 px-4 text-foreground">${forecast.actual.toLocaleString()}</td>
                    )}
                    <td className="py-3 px-4 font-medium text-accent">
                      ${forecast.predicted.toLocaleString()}
                    </td>
                    {forecast.confidence_lower && (
                      <>
                        <td className="py-3 px-4 text-muted-foreground">
                          ${forecast.confidence_lower.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          ${forecast.confidence_upper?.toLocaleString()}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
