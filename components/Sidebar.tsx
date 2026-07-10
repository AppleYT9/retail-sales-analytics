'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Activity, LayoutDashboard, BarChart3, TrendingUp, Brain, FileText, UploadCloud, LogOut } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { apiClient } from '@/lib/api-client'
import { useRouter } from 'next/navigation'

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Forecasting', href: '/forecast', icon: TrendingUp },
  { name: 'ML Hub', href: '/ml-hub', icon: Brain },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Import Data', href: '/upload', icon: UploadCloud },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [uploads, setUploads] = useState<any[]>([])
  const [activeUploadId, setActiveUploadId] = useState<string>('none')

  // Fetch upload history for the dropdown list
  useEffect(() => {
    if (pathname?.startsWith('/auth')) return

    const fetchHistory = async () => {
      try {
        const response = await apiClient.getUploadHistory()
        if (response.success && response.data) {
          setUploads(response.data)
        }
      } catch (err) {
        console.error(err)
      }
    }

    fetchHistory()

    const saved = localStorage.getItem('activeUploadId') || 'none'
    setActiveUploadId(saved)

    // Listen for custom history refreshes (e.g. when new file is uploaded)
    const handleHistoryRefresh = () => {
      fetchHistory()
    }
    window.addEventListener('uploadHistoryRefreshed', handleHistoryRefresh)
    return () => window.removeEventListener('uploadHistoryRefreshed', handleHistoryRefresh)
  }, [pathname])

  // Validate activeUploadId against the list of fetched uploads
  useEffect(() => {
    if (activeUploadId !== 'none' && uploads.length > 0) {
      const exists = uploads.some(u => String(u.id) === activeUploadId)
      if (!exists) {
        // ID no longer exists (e.g. deleted), fallback to 'none'
        localStorage.setItem('activeUploadId', 'none')
        setActiveUploadId('none')
        window.dispatchEvent(new Event('activeUploadChanged'))
      }
    }
  }, [uploads, activeUploadId])

  // Change selected active dataset
  const handleUploadChange = (val: string) => {
    localStorage.setItem('activeUploadId', val)
    setActiveUploadId(val)
    window.dispatchEvent(new Event('activeUploadChanged'))
  }

  // Hide sidebar on authentication pages
  if (pathname?.startsWith('/auth')) {
    return null
  }

  const handleLogout = async () => {
    await apiClient.logout()
    window.location.href = '/auth/login'
  }

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col h-screen sticky top-0 left-0">
      <div className="p-6 flex items-center gap-3 border-b border-border/50">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground">RetailAnalytics</h1>
        </div>
      </div>

      {/* Dataset Selection Dropdown */}
      <div className="px-4 py-3 border-b border-border/50 bg-muted/20">
        <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
          Active Dataset
        </label>
        <select
          value={activeUploadId}
          onChange={(e) => handleUploadChange(e.target.value)}
          className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-card text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
        >
          <option value="none">Select a dataset...</option>
          {uploads.map((u) => (
            <option key={u.id} value={u.id}>
              {u.filename.length > 20 ? u.filename.substring(0, 18) + '...' : u.filename} ({u.records_processed} rows)
            </option>
          ))}
        </select>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border/50 space-y-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
        <div className="flex items-center justify-between px-3 py-2 text-sm text-muted-foreground">
          <span>Theme</span>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  )
}
