'use client'

import { useState, useEffect } from 'react'
import { RaffleList } from './RaffleList'
import { raffleService } from '@/services/raffleService'

interface RaffleListContainerProps {
  className?: string
}

export function RaffleListContainer({ className = '' }: RaffleListContainerProps) {
  const [totalRaffles, setTotalRaffles] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [isLoading, setIsLoading] = useState(true)

  // Carregar total de rifas
  useEffect(() => {
    const loadTotalRaffles = async () => {
      try {
        setIsLoading(true)
        const response = await raffleService.getMyRafflesWithPagination(0, 1) // Página 0, tamanho 1 apenas para obter o total
        if (response.success && response.data) {
          setTotalRaffles(response.data.totalElements || 0)
        }
      } catch (error) {
        console.error('❌ [RAFFLE-CONTAINER] Erro ao carregar total de rifas:', error)
        setTotalRaffles(0)
      } finally {
        setIsLoading(false)
      }
    }

    loadTotalRaffles()
  }, [])

  // Opções para itens por página
  const itemsPerPageOptions = [5, 10, 20, 50]

  const handleRefresh = () => {
    // Recarregar total de rifas quando a lista for atualizada
    const loadTotalRaffles = async () => {
      try {
        const response = await raffleService.getMyRafflesWithPagination(0, 1)
        if (response.success && response.data) {
          setTotalRaffles(response.data.totalElements || 0)
        }
      } catch (error) {
        console.error('❌ [RAFFLE-CONTAINER] Erro ao recarregar total de rifas:', error)
      }
    }

    loadTotalRaffles()
  }

  return (
    <div className={`bg-gray-50 rounded-lg shadow-lg border border-gray-200 p-6 space-y-4 ${className}`}>
      {/* Cabeçalho com controles */}
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
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

      {/* Lista de rifas */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <RaffleList onRefresh={handleRefresh} />
      </div>
    </div>
  )
}
