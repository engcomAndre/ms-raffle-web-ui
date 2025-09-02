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
      <div className="flex items-center justify-between">
        {/* Filtros à esquerda */}
        <RaffleListFilter
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onSearchChange={onSearchChange}
          onStatusFilterChange={onStatusFilterChange}
          onClearFilters={onClearFilters}
          isLoading={isLoading}
        />

        {/* Paginação à direita */}
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
  )
}