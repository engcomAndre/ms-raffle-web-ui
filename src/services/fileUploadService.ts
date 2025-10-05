import { ApiService } from './api'
import { environment } from '@/config/environment'

export interface FileUploadResponse {
  success: boolean
  error?: string
  message?: string
}

export class FileUploadService {
  private readonly apiService: ApiService

  constructor() {
    this.apiService = new ApiService(environment.raffleApiBaseUrl)
  }

  /**
   * Faz upload de uma imagem para uma rifa específica
   */
  async uploadRaffleImage(raffleId: string, file: File): Promise<FileUploadResponse> {
    try {
      console.log('📤 [FILE-UPLOAD] Iniciando upload de imagem')
      console.log('📋 [FILE-UPLOAD] Rifa ID:', raffleId)
      console.log('📁 [FILE-UPLOAD] Arquivo:', file.name, 'Tamanho:', file.size)

      // Validar arquivo
      const validation = this.validateFile(file)
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error
        }
      }

      // Criar FormData
      const formData = new FormData()
      formData.append('file', file)

      // Fazer upload
      const response = await this.apiService.request<void>(
        `/v1/raffles/${raffleId}/file`,
        {
          method: 'PATCH',
          body: formData
        }
      )

      if (response.success) {
        console.log('✅ [FILE-UPLOAD] Upload realizado com sucesso')
        return {
          success: true,
          message: 'Imagem enviada com sucesso'
        }
      } else {
        console.error('❌ [FILE-UPLOAD] Erro no upload:', response.error)
        return {
          success: false,
          error: response.error || 'Erro ao fazer upload da imagem'
        }
      }
    } catch (error) {
      console.error('💥 [FILE-UPLOAD] Erro inesperado:', error)
      return {
        success: false,
        error: 'Erro inesperado ao fazer upload da imagem'
      }
    }
  }

  /**
   * Valida se o arquivo é válido para upload
   */
  private validateFile(file: File): { isValid: boolean; error?: string } {
    // Verificar se é uma imagem
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg']
    if (!validTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Apenas arquivos PNG e JPEG são permitidos'
      }
    }

    // Verificar tamanho (10MB = 10 * 1024 * 1024 bytes)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'Arquivo deve ter no máximo 10MB'
      }
    }

    return { isValid: true }
  }

  /**
   * Cria uma URL de preview para o arquivo
   */
  createPreviewUrl(file: File): string {
    return URL.createObjectURL(file)
  }

  /**
   * Limpa a URL de preview para liberar memória
   */
  revokePreviewUrl(url: string): void {
    URL.revokeObjectURL(url)
  }
}

// Instância singleton
export const fileUploadService = new FileUploadService()
