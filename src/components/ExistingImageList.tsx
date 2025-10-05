import React, { useState } from 'react'
import { fileUploadService } from '@/services/fileUploadService'

interface ExistingImageListProps {
  raffleId: string
  imageUrls: string[]
  onImageDeleted: (deletedUrl: string) => void
  disabled?: boolean
}

export function ExistingImageList({ raffleId, imageUrls, onImageDeleted, disabled = false }: ExistingImageListProps) {
  const [deletingImages, setDeletingImages] = useState<Set<string>>(new Set())

  const handleDeleteImage = async (imageUrl: string) => {
    if (disabled || deletingImages.has(imageUrl)) return

    const confirmed = window.confirm('Tem certeza que deseja excluir esta imagem? Esta ação não pode ser desfeita.')
    if (!confirmed) return

    setDeletingImages(prev => new Set(prev).add(imageUrl))

    try {
      const result = await fileUploadService.deleteRaffleImage(raffleId, imageUrl)
      
      if (result.success) {
        onImageDeleted(imageUrl)
        console.log('✅ [EXISTING-IMAGES] Imagem excluída com sucesso')
      } else {
        console.error('❌ [EXISTING-IMAGES] Erro ao excluir imagem:', result.error)
        alert(`Erro ao excluir imagem: ${result.error}`)
      }
    } catch (error) {
      console.error('💥 [EXISTING-IMAGES] Erro inesperado:', error)
      alert('Erro inesperado ao excluir imagem')
    } finally {
      setDeletingImages(prev => {
        const newSet = new Set(prev)
        newSet.delete(imageUrl)
        return newSet
      })
    }
  }

  if (imageUrls.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700">Imagens Existentes ({imageUrls.length})</h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {imageUrls.map((imageUrl, index) => {
          const isDeleting = deletingImages.has(imageUrl)
          
          return (
            <div key={index} className="relative group aspect-square rounded-lg overflow-hidden shadow-sm border border-gray-200">
              <img 
                src={imageUrl} 
                alt={`Imagem ${index + 1}`} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback para imagem quebrada
                  const target = e.target as HTMLImageElement
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2VtPC90ZXh0Pjwvc3ZnPg=='
                }}
              />
              
              {/* Botão de exclusão */}
              <button
                type="button"
                onClick={() => handleDeleteImage(imageUrl)}
                disabled={disabled || isDeleting}
                className={`
                  absolute top-1 right-1 rounded-full p-1 text-xs transition-opacity
                  ${isDeleting 
                    ? 'bg-gray-500 text-white cursor-not-allowed' 
                    : 'bg-red-500 text-white opacity-0 group-hover:opacity-100 hover:bg-red-600'
                  }
                `}
                title={isDeleting ? 'Excluindo...' : 'Excluir imagem'}
              >
                {isDeleting ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                ) : (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
              
              {/* Overlay de carregamento */}
              {isDeleting && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-white text-xs font-medium">Excluindo...</div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">
        <p className="font-medium mb-1">⚠️ Aviso:</p>
        <p>Clique no "X" para excluir imagens existentes. Esta ação remove a imagem tanto do servidor quanto da rifa.</p>
      </div>
    </div>
  )
}
