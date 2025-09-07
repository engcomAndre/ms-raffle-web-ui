'use client'

import { useState, useEffect, useRef } from 'react'
import { RaffleList, RaffleListRef } from './RaffleList'
import { RaffleListControls } from './RaffleListControls'
import { CreateRaffleModal } from './CreateRaffleModal'
import { raffleService } from '@/services/raffleService'

interface RaffleListContainerProps {
  className?: string
}

export function RaffleListContainer({ className = '' }: RaffleListContainerProps) {
  const [totalRaffles, setTotalRaffles] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  
  // Ref para acessar métodos do RaffleList
  const raffleListRef = useRef<RaffleListRef>(null)

  // Remover carregamento duplicado - agora o RaffleList gerencia os dados



  const handleRefresh = () => {
    // O RaffleList vai recarregar os dados automaticamente
    console.log('🔄 [RAFFLE-CONTAINER] Refresh solicitado')
  }

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value)
    setCurrentPage(0) // Reset para primeira página quando mudar itens por página
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSearchChange = (search: string) => {
    setSearchTerm(search)
    setCurrentPage(0) // Reset para primeira página quando filtrar
  }

  const handleStatusFilterChange = (status: 'all' | 'active' | 'inactive') => {
    setStatusFilter(status)
    setCurrentPage(0) // Reset para primeira página quando filtrar
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setCurrentPage(0)
  }

  const handleDataChange = (totalRaffles: number, totalPages: number) => {
    setTotalRaffles(totalRaffles)
    setTotalPages(totalPages)
    setIsLoading(false)
  }

  const handleCreateSuccess = () => {
    // Recarregar a lista de rifas após criação bem-sucedida
    console.log('🎉 [RAFFLE-CONTAINER] Rifa criada com sucesso, recarregando lista...')
    raffleListRef.current?.refresh()
  }

  return (
    <div className={`bg-gray-50 rounded-lg shadow-lg border border-gray-200 p-6 space-y-4 ${className}`}>
      {/* Cabeçalho com título e botão de criar rifa */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Minhas Rifas</h2>
          <p className="text-sm text-gray-600">Gerencie suas rifas e acompanhe o desempenho</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          + Criar Nova Rifa
        </button>
      </div>

      {/* Cabeçalho com controles */}
      <RaffleListControls
        totalRaffles={totalRaffles}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        totalPages={totalPages}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        onItemsPerPageChange={handleItemsPerPageChange}
        onPageChange={handlePageChange}
        onSearchChange={handleSearchChange}
        onStatusFilterChange={handleStatusFilterChange}
        onClearFilters={handleClearFilters}
        isLoading={isLoading}
      />

      {/* Lista de rifas */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <RaffleList 
          ref={raffleListRef}
          currentPage={currentPage}
          pageSize={itemsPerPage}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onRefresh={handleRefresh}
          onDataChange={handleDataChange}
        />
      </div>

      {/* Modal de criação de rifa */}
      <CreateRaffleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  )
}




