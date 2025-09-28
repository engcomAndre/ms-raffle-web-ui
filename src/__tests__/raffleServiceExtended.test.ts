import { RaffleService } from '../services/raffleService'
import { ApiService } from '../services/api'
import { environment } from '../config/environment'
import { RaffleCreationData, RaffleResponse, RaffleNumbersResponse } from '../types/raffle'

// Mock das dependências
jest.mock('../services/api')
jest.mock('../config/environment', () => ({
  environment: {
    raffleApiBaseUrl: 'http://localhost:8081'
  }
}))

const mockApiService = ApiService as jest.MockedClass<typeof ApiService>

describe('RaffleService - Extended Tests', () => {
  let raffleService: RaffleService
  let mockApiServiceInstance: jest.Mocked<ApiService>

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock do ApiService
    mockApiServiceInstance = {
      post: jest.fn(),
      get: jest.fn(),
      put: jest.fn(),
      delete: jest.fn()
    } as any
    
    mockApiService.mockImplementation(() => mockApiServiceInstance)
    
    raffleService = new RaffleService()
  })

  describe('createRaffle', () => {
    const mockRaffleData: RaffleCreationData = {
      title: 'Test Raffle',
      description: 'Test Description',
      maxNumbers: 100,
      pricePerNumber: 10.50,
      startAt: '2024-01-01T00:00:00Z',
      endAt: '2024-12-31T23:59:59Z'
    }

    const mockRaffleResponse: RaffleResponse = {
      id: 'raffle-123',
      title: 'Test Raffle',
      description: 'Test Description',
      maxNumbers: 100,
      pricePerNumber: 10.50,
      startAt: '2024-01-01T00:00:00Z',
      endAt: '2024-12-31T23:59:59Z',
      active: true,
      files: []
    }

    it('deve criar rifa com sucesso', async () => {
      // Mock da resposta da API
      mockApiServiceInstance.post.mockResolvedValue({
        success: true,
        data: mockRaffleResponse
      })

      // Executar criação
      const result = await raffleService.createRaffle(mockRaffleData)

      // Verificar resultado
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockRaffleResponse)

      // Verificar se a API foi chamada corretamente
      expect(mockApiServiceInstance.post).toHaveBeenCalledWith('/v1/raffles', mockRaffleData)
    })

    it('deve lidar com erro na criação de rifa', async () => {
      // Mock de erro da API
      mockApiServiceInstance.post.mockResolvedValue({
        success: false,
        error: 'Validation failed'
      })

      // Executar criação
      const result = await raffleService.createRaffle(mockRaffleData)

      // Verificar resultado
      expect(result.success).toBe(false)
      expect(result.error).toBe('Validation failed')
    })

    it('deve lidar com exceção durante criação', async () => {
      // Mock de exceção
      mockApiServiceInstance.post.mockRejectedValue(new Error('Network error'))

      // Executar criação
      const result = await raffleService.createRaffle(mockRaffleData)

      // Verificar resultado
      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })
  })

  describe('getMyRaffles', () => {
    const mockRafflesResponse: RaffleResponse[] = [
      {
        id: 'raffle-1',
        title: 'Raffle 1',
        description: 'Description 1',
        maxNumbers: 100,
        pricePerNumber: 10.50,
        startAt: '2024-01-01T00:00:00Z',
        endAt: '2024-12-31T23:59:59Z',
        active: true,
        files: []
      },
      {
        id: 'raffle-2',
        title: 'Raffle 2',
        description: 'Description 2',
        maxNumbers: 200,
        pricePerNumber: 15.00,
        startAt: '2024-02-01T00:00:00Z',
        endAt: '2024-12-31T23:59:59Z',
        active: false,
        files: []
      }
    ]

    it('deve buscar rifas com sucesso', async () => {
      // Mock da resposta da API
      mockApiServiceInstance.get.mockResolvedValue({
        success: true,
        data: mockRafflesResponse
      })

      // Executar busca
      const result = await raffleService.getMyRaffles()

      // Verificar resultado
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockRafflesResponse)

      // Verificar se a API foi chamada corretamente
      expect(mockApiServiceInstance.get).toHaveBeenCalledWith('/v1/raffles/my-raffles')
    })

    it('deve lidar com erro na busca de rifas', async () => {
      // Mock de erro da API
      mockApiServiceInstance.get.mockResolvedValue({
        success: false,
        error: 'Unauthorized'
      })

      // Executar busca
      const result = await raffleService.getMyRaffles()

      // Verificar resultado
      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })
  })

  describe('getRaffleById', () => {
    const mockRaffleId = 'raffle-123'
    const mockRaffleResponse: RaffleResponse = {
      id: mockRaffleId,
      title: 'Test Raffle',
      description: 'Test Description',
      maxNumbers: 100,
      pricePerNumber: 10.50,
      startAt: '2024-01-01T00:00:00Z',
      endAt: '2024-12-31T23:59:59Z',
      active: true,
      files: []
    }

    it('deve buscar rifa por ID com sucesso', async () => {
      // Mock da resposta da API
      mockApiServiceInstance.get.mockResolvedValue({
        success: true,
        data: mockRaffleResponse
      })

      // Executar busca
      const result = await raffleService.getRaffleById(mockRaffleId)

      // Verificar resultado
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockRaffleResponse)

      // Verificar se a API foi chamada corretamente
      expect(mockApiServiceInstance.get).toHaveBeenCalledWith(`/v1/raffles/${mockRaffleId}`)
    })

    it('deve lidar com rifa não encontrada', async () => {
      // Mock de erro da API
      mockApiServiceInstance.get.mockResolvedValue({
        success: false,
        error: 'Raffle not found'
      })

      // Executar busca
      const result = await raffleService.getRaffleById(mockRaffleId)

      // Verificar resultado
      expect(result.success).toBe(false)
      expect(result.error).toBe('Raffle not found')
    })
  })

  describe('getRaffleNumbers', () => {
    const mockRaffleId = 'raffle-123'
    const mockNumbersResponse: RaffleNumbersResponse = {
      rafflesNumbers: [
        { number: '1', status: 'ACTIVE', reservedBy: null, soldBy: null },
        { number: '2', status: 'RESERVED', reservedBy: 'user1', soldBy: null },
        { number: '3', status: 'SOLD', reservedBy: 'user1', soldBy: 'user2' }
      ],
      pageNumber: 0,
      pageSize: 20,
      totalElements: 100,
      totalPages: 5
    }

    it('deve buscar números da rifa com sucesso', async () => {
      // Mock da resposta da API
      mockApiServiceInstance.get.mockResolvedValue({
        success: true,
        data: mockNumbersResponse
      })

      // Executar busca
      const result = await raffleService.getRaffleNumbers(mockRaffleId, 0, 20)

      // Verificar resultado
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockNumbersResponse)

      // Verificar se a API foi chamada corretamente
      expect(mockApiServiceInstance.get).toHaveBeenCalledWith(
        `/v1/raffles/${mockRaffleId}/numbers?page=0&size=20`
      )
    })

    it('deve lidar com erro na busca de números', async () => {
      // Mock de erro da API
      mockApiServiceInstance.get.mockResolvedValue({
        success: false,
        error: 'Invalid raffle ID'
      })

      // Executar busca
      const result = await raffleService.getRaffleNumbers(mockRaffleId, 0, 20)

      // Verificar resultado
      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid raffle ID')
    })
  })

  describe('reserveRaffleNumber', () => {
    const mockRaffleId = 'raffle-123'
    const mockNumber = 15

    it('deve reservar número com sucesso', async () => {
      // Mock da resposta da API
      mockApiServiceInstance.post.mockResolvedValue({
        success: true,
        data: null
      })

      // Executar reserva
      const result = await raffleService.reserveRaffleNumber(mockRaffleId, mockNumber)

      // Verificar resultado
      expect(result.success).toBe(true)

      // Verificar se a API foi chamada corretamente
      expect(mockApiServiceInstance.post).toHaveBeenCalledWith(
        `/v1/raffles/${mockRaffleId}/numbers/reserve`,
        { number: mockNumber.toString() }
      )
    })

    it('deve lidar com erro na reserva', async () => {
      // Mock de erro da API
      mockApiServiceInstance.post.mockResolvedValue({
        success: false,
        error: 'Number already reserved'
      })

      // Executar reserva
      const result = await raffleService.reserveRaffleNumber(mockRaffleId, mockNumber)

      // Verificar resultado
      expect(result.success).toBe(false)
      expect(result.error).toBe('Number already reserved')
    })
  })

  describe('unreserveRaffleNumber', () => {
    const mockRaffleId = 'raffle-123'
    const mockNumber = 15

    it('deve desreservar número com sucesso', async () => {
      // Mock da resposta da API
      mockApiServiceInstance.post.mockResolvedValue({
        success: true,
        data: null
      })

      // Executar desreserva
      const result = await raffleService.unreserveRaffleNumber(mockRaffleId, mockNumber)

      // Verificar resultado
      expect(result.success).toBe(true)

      // Verificar se a API foi chamada corretamente
      expect(mockApiServiceInstance.post).toHaveBeenCalledWith(
        `/v1/raffles/${mockRaffleId}/numbers/unreserve`,
        { number: mockNumber.toString() }
      )
    })

    it('deve lidar com erro na desreserva', async () => {
      // Mock de erro da API
      mockApiServiceInstance.post.mockResolvedValue({
        success: false,
        error: 'Number not reserved'
      })

      // Executar desreserva
      const result = await raffleService.unreserveRaffleNumber(mockRaffleId, mockNumber)

      // Verificar resultado
      expect(result.success).toBe(false)
      expect(result.error).toBe('Number not reserved')
    })
  })

  describe('updateRaffle', () => {
    const mockRaffleId = 'raffle-123'
    const mockUpdateData = {
      title: 'Updated Raffle',
      description: 'Updated Description'
    }

    const mockUpdatedRaffle: RaffleResponse = {
      id: mockRaffleId,
      title: 'Updated Raffle',
      description: 'Updated Description',
      maxNumbers: 100,
      pricePerNumber: 10.50,
      startAt: '2024-01-01T00:00:00Z',
      endAt: '2024-12-31T23:59:59Z',
      active: true,
      files: []
    }

    it('deve atualizar rifa com sucesso', async () => {
      // Mock da resposta da API
      mockApiServiceInstance.put.mockResolvedValue({
        success: true,
        data: mockUpdatedRaffle
      })

      // Executar atualização
      const result = await raffleService.updateRaffle(mockRaffleId, mockUpdateData)

      // Verificar resultado
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockUpdatedRaffle)

      // Verificar se a API foi chamada corretamente
      expect(mockApiServiceInstance.put).toHaveBeenCalledWith(
        `/v1/raffles/${mockRaffleId}`,
        mockUpdateData
      )
    })

    it('deve lidar com erro na atualização', async () => {
      // Mock de erro da API
      mockApiServiceInstance.put.mockResolvedValue({
        success: false,
        error: 'Raffle not found'
      })

      // Executar atualização
      const result = await raffleService.updateRaffle(mockRaffleId, mockUpdateData)

      // Verificar resultado
      expect(result.success).toBe(false)
      expect(result.error).toBe('Raffle not found')
    })
  })

  describe('deleteRaffle', () => {
    const mockRaffleId = 'raffle-123'

    it('deve deletar rifa com sucesso', async () => {
      // Mock da resposta da API
      mockApiServiceInstance.delete.mockResolvedValue({
        success: true,
        data: null
      })

      // Executar deleção
      const result = await raffleService.deleteRaffle(mockRaffleId)

      // Verificar resultado
      expect(result.success).toBe(true)

      // Verificar se a API foi chamada corretamente
      expect(mockApiServiceInstance.delete).toHaveBeenCalledWith(`/v1/raffles/${mockRaffleId}`)
    })

    it('deve lidar com erro na deleção', async () => {
      // Mock de erro da API
      mockApiServiceInstance.delete.mockResolvedValue({
        success: false,
        error: 'Cannot delete raffle with active numbers'
      })

      // Executar deleção
      const result = await raffleService.deleteRaffle(mockRaffleId)

      // Verificar resultado
      expect(result.success).toBe(false)
      expect(result.error).toBe('Cannot delete raffle with active numbers')
    })
  })
})
