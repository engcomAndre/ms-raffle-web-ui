'use client'

import { useState, useEffect } from 'react'
import { RaffleNumberItemResponse, RaffleResponse } from '@/types/raffle'
import { raffleService } from '@/services/raffleService'
import { AvailableRaffleNumberList } from './AvailableRaffleNumberList'
import { RaffleNumberListPagination } from './RaffleNumberListPagination'
import { RaffleNumberLegend } from './RaffleNumberLegend'

interface AvailableRaffleNumberListContainerProps {
  raffleId: string
  pageSize?: number
  showPagination?: boolean
  onNumbersChange?: (numbers: RaffleNumberItemResponse[], totalElements: number) => void
  onReserveNumber?: (raffleId: string, number: number) => void
}

export function AvailableRaffleNumberListContainer({ 
  raffleId, 
  pageSize = 20, 
  showPagination = true,
  onNumbersChange,
  onReserveNumber
}: AvailableRaffleNumberListContainerProps) {
  const [numbers, setNumbers] = useState<RaffleNumberItemResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPageSize, setCurrentPageSize] = useState(pageSize)

  const loadNumbers = async (page: number = 0, size: number = currentPageSize) => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('🔢 [AVAILABLE-NUMBERS] Carregando números da rifa:', raffleId, 'página:', page, 'tamanho:', size)
      
      const response = await raffleService.getPublicRaffleNumbers(raffleId, page, size)
      
      console.log('📊 [AVAILABLE-NUMBERS] Resposta da API:', response)
      
      if (response.success && response.data) {
        console.log('✅ [AVAILABLE-NUMBERS] Dados recebidos:', response.data)
        console.log('📋 [AVAILABLE-NUMBERS] Números encontrados:', response.data.rafflesNumbers?.length || 0)
        
        setNumbers(response.data.rafflesNumbers || [])
        setTotalElements(response.data.totalElements || 0)
        setTotalPages(response.data.totalPages || 0)
        
        // Notificar componente pai sobre mudanças
        if (onNumbersChange) {
          onNumbersChange(response.data.rafflesNumbers || [], response.data.totalElements || 0)
        }
      } else {
        console.log('❌ [AVAILABLE-NUMBERS] Erro na resposta:', response.error)
        setError('Erro ao carregar números da rifa')
        setNumbers([])
        setTotalElements(0)
        setTotalPages(0)
      }
    } catch (error) {
      console.error('❌ [AVAILABLE-NUMBERS] Erro ao carregar números da rifa:', error)
      setError('Erro ao carregar números da rifa')
      setNumbers([])
      setTotalElements(0)
      setTotalPages(0)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    loadNumbers(page, currentPageSize)
  }

  const handlePageSizeChange = (size: number) => {
    setCurrentPageSize(size)
    setCurrentPage(0)
    loadNumbers(0, size)
  }

  const handleRefresh = () => {
    loadNumbers(currentPage, currentPageSize)
  }

  const handleReserveNumber = (number: number) => {
    if (onReserveNumber) {
      onReserveNumber(raffleId, number)
    }
  }

  // Carregar dados iniciais
  useEffect(() => {
    loadNumbers()
  }, [raffleId])

  return (
    <div className="space-y-4">
      {/* Legenda */}
      <RaffleNumberLegend />

      {/* Lista de números */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <AvailableRaffleNumberList
          numbers={numbers}
          raffleId={raffleId}
          isLoading={isLoading}
          error={error}
          onReserveSuccess={() => loadNumbers(currentPage, currentPageSize)}
          onReserveError={(error) => console.error('Erro ao reservar número:', error)}
        />
      </div>

      {/* Paginação */}
      {showPagination && totalPages > 1 && (
        <RaffleNumberListPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={currentPageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      {/* Aviso sobre funcionalidades limitadas */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-yellow-800">
            <p className="font-medium">Modo de Visualização</p>
            <p className="text-xs">Você pode visualizar os números, mas não pode editá-los ou excluí-los.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
