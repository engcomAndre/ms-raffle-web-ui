'use client'

import { useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import { raffleService } from '@/services/raffleService'
import { RaffleResponse, RafflePageResponse } from '@/types/raffle'
import { RaffleListItem } from './RaffleListItem'
import { RaffleEditModal } from './RaffleEditModal'

interface RaffleListProps {
  currentPage?: number
  pageSize?: number
  searchTerm?: string
  statusFilter?: 'all' | 'active' | 'inactive'
  onRefresh?: () => void
  onDataChange?: (totalRaffles: number, totalPages: number) => void
}

export interface RaffleListRef {
  refresh: () => void
}



export const RaffleList = forwardRef<RaffleListRef, RaffleListProps>(({ 
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
  
  // Estados internos removidos - agora vêm via props

  // Estados do modal de edição
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [raffleToEdit, setRaffleToEdit] = useState<RaffleResponse | null>(null)

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

  // Carregar rifas com paginação
  const loadRaffles = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('🔄 [RAFFLE-LIST] Carregando rifas...', {
        search: searchTerm,
        status: statusFilter
      })

      // Carregar todas as rifas (ou uma quantidade maior) para filtrar localmente
      const response = await raffleService.getMyRafflesWithPagination(0, 100) // Carrega até 100 rifas
      
      if (response.success && response.data) {
        const data = response.data as RafflePageResponse
        const allData = data.content || []
        
        setAllRaffles(allData)
        
        console.log('✅ [RAFFLE-LIST] Rifas carregadas:', {
          total: allData.length,
          search: searchTerm,
          status: statusFilter
        })
      } else {
        setError('Erro ao carregar rifas')
        console.error('❌ [RAFFLE-LIST] Erro na resposta:', response)
        setAllRaffles([])
      }
    } catch (error) {
      console.error('❌ [RAFFLE-LIST] Erro ao carregar rifas:', error)
      setError('Erro ao carregar rifas')
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
    
    console.log('🔍 [RAFFLE-LIST] Filtros aplicados:', {
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


  // Handlers para ações das rifas
  const handleEdit = (raffle: RaffleResponse) => {
    console.log('✏️ [RAFFLE-LIST] Editando rifa:', raffle.id)
    setRaffleToEdit(raffle)
    setIsEditModalOpen(true)
  }

  const handleEditModalClose = () => {
    setIsEditModalOpen(false)
    setRaffleToEdit(null)
  }

  const handleEditSuccess = () => {
    console.log('✅ [RAFFLE-LIST] Rifa editada com sucesso, recarregando lista')
    loadRaffles()
    onRefresh?.()
  }

  const handleDelete = async (raffleId: string) => {
    if (confirm('Tem certeza que deseja excluir esta rifa?')) {
      try {
        console.log('🗑️ [RAFFLE-LIST] Excluindo rifa:', raffleId)
        const response = await raffleService.deleteRaffle(raffleId)
        
        if (response.success) {
          console.log('✅ [RAFFLE-LIST] Rifa excluída com sucesso')
          loadRaffles() // Recarregar lista
          onRefresh?.() // Notificar componente pai
        } else {
          console.error('❌ [RAFFLE-LIST] Erro ao excluir rifa:', response.error)
          alert('Erro ao excluir rifa')
        }
      } catch (error) {
        console.error('❌ [RAFFLE-LIST] Erro ao excluir rifa:', error)
        alert('Erro ao excluir rifa')
      }
    }
  }

  const handleToggleStatus = async (raffleId: string, newStatus: boolean) => {
    try {
      console.log('🔄 [RAFFLE-LIST] Alterando status da rifa:', raffleId, 'para:', newStatus)
      const response = newStatus 
        ? await raffleService.activeRaffle(raffleId)
        : await raffleService.inactiveRaffle(raffleId)
      
      if (response.success) {
        console.log('✅ [RAFFLE-LIST] Status alterado com sucesso')
        loadRaffles() // Recarregar lista
        onRefresh?.() // Notificar componente pai
      } else {
        console.error('❌ [RAFFLE-LIST] Erro ao alterar status:', response.error)
        alert('Erro ao alterar status da rifa')
      }
    } catch (error) {
      console.error('❌ [RAFFLE-LIST] Erro ao alterar status:', error)
      alert('Erro ao alterar status da rifa')
    }
  }

  const handleViewNumbers = (raffleId: string) => {
    console.log('👀 [RAFFLE-LIST] Visualizando números da rifa:', raffleId)
    // TODO: Implementar modal de visualização de números
  }



  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando rifas...</p>
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
          <p className="text-lg font-medium">Erro ao carregar rifas</p>
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




      {/* Lista de Rifas */}
      <div className="space-y-4">
        {paginatedRaffles.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg font-medium text-gray-900 mb-2">
              {filteredRaffles.length === 0 ? 'Nenhuma rifa encontrada' : 'Nenhuma rifa nesta página'}
            </p>
            <p className="text-gray-500">
              {filteredRaffles.length === 0 
                ? (searchTerm || statusFilter !== 'all' 
                  ? 'Tente ajustar os filtros ou criar uma nova rifa.' 
                  : 'Você ainda não criou nenhuma rifa.')
                : 'Navegue para uma página diferente.'
              }
            </p>
          </div>
        ) : (
          paginatedRaffles.map((raffle) => (
            <RaffleListItem
              key={raffle.id}
              raffle={raffle}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              onViewNumbers={handleViewNumbers}
            />
          ))
        )}
      </div>



      {/* Modal de Edição */}
      <RaffleEditModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        raffle={raffleToEdit}
        onSuccess={handleEditSuccess}
      />
    </div>
  )
})