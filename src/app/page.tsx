'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGoogleButtonSafe } from '@/hooks/useGoogleButtonSafe'

export default function HomePage() {
  const { isAuthenticated, isLoading } = useGoogleButtonSafe()
  const router = useRouter()

  useEffect(() => {
    console.log('🏠 HomePage useEffect:', { isLoading, isAuthenticated })
    if (!isLoading) {
      if (isAuthenticated) {
        console.log('🏠 Redirecionando autenticado para /playground')
        router.push('/playground')
      } else {
        console.log('🏠 Redirecionando não autenticado para /welcome')
        router.push('/welcome')
      }
    }
  }, [isAuthenticated, isLoading, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-lg font-medium">Carregando MS Raffle...</p>
      </div>
    </div>
  )
}