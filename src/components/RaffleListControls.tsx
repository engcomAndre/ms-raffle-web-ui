'use client'

interface RaffleListControlsProps {
  totalRaffles: number
  itemsPerPage: number
  currentPage: number
  totalPages: number
  onItemsPerPageChange: (value: number) => void
  onPageChange: (page: number) => void
  isLoading?: boolean
}

export function RaffleListControls({ 
  totalRaffles, 
  itemsPerPage, 
  currentPage,
  totalPages,
  onItemsPerPageChange, 
  onPageChange,
  isLoading = false 
}: RaffleListControlsProps) {
  // Opções para itens por página
  const itemsPerPageOptions = [5, 10, 20, 50]

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Itens por página */}
        <div className="flex items-center space-x-2">
          <label htmlFor="items-per-page" className="text-sm font-medium text-gray-700">
            Itens por página:
          </label>
          <select
            id="items-per-page"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          >
            {itemsPerPageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Navegação de páginas - Centro */}
        {totalPages > 1 && (
          <div className="flex items-center space-x-3">
            {/* Botão página anterior */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 0 || isLoading}
              className="flex items-center justify-center w-8 h-8 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-blue-200"
              title="Página anterior"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Informação da página atual */}
            <span className="text-sm font-medium text-gray-700 bg-gray-50 px-3 py-1 rounded-md border border-gray-200">
              Página {currentPage + 1} de {totalPages}
            </span>

            {/* Botão próxima página */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1 || isLoading}
              className="flex items-center justify-center w-8 h-8 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-blue-200"
              title="Próxima página"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Total de rifas */}
        <div className="flex items-center space-x-2">
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span className="text-sm text-gray-500">Carregando...</span>
            </div>
          ) : (
            <span className="text-sm font-medium text-gray-700">
              Total: {totalRaffles} rifa{totalRaffles !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
