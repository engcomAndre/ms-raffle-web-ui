'use client'

import { useState } from 'react'
import { RaffleNumberItemResponse } from '@/types/raffle'
import { AvailableRaffleNumberListItem } from './AvailableRaffleNumberListItem'
import { Toast } from './Toast'

interface AvailableRaffleNumberListProps {
  numbers: RaffleNumberItemResponse[]
  isLoading?: boolean
  error?: string | null
  emptyMessage?: string
  onRefresh?: () => void
  onReserveNumber?: (number: number) => void
}

export function AvailableRaffleNumberList({ 
  numbers, 
  isLoading = false, 
  error = null, 
  emptyMessage = 'Nenhum número encontrado para esta rifa.',
  onRefresh,
  onReserveNumber
}: AvailableRaffleNumberListProps) {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null)

  const handleReserveNumber = (number: number) => {
    if (onReserveNumber) {
      onReserveNumber(number)
    }
  }

  const handleReserveSuccess = (number: number) => {
    setToast({
      message: `Número ${number} reservado com sucesso!`,
      type: 'success'
    })
  }

  const handleReserveError = (error: string) => {
    setToast({
      message: error,
      type: 'error'
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
        <span className="ml-2 text-sm text-gray-600">Carregando números...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-6">
        <div className="text-red-600 mb-4">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-medium">Erro ao carregar números</p>
          <p className="text-xs text-gray-500 mt-1">{error}</p>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Tentar novamente
          </button>
        )}
      </div>
    )
  }

  if (numbers.length === 0) {
    return (
      <div className="text-center py-6">
        <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm text-gray-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Grid de números */}
      <div className="grid grid-cols-10 gap-2 p-4">
        {numbers.map((numberItem) => (
          <AvailableRaffleNumberListItem
            key={numberItem.number}
            numberItem={numberItem}
            onReserveNumber={handleReserveNumber}
            onReserveSuccess={handleReserveSuccess}
            onReserveError={handleReserveError}
          />
        ))}
      </div>

      {/* Toast para feedback */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
