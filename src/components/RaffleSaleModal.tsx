'use client'

import { useState, useEffect } from 'react'
import { RaffleNumberItemResponse, RaffleResponse } from '@/types/raffle'
import { raffleService } from '@/services/raffleService'
import { Toast } from './Toast'

interface RaffleSaleModalProps {
  isOpen: boolean
  onClose: () => void
  raffle: RaffleResponse
  onSaleSuccess?: () => void
}

export function RaffleSaleModal({ 
  isOpen, 
  onClose, 
  raffle, 
  onSaleSuccess 
}: RaffleSaleModalProps) {
  const [reservedNumbers, setReservedNumbers] = useState<RaffleNumberItemResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSelling, setIsSelling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null)
  const [selectedNumbers, setSelectedNumbers] = useState<Set<number>>(new Set())

  // Carregar números reservados quando o modal abre
  useEffect(() => {
    if (isOpen && raffle.id) {
      loadReservedNumbers()
    }
  }, [isOpen, raffle.id])

  const loadReservedNumbers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Buscar todos os números da rifa (pode precisar de paginação para rifas grandes)
      const response = await raffleService.getRaffleNumbers(raffle.id, 0, 1000)
      
      if (response.success && response.data) {
        // Filtrar apenas os números reservados
        const reserved = response.data.rafflesNumbers.filter(
          (number: RaffleNumberItemResponse) => number.status === 'RESERVED'
        )
        setReservedNumbers(reserved)
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
    if (selectedNumbers.size === reservedNumbers.length) {
      setSelectedNumbers(new Set())
    } else {
      setSelectedNumbers(new Set(reservedNumbers.map(n => parseInt(n.number))))
    }
  }

  const handleConfirmSale = async () => {
    if (selectedNumbers.size === 0) {
      setToast({
        message: 'Selecione pelo menos um número para vender',
        type: 'warning'
      })
      return
    }

    try {
      setIsSelling(true)
      setError(null)

      // Vender cada número selecionado
      const salePromises = Array.from(selectedNumbers).map(number => 
        raffleService.sellRaffleNumber(raffle.id, number)
      )

      const results = await Promise.allSettled(salePromises)
      
      // Verificar se todas as vendas foram bem-sucedidas
      const failedSales = results.filter(result => result.status === 'rejected')
      
      if (failedSales.length === 0) {
        setToast({
          message: `${selectedNumbers.size} número(s) vendido(s) com sucesso!`,
          type: 'success'
        })
        
        // Fechar modal após sucesso
        setTimeout(() => {
          onSaleSuccess?.()
          onClose()
        }, 1500)
      } else {
        const successCount = results.length - failedSales.length
        if (successCount > 0) {
          setToast({
            message: `${successCount} número(s) vendido(s) com sucesso. ${failedSales.length} falharam.`,
            type: 'warning'
          })
        } else {
          setToast({
            message: 'Erro ao vender os números selecionados',
            type: 'error'
          })
        }
      }
    } catch (error) {
      console.error('Erro ao vender números:', error)
      setToast({
        message: 'Erro ao vender os números selecionados',
        type: 'error'
      })
    } finally {
      setIsSelling(false)
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
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-transparent backdrop-blur-sm transition-opacity"
        onClick={handleClose}
        data-testid="overlay"
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Vender Números Reservados
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
          ) : reservedNumbers.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500">Nenhum número reservado encontrado</p>
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
                    {selectedNumbers.size === reservedNumbers.length ? 'Desmarcar todos' : 'Selecionar todos'}
                  </button>
                  <span className="text-sm text-gray-500">
                    {selectedNumbers.size} de {reservedNumbers.length} selecionados
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
                {reservedNumbers.map((number) => {
                  const isSelected = selectedNumbers.has(parseInt(number.number))
                  return (
                    <button
                      key={number.number}
                      onClick={() => handleNumberToggle(parseInt(number.number))}
                      className={`
                        p-2 text-sm font-medium rounded border-2 transition-colors
                        ${isSelected 
                          ? 'bg-blue-500 text-white border-blue-500' 
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
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
              onClick={handleConfirmSale}
              disabled={selectedNumbers.size === 0 || isSelling}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSelling ? 'Vendendo...' : `Confirmar Venda (${selectedNumbers.size})`}
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
    </div>
  )
}

