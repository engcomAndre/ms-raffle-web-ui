'use client'

import { useState, useEffect } from 'react'
import { RaffleNumberItemResponse, RaffleResponse } from '@/types/raffle'
import { raffleService } from '@/services/raffleService'
import { Toast } from './Toast'

interface RafflePurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  raffle: RaffleResponse
  onPurchaseSuccess?: () => void
}

export function RafflePurchaseModal({ 
  isOpen, 
  onClose, 
  raffle, 
  onPurchaseSuccess 
}: RafflePurchaseModalProps) {
  const [availableNumbers, setAvailableNumbers] = useState<RaffleNumberItemResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null)
  const [selectedNumbers, setSelectedNumbers] = useState<Set<number>>(new Set())

  // Carregar números reservados quando o modal abre
  useEffect(() => {
    if (isOpen && raffle.id) {
      loadReservedNumbers()
    }
  }, [isOpen, raffle.id])

  // Fechar modal com ESC
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const loadReservedNumbers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Buscar todos os números da rifa (pode precisar de paginação para rifas grandes)
      const response = await raffleService.getPublicRaffleNumbers(raffle.id, 0, 1000)
      
      if (response.success && response.data) {
        // Filtrar apenas os números reservados (RESERVED)
        const reserved = response.data.rafflesNumbers.filter(
          (number: RaffleNumberItemResponse) => number.status === 'RESERVED'
        )
        setAvailableNumbers(reserved)
        
        // Pré-selecionar todos os números reservados
        const reservedNumbers = reserved.map(n => parseInt(n.number))
        setSelectedNumbers(new Set(reservedNumbers))
      } else {
        setError('Erro ao carregar números reservados')
      }
    } catch (error) {
      console.error('Erro ao carregar números reservados:', error)
      setError('Erro ao carregar números reservados')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNumberToggle = (number: number) => {
    const newSelected = new Set(selectedNumbers)
    if (newSelected.has(number)) {
      newSelected.delete(number)
    } else {
      newSelected.add(number)
    }
    setSelectedNumbers(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedNumbers.size === availableNumbers.length) {
      setSelectedNumbers(new Set())
    } else {
      setSelectedNumbers(new Set(availableNumbers.map(n => parseInt(n.number))))
    }
  }

  const handleConfirmPurchase = async () => {
    if (selectedNumbers.size === 0) {
      setToast({
        message: 'Selecione pelo menos um número para comprar',
        type: 'warning'
      })
      return
    }

    try {
      setIsPurchasing(true)
      setError(null)

      // Comprar cada número selecionado
      const purchasePromises = Array.from(selectedNumbers).map(number => 
        raffleService.sellRaffleNumber(raffle.id, number)
      )

      const results = await Promise.allSettled(purchasePromises)
      
      // Verificar se todas as compras foram bem-sucedidas
      const failedPurchases = results.filter(result => result.status === 'rejected')
      
      if (failedPurchases.length === 0) {
        setToast({
          message: `${selectedNumbers.size} número(s) comprado(s) com sucesso!`,
          type: 'success'
        })
        
        // Fechar modal após sucesso
        setTimeout(() => {
          onPurchaseSuccess?.()
          onClose()
        }, 1500)
      } else {
        const successCount = results.length - failedPurchases.length
        if (successCount > 0) {
          setToast({
            message: `${successCount} número(s) comprado(s) com sucesso. ${failedPurchases.length} falharam.`,
            type: 'warning'
          })
        } else {
          setToast({
            message: 'Erro ao comprar os números selecionados',
            type: 'error'
          })
        }
      }
    } catch (error) {
      console.error('Erro ao comprar números:', error)
      setToast({
        message: 'Erro ao comprar os números selecionados',
        type: 'error'
      })
    } finally {
      setIsPurchasing(false)
    }
  }

  const handleClose = () => {
    setSelectedNumbers(new Set())
    setError(null)
    setToast(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Comprar Números Reservados
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Informações da rifa */}
        <div className="p-6 border-b border-gray-200">
          <div className="p-4 bg-gray-50 rounded-md">
            <h4 className="font-medium text-gray-900">{raffle.title}</h4>
            <p className="text-sm text-gray-600 mt-1">
              {raffle.description && raffle.description.length > 100 
                ? `${raffle.description.substring(0, 100)}...` 
                : raffle.description
              }
            </p>
            <div className="mt-2 text-sm text-gray-500">
              <span className="font-medium">Prêmio:</span> {raffle.prize || 'Não definido'}
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-sm text-gray-600">Carregando números reservados...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-600 mb-2">
                <svg className="mx-auto h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-sm text-red-600">{error}</p>
              <button
                onClick={loadReservedNumbers}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Tentar novamente
              </button>
            </div>
          ) : availableNumbers.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500">Nenhum número reservado para compra</p>
            </div>
          ) : (
            <div>
              {/* Controles */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {selectedNumbers.size === availableNumbers.length ? 'Desmarcar todos' : 'Selecionar todos'}
                  </button>
                  <span className="text-sm text-gray-500">
                    {selectedNumbers.size} de {availableNumbers.length} selecionados
                  </span>
                </div>
                <button
                  onClick={loadReservedNumbers}
                  disabled={isLoading}
                  className="text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
                >
                  Atualizar
                </button>
              </div>

              {/* Grid de números */}
              <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-64 overflow-y-auto">
                {availableNumbers.map((number) => {
                  const isSelected = selectedNumbers.has(parseInt(number.number))
                  return (
                    <button
                      key={number.number}
                      onClick={() => handleNumberToggle(parseInt(number.number))}
                      className={`
                        p-2 text-sm font-medium rounded border-2 transition-colors
                        ${isSelected 
                          ? 'bg-yellow-100 border-yellow-300 text-yellow-800' 
                          : 'bg-white text-gray-700 border-gray-300 hover:border-yellow-300'
                        }
                      `}
                    >
                      {number.number}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmPurchase}
            disabled={selectedNumbers.size === 0 || isPurchasing}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPurchasing ? 'Comprando...' : `Confirmar Compra (${selectedNumbers.size})`}
          </button>
        </div>

        {/* Toast */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  )
}
