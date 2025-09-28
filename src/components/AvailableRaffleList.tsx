'use client'

import { useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import { raffleService } from '@/services/raffleService'
import { RaffleResponse, RafflePageResponse } from '@/types/raffle'
import { AvailableRaffleListItem } from './AvailableRaffleListItem'

interface AvailableRaffleListProps {
  currentPage?: number
  pageSize?: number
  searchTerm?: string
  statusFilter?: 'all' | 'active' | 'inactive'
  onRefresh?: () => void
  onDataChange?: (totalRaffles: number, totalPages: number) => void
}

export interface AvailableRaffleListRef {
  refresh: () => void
}

export const AvailableRaffleList = forwardRef<AvailableRaffleListRef, AvailableRaffleListProps>(({ 
  currentPage = 0, 
  pageSize = 10, 
  searchTerm = '', 
  statusFilter = 'all', 
  onRefresh,
  onDataChange
}, ref) => {
  const [allRaffles, setAllRaffles] = useState<RaffleResponse[]>([])
  const [filteredRaffles, setFilteredRaffles] = useState<RaffleResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Função para aplicar filtros
  const applyFilters = (raffles: RaffleResponse[]) => {
    let filtered = [...raffles]

    // Filtro por termo de busca (título, prêmio ou descrição)
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim()
      filtered = filtered.filter(raffle => 
        raffle.title?.toLowerCase().includes(searchLower) ||
        raffle.prize?.toLowerCase().includes(searchLower) ||
        raffle.description?.toLowerCase().includes(searchLower)
      )
    }

    // Filtro por status (usando a flag active)
    if (statusFilter !== 'all') {
      filtered = filtered.filter(raffle => {
        if (statusFilter === 'active') {
          return raffle.active === true
        } else if (statusFilter === 'inactive') {
          return raffle.active === false
        }
        return true
      })
    }

    return filtered
  }

  // Carregar rifas disponíveis (de outros usuários)
  const loadRaffles = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('🔄 [AVAILABLE-RAFFLE-LIST] Carregando rifas disponíveis...', {
        search: searchTerm,
        status: statusFilter
      })

      // Carregar todas as rifas disponíveis (de outros usuários) com paginação
      const response = await raffleService.getPublicRafflesWithPagination(0, 100)
      
      if (response.success && response.data) {
        const pageData = response.data as RafflePageResponse
        const allData = pageData.content || []
        
        // As rifas já vêm filtradas (ativas e não deletadas) do backend
        const availableRaffles = allData
        
        setAllRaffles(availableRaffles)
        
        console.log('✅ [AVAILABLE-RAFFLE-LIST] Rifas disponíveis carregadas:', {
          total: availableRaffles.length,
          search: searchTerm,
          status: statusFilter
        })
      } else {
        setError('Erro ao carregar rifas disponíveis')
        console.error('❌ [AVAILABLE-RAFFLE-LIST] Erro na resposta:', response)
        setAllRaffles([])
      }
    } catch (error) {
      console.error('❌ [AVAILABLE-RAFFLE-LIST] Erro ao carregar rifas disponíveis:', error)
      setError('Erro ao carregar rifas disponíveis')
      setAllRaffles([])
    } finally {
      setIsLoading(false)
    }
  }

  // Expor função de refresh via ref
  useImperativeHandle(ref, () => ({
    refresh: loadRaffles
  }))

  // Carregar rifas apenas quando não há filtros ou na primeira carga
  useEffect(() => {
    loadRaffles()
  }, []) // Carrega apenas uma vez

  // Aplicar filtros sempre que os dados ou filtros mudarem
  useEffect(() => {
    const filtered = applyFilters(allRaffles)
    setFilteredRaffles(filtered)
    
    console.log('🔍 [AVAILABLE-RAFFLE-LIST] Filtros aplicados:', {
      total: allRaffles.length,
      filtered: filtered.length,
      search: searchTerm,
      status: statusFilter
    })
  }, [allRaffles, searchTerm, statusFilter])

  // Calcular dados paginados localmente
  const getPaginatedRaffles = () => {
    const startIndex = currentPage * pageSize
    const endIndex = startIndex + pageSize
    return filteredRaffles.slice(startIndex, endIndex)
  }

  const paginatedRaffles = getPaginatedRaffles()

  // Notificar o container sobre mudanças nos dados
  useEffect(() => {
    if (onDataChange) {
      const totalPages = Math.ceil(filteredRaffles.length / pageSize)
      onDataChange(filteredRaffles.length, totalPages)
    }
  }, [filteredRaffles.length, pageSize, onDataChange])

  // Handlers para ações das rifas (apenas visualização)
  const handleViewNumbers = (raffleId: string) => {
    console.log('👀 [AVAILABLE-RAFFLE-LIST] Visualizando números da rifa:', raffleId)
    // TODO: Implementar modal de visualização de números (somente leitura)
  }

  const handleReserveNumber = (raffleId: string, number: number) => {
    console.log('🔒 [AVAILABLE-RAFFLE-LIST] Reservando número:', number, 'da rifa:', raffleId)
    // TODO: Implementar funcionalidade de reserva de números
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando rifas disponíveis...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-medium">Erro ao carregar rifas disponíveis</p>
          <p className="text-sm text-gray-500 mt-2">{error}</p>
        </div>
        <button
          onClick={loadRaffles}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Lista de Rifas Disponíveis */}
      <div className="space-y-4">
        {paginatedRaffles.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-lg font-medium text-gray-900 mb-2">
              {filteredRaffles.length === 0 ? 'Nenhuma rifa disponível' : 'Nenhuma rifa nesta página'}
            </p>
            <p className="text-gray-500">
              {filteredRaffles.length === 0 
                ? (searchTerm || statusFilter !== 'all' 
                  ? 'Tente ajustar os filtros para encontrar rifas disponíveis.' 
                  : 'Não há rifas ativas disponíveis no momento.')
                : 'Navegue para uma página diferente.'
              }
            </p>
          </div>
        ) : (
          paginatedRaffles.map((raffle) => (
            <AvailableRaffleListItem
              key={raffle.id}
              raffle={raffle}
              onViewNumbers={handleViewNumbers}
              onReserveNumber={handleReserveNumber}
            />
          ))
        )}
      </div>
    </div>
  )
})
