'use client'

interface RaffleListFiltersProps {
  searchTerm: string
  statusFilter: string
  onSearchChange: (value: string) => void
  onStatusFilterChange: (value: string) => void
  isLoading?: boolean
}

export function RaffleListFilters({ 
  searchTerm, 
  statusFilter, 
  onSearchChange, 
  onStatusFilterChange, 
  isLoading = false 
}: RaffleListFiltersProps) {
  const statusOptions = [
    { value: 'all', label: 'Todos os status' },
    { value: 'active', label: 'Ativas' },
    { value: 'inactive', label: 'Inativas' }
  ]

  return (
    <div className="flex items-center space-x-4">
      {/* Campo de busca */}
      <div className="flex items-center space-x-2">
        <label htmlFor="search" className="text-sm font-medium text-gray-700">
          Buscar:
        </label>
        <div className="relative">
          <input
            id="search"
            type="text"
            placeholder="Título da rifa..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-48"
            disabled={isLoading}
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              title="Limpar busca"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Filtro de status */}
      <div className="flex items-center space-x-2">
        <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
          Status:
        </label>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={isLoading}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
