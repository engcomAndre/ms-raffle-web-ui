import { FileUploadService } from '../services/fileUploadService'
import { ApiService } from '../services/api'

// Mock do ApiService
jest.mock('../services/api')
const MockedApiService = ApiService as jest.MockedClass<typeof ApiService>

describe('FileUploadService', () => {
  let fileUploadService: FileUploadService
  let mockApiService: jest.Mocked<ApiService>

  beforeEach(() => {
    // Limpar mocks
    jest.clearAllMocks()
    
    // Mock URL.createObjectURL e URL.revokeObjectURL
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url')
    global.URL.revokeObjectURL = jest.fn()
    
    // Criar mock do ApiService
    mockApiService = {
      request: jest.fn()
    } as any
    
    MockedApiService.mockImplementation(() => mockApiService)
    
    fileUploadService = new FileUploadService()
  })

  describe('validateFile', () => {
    test('should validate PNG files correctly', () => {
      const validFile = new File(['test'], 'test.png', { type: 'image/png' })
      const result = (fileUploadService as any).validateFile(validFile)
      
      expect(result.isValid).toBe(true)
    })

    test('should validate JPEG files correctly', () => {
      const validFile = new File(['test'], 'test.jpeg', { type: 'image/jpeg' })
      const result = (fileUploadService as any).validateFile(validFile)
      
      expect(result.isValid).toBe(true)
    })

    test('should validate JPG files correctly', () => {
      const validFile = new File(['test'], 'test.jpg', { type: 'image/jpg' })
      const result = (fileUploadService as any).validateFile(validFile)
      
      expect(result.isValid).toBe(true)
    })

    test('should reject invalid file types', () => {
      const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' })
      const result = (fileUploadService as any).validateFile(invalidFile)
      
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Apenas arquivos PNG e JPEG são permitidos')
    })

    test('should reject files that are too large', () => {
      // Criar um arquivo maior que 10MB
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.png', { type: 'image/png' })
      const result = (fileUploadService as any).validateFile(largeFile)
      
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Arquivo deve ter no máximo 10MB')
    })

    test('should accept files at the size limit', () => {
      // Criar um arquivo exatamente no limite de 10MB
      const limitFile = new File(['x'.repeat(10 * 1024 * 1024)], 'limit.png', { type: 'image/png' })
      const result = (fileUploadService as any).validateFile(limitFile)
      
      expect(result.isValid).toBe(true)
    })
  })

  describe('uploadRaffleImage', () => {
    const validFile = new File(['test'], 'test.png', { type: 'image/png' })
    const raffleId = 'test-raffle-id'

    test('should upload file successfully', async () => {
      mockApiService.request.mockResolvedValue({
        success: true,
        data: undefined
      })

      const result = await fileUploadService.uploadRaffleImage(raffleId, validFile)

      expect(result.success).toBe(true)
      expect(result.message).toBe('Imagem enviada com sucesso')
      expect(mockApiService.request).toHaveBeenCalledWith(
        `/v1/raffles/${raffleId}/file`,
        {
          method: 'PATCH',
          body: expect.any(FormData)
        }
      )
    })

    test('should handle API error response', async () => {
      mockApiService.request.mockResolvedValue({
        success: false,
        error: 'API Error'
      })

      const result = await fileUploadService.uploadRaffleImage(raffleId, validFile)

      expect(result.success).toBe(false)
      expect(result.error).toBe('API Error')
    })

    test('should handle API error without error message', async () => {
      mockApiService.request.mockResolvedValue({
        success: false
      })

      const result = await fileUploadService.uploadRaffleImage(raffleId, validFile)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Erro ao fazer upload da imagem')
    })

    test('should handle network error', async () => {
      mockApiService.request.mockRejectedValue(new Error('Network error'))

      const result = await fileUploadService.uploadRaffleImage(raffleId, validFile)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Erro inesperado ao fazer upload da imagem')
    })

    test('should reject invalid file types', async () => {
      const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' })

      const result = await fileUploadService.uploadRaffleImage(raffleId, invalidFile)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Apenas arquivos PNG e JPEG são permitidos')
      expect(mockApiService.request).not.toHaveBeenCalled()
    })

    test('should reject files that are too large', async () => {
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.png', { type: 'image/png' })

      const result = await fileUploadService.uploadRaffleImage(raffleId, largeFile)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Arquivo deve ter no máximo 10MB')
      expect(mockApiService.request).not.toHaveBeenCalled()
    })
  })

  describe('createPreviewUrl', () => {
    test('should create preview URL for file', () => {
      const file = new File(['test'], 'test.png', { type: 'image/png' })
      const url = fileUploadService.createPreviewUrl(file)
      
      expect(url).toMatch(/^blob:/)
      expect(typeof url).toBe('string')
    })
  })

  describe('revokePreviewUrl', () => {
    test('should revoke preview URL', () => {
      const file = new File(['test'], 'test.png', { type: 'image/png' })
      const url = fileUploadService.createPreviewUrl(file)
      
      // Não deve lançar erro
      expect(() => fileUploadService.revokePreviewUrl(url)).not.toThrow()
    })
  })

  describe('singleton instance', () => {
    test('should export singleton instance', () => {
      const { fileUploadService: singleton } = require('../services/fileUploadService')
      expect(singleton).toBeInstanceOf(FileUploadService)
    })
  })
})