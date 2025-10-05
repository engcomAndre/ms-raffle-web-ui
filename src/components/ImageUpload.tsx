'use client'

import { useState, useRef, useCallback } from 'react'
import { fileUploadService } from '@/services/fileUploadService'

interface ImageUploadProps {
  raffleId: string
  onUploadSuccess: (imageUrl: string) => void
  onUploadError: (error: string) => void
  maxImages?: number
  currentImageCount?: number
  disabled?: boolean
}

interface UploadedImage {
  id: string
  file: File
  previewUrl: string
  isUploading: boolean
  error?: string
}

export function ImageUpload({
  raffleId,
  onUploadSuccess,
  onUploadError,
  maxImages = 5,
  currentImageCount = 0,
  disabled = false
}: ImageUploadProps) {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const canUploadMore = currentImageCount + uploadedImages.length < maxImages

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || disabled || !canUploadMore) return

    const remainingSlots = maxImages - currentImageCount - uploadedImages.length
    const filesToProcess = Array.from(files).slice(0, remainingSlots)

    filesToProcess.forEach(file => {
      const imageId = Math.random().toString(36).substr(2, 9)
      const previewUrl = fileUploadService.createPreviewUrl(file)
      
      const newImage: UploadedImage = {
        id: imageId,
        file,
        previewUrl,
        isUploading: false
      }

      setUploadedImages(prev => [...prev, newImage])
    })
  }, [disabled, canUploadMore, maxImages, currentImageCount, uploadedImages.length])

  const handleUpload = async (imageId: string) => {
    const image = uploadedImages.find(img => img.id === imageId)
    if (!image) return

    setUploadedImages(prev => 
      prev.map(img => 
        img.id === imageId 
          ? { ...img, isUploading: true, error: undefined }
          : img
      )
    )

    try {
      const result = await fileUploadService.uploadRaffleImage(raffleId, image.file)
      
      if (result.success) {
        onUploadSuccess(image.previewUrl)
        // Remover da lista após upload bem-sucedido
        setUploadedImages(prev => prev.filter(img => img.id !== imageId))
        fileUploadService.revokePreviewUrl(image.previewUrl)
      } else {
        setUploadedImages(prev => 
          prev.map(img => 
            img.id === imageId 
              ? { ...img, isUploading: false, error: result.error }
              : img
          )
        )
        onUploadError(result.error || 'Erro no upload')
      }
    } catch (error) {
      setUploadedImages(prev => 
        prev.map(img => 
          img.id === imageId 
            ? { ...img, isUploading: false, error: 'Erro inesperado' }
            : img
        )
      )
      onUploadError('Erro inesperado no upload')
    }
  }

  const handleRemove = (imageId: string) => {
    const image = uploadedImages.find(img => img.id === imageId)
    if (image) {
      fileUploadService.revokePreviewUrl(image.previewUrl)
    }
    setUploadedImages(prev => prev.filter(img => img.id !== imageId))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled && canUploadMore) {
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
    if (!disabled && canUploadMore) {
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
    if (!disabled && canUploadMore && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="space-y-4">
      {/* Área de Upload */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled || !canUploadMore 
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
          disabled={disabled || !canUploadMore}
        />
        
        <div className="space-y-2">
          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          
          <div className="text-sm text-gray-600">
            <span className="font-medium text-blue-600 hover:text-blue-500">
              Clique para selecionar
            </span>
            {' '}ou arraste e solte
          </div>
          
          <p className="text-xs text-gray-500">
            PNG, JPEG até 10MB cada
          </p>
          
          <p className="text-xs text-gray-500">
            {currentImageCount + uploadedImages.length} de {maxImages} imagens
          </p>
        </div>
      </div>

      {/* Lista de Imagens Selecionadas */}
      {uploadedImages.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">
            Imagens Selecionadas ({uploadedImages.length})
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {uploadedImages.map(image => (
              <div key={image.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={image.previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Overlay com ações */}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                  {image.isUploading ? (
                    <div className="text-white text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2"></div>
                      <p className="text-xs">Enviando...</p>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleUpload(image.id)}
                        disabled={image.isUploading}
                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition-colors disabled:opacity-50"
                      >
                        Enviar
                      </button>
                      <button
                        onClick={() => handleRemove(image.id)}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded transition-colors"
                      >
                        Remover
                      </button>
                    </>
                  )}
                </div>
                
                {/* Erro */}
                {image.error && (
                  <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white text-xs p-1 rounded-b-lg">
                    {image.error}
                  </div>
                )}
                
                {/* Nome do arquivo */}
                <div className="mt-1 text-xs text-gray-600 truncate">
                  {image.file.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
