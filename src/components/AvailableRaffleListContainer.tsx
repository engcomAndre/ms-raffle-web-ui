'use client'

import { useState, useEffect, useRef } from 'react'
import { AvailableRaffleList, AvailableRaffleListRef } from './AvailableRaffleList'
import { RaffleListControls } from './RaffleListControls'

interface AvailableRaffleListContainerProps {
  className?: string
}

export function AvailableRaffleListContainer({ className = '' }: AvailableRaffleListContainerProps) {
  const [totalRaffles, setTotalRaffles] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [isLoading, setIsLoading] = useState(true)
  
  // Ref para acessar métodos do AvailableRaffleList
  const raffleListRef = useRef<AvailableRaffleListRef>(null)

  const handleRefresh = () => {
    console.log('🔄 [AVAILABLE-RAFFLE-CONTAINER] Refresh solicitado')
    raffleListRef.current?.refresh()
  }

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value)
    setCurrentPage(0) // Reset para primeira página quando mudar itens por página
  }

  const handlePageChange = (page: number) => {
    console.log('🔄 [AVAILABLE-RAFFLE-CONTAINER] Mudança de página solicitada:', page)
    // Garantir que a página não seja negativa e não exceda o total de páginas
    const validPage = Math.max(0, Math.min(page, totalPages - 1))
    console.log('🔄 [AVAILABLE-RAFFLE-CONTAINER] Página válida calculada:', validPage)
    setCurrentPage(validPage)
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

  return (
    <div className={`bg-gray-50 rounded-lg shadow-lg border border-gray-200 p-6 space-y-4 ${className}`}>
      {/* Cabeçalho com título */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Rifas Disponíveis</h2>
          <p className="text-sm text-gray-600">Visualize rifas de outros usuários e reserve números</p>
        </div>
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
        <AvailableRaffleList 
          ref={raffleListRef}
          currentPage={currentPage}
          pageSize={itemsPerPage}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onRefresh={handleRefresh}
          onDataChange={handleDataChange}
        />
      </div>
    </div>
  )
}
