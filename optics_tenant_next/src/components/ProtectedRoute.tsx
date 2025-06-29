
// components/ProtectedRoute.tsx
'use client'
import { useAuth } from '@/src/lib/hooks/useAuth'
import { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  requiredPermissions?: string[]
  fallback?: ReactNode
}

export function ProtectedRoute({ 
  children, 
  requiredPermissions, 
  fallback 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth(requiredPermissions)

  if (loading) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      )
    )
  }

  if (!user) {
    return null // سيتم إعادة التوجيه من useAuth
  }

  return <>{children}</>
}