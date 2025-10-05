'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/DashboardLayout'
import { RaffleListContainer } from '@/components/RaffleListContainer'
import { DebugRaffleComponent } from '@/components/DebugRaffleComponent'

export default function PlaygroundPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [shouldRedirect, setShouldRedirect] = useState(false)

  // Verificação de autenticação usando useEffect
  useEffect(() => {
    const token = localStorage.getItem('auth-token')
    const username = localStorage.getItem('auth-username')
    
    if (!token || !username) {
      console.log('❌ [PLAYGROUND] Usuário não autenticado via localStorage, redirecionando para /welcome')
      setShouldRedirect(true)
    } else {
      console.log('✅ [PLAYGROUND] Usuário autenticado via localStorage')
      setUserInfo({ token, username })
      setIsLoading(false)
    }
  }, [])

  // Redirecionamento usando useEffect separado
  useEffect(() => {
    if (shouldRedirect) {
      router.push('/welcome')
    }
  }, [shouldRedirect, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!userInfo) {
    return null
  }

  return (
    <DashboardLayout currentPage="Minhas Rifas">
      <div className="space-y-6">
        <DebugRaffleComponent />
        {/* Lista de Rifas */}
        <RaffleListContainer />
      </div>
    </DashboardLayout>
  )
}