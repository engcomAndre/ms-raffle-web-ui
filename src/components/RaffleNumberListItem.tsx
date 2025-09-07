'use client'

import { RaffleNumberItemResponse, RaffleNumberStatus } from '@/types/raffle'

interface RaffleNumberListItemProps {
  number: RaffleNumberItemResponse
}

export function RaffleNumberListItem({ number }: RaffleNumberListItemProps) {
  const getStatusClasses = (status: RaffleNumberStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-50 border-green-200 text-green-900'
      case 'RESERVED':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900'
      case 'SOLD':
        return 'bg-gray-100 border-gray-300 text-gray-600'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-900'
    }
  }

  return (
    <div className={`border rounded p-2 text-center hover:shadow-sm transition-shadow ${getStatusClasses(number.status)}`}>
      <div className="text-sm font-semibold mb-1">
        {number.number}
      </div>
      {(number.buyerName || number.owner) && (
        <div className="text-xs">
          <div className="font-medium truncate">{number.buyerName || number.owner}</div>
          {number.buyerPhone && <div className="opacity-75 truncate">{number.buyerPhone}</div>}
          {number.reservedBy && number.reservedBy !== (number.buyerName || number.owner) && (
            <div className="opacity-75 truncate">Res: {number.reservedBy}</div>
          )}
        </div>
      )}
      {number.winner && (
        <div className="mt-1">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-200 text-yellow-800">
            🏆
          </span>
        </div>
      )}
    </div>
  )
}
