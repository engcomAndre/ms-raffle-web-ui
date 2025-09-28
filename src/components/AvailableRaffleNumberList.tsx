'use client'

import { useState } from 'react'
import { RaffleNumberItemResponse, RaffleResponse } from '@/types/raffle'
import { AvailableRaffleNumberListItem } from './AvailableRaffleNumberListItem'
import { Toast } from './Toast'

interface AvailableRaffleNumberListProps {
  numbers: RaffleNumberItemResponse[]
  raffleId: string
  raffleInfo?: RaffleResponse | null
  isLoading?: boolean
  error?: string | null
  emptyMessage?: string
  onReserveSuccess?: (number: number) => void
  onReserveError?: (error: string) => void
}

export function AvailableRaffleNumberList({ 
  numbers, 
  raffleId,
  raffleInfo,
  isLoading = false, 
  error = null, 
  emptyMessage = 'Nenhum número encontrado para esta rifa.',
  onReserveSuccess,
  onReserveError
}: AvailableRaffleNumberListProps) {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null)

  const handleReserveSuccess = (number: number) => {
    setToast({
      message: `Número ${number} atualizado com sucesso!`,
      type: 'success'
    })
    onReserveSuccess?.(number)
  }

  const handleReserveError = (error: string) => {
    setToast({
      message: error,
      type: 'error'
    })
    onReserveError?.(error)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-sm text-gray-600">Carregando números...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-6">
        <div className="text-red-600 mb-2">
          <svg className="mx-auto h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    )
  }

  if (numbers.length === 0) {
    return (
      <div className="text-center py-6">
        <div className="text-gray-400 mb-2">
          <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-sm text-gray-500">{emptyMessage}</p>
      </div>
    )
  }

  console.log('🔢 [AVAILABLE-NUMBER-LIST] Renderizando números:', numbers.length, 'números')

  return (
    <>
      <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
        {numbers.map((numberItem) => (
          <AvailableRaffleNumberListItem
            key={numberItem.number}
            numberItem={numberItem}
            raffleId={raffleId}
            raffleInfo={raffleInfo}
            onReserveSuccess={handleReserveSuccess}
            onReserveError={handleReserveError}
          />
        ))}
      </div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  )
}
