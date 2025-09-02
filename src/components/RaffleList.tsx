'use client'

import { useState, useEffect } from 'react'
import { raffleService } from '@/services/raffleService'
import { RaffleResponse, RafflePageResponse } from '@/types/raffle'
import { RaffleListItem } from './RaffleListItem'

interface RaffleListProps {
  onRefresh?: () => void
}

// Componente de ícone de ordenação
const SortIcon = ({ isActive, order }: { isActive: boolean; order: 'asc' | 'desc' }) => {
  if (!isActive) {
    return (
      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    )
  }
  
  return (
    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
      {order === 'asc' ? (
        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
      ) : (
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
      )}
    </svg>
  )
}

export function RaffleList({ onRefresh }: RaffleListProps) {
  const [raffles, setRaffles] = useState<RaffleResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrevious, setHasPrevious] = useState(false)

  // Estados de filtros e ordenação
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortFields, setSortFields] = useState<Array<{field: string, order: 'asc' | 'desc'}>>([
    { field: 'createdAt', order: 'desc' }
  ])

  // Carregar rifas com paginação, filtros e ordenação
  const loadRaffles = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('🔄 [RAFFLE-LIST] Carregando rifas...', {
        page: currentPage,
        size: pageSize,
        search: searchTerm,
        status: statusFilter,
        sort: sortFields
      })

      const response = await raffleService.getMyRafflesWithPagination(currentPage, pageSize)
      
      if (response.success && response.data) {
        const data = response.data as RafflePageResponse
        setRaffles(data.content || [])
        setTotalElements(data.totalElements || 0)
        setTotalPages(data.totalPages || 0)
        setHasNext(data.hasNext || false)
        setHasPrevious(data.hasPrevious || false)
        
        console.log('✅ [RAFFLE-LIST] Rifas carregadas:', {
          total: data.totalElements,
          current: data.content?.length,
          page: currentPage + 1,
          totalPages: data.totalPages
        })
      } else {
        setError('Erro ao carregar rifas')
        console.error('❌ [RAFFLE-LIST] Erro na resposta:', response)
      }
    } catch (error) {
      console.error('❌ [RAFFLE-LIST] Erro ao carregar rifas:', error)
      setError('Erro ao carregar rifas')
    } finally {
      setIsLoading(false)
    }
  }

  // Carregar rifas quando os parâmetros mudarem
  useEffect(() => {
    loadRaffles()
  }, [currentPage, pageSize, searchTerm, statusFilter, sortFields])

  // Função para adicionar/remover ordenação
  const toggleSort = (field: string) => {
    setSortFields(prev => {
      const existing = prev.find(s => s.field === field)
      if (existing) {
        if (existing.order === 'asc') {
          return prev.map(s => s.field === field ? { ...s, order: 'desc' as const } : s)
        } else {
          return prev.filter(s => s.field !== field)
        }
      } else {
        return [...prev, { field, order: 'asc' as const }]
      }
    })
  }

  // Função para remover ordenação específica
  const removeSort = (field: string) => {
    setSortFields(prev => prev.filter(s => s.field !== field))
  }

  // Função para limpar todas as ordenações
  const clearAllSorts = () => {
    setSortFields([])
  }

  // Handlers para ações das rifas
  const handleEdit = (raffle: RaffleResponse) => {
    console.log('✏️ [RAFFLE-LIST] Editando rifa:', raffle.id)
    // TODO: Implementar modal de edição
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

  // Campos disponíveis para ordenação
  const sortableFields = [
    { key: 'title', label: 'Título' },
    { key: 'price', label: 'Preço' },
    { key: 'totalNumbers', label: 'Total de Números' },
    { key: 'active', label: 'Status' },
    { key: 'createdAt', label: 'Data de Criação' },
    { key: 'updatedAt', label: 'Data de Atualização' }
  ]

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
      {/* Filtros e Busca */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Busca */}
          <div className="flex-1 max-w-md">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Buscar rifas
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Digite o título da rifa..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Filtro de Status */}
          <div className="lg:ml-4">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todas</option>
              <option value="active">Ativas</option>
              <option value="inactive">Inativas</option>
            </select>
          </div>

          {/* Tamanho da página */}
          <div className="lg:ml-4">
            <label htmlFor="pageSize" className="block text-sm font-medium text-gray-700 mb-2">
              Itens por página
            </label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ordenação */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Ordenar por:</span>
            <div className="flex flex-wrap gap-2">
              {sortableFields.map((field) => {
                const sortField = sortFields.find(s => s.field === field.key)
                return (
                  <button
                    key={field.key}
                    onClick={() => toggleSort(field.key)}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-colors"
                    style={{
                      backgroundColor: sortField ? '#dbeafe' : 'white',
                      borderColor: sortField ? '#3b82f6' : '#d1d5db',
                      color: sortField ? '#1e40af' : '#6b7280'
                    }}
                  >
                    {field.label}
                    <SortIcon isActive={!!sortField} order={sortField?.order || 'asc'} />
                  </button>
                )
              })}
            </div>
          </div>
          
          <div className="ml-auto flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {raffles.length} rifa{raffles.length !== 1 ? 's' : ''} encontrada{raffles.length !== 1 ? 's' : ''}
            </span>
            {sortFields.length > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                {sortFields.length} ordenação{sortFields.length !== 1 ? 'ões' : 'ão'}
              </span>
            )}
          </div>
        </div>

        {/* Ordenações ativas */}
        {sortFields.length > 0 && (
          <div className="border-t pt-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {sortFields.map((sort) => (
                  <span
                    key={sort.field}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {sortableFields.find(f => f.key === sort.field)?.label} ({sort.order === 'asc' ? 'A-Z' : 'Z-A'})
                    <button
                      onClick={() => removeSort(sort.field)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                      title="Remover ordenação"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
              <button
                onClick={clearAllSorts}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Limpar todas
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lista de Rifas */}
      <div className="space-y-4">
        {raffles.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg font-medium text-gray-900 mb-2">Nenhuma rifa encontrada</p>
            <p className="text-gray-500">Tente ajustar os filtros ou criar uma nova rifa.</p>
          </div>
        ) : (
          raffles.map((raffle) => (
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

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={!hasPrevious}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={!hasNext}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próximo
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{currentPage * pageSize + 1}</span> até{' '}
                <span className="font-medium">
                  {Math.min((currentPage + 1) * pageSize, totalElements)}
                </span>{' '}
                de <span className="font-medium">{totalElements}</span> resultados
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={!hasPrevious}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Anterior</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Páginas */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + Math.max(0, currentPage - 2)
                  if (page >= totalPages) return null
                  
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page + 1}
                    </button>
                  )
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={!hasNext}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Próximo</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}