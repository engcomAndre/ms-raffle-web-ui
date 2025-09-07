'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/DashboardLayout'
import { raffleService } from '@/services/raffleService'
import { RaffleCreationData } from '@/types/raffle'

export default function CreateRafflePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

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
        setSuccess(true)
        setTimeout(() => {
          router.push('/playground')
        }, 2000)
      } else {
        throw new Error(response.error || 'Erro ao criar rifa')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <DashboardLayout currentPage="Criar Rifa">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Rifa Criada com Sucesso!</h2>
            <p className="text-gray-600 mb-4">Sua rifa foi criada e está pronta para receber participantes.</p>
            <p className="text-sm text-gray-500">Redirecionando para suas rifas...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout currentPage="Criar Rifa">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Criar Nova Rifa</h1>
          <p className="text-gray-600">
            Preencha os dados abaixo para criar sua rifa e começar a receber participantes
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
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

          {/* Botões */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
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
    </DashboardLayout>
  )
}
