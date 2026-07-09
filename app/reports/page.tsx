'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Download, Calendar } from 'lucide-react'
import { apiClient } from '@/lib/api-client'

interface ReportTemplate {
  id: string
  name: string
  description: string
  icon: string
}

export default function ReportsPage() {
  const [generating, setGenerating] = useState<string | null>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf')

  const reportTemplates: ReportTemplate[] = [
    {
      id: 'summary',
      name: 'Executive Summary',
      description: 'High-level overview of key metrics and trends',
      icon: '📊',
    },
    {
      id: 'sales',
      name: 'Sales Analysis',
      description: 'Detailed sales performance by category and region',
      icon: '💰',
    },
    {
      id: 'forecast',
      name: 'Forecast Report',
      description: 'ML predictions and forecasting insights',
      icon: '📈',
    },
    {
      id: 'inventory',
      name: 'Inventory Report',
      description: 'Product inventory and stock level analysis',
      icon: '📦',
    },
  ]

  const generateReport = async (reportId: string) => {
    try {
      setGenerating(reportId)
      const blob = await apiClient.generateReport(reportId, selectedFormat)

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${reportId}_report.${selectedFormat === 'excel' ? 'xlsx' : selectedFormat}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Failed to generate report:', error)
      alert('Failed to generate report')
    } finally {
      setGenerating(null)
    }
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
            <h1 className="text-2xl font-bold text-foreground">Reports & Exports</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Report Filters */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Report Settings</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Format</label>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value as 'pdf' | 'excel' | 'csv')}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
              </select>
            </div>

            <div className="flex items-end">
              <button className="w-full px-4 py-2 rounded-lg bg-muted text-foreground font-medium hover:bg-muted/80 transition-colors">
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Report Templates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportTemplates.map((template) => (
            <div key={template.id} className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{template.icon}</div>
                <button
                  onClick={() => generateReport(template.id)}
                  disabled={generating === template.id}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  <Download className="w-4 h-4" />
                  {generating === template.id ? 'Generating...' : 'Download'}
                </button>
              </div>

              <h3 className="text-lg font-semibold text-foreground mb-2">{template.name}</h3>
              <p className="text-sm text-muted-foreground">{template.description}</p>
            </div>
          ))}
        </div>

        {/* Recent Reports */}
        <div className="mt-12 bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Downloads</h2>

          <div className="space-y-3">
            {[
              {
                name: 'Q3 2024 Sales Summary',
                date: '2024-01-15',
                size: '2.4 MB',
              },
              {
                name: 'November Forecast Report',
                date: '2024-01-10',
                size: '1.8 MB',
              },
              {
                name: 'Regional Analysis',
                date: '2024-01-05',
                size: '3.2 MB',
              },
            ].map((report, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div>
                  <p className="font-medium text-foreground">{report.name}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(report.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">{report.size}</p>
                  <button className="text-sm text-primary hover:underline mt-1">Download again</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
