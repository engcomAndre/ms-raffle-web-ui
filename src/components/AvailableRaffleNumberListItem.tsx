'use client'

import { useState, useEffect } from 'react'
import { RaffleNumberItemResponse, RaffleNumberStatus } from '@/types/raffle'
import { raffleService } from '@/services/raffleService'
import { getErrorMessage } from '@/utils/errorMessages'

interface AvailableRaffleNumberListItemProps {
  numberItem: RaffleNumberItemResponse
  raffleId: string
  onReserveSuccess?: (number: number) => void
  onReserveError?: (error: string) => void
}

export function AvailableRaffleNumberListItem({
  numberItem,
  raffleId,
  onReserveSuccess,
  onReserveError
}: AvailableRaffleNumberListItemProps) {
  const [isReserving, setIsReserving] = useState(false)
  const [localStatus, setLocalStatus] = useState(numberItem.status)

  useEffect(() => {
    setLocalStatus(numberItem.status)
  }, [numberItem.status])

  const getStatusClasses = (status: RaffleNumberStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 border-green-300 text-green-800 cursor-pointer hover:bg-green-200'
      case 'RESERVED':
        return 'bg-orange-100 border-orange-300 text-orange-800 cursor-pointer hover:bg-orange-200'
      case 'SOLD':
        return 'bg-gray-200 border-gray-400 text-gray-700 cursor-not-allowed'
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800 cursor-pointer hover:bg-gray-200'
    }
  }
  
  const canReserve = localStatus === 'ACTIVE' && !isReserving
  const canUnreserve = localStatus === 'RESERVED' && !isReserving
  
  // Debug log para verificar estado
  console.log(`🔍 [UNRESERVE-DEBUG] Number: ${numberItem.number}, Status: ${localStatus}, CanReserve: ${canReserve}, CanUnreserve: ${canUnreserve}`)

  const handleClick = async () => {
    console.log(`🖱️ [CLICK-DEBUG] Clicked on number ${numberItem.number}`)
    console.log(`🖱️ [CLICK-DEBUG] CanReserve: ${canReserve}, CanUnreserve: ${canUnreserve}`)
    console.log(`🖱️ [CLICK-DEBUG] LocalStatus: ${localStatus}`)

    // Toggle: reservar se ACTIVE, desreservar se RESERVED
    if (canReserve) {
      setIsReserving(true)
      setLocalStatus('RESERVED' as RaffleNumberStatus)
      try {
        await raffleService.reserveRaffleNumber(raffleId, Number(numberItem.number))
        onReserveSuccess?.(Number(numberItem.number))
      } catch (error: unknown) {
        setLocalStatus('ACTIVE' as RaffleNumberStatus)
        const errorMessage = getErrorMessage(error)
        onReserveError?.(errorMessage)
      } finally {
        setIsReserving(false)
      }
      return
    }

    if (canUnreserve) {
      setIsReserving(true)
      setLocalStatus('ACTIVE' as RaffleNumberStatus)
      try {
        await raffleService.unreserveRaffleNumber(raffleId, Number(numberItem.number))
        console.log(`✅ [UNRESERVE] Número ${numberItem.number} desreservado com sucesso`)
        // Reutilizamos o callback de sucesso para refresh, a mensagem virá do List
        onReserveSuccess?.(Number(numberItem.number))
      } catch (error: unknown) {
        setLocalStatus('RESERVED' as RaffleNumberStatus)
        const errorMessage = getErrorMessage(error)
        console.error(`❌ [UNRESERVE] Erro ao desreservar número ${numberItem.number}:`, errorMessage)
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
        (canReserve || canUnreserve) ? 'hover:shadow-md' : ''
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
        {localStatus === 'RESERVED' && (
          <span className="ml-1 text-xs font-bold text-orange-600" title="Clique para desreservar">↶</span>
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
