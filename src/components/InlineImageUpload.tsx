'use client'

import { useState, useRef, useCallback } from 'react'

interface InlineImageUploadProps {
  onImagesChange: (images: File[]) => void
  maxImages?: number
  disabled?: boolean
}

interface SelectedImage {
  id: string
  file: File
  previewUrl: string
}

export function InlineImageUpload({
  onImagesChange,
  maxImages = 5,
  disabled = false
}: InlineImageUploadProps) {
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const canAddMore = selectedImages.length < maxImages

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || disabled || !canAddMore) return

    const remainingSlots = maxImages - selectedImages.length
    const filesToProcess = Array.from(files).slice(0, remainingSlots)

    const newImages: SelectedImage[] = filesToProcess.map(file => {
      const imageId = Math.random().toString(36).substr(2, 9)
      const previewUrl = URL.createObjectURL(file)
      
      return {
        id: imageId,
        file,
        previewUrl
      }
    })

    const updatedImages = [...selectedImages, ...newImages]
    setSelectedImages(updatedImages)
    onImagesChange(updatedImages.map(img => img.file))
  }, [disabled, canAddMore, maxImages, selectedImages, onImagesChange])

  const handleRemove = (imageId: string) => {
    const image = selectedImages.find(img => img.id === imageId)
    if (image) {
      URL.revokeObjectURL(image.previewUrl)
    }
    
    const updatedImages = selectedImages.filter(img => img.id !== imageId)
    setSelectedImages(updatedImages)
    onImagesChange(updatedImages.map(img => img.file))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled && canAddMore) {
      setIsDragOver(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (!disabled && canAddMore) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files)
    // Limpar o input para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const openFileDialog = () => {
    if (!disabled && canAddMore && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="space-y-4">
      {/* Área de Upload */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-4 text-center transition-colors
          ${isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled || !canAddMore 
            ? 'opacity-50 cursor-not-allowed' 
            : 'cursor-pointer hover:bg-gray-50'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled || !canAddMore}
        />
        
        <div className="space-y-2">
          <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          
          <div className="text-sm text-gray-600">
            <span className="font-medium text-blue-600 hover:text-blue-500">
              Clique para selecionar imagens
            </span>
            {' '}ou arraste e solte
          </div>
          
          <p className="text-xs text-gray-500">
            PNG, JPEG até 10MB cada • Máximo {maxImages} imagens
          </p>
        </div>
      </div>

      {/* Preview das Imagens */}
      {selectedImages.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">
              Imagens Selecionadas
            </h4>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {selectedImages.length} de {maxImages}
            </span>
          </div>
          
          <div className="grid grid-cols-5 gap-2">
            {selectedImages.map(image => (
              <div key={image.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={image.previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Botão de remover */}
                <button
                  onClick={() => handleRemove(image.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white text-xs rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                >
                  ×
                </button>
                
                {/* Nome do arquivo truncado */}
                <div className="mt-1 text-xs text-gray-600 truncate" title={image.file.name}>
                  {image.file.name.length > 12 
                    ? image.file.name.substring(0, 12) + '...' 
                    : image.file.name
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
