'use client'

import { useState } from 'react'

interface RaffleImageCarouselProps {
  images: string[]
  className?: string
}

export function RaffleImageCarousel({ images, className = '' }: RaffleImageCarouselProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  // Se não há imagens, mostra placeholder
  if (!images || images.length === 0) {
    return (
      <div className={`w-48 h-32 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-xs font-medium">Sem imagens</p>
        </div>
      </div>
    )
  }

  const goToPrevious = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    )
  }

  const goToNext = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    )
  }

  const currentImage = images[currentImageIndex]

  return (
    <div 
      className={`relative w-48 h-32 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Imagem atual */}
      <img
        src={currentImage}
        alt={`Imagem ${currentImageIndex + 1} da rifa`}
        className="w-full h-full object-cover"
        onError={(e) => {
          // Fallback para imagem quebrada
          const target = e.target as HTMLImageElement
          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyIiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDE5MiAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxOTIiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik05NiA0OEw4NCA2MEgxMDhMOTYgNDhaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik04NCA2MEw5NiA3MkgxMDhMOTYgNjBaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik05NiA3Mkw4NCA4NEgxMDhMOTYgNzJaIiBmaWxsPSIjOUNBM0FGIi8+Cjx0ZXh0IHg9Ijk2IiB5PSI5NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzlDQTNBRiIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIj5JbWFnZW0gSW5kaXNwb27DrXZlbDwvdGV4dD4KPC9zdmc+'
        }}
      />

      {/* Indicador de posição */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
          <div className="flex space-x-1">
            {images.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Botões de navegação - só aparecem no hover */}
      {images.length > 1 && isHovered && (
        <>
          {/* Botão anterior */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              goToPrevious()
            }}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors"
            aria-label="Imagem anterior"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Botão próximo */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              goToNext()
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors"
            aria-label="Próxima imagem"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Contador de imagens */}
      {images.length > 1 && (
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          {currentImageIndex + 1}/{images.length}
        </div>
      )}
    </div>
  )
}
