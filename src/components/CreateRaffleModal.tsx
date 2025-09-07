'use client'

import { useState } from 'react'
import { raffleService } from '@/services/raffleService'
import { RaffleCreationData } from '@/types/raffle'

interface CreateRaffleModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateRaffleModal({ isOpen, onClose, onSuccess }: CreateRaffleModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<RaffleCreationData>({
    title: '',
    prize: '',
    maxNumbers: 100,
    files: [],
    startAt: '',
    endAt: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxNumbers' ? parseInt(value) || 0 : value
    }))
  }

  const handlePreconfigureDates = () => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    tomorrow.setHours(9, 0, 0, 0) // 9:00 AM

    const nextWeek = new Date(today)
    nextWeek.setDate(today.getDate() + 7)
    nextWeek.setHours(23, 59, 0, 0) // 11:59 PM

    setFormData(prev => ({
      ...prev,
      startAt: tomorrow.toISOString().slice(0, 16), // Format for datetime-local input
      endAt: nextWeek.toISOString().slice(0, 16)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Validar dados
      if (!formData.title.trim()) {
        throw new Error('Título é obrigatório')
      }
      if (!formData.prize.trim()) {
        throw new Error('Prêmio é obrigatório')
      }
      if (formData.maxNumbers <= 0) {
        throw new Error('Número máximo de números deve ser maior que zero')
      }
      if (!formData.startAt) {
        throw new Error('Data de início é obrigatória')
      }
      if (!formData.endAt) {
        throw new Error('Data de fim é obrigatória')
      }
      if (new Date(formData.startAt) >= new Date(formData.endAt)) {
        throw new Error('Data de fim deve ser posterior à data de início')
      }

      const response = await raffleService.createRaffle(formData)
      
      if (response.success) {
        onSuccess()
        onClose()
        // Reset form
        setFormData({
          title: '',
          prize: '',
          maxNumbers: 100,
          files: [],
          startAt: '',
          endAt: ''
        })
      } else {
        throw new Error(response.error || 'Erro ao criar rifa')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setError(null)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Criar Nova Rifa</h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Título */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Título da Rifa *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Rifa do iPhone 15 Pro"
              required
            />
          </div>

          {/* Prêmio */}
          <div>
            <label htmlFor="prize" className="block text-sm font-medium text-gray-700 mb-2">
              Prêmio *
            </label>
            <textarea
              id="prize"
              name="prize"
              value={formData.prize}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Descreva o prêmio em detalhes..."
              required
            />
          </div>

          {/* Número máximo de números */}
          <div>
            <label htmlFor="maxNumbers" className="block text-sm font-medium text-gray-700 mb-2">
              Número Máximo de Números *
            </label>
            <input
              type="number"
              id="maxNumbers"
              name="maxNumbers"
              value={formData.maxNumbers}
              onChange={handleInputChange}
              min="1"
              max="10000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Quantos números estarão disponíveis para venda (ex: 1000 números de 0001 a 1000)
            </p>
          </div>

          {/* Seção de Datas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Período da Rifa</h3>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handlePreconfigureDates}
                  className="inline-flex items-center px-3 py-1.5 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Aplicar Sugestão
                </button>
                <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                  Amanhã 9:00 → +7 dias 23:59
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Data de início */}
              <div>
                <label htmlFor="startAt" className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Início *
                </label>
                <input
                  type="datetime-local"
                  id="startAt"
                  name="startAt"
                  value={formData.startAt}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Data de fim */}
              <div>
                <label htmlFor="endAt" className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Fim *
                </label>
                <input
                  type="datetime-local"
                  id="endAt"
                  name="endAt"
                  value={formData.endAt}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Criando...' : 'Criar Rifa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
