'use client'

import { useState } from 'react'
import { RaffleResponse } from '@/types/raffle'
import { AvailableRaffleNumberListContainer } from './AvailableRaffleNumberListContainer'
import { RaffleImageCarousel } from './RaffleImageCarousel'
import { RafflePurchaseModal } from './RafflePurchaseModal'

interface AvailableRaffleListItemProps {
  raffle: RaffleResponse
}

export function AvailableRaffleListItem({ 
  raffle
}: AvailableRaffleListItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false)

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  const handlePurchaseClick = () => {
    setIsPurchaseModalOpen(true)
  }

  const handlePurchaseSuccess = () => {
    // Recarregar a lista de números se estiver expandida
    if (isExpanded) {
      // O AvailableRaffleNumberListContainer já tem refresh automático
    }
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
      <div className="p-6">
        <div className="flex items-start justify-between">
          {/* Carrossel de Imagens */}
          <div className="mr-6">
            <RaffleImageCarousel images={raffle.files || []} />
          </div>
          
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
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
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
          
          <button
            onClick={handlePurchaseClick}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
            </svg>
            Comprar Números
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <AvailableRaffleNumberListContainer
            raffleId={raffle.id}
            pageSize={20}
            showPagination={true}
          />
        </div>
      )}

      {/* Modal de Compra */}
      <RafflePurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        raffle={raffle}
        onPurchaseSuccess={handlePurchaseSuccess}
      />
    </div>
  )
}
