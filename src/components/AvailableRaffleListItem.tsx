'use client'

import { useState } from 'react'
import { RaffleResponse } from '@/types/raffle'
import { AvailableRaffleNumberListContainer } from './AvailableRaffleNumberListContainer'

interface AvailableRaffleListItemProps {
  raffle: RaffleResponse
  onViewNumbers: (raffleId: string) => void
  onReserveNumber: (raffleId: string, number: number) => void
}

export function AvailableRaffleListItem({ 
  raffle, 
  onViewNumbers, 
  onReserveNumber 
}: AvailableRaffleListItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  const getStatusBadge = (status: boolean) => {
    return status ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Ativa
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Inativa
      </span>
    )
  }

  const formatCurrency = (value: number) => {
    if (isNaN(value) || value === null || value === undefined) {
      return 'Valor não definido'
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === 'Invalid Date') {
      return 'Data não definida'
    }
    
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return 'Data não definida'
    }
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      {/* Cabeçalho da rifa */}
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{raffle.title}</h3>
              {getStatusBadge(raffle.active)}
            </div>
            
            <p className="text-gray-600 mb-4">{raffle.description}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Prêmio:</span>
                <p className="font-medium text-gray-900">{raffle.prize || 'Não definido'}</p>
              </div>
              <div>
                <span className="text-gray-500">Números criados:</span>
                <div className="font-medium text-gray-900">
                  <span className="font-medium">{raffle.numbersCreated || 0}</span>
                  <div className="text-xs text-gray-500">de {raffle.maxNumbers || 'Não definido'}</div>
                </div>
              </div>
              <div>
                <span className="text-gray-500">Período:</span>
                <div className="font-medium text-gray-900">
                  <div>{formatDate(raffle.startAt)}</div>
                  <div className="text-xs text-gray-400">até {formatDate(raffle.endAt)}</div>
                </div>
              </div>
              <div>
                <span className="text-gray-500">Criada em:</span>
                <p className="font-medium text-gray-900">{formatDate(raffle.createdAt)}</p>
              </div>
            </div>
          </div>
          
          {/* Ações disponíveis (somente visualização e participação) */}
          <div className="flex flex-col space-y-2 ml-4">
            <button
              onClick={() => onViewNumbers(raffle.id)}
              className="inline-flex items-center px-3 py-2 border border-blue-300 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Ver Detalhes
            </button>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2 text-xs text-yellow-800">
              <div className="flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Somente Visualização
              </div>
            </div>
          </div>
        </div>
        
        {/* Botão para ver números */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={handleToggleExpanded}
            className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-500"
          >
            <svg 
              className={`w-4 h-4 mr-2 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            {isExpanded ? 'Ocultar números' : 'Ver números da rifa'}
          </button>
        </div>
      </div>
      
      {/* Números da rifa (expandido) */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <AvailableRaffleNumberListContainer
            raffleId={raffle.id}
            pageSize={20}
            showPagination={true}
            onReserveNumber={onReserveNumber}
          />
        </div>
      )}
    </div>
  )
}
