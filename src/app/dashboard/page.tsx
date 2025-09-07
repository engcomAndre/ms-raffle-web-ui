'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { CreateRaffleModal } from '@/components/CreateRaffleModal'
import { RaffleListContainer } from '@/components/RaffleListContainer'
import { useGoogleButtonSafe } from '@/hooks/useGoogleButtonSafe'
import { raffleService } from '@/services/raffleService'

export default function DashboardPage() {
  const { user } = useGoogleButtonSafe()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [stats, setStats] = useState({
    totalRaffles: 0,
    totalRevenue: 0,
    totalParticipants: 0,
    activeRaffles: 0
  })
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  // Carregar estatísticas das rifas
  const loadStats = async () => {
    try {
      setIsLoadingStats(true)
      const response = await raffleService.getMyRafflesWithPagination(0, 100)
      
      if (response.success && response.data) {
        const raffles = response.data.content || []
        const now = new Date()
        
        const totalRaffles = raffles.length
        const activeRaffles = raffles.filter(raffle => {
          const startDate = new Date(raffle.startAt)
          const endDate = new Date(raffle.endAt)
          return startDate <= now && now <= endDate && raffle.isActive
        }).length
        
        // Calcular receita total (simplificado - assumindo preço fixo por número)
        const totalRevenue = raffles.reduce((sum, raffle) => {
          // Aqui você pode implementar lógica mais complexa baseada nos números vendidos
          return sum + (raffle.maxNumbers * 10) // Exemplo: R$ 10 por número
        }, 0)
        
        // Calcular participantes únicos (simplificado)
        const totalParticipants = raffles.reduce((sum, raffle) => {
          // Aqui você pode implementar lógica baseada nos números vendidos
          return sum + Math.floor(raffle.maxNumbers * 0.3) // Exemplo: 30% dos números vendidos
        }, 0)
        
        setStats({
          totalRaffles,
          totalRevenue,
          totalParticipants,
          activeRaffles
        })
        
        console.log('📊 [DASHBOARD] Estatísticas carregadas:', {
          totalRaffles,
          activeRaffles,
          totalRevenue,
          totalParticipants
        })
      }
    } catch (error) {
      console.error('❌ [DASHBOARD] Erro ao carregar estatísticas:', error)
    } finally {
      setIsLoadingStats(false)
    }
  }

  // Carregar estatísticas na montagem do componente
  useEffect(() => {
    loadStats()
  }, [])

  // Função para recarregar dados após criação de rifa
  const handleCreateSuccess = () => {
    console.log('🎉 [DASHBOARD] Rifa criada com sucesso, recarregando estatísticas...')
    loadStats()
  }

  return (
    <DashboardLayout currentPage="Minhas Rifas">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Bem-vindo ao Dashboard, {user?.name?.split(' ')[0] || 'Usuário'}!
        </h1>
        <p className="text-gray-600">
          Gerencie suas rifas e acompanhe o desempenho dos seus sorteios
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Rifas</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoadingStats ? '...' : stats.totalRaffles}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Receita Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoadingStats ? '...' : new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(stats.totalRevenue)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Participantes</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoadingStats ? '...' : stats.totalParticipants}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rifas Ativas</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoadingStats ? '...' : stats.activeRaffles}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Rifas */}
      <RaffleListContainer />

      {/* Modal de criação de rifa */}
      <CreateRaffleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </DashboardLayout>
  )
}