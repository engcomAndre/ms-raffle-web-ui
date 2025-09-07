'use client'

import { useState, useEffect } from 'react'
import { RaffleResponse } from '@/types/raffle'
import { raffleService } from '@/services/raffleService'

interface RaffleEditModalProps {
  isOpen: boolean
  onClose: () => void
  raffle: RaffleResponse | null
  onSuccess: () => void
}

export function RaffleEditModal({ isOpen, onClose, raffle, onSuccess }: RaffleEditModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prize: '',
    maxNumbers: 0,
    startAt: '',
    endAt: ''
  })

  // Carregar dados da rifa quando o modal abrir
  useEffect(() => {
    if (isOpen && raffle) {
      setFormData({
        title: raffle.title || '',
        description: raffle.description || '',
        prize: raffle.prize || '',
        maxNumbers: raffle.maxNumbers || 0,
        startAt: raffle.startAt ? raffle.startAt.split('T')[0] + 'T' + raffle.startAt.split('T')[1].substring(0, 5) : '',
        endAt: raffle.endAt ? raffle.endAt.split('T')[0] + 'T' + raffle.endAt.split('T')[1].substring(0, 5) : ''
      })
      setError(null)
    }
  }, [isOpen, raffle])

  // Fechar modal com ESC
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!raffle) return

    try {
      setIsLoading(true)
      setError(null)

      console.log('✏️ [RAFFLE-EDIT-MODAL] Atualizando rifa:', raffle.id)
      console.log('📝 [RAFFLE-EDIT-MODAL] Dados do formulário:', formData)

      const response = await raffleService.updateRaffle(raffle.id, formData)

      if (response.success) {
        console.log('✅ [RAFFLE-EDIT-MODAL] Rifa atualizada com sucesso')
        onSuccess()
        onClose()
      } else {
        console.error('❌ [RAFFLE-EDIT-MODAL] Erro ao atualizar rifa:', response.error)
        setError(response.message || 'Erro ao atualizar rifa')
      }
    } catch (error) {
      console.error('💥 [RAFFLE-EDIT-MODAL] Erro inesperado:', error)
      setError('Erro inesperado ao atualizar rifa')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-transparent backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Editar Rifa
            </h3>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Título */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Título *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Digite o título da rifa"
              />
            </div>

            {/* Descrição */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                disabled={isLoading}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Descreva a rifa"
              />
            </div>

            {/* Prêmio */}
            <div>
              <label htmlFor="prize" className="block text-sm font-medium text-gray-700 mb-2">
                Prêmio *
              </label>
              <input
                type="text"
                id="prize"
                value={formData.prize}
                onChange={(e) => handleInputChange('prize', e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Descreva o prêmio"
              />
            </div>

            {/* Número máximo de números */}
            <div>
              <label htmlFor="maxNumbers" className="block text-sm font-medium text-gray-700 mb-2">
                Número máximo de números *
              </label>
              <input
                type="number"
                id="maxNumbers"
                value={formData.maxNumbers}
                onChange={(e) => handleInputChange('maxNumbers', parseInt(e.target.value) || 0)}
                required
                min="1"
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Ex: 100"
              />
            </div>

            {/* Data de início */}
            <div>
              <label htmlFor="startAt" className="block text-sm font-medium text-gray-700 mb-2">
                Data de início *
              </label>
              <input
                type="datetime-local"
                id="startAt"
                value={formData.startAt}
                onChange={(e) => handleInputChange('startAt', e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Data de fim */}
            <div>
              <label htmlFor="endAt" className="block text-sm font-medium text-gray-700 mb-2">
                Data de fim *
              </label>
              <input
                type="datetime-local"
                id="endAt"
                value={formData.endAt}
                onChange={(e) => handleInputChange('endAt', e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Botões */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </div>
                ) : (
                  'Salvar Alterações'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
