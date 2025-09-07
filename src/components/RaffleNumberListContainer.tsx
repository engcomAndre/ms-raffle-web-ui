'use client'

import { useState, useEffect } from 'react'
import { RaffleNumberItemResponse, RaffleNumbersResponse } from '@/types/raffle'
import { raffleService } from '@/services/raffleService'
import { RaffleNumberList } from './RaffleNumberList'
import { RaffleNumberListPagination } from './RaffleNumberListPagination'

interface RaffleNumberListContainerProps {
  raffleId: string
  pageSize?: number
  showPagination?: boolean
  onNumbersChange?: (numbers: RaffleNumberItemResponse[], totalElements: number) => void
}

export function RaffleNumberListContainer({ 
  raffleId, 
  pageSize = 20, 
  showPagination = true,
  onNumbersChange 
}: RaffleNumberListContainerProps) {
  const [numbers, setNumbers] = useState<RaffleNumberItemResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrevious, setHasPrevious] = useState(false)

  const loadNumbers = async (page: number = 0) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await raffleService.getRaffleNumbers(raffleId, page, pageSize)
      
      if (response.success && response.data) {
        const data = response.data
        setNumbers(data.rafflesNumbers || [])
        setTotalElements(data.totalElements || 0)
        setTotalPages(data.totalPages || 0)
        setHasNext(data.hasNext || false)
        setHasPrevious(data.hasPrevious || false)
        setCurrentPage(data.pageNumber || 0)
        
        // Callback para notificar mudanças nos números
        if (onNumbersChange) {
          onNumbersChange(data.rafflesNumbers || [], data.totalElements || 0)
        }
      } else {
        setError('Erro ao carregar números da rifa')
        setNumbers([])
      }
    } catch (error) {
      console.error('Erro ao carregar números:', error)
      setError('Erro ao carregar números da rifa')
      setNumbers([])
    } finally {
      setIsLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    loadNumbers(page)
  }

  const handleRefresh = () => {
    loadNumbers(currentPage)
  }

  // Carregar números quando o componente monta ou raffleId muda
  useEffect(() => {
    if (raffleId) {
      loadNumbers(0)
    }
  }, [raffleId])

  return (
    <div className="space-y-4">
      {/* Header com informações e botão de refresh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h4 className="text-lg font-medium text-gray-900">Números da Rifa</h4>
          {totalElements > 0 && (
            <span className="text-sm text-gray-500">
              {totalElements} número{totalElements !== 1 ? 's' : ''} total{totalElements !== 1 ? 'is' : ''}
            </span>
          )}
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg 
            className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Atualizar
        </button>
      </div>

      {/* Lista de números */}
      <RaffleNumberList
        numbers={numbers}
        isLoading={isLoading}
        error={error}
        emptyMessage="Nenhum número encontrado para esta rifa."
      />

      {/* Paginação */}
      {showPagination && totalPages > 1 && (
        <RaffleNumberListPagination
          currentPage={currentPage}
          totalPages={totalPages}
          hasNext={hasNext}
          hasPrevious={hasPrevious}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  )
}
