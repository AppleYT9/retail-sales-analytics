'use client'

import { useState } from 'react'
import { LogIn, Mail, Lock, User, UserCheck, Brain } from 'lucide-react'
import { apiClient } from '@/lib/api-client'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setLoading(true)

    try {
      if (mode === 'login') {
        const response = await apiClient.login({ email, password })
        if (response.success) {
          window.location.href = '/upload'
        } else {
          setError(response.error || 'Login failed')
        }
      } else {
        const response = await apiClient.register({ email, password })
        if (response.success) {
          setSuccessMessage('Registration successful! Click "Sign in" below to log in.')
          setMode('login')
        } else {
          setError(response.error || 'Registration failed')
        }
      }
    } catch (err) {
      setError(`${mode === 'login' ? 'Login' : 'Registration'} failed. Please try again.`)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white">
      {/* Left Form Column */}
      <div className="col-span-1 lg:col-span-5 flex flex-col justify-between p-8 lg:p-12 xl:p-16 bg-white">
        {/* Brand Logo */}
        <div className="flex items-center gap-2 mb-12">
          <div className="w-9 h-9 rounded-lg bg-black flex items-center justify-center text-white">
            <LogIn className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-slate-900 tracking-tight">RetailAnalytics</span>
        </div>

        {/* Form Container */}
        <div className="max-w-md w-full mx-auto my-auto space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              {mode === 'login' ? 'Log in to your account.' : 'Create an account.'}
            </h1>
            <p className="text-sm text-slate-500">
              {mode === 'login' 
                ? 'Enter your email address and password to log in.' 
                : 'Sign up to start analyzing and forecasting sales.'}
            </p>
          </div>

          {successMessage && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent focus:bg-white transition-all placeholder:text-slate-400"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                {mode === 'login' && (
                  <button type="button" className="text-xs font-semibold text-blue-600 hover:underline">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent focus:bg-white transition-all placeholder:text-slate-400"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer mt-2"
            >
              {loading 
                ? (mode === 'login' ? 'Logging in...' : 'Creating Account...') 
                : (mode === 'login' ? 'Login' : 'Sign Up')
              }
            </button>
          </form>


        </div>

        {/* Footer Toggle */}
        <div className="mt-12 text-center text-sm text-slate-500">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup')
                  setError(null)
                  setSuccessMessage(null)
                }}
                className="text-blue-600 hover:underline font-semibold cursor-pointer ml-0.5"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  setError(null)
                  setSuccessMessage(null)
                }}
                className="text-blue-600 hover:underline font-semibold cursor-pointer ml-0.5"
              >
                Sign In
              </button>
            </>
          )}
        </div>
      </div>

      {/* Right Product Card Column (hidden on mobile, span 7 on large screens) */}
      <div className="hidden lg:block lg:col-span-7 p-6 bg-white h-screen">
        <div className="h-full w-full rounded-[32px] bg-[#0A52FF] relative overflow-hidden flex flex-col justify-between p-12 text-white shadow-2xl">
          {/* Background grid details */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent pointer-events-none" />

          {/* Top decorative hexagon */}
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-blue-500/10 blur-xl" />

          {/* Center Mockup */}
          <div className="w-full max-w-xl mx-auto my-auto space-y-8 flex flex-col items-center">
            {/* Browser frame */}
            <div className="w-full bg-white rounded-2xl shadow-2xl border border-blue-400/20 overflow-hidden transform hover:scale-[1.02] transition-transform duration-500">
              {/* Window controls bar */}
              <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] font-semibold text-slate-400 ml-4 font-mono select-none">retail-sales-forecast.json</span>
              </div>
              {/* Main Dashboard Preview Image */}
              <img 
                src="/login_banner.png" 
                alt="Retail Sales Analytics Dashboard preview"
                className="w-full object-cover select-none"
              />
            </div>
            
            {/* Hexagon floating card */}
            <div className="absolute right-12 top-1/4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-3 shadow-lg max-w-[160px] animate-bounce" style={{ animationDuration: '6s' }}>
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-[10px] text-blue-100 font-semibold uppercase">Prophet ML</p>
                <p className="text-xs font-bold text-white">Forecast Model</p>
              </div>
            </div>
          </div>

          {/* Bottom Pitch Copy */}
          <div className="text-center max-w-lg mx-auto z-10 space-y-2.5">
            <h2 className="text-2xl font-extrabold tracking-tight">
              The easiest way to manage your portfolio.
            </h2>
            <p className="text-sm text-blue-100 font-medium opacity-90">
              Join the RetailAnalytics community now!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
