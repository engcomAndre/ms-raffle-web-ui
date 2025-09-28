'use client'

interface RaffleListPaginationProps {
  totalRaffles: number
  itemsPerPage: number
  currentPage: number
  totalPages: number
  onItemsPerPageChange: (value: number) => void
  onPageChange: (page: number) => void
  isLoading?: boolean
}

export function RaffleListPagination({
  totalRaffles,
  itemsPerPage,
  currentPage,
  totalPages,
  onItemsPerPageChange,
  onPageChange,
  isLoading = false
}: RaffleListPaginationProps) {
  // Opções para itens por página
  const itemsPerPageOptions = [5, 10, 20, 50]

  // Debug logs
  console.log('🔍 [RAFFLE-LIST-PAGINATION] Props recebidas:', {
    totalRaffles,
    itemsPerPage,
    currentPage,
    totalPages,
    isLoading
  })

  return (
    <div className="flex items-center space-x-4">
      {/* Total de rifas */}
      <div className="flex items-center space-x-2">
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="text-sm text-gray-500">Carregando...</span>
          </div>
        ) : (
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Total: {totalRaffles} rifa{totalRaffles !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Itens por página */}
      <div className="flex items-center space-x-2">
        <label htmlFor="items-per-page" className="text-sm font-medium text-gray-700 whitespace-nowrap">
          Por página:
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

      {/* Navegação de páginas */}
      <div className="flex items-center space-x-2">
        {/* Botão página anterior */}
        <button
          onClick={() => {
            console.log('🔄 [RAFFLE-LIST-PAGINATION] Clicou em página anterior, página atual:', currentPage)
            onPageChange(currentPage - 1)
          }}
          disabled={currentPage === 0 || isLoading}
          className="flex items-center justify-center w-8 h-8 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-blue-200"
          title="Página anterior"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Informação da página atual */}
        <span className="text-sm font-medium text-gray-700 bg-gray-50 px-3 py-1 rounded-md border border-gray-200 whitespace-nowrap">
          Página {currentPage + 1} de {totalPages}
        </span>

        {/* Botão próxima página */}
        <button
          onClick={() => {
            console.log('🔄 [RAFFLE-LIST-PAGINATION] Clicou em próxima página, página atual:', currentPage)
            onPageChange(currentPage + 1)
          }}
          disabled={currentPage >= totalPages - 1 || isLoading}
          className="flex items-center justify-center w-8 h-8 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-blue-200"
          title="Próxima página"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
