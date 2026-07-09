'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, LogOut, User, Mail, Calendar } from 'lucide-react'
import { UserProfile, apiClient } from '@/lib/api-client'

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        const response = await apiClient.getUserProfile()
        if (response.success && response.data) {
          setUser(response.data)
        } else {
          setError(response.error || 'Failed to load profile')
        }
      } catch (err) {
        setError('Failed to load profile')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const handleLogout = async () => {
    await apiClient.logout()
    // Redirect to login page
    window.location.href = '/auth/login'
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-foreground">User Profile</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-8 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            <div className="h-32 bg-muted rounded-lg animate-pulse" />
            <div className="h-10 bg-muted rounded-lg animate-pulse" />
            <div className="h-10 bg-muted rounded-lg animate-pulse" />
          </div>
        ) : user ? (
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-card border border-border rounded-lg p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-primary-foreground">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>

                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-foreground">{user.name || 'User'}</h2>
                  <p className="text-muted-foreground flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </p>
                </div>
              </div>

              {/* User Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-border">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    <User className="w-4 h-4 inline mr-2" />
                    User ID
                  </label>
                  <p className="text-foreground font-mono text-sm">{user.id}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Joined
                  </label>
                  <p className="text-foreground">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Account Settings</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="font-medium text-foreground">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive weekly reports and alerts</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5" defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="font-medium text-foreground">API Access</p>
                    <p className="text-sm text-muted-foreground">Enable programmatic access to your data</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5" />
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="font-medium text-foreground">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <button className="px-3 py-1 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">
                    Enable
                  </button>
                </div>
              </div>
            </div>

            {/* Connected Apps */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Connected Services</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <span className="text-lg">🔐</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">OAuth Provider</p>
                      <p className="text-sm text-muted-foreground">Connected via Google/GitHub</p>
                    </div>
                  </div>
                  <button className="text-sm text-red-600 hover:text-red-700 font-medium">Disconnect</button>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-card border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>

              <div className="space-y-3">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-red-200 text-red-600 font-medium hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>

                <button className="w-full px-4 py-3 rounded-lg border border-red-200 text-red-600 font-medium hover:bg-red-50 transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}
