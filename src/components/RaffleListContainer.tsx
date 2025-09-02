'use client'

import { useState, useEffect } from 'react'
import { RaffleList } from './RaffleList'
import { RaffleListControls } from './RaffleListControls'
import { FilterOptions } from './RaffleListFilters'
import { raffleService } from '@/services/raffleService'

interface RaffleListContainerProps {
  className?: string
}

export function RaffleListContainer({ className = '' }: RaffleListContainerProps) {
  const [totalRaffles, setTotalRaffles] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  
  // Estados dos filtros
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    statusFilter: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  // Carregar dados de paginação
  useEffect(() => {
    const loadPaginationData = async () => {
      try {
        setIsLoading(true)
        const response = await raffleService.getMyRafflesWithPagination(currentPage, itemsPerPage)
        if (response.success && response.data) {
          setTotalRaffles(response.data.totalElements || 0)
          setTotalPages(response.data.totalPages || 0)
        }
      } catch (error) {
        console.error('❌ [RAFFLE-CONTAINER] Erro ao carregar dados de paginação:', error)
        setTotalRaffles(0)
        setTotalPages(0)
      } finally {
        setIsLoading(false)
      }
    }

    loadPaginationData()
  }, [currentPage, itemsPerPage, filters])



  const handleRefresh = () => {
    // Recarregar dados de paginação quando a lista for atualizada
    const loadPaginationData = async () => {
      try {
        const response = await raffleService.getMyRafflesWithPagination(currentPage, itemsPerPage)
        if (response.success && response.data) {
          setTotalRaffles(response.data.totalElements || 0)
          setTotalPages(response.data.totalPages || 0)
        }
      } catch (error) {
        console.error('❌ [RAFFLE-CONTAINER] Erro ao recarregar dados de paginação:', error)
      }
    }

    loadPaginationData()
  }

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value)
    setCurrentPage(0) // Reset para primeira página quando mudar itens por página
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters)
    setCurrentPage(0) // Reset para primeira página quando mudar filtros
  }

  const handleClearFilters = () => {
    setFilters({
      searchTerm: '',
      statusFilter: 'all',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
    setCurrentPage(0)
  }

  return (
    <div className={`bg-gray-50 rounded-lg shadow-lg border border-gray-200 p-6 space-y-4 ${className}`}>
      {/* Cabeçalho com controles */}
      <RaffleListControls
        totalRaffles={totalRaffles}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        totalPages={totalPages}
        filters={filters}
        onItemsPerPageChange={handleItemsPerPageChange}
        onPageChange={handlePageChange}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
        isLoading={isLoading}
      />

      {/* Lista de rifas */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <RaffleList 
          currentPage={currentPage}
          pageSize={itemsPerPage}
          onRefresh={handleRefresh} 
        />
      </div>
    </div>
  )
}





