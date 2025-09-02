'use client'

import { useState } from 'react'

interface RaffleListFilterProps {
  searchTerm: string
  statusFilter: 'all' | 'active' | 'inactive'
  onSearchChange: (search: string) => void
  onStatusFilterChange: (status: 'all' | 'active' | 'inactive') => void
  onClearFilters: () => void
  isLoading?: boolean
}

export function RaffleListFilter({
  searchTerm,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
  onClearFilters,
  isLoading = false
}: RaffleListFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'all'

  return (
    <div className="flex items-center space-x-3">
      {/* Botão para expandir/colapsar filtros */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-md border transition-colors ${
          hasActiveFilters
            ? 'bg-blue-50 border-blue-200 text-blue-700'
            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
        }`}
        disabled={isLoading}
        title="Filtros"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707v4.586a1 1 0 01-.293.707l-2 2A1 1 0 0110 21v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span className="text-sm font-medium">Filtros</span>
        {hasActiveFilters && (
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
            {(searchTerm ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0)}
          </span>
        )}
        <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Filtros expandidos */}
      {isExpanded && (
        <div className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
          {/* Campo de busca */}
          <div className="flex items-center space-x-2">
            <label htmlFor="search" className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Buscar:
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Título ou prêmio..."
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-48"
              disabled={isLoading}
            />
          </div>

          {/* Filtro de status */}
          <div className="flex items-center space-x-2">
            <label htmlFor="status-filter" className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Status:
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value as 'all' | 'active' | 'inactive')}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            >
              <option value="all">Todos</option>
              <option value="active">Ativas</option>
              <option value="inactive">Inativas</option>
            </select>
          </div>

          {/* Botão limpar filtros */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
              disabled={isLoading}
            >
              Limpar
            </button>
          )}
        </div>
      )}
    </div>
  )
}
