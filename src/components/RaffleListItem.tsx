'use client'

import { useState } from 'react'
import { RaffleResponse } from '@/types/raffle'
import { RaffleNumberListContainer } from './RaffleNumberListContainer'

interface RaffleListItemProps {
  raffle: RaffleResponse
  onEdit: (raffle: RaffleResponse) => void
  onDelete: (raffleId: string) => void
  onToggleStatus: (raffleId: string, newStatus: boolean) => void
  onViewNumbers: (raffleId: string) => void
}

export function RaffleListItem({ 
  raffle, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  onViewNumbers 
}: RaffleListItemProps) {
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
                <p className="font-medium text-gray-900">
                  <span className="font-medium">{raffle.numbersCreated || 0}</span>
                  <div className="text-xs text-gray-500">de {raffle.maxNumbers || 'Não definido'}</div>
                </p>
              </div>
              <div>
                <span className="text-gray-500">Período:</span>
                <p className="font-medium text-gray-900">
                  <div>{formatDate(raffle.startAt)}</div>
                  <div className="text-xs text-gray-400">até {formatDate(raffle.endAt)}</div>
                </p>
              </div>
              <div>
                <span className="text-gray-500">Criada em:</span>
                <p className="font-medium text-gray-900">{formatDate(raffle.createdAt)}</p>
              </div>
            </div>
          </div>
          
          {/* Ações */}
          <div className="flex flex-col space-y-2 ml-4">
            <button
              onClick={() => onEdit(raffle)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </button>
            
            <button
              onClick={() => onToggleStatus(raffle.id, !raffle.active)}
              className={`inline-flex items-center px-3 py-2 border shadow-sm text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                raffle.active 
                  ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100' 
                  : 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
              }`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
              </svg>
              {raffle.active ? 'Desativar' : 'Ativar'}
            </button>
            
            <button
              onClick={() => onDelete(raffle.id)}
              className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Excluir
            </button>
          </div>
        </div>
        
        {/* Botão para ver números */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={handleToggleExpanded}
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
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
        <div className="border-t border-gray-200 bg-gray-50 p-6">
          <RaffleNumberListContainer
            raffleId={raffle.id}
            pageSize={20}
            showPagination={true}
          />
        </div>
      )}
    </div>
  )
}
