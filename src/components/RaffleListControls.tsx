'use client'

interface RaffleListControlsProps {
  totalRaffles: number
  itemsPerPage: number
  onItemsPerPageChange: (value: number) => void
  isLoading?: boolean
}

export function RaffleListControls({ 
  totalRaffles, 
  itemsPerPage, 
  onItemsPerPageChange, 
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
