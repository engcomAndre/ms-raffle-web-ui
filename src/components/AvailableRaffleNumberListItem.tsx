'use client'

import { useState, useEffect } from 'react'
import { RaffleNumberItemResponse, RaffleNumberStatus } from '@/types/raffle'

interface AvailableRaffleNumberListItemProps {
  numberItem: RaffleNumberItemResponse
  onReserveNumber?: (number: number) => void
  onReserveSuccess?: (number: number) => void
  onReserveError?: (error: string) => void
}

export function AvailableRaffleNumberListItem({
  numberItem,
  onReserveNumber,
  onReserveSuccess,
  onReserveError
}: AvailableRaffleNumberListItemProps) {
  const [localStatus, setLocalStatus] = useState(numberItem.status)

  // Sincronizar status local com o status do número quando ele mudar
  useEffect(() => {
    setLocalStatus(numberItem.status)
  }, [numberItem.status])

  const getStatusClasses = (status: RaffleNumberStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 border-green-300 text-green-800 cursor-pointer hover:bg-green-200'
      case 'RESERVED':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800 cursor-not-allowed'
      case 'SOLD':
        return 'bg-gray-200 border-gray-400 text-gray-700 cursor-not-allowed'
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800 cursor-pointer hover:bg-gray-200'
    }
  }

  const getStatusText = (status: RaffleNumberStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'Disponível'
      case 'RESERVED':
        return 'Reservado'
      case 'SOLD':
        return 'Vendido'
      default:
        return 'Indisponível'
    }
  }

  const getStatusIcon = (status: RaffleNumberStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case 'RESERVED':
        return (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        )
      case 'SOLD':
        return (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      default:
        return (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
    }
  }

  const handleClick = () => {
    if (localStatus === 'ACTIVE' && onReserveNumber) {
      onReserveNumber(numberItem.number)
    }
  }

  const isClickable = localStatus === 'ACTIVE'

  return (
    <div
      className={`
        relative flex flex-col items-center justify-center p-2 border-2 rounded-lg text-xs font-medium transition-all duration-200
        ${getStatusClasses(localStatus)}
        ${isClickable ? 'hover:shadow-md' : ''}
      `}
      onClick={handleClick}
      title={`Número ${numberItem.number} - ${getStatusText(localStatus)}`}
    >
      {/* Número */}
      <div className="text-center">
        <div className="text-lg font-bold">{numberItem.number}</div>
        <div className="text-xs opacity-75">{getStatusText(localStatus)}</div>
      </div>

      {/* Ícone de status */}
      <div className="absolute top-1 right-1">
        {getStatusIcon(localStatus)}
      </div>

      {/* Indicador de clique */}
      {isClickable && (
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
          <div className="w-1 h-1 bg-green-600 rounded-full"></div>
        </div>
      )}
    </div>
  )
}
