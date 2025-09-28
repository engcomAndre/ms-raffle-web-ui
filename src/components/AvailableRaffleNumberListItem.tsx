'use client'

import { useState, useEffect } from 'react'
import { RaffleNumberItemResponse, RaffleNumberStatus, RaffleResponse } from '@/types/raffle'
import { raffleService } from '@/services/raffleService'
import { getErrorMessage } from '@/utils/errorMessages'

interface AvailableRaffleNumberListItemProps {
  numberItem: RaffleNumberItemResponse
  raffleId: string
  raffleInfo?: RaffleResponse | null
  onReserveSuccess?: (number: number) => void
  onReserveError?: (error: string) => void
}

export function AvailableRaffleNumberListItem({
  numberItem,
  raffleId,
  raffleInfo,
  onReserveSuccess,
  onReserveError
}: AvailableRaffleNumberListItemProps) {
  const [isReserving, setIsReserving] = useState(false)
  const [localStatus, setLocalStatus] = useState(numberItem.status)

  useEffect(() => {
    setLocalStatus(numberItem.status)
  }, [numberItem.status])

  const getStatusClasses = (status: RaffleNumberStatus) => {
    // Se a rifa não está ativa, todos os números ficam desabilitados
    if (!isRaffleActive) {
      return 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed opacity-60'
    }
    
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

  // Verificar se a rifa está ativa
  const isRaffleActive = raffleInfo ? raffleInfo.active : true
  
  const canReserve = localStatus === 'ACTIVE' && !isReserving && isRaffleActive
  const canUnreserve = localStatus === 'RESERVED' && !isReserving && isRaffleActive && numberItem.reservedBy === localStorage.getItem('auth-username')

  const handleClick = async () => {
    // Pré-checagem de rifa inativa
    if (!isRaffleActive) {
      onReserveError?.('Não é possível reservar números de uma rifa inativa')
      return
    }

    // Toggle: reservar se ACTIVE, desreservar se RESERVED
    if (canReserve) {
      setIsReserving(true)
      setLocalStatus('RESERVED')
      try {
        await raffleService.reserveRaffleNumber(raffleId, numberItem.number)
        onReserveSuccess?.(numberItem.number)
      } catch (error: unknown) {
        setLocalStatus('ACTIVE')
        const errorMessage = getErrorMessage(error)
        onReserveError?.(errorMessage)
      } finally {
        setIsReserving(false)
      }
      return
    }

    if (canUnreserve) {
      setIsReserving(true)
      setLocalStatus('ACTIVE')
      try {
        await raffleService.unreserveRaffleNumber(raffleId, numberItem.number)
        // Reutilizamos o callback de sucesso para refresh, a mensagem virá do List
        onReserveSuccess?.(numberItem.number)
      } catch (error: unknown) {
        setLocalStatus('RESERVED')
        const errorMessage = getErrorMessage(error)
        onReserveError?.(errorMessage)
      } finally {
        setIsReserving(false)
      }
      return
    }
  }

  const statusClasses = getStatusClasses(localStatus)

  return (
    <div
      className={`border rounded p-2 text-center transition-all duration-200 ${statusClasses} ${
        canReserve ? 'hover:shadow-md' : ''
      }`}
      onClick={handleClick}
    >
      <div className="text-sm font-semibold mb-1">
        {numberItem.number}
        {isReserving && (
          <span className="ml-1 text-xs opacity-75">⏳</span>
        )}
        {localStatus === 'RESERVED' && (
          <span className="ml-1 text-xs font-bold text-yellow-600">✓</span>
        )}
        {!isRaffleActive && (
          <span className="ml-1 text-xs font-bold text-gray-500">🚫</span>
        )}
      </div>
      {(numberItem.buyerName || numberItem.owner) && (
        <div className="text-xs">
          <div className="font-medium truncate">{numberItem.buyerName || numberItem.owner}</div>
          {numberItem.buyerPhone && <div className="opacity-75 truncate">{numberItem.buyerPhone}</div>}
          {numberItem.reservedBy && numberItem.reservedBy !== (numberItem.buyerName || numberItem.owner) && (
            <div className="opacity-75 truncate">Res: {numberItem.reservedBy}</div>
          )}
        </div>
      )}
      {numberItem.winner && (
        <div className="mt-1">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-200 text-yellow-800">
            🏆
          </span>
        </div>
      )}
    </div>
  )
}
