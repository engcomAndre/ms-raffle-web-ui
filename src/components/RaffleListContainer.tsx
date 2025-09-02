'use client'

import { RaffleList } from './RaffleList'

interface RaffleListContainerProps {
  // Props podem ser adicionadas conforme necessário
}

export function RaffleListContainer({}: RaffleListContainerProps) {
  return (
    <div className="space-y-6">
      {/* Header com informações de paginação e total */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Itens</span>
              <select className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            <span className="font-medium">Total: </span>
            <span className="font-semibold text-gray-900">10 rifas</span>
          </div>
        </div>
      </div>

      {/* Componente de listagem de rifas */}
      <RaffleList />
    </div>
  )
}
