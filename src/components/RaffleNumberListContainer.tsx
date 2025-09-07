'use client'

import { useState, useEffect } from 'react'
import { RaffleNumberItemResponse, RaffleResponse } from '@/types/raffle'
import { raffleService } from '@/services/raffleService'
import { RaffleNumberList } from './RaffleNumberList'
import { RaffleNumberListPagination } from './RaffleNumberListPagination'
import { RaffleNumberLegend } from './RaffleNumberLegend'

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
  const [currentPageSize, setCurrentPageSize] = useState(pageSize)
  const [raffleInfo, setRaffleInfo] = useState<RaffleResponse | null>(null)

  const loadRaffleInfo = async () => {
    try {
      const response = await raffleService.getRaffleById(raffleId)
      if (response.success && response.data) {
        setRaffleInfo(response.data)
      }
    } catch (error) {
      console.error('Erro ao carregar informações da rifa:', error)
    }
  }

  const loadNumbers = async (page: number = 0, size: number = currentPageSize) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await raffleService.getRaffleNumbers(raffleId, page, size)
      
      if (response.success && response.data) {
        const data = response.data
        setNumbers(data.rafflesNumbers || [])
        setTotalElements(data.totalElements || 0)
        setTotalPages(data.totalPages || 0)
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
    loadNumbers(page, currentPageSize)
  }

  const handleItemsPerPageChange = (size: number) => {
    setCurrentPageSize(size)
    setCurrentPage(0) // Reset para primeira página
    loadNumbers(0, size)
  }

  const handleRefresh = () => {
    loadNumbers(currentPage, currentPageSize)
  }

  const handleReserveSuccess = () => {
    // Recarregar os dados após reserva/desreserva bem-sucedida
    loadNumbers(currentPage, currentPageSize)
  }

  const handleReserveError = (error: string) => {
    // O feedback visual já é tratado no RaffleNumberList
    // Não logar mensagens de usuário como erros
  }

  // Carregar informações da rifa quando o componente monta ou raffleId muda
  useEffect(() => {
    if (raffleId) {
      loadRaffleInfo()
    }
  }, [raffleId])

  // Carregar números quando o componente monta ou raffleId muda
  useEffect(() => {
    if (raffleId) {
      loadNumbers(0, currentPageSize)
    }
  }, [raffleId])

  return (
    <div className="space-y-3">
      {/* Header com informações e botão de refresh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h4 className="text-base font-medium text-gray-900">Números da Rifa</h4>
          {totalElements > 0 && (
            <span className="text-xs text-gray-500">
              {totalElements} número{totalElements !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg 
            className={`w-3 h-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Atualizar
        </button>
      </div>

      {/* Legenda */}
      <RaffleNumberLegend />

      {/* Lista de números */}
      <RaffleNumberList
        numbers={numbers}
        raffleId={raffleId}
        raffleInfo={raffleInfo}
        isLoading={isLoading}
        error={error}
        emptyMessage="Nenhum número encontrado para esta rifa."
        onReserveSuccess={handleReserveSuccess}
        onReserveError={handleReserveError}
      />

      {/* Paginação */}
      {showPagination && (
        <RaffleNumberListPagination
          totalNumbers={totalElements}
          itemsPerPage={currentPageSize}
          currentPage={currentPage}
          totalPages={totalPages}
          onItemsPerPageChange={handleItemsPerPageChange}
          onPageChange={handlePageChange}
          isLoading={isLoading}
        />
      )}
    </div>
  )
}
