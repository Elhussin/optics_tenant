// // hooks/useAuth.ts
// 'use client'
// import { useEffect, useState } from 'react'
// import { useRouter, usePathname } from 'next/navigation'
// import { useUser } from  '@/src/lib/hooks/useCurrentUser'
// interface User {
//   id: string
//   role: string
//   email: string
// }

// export function useAuth(requiredPermissions?: string[]) {
//   const { user } = useUser()
//   const [loading, setLoading] = useState(true)
//   const router = useRouter()
//   const pathname = usePathname()

//   useEffect(() => {
//     checkAuth()
//   }, [pathname])

//   const checkAuth = async () => {
//     try {
//       // التحقق من وجود التوكن
//       const token = document.cookie
//         .split('; ')
//         .find(row => row.startsWith('access_token='))
//         ?.split('=')[1]

//       if (!user) {
//         console.log('❌ No user - redirecting to login',encodeURIComponent(pathname))
//         router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`)
//         return
//       }

//       // التحقق من الأذونات إذا كانت مطلوبة
//       if (requiredPermissions && requiredPermissions.length > 0) {
//         const hasPermission = checkPermissions(user.role, requiredPermissions)
//         if (!hasPermission) {
//           console.log('❌ Insufficient permissions')
//           router.push('/unauthorized')
//           return
//         }
//       }

//       console.log('✅ Auth check passed')
//     } catch (error) {
//       console.error('Auth check error:', error)
//       router.push('/auth/login')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const checkPermissions = (userRole: string, permissions: string[]): boolean => {
//     const rolePermissions: Record<string, string[]> = {
//       ADMIN: ['*'],
//       TECHNICIAN: ['create_prescription', 'edit_prescription', 'view_prescriptions'],
//       SALESPERSON: ['create_invoice', 'view_invoices', 'edit_invoice'],
//     }

//     const userPermissions = rolePermissions[userRole] || []
//     console
//     if (userPermissions.includes('*')) return true
    
//     return permissions.every(permission => userPermissions.includes(permission))
//   }

//   const logout = () => {
//     document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
//     setUser(null)
//     router.push('/auth/login')
//   }

//   return { user, loading, logout, checkAuth }
// }
