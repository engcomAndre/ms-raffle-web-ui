'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/DashboardLayout'

export default function AvailableRafflesPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [shouldRedirect, setShouldRedirect] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('auth-token')
    const username = localStorage.getItem('auth-username')
    
    if (!token || !username) {
      console.log('❌ [AVAILABLE-RAFFLES] Usuário não autenticado via localStorage, redirecionando para /welcome')
      setShouldRedirect(true)
    } else {
      console.log('✅ [AVAILABLE-RAFFLES] Usuário autenticado via localStorage')
      setUserInfo({ token, username })
      setIsLoading(false)
    }
  }, [])

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
    <DashboardLayout currentPage="Rifas Disponíveis">
      <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-green-700">
              Funcionalidade em desenvolvimento. Em breve você poderá visualizar e gerenciar rifas disponíveis de outros usuários.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Rifas Disponíveis</h2>
          <p className="text-gray-600 mb-6">
            Esta funcionalidade está sendo desenvolvida e estará disponível em breve.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 max-w-md mx-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Funcionalidades planejadas:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Visualizar rifas de outros usuários</li>
              <li>• Filtrar e pesquisar rifas disponíveis</li>
              <li>• Ver números e detalhes das rifas</li>
              <li>• Reservar números de rifas públicas</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
