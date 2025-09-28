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
  
  const applyFilters = (raffles: RaffleResponse[]) => {
    let filtered = [...raffles]

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim()
      filtered = filtered.filter(raffle => 
        raffle.title?.toLowerCase().includes(searchLower) ||
        raffle.prize?.toLowerCase().includes(searchLower) ||
        raffle.description?.toLowerCase().includes(searchLower)
      )
    }

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

  const loadRaffles = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('🔄 [AVAILABLE-RAFFLE-LIST] Carregando rifas disponíveis...', {
        search: searchTerm,
        status: statusFilter
      })

      const response = await raffleService.getPublicRafflesWithPagination(0, 100) // Carrega até 100 rifas
      
      if (response.success && response.data) {
        const pageData = response.data as RafflePageResponse
        const allData = pageData.content || []
        
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

  useImperativeHandle(ref, () => ({
    refresh: loadRaffles
  }))

  useEffect(() => {
    loadRaffles()
  }, [])

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

  const getPaginatedRaffles = () => {
    const startIndex = currentPage * pageSize
    const endIndex = startIndex + pageSize
    return filteredRaffles.slice(startIndex, endIndex)
  }

  const paginatedRaffles = getPaginatedRaffles()

  useEffect(() => {
    if (onDataChange) {
      const totalPages = Math.ceil(filteredRaffles.length / pageSize)
      onDataChange(filteredRaffles.length, totalPages)
    }
  }, [filteredRaffles.length, pageSize, onDataChange])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
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
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {paginatedRaffles.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg font-medium text-gray-900 mb-2">
              {filteredRaffles.length === 0 ? 'Nenhuma rifa disponível encontrada' : 'Nenhuma rifa nesta página'}
            </p>
            <p className="text-gray-500">
              {filteredRaffles.length === 0 
                ? (searchTerm || statusFilter !== 'all' 
                  ? 'Tente ajustar os filtros.' 
                  : 'Não há rifas disponíveis de outros usuários no momento.')
                : 'Navegue para uma página diferente.'
              }
            </p>
          </div>
        ) : (
          paginatedRaffles.map((raffle) => (
            <AvailableRaffleListItem
              key={raffle.id}
              raffle={raffle}
            />
          ))
        )}
      </div>
    </div>
  )
})
