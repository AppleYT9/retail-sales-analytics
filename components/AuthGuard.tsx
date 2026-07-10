'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

const DEMO_TOKEN = 'demo-mode-token'
const LOGGED_OUT_KEY = 'authLoggedOut'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const isAuthPage = pathname?.startsWith('/auth')
    const token = localStorage.getItem('authToken')
    const loggedOut = localStorage.getItem(LOGGED_OUT_KEY) === 'true'

    if (isAuthPage && token) {
      router.replace('/')
      return
    }

    if (!isAuthPage && !token) {
      if (loggedOut) {
        router.replace('/auth/login')
        return
      }

      // Auto-set a demo token on first visit when the user has not explicitly logged out.
      localStorage.setItem('authToken', DEMO_TOKEN)
    }
  }, [pathname, router])

  // Show a clean loading state only during initial hydration
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
