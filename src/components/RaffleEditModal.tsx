'use client'

import { useState, useEffect } from 'react'
import { RaffleResponse } from '@/types/raffle'
import { raffleService } from '@/services/raffleService'
import { InlineImageUpload } from './InlineImageUpload'
import { ExistingImageList } from './ExistingImageList'
import { fileUploadService } from '@/services/fileUploadService'

interface RaffleEditModalProps {
  isOpen: boolean
  onClose: () => void
  raffle: RaffleResponse | null
  onSuccess: () => void
}

export function RaffleEditModal({ isOpen, onClose, raffle, onSuccess }: RaffleEditModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isIncrementing, setIsIncrementing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [formData, setFormData] = useState({
    title: '',
    prize: '',
    maxNumbers: 0,
    startAt: '',
    endAt: ''
  })
  const [originalMaxNumbers, setOriginalMaxNumbers] = useState(0)

  // Carregar dados da rifa quando o modal abrir
  useEffect(() => {
    if (isOpen && raffle) {
      const maxNumbers = raffle.maxNumbers || 0
      setFormData({
        title: raffle.title || '',
        prize: raffle.prize || '',
        maxNumbers: maxNumbers,
        startAt: raffle.startAt ? raffle.startAt.split('T')[0] + 'T' + raffle.startAt.split('T')[1].substring(0, 5) : '',
        endAt: raffle.endAt ? raffle.endAt.split('T')[0] + 'T' + raffle.endAt.split('T')[1].substring(0, 5) : ''
      })
      setOriginalMaxNumbers(maxNumbers)
      setExistingImages(raffle.files || [])
      setError(null)
      setSuccessMessage(null)
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

  const handleImagesChange = (images: File[]) => {
    setSelectedImages(images)
  }

  const handleImageDeleted = (deletedUrl: string) => {
    setExistingImages(prev => prev.filter(url => url !== deletedUrl))
    console.log('🗑️ [RAFFLE-EDIT-MODAL] Imagem excluída:', deletedUrl)
  }

  const handleIncrementNumbers = async () => {
    if (!raffle) return

    const newMaxNumbers = formData.maxNumbers
    const originalNumbers = originalMaxNumbers

    // Validar se o novo valor é maior que o original
    if (newMaxNumbers <= originalNumbers) {
      setError('O número máximo de números deve ser maior que o valor atual para incrementar.')
      return
    }

    const incrementsBy = newMaxNumbers - originalNumbers

    try {
      setIsIncrementing(true)
      setError(null)
      setSuccessMessage(null)

      console.log('➕ [RAFFLE-EDIT-MODAL] Incrementando números:', { 
        raffleId: raffle.id, 
        incrementsBy, 
        originalNumbers, 
        newMaxNumbers 
      })

      const response = await raffleService.incrementRaffleNumbers(raffle.id, incrementsBy)

      if (response.success) {
        console.log('✅ [RAFFLE-EDIT-MODAL] Números incrementados com sucesso')
        setSuccessMessage(`Números incrementados com sucesso! ${incrementsBy} novos números foram adicionados.`)
        setOriginalMaxNumbers(newMaxNumbers)
      } else {
        console.error('❌ [RAFFLE-EDIT-MODAL] Erro ao incrementar números:', response.error)
        setError(response.message || 'Erro ao incrementar números')
      }
    } catch (error: any) {
      console.error('💥 [RAFFLE-EDIT-MODAL] Erro inesperado ao incrementar números:', error)
      setError(error.message || 'Erro inesperado ao incrementar números')
    } finally {
      setIsIncrementing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!raffle) return

    // Validar se não há decremento de números
    if (formData.maxNumbers < originalMaxNumbers) {
      setError('Não é possível diminuir o número de números. Apenas incrementos são permitidos.')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      setSuccessMessage(null)

      console.log('✏️ [RAFFLE-EDIT-MODAL] Atualizando rifa:', raffle.id)
      console.log('📝 [RAFFLE-EDIT-MODAL] Dados do formulário:', formData)

      // Se houve incremento, não atualizar o maxNumbers no update normal
      const updateData = { ...formData }
      if (formData.maxNumbers > originalMaxNumbers) {
        // Manter o valor original para o update, pois o incremento já foi feito
        updateData.maxNumbers = originalMaxNumbers
      }

      const response = await raffleService.updateRaffle(raffle.id, updateData)

      if (response.success) {
        console.log('✅ [RAFFLE-EDIT-MODAL] Rifa atualizada com sucesso')
        
        // Fazer upload das imagens se houver
        if (selectedImages.length > 0) {
          console.log('📤 [RAFFLE-EDIT-MODAL] Fazendo upload de imagens:', selectedImages.length)
          const uploadPromises = selectedImages.map(image => 
            fileUploadService.uploadRaffleImage(raffle.id, image)
          )
          
          const uploadResults = await Promise.all(uploadPromises)
          
          // Verificar se algum upload falhou
          const failedUploads = uploadResults.filter(result => !result.success)
          if (failedUploads.length > 0) {
            console.warn('⚠️ [RAFFLE-EDIT-MODAL] Alguns uploads falharam:', failedUploads)
            setSuccessMessage(`Rifa atualizada com sucesso! ${failedUploads.length} imagens não foram enviadas.`)
          } else {
            console.log('✅ [RAFFLE-EDIT-MODAL] Todas as imagens enviadas com sucesso')
            setSuccessMessage('Rifa atualizada e imagens enviadas com sucesso!')
          }
        } else {
          setSuccessMessage('Rifa atualizada com sucesso!')
        }
        
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
    if (!isLoading && !isIncrementing) {
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
        data-testid="overlay"
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
              disabled={isLoading || isIncrementing}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              aria-label="Fechar modal"
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

            {/* Seção de Upload de Imagens */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Imagens dos Prêmios da Rifa
                </label>
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  Opcional • Até 5 imagens
                </div>
              </div>
              
              <InlineImageUpload
                onImagesChange={handleImagesChange}
                maxImages={5}
                disabled={isLoading || isIncrementing}
              />
              
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg mt-3">
                <p className="font-medium mb-1">💡 Dica:</p>
                <p>Adicione imagens do prêmio para atrair mais participantes! As imagens serão enviadas automaticamente após salvar as alterações.</p>
              </div>
              
              {/* Listagem de Imagens Existentes */}
              {raffle && (
                <ExistingImageList
                  raffleId={raffle.id}
                  imageUrls={existingImages}
                  onImageDeleted={handleImageDeleted}
                  disabled={isLoading || isIncrementing}
                />
              )}
            </div>

            {/* Número máximo de números */}
            <div>
              <label htmlFor="maxNumbers" className="block text-sm font-medium text-gray-700 mb-2">
                Número máximo de números *
                {originalMaxNumbers > 0 && (
                  <span className="text-xs text-gray-500 ml-2">
                    (Atual: {originalMaxNumbers})
                  </span>
                )}
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  id="maxNumbers"
                  value={formData.maxNumbers}
                  onChange={(e) => handleInputChange('maxNumbers', parseInt(e.target.value) || 0)}
                  required
                  min="1"
                  disabled={isLoading || isIncrementing}
                  className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
                    formData.maxNumbers < originalMaxNumbers 
                      ? 'border-red-300 bg-red-50' 
                      : formData.maxNumbers > originalMaxNumbers 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-300'
                  }`}
                  placeholder="Ex: 100"
                />
                {formData.maxNumbers > originalMaxNumbers && (
                  <button
                    type="button"
                    onClick={handleIncrementNumbers}
                    disabled={isLoading || isIncrementing}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isIncrementing ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Incrementando...
                      </div>
                    ) : (
                      `+${formData.maxNumbers - originalMaxNumbers}`
                    )}
                  </button>
                )}
              </div>
              {formData.maxNumbers < originalMaxNumbers && (
                <p className="mt-1 text-sm text-red-600">
                  ⚠️ Não é possível diminuir o número de números. Apenas incrementos são permitidos.
                </p>
              )}
              {formData.maxNumbers > originalMaxNumbers && (
                <p className="mt-1 text-sm text-green-600">
                  ✅ {formData.maxNumbers - originalMaxNumbers} novos números serão adicionados.
                </p>
              )}
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

            {/* Sucesso */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div className="ml-3">
                    <p className="text-sm text-green-800">{successMessage}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Botões */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading || isIncrementing}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading || isIncrementing}
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
