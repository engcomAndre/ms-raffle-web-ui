'use client'

import { RaffleListFilter } from './RaffleListFilter'
import { RaffleListPagination } from './RaffleListPagination'

interface RaffleListControlsProps {
  totalRaffles: number
  itemsPerPage: number
  currentPage: number
  totalPages: number
  searchTerm: string
  statusFilter: 'all' | 'active' | 'inactive'
  onItemsPerPageChange: (value: number) => void
  onPageChange: (page: number) => void
  onSearchChange: (search: string) => void
  onStatusFilterChange: (status: 'all' | 'active' | 'inactive') => void
  onClearFilters: () => void
  isLoading?: boolean
}

export function RaffleListControls({ 
  totalRaffles, 
  itemsPerPage, 
  currentPage,
  totalPages,
  searchTerm,
  statusFilter,
  onItemsPerPageChange, 
  onPageChange,
  onSearchChange,
  onStatusFilterChange,
  onClearFilters,
  isLoading = false 
}: RaffleListControlsProps) {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        {/* Container dos Filtros - Alinhado à esquerda */}
        <div className="flex items-center justify-start flex-shrink-0">
          <RaffleListFilter
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            onSearchChange={onSearchChange}
            onStatusFilterChange={onStatusFilterChange}
            onClearFilters={onClearFilters}
            isLoading={isLoading}
          />
        </div>

        {/* Espaço flexível no meio */}
        <div className="flex-grow"></div>

        {/* Container da Paginação - Alinhado à direita */}
        <div className="flex items-center justify-end flex-shrink-0">
          <RaffleListPagination
            totalRaffles={totalRaffles}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            totalPages={totalPages}
            onItemsPerPageChange={onItemsPerPageChange}
            onPageChange={onPageChange}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}