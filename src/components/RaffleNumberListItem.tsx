'use client'

import { RaffleNumberItemResponse, RaffleNumberStatus } from '@/types/raffle'

interface RaffleNumberListItemProps {
  number: RaffleNumberItemResponse
}

export function RaffleNumberListItem({ number }: RaffleNumberListItemProps) {
  const getNumberStatusBadge = (status: RaffleNumberStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
            Disp
          </span>
        )
      case 'RESERVED':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
            Res
          </span>
        )
      case 'SOLD':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
            Vend
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        )
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded p-2 text-center hover:shadow-sm transition-shadow">
      <div className="text-sm font-semibold text-gray-900 mb-1">
        {number.number}
      </div>
      <div className="mb-1">
        {getNumberStatusBadge(number.status)}
      </div>
      {(number.buyerName || number.owner) && (
        <div className="text-xs text-gray-600">
          <div className="font-medium truncate">{number.buyerName || number.owner}</div>
          {number.buyerPhone && <div className="text-gray-500 truncate">{number.buyerPhone}</div>}
          {number.reservedBy && number.reservedBy !== (number.buyerName || number.owner) && (
            <div className="text-gray-500 truncate">Res: {number.reservedBy}</div>
          )}
        </div>
      )}
      {number.winner && (
        <div className="mt-1">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
            🏆
          </span>
        </div>
      )}
    </div>
  )
}
