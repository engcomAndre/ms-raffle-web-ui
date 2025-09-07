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
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Disponível
          </span>
        )
      case 'RESERVED':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Reservado
          </span>
        )
      case 'SOLD':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Vendido
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        )
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 text-center hover:shadow-md transition-shadow">
      <div className="text-lg font-semibold text-gray-900 mb-1">
        {number.number}
      </div>
      <div className="mb-2">
        {getNumberStatusBadge(number.status)}
      </div>
      {(number.buyerName || number.owner) && (
        <div className="text-xs text-gray-600">
          <p className="font-medium">{number.buyerName || number.owner}</p>
          {number.buyerPhone && <p>{number.buyerPhone}</p>}
          {number.reservedBy && number.reservedBy !== (number.buyerName || number.owner) && (
            <p className="text-gray-500">Reservado por: {number.reservedBy}</p>
          )}
        </div>
      )}
      {number.winner && (
        <div className="mt-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            🏆 Ganhador
          </span>
        </div>
      )}
    </div>
  )
}
