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
        setNumbers(response.data.content || [])
        setTotalElements(response.data.totalElements || 0)
        setTotalPages(response.data.totalPages || 0)
        
        // Notificar componente pai sobre mudanças
        if (onNumbersChange) {
          onNumbersChange(response.data.content || [], response.data.totalElements || 0)
        }
      } else {
        setError('Erro ao carregar números da rifa')
        setNumbers([])
        setTotalElements(0)
        setTotalPages(0)
      }
    } catch (error) {
      console.error('Erro ao carregar números da rifa:', error)
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
    loadRaffleInfo()
    loadNumbers()
  }, [raffleId])

  return (
    <div className="space-y-4">
      {/* Informações da rifa */}
      {raffleInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900">{raffleInfo.title}</h3>
              <p className="text-sm text-blue-700">{raffleInfo.description}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-600">
                <span className="font-medium">{totalElements}</span> números disponíveis
              </div>
              <div className="text-xs text-blue-500">
                de {raffleInfo.maxNumbers || 'N/A'} máximo
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legenda */}
      <RaffleNumberLegend />

      {/* Lista de números */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <AvailableRaffleNumberList
          numbers={numbers}
          isLoading={isLoading}
          error={error}
          onRefresh={handleRefresh}
          onReserveNumber={handleReserveNumber}
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
