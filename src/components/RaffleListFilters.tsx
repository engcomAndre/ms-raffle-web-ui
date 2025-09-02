'use client'

import { useState } from 'react'

export interface FilterOptions {
  searchTerm: string
  statusFilter: 'all' | 'active' | 'inactive'
  sortBy: 'createdAt' | 'title' | 'endAt'
  sortOrder: 'asc' | 'desc'
}

interface RaffleListFiltersProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  onClearFilters: () => void
  isLoading?: boolean
}

export function RaffleListFilters({ 
  filters, 
  onFiltersChange, 
  onClearFilters,
  isLoading = false 
}: RaffleListFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, searchTerm: value })
  }

  const handleStatusChange = (value: FilterOptions['statusFilter']) => {
    onFiltersChange({ ...filters, statusFilter: value })
  }

  const handleSortByChange = (value: FilterOptions['sortBy']) => {
    onFiltersChange({ ...filters, sortBy: value })
  }

  const handleSortOrderChange = (value: FilterOptions['sortOrder']) => {
    onFiltersChange({ ...filters, sortOrder: value })
  }

  const hasActiveFilters = filters.searchTerm !== '' || 
                          filters.statusFilter !== 'all' || 
                          filters.sortBy !== 'createdAt' || 
                          filters.sortOrder !== 'desc'

  return (
    <div className="flex items-center space-x-3">
      {/* Botão de toggle dos filtros */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${
          hasActiveFilters 
            ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
        }`}
        disabled={isLoading}
        title="Filtros e ordenação"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
        </svg>
        <span>Filtros</span>
        {hasActiveFilters && (
          <span className="bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center">
            {[
              filters.searchTerm !== '',
              filters.statusFilter !== 'all',
              filters.sortBy !== 'createdAt',
              filters.sortOrder !== 'desc'
            ].filter(Boolean).length}
          </span>
        )}
        <svg 
          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Painel de filtros expandido */}
      {isExpanded && (
        <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-md border border-gray-200">
          {/* Campo de busca */}
          <div className="flex items-center space-x-2">
            <label htmlFor="search" className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Buscar:
            </label>
            <input
              id="search"
              type="text"
              value={filters.searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Título da rifa..."
              className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-40"
              disabled={isLoading}
            />
          </div>

          {/* Filtro de status */}
          <div className="flex items-center space-x-2">
            <label htmlFor="status" className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Status:
            </label>
            <select
              id="status"
              value={filters.statusFilter}
              onChange={(e) => handleStatusChange(e.target.value as FilterOptions['statusFilter'])}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            >
              <option value="all">Todas</option>
              <option value="active">Ativas</option>
              <option value="inactive">Inativas</option>
            </select>
          </div>

          {/* Ordenação */}
          <div className="flex items-center space-x-2">
            <label htmlFor="sortBy" className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Ordenar por:
            </label>
            <select
              id="sortBy"
              value={filters.sortBy}
              onChange={(e) => handleSortByChange(e.target.value as FilterOptions['sortBy'])}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            >
              <option value="createdAt">Data de criação</option>
              <option value="title">Título</option>
              <option value="endAt">Data de término</option>
            </select>
          </div>

          {/* Direção da ordenação */}
          <div className="flex items-center space-x-2">
            <select
              value={filters.sortOrder}
              onChange={(e) => handleSortOrderChange(e.target.value as FilterOptions['sortOrder'])}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            >
              <option value="desc">Decrescente</option>
              <option value="asc">Crescente</option>
            </select>
          </div>

          {/* Botão limpar filtros */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center space-x-1 px-2 py-1 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
              disabled={isLoading}
              title="Limpar todos os filtros"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Limpar</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
