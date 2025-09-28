import { RaffleService } from '@/services/raffleService'
import { ApiService } from '@/services/api'

jest.mock('@/services/api')

describe('RaffleService', () => {
  let service: RaffleService
  let apiMock: jest.Mocked<ApiService>

  beforeEach(() => {
    (ApiService as unknown as jest.Mock).mockClear()
    apiMock = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn()
      // @ts-ignore
    } as jest.Mocked<ApiService>

    ;(ApiService as unknown as jest.Mock).mockImplementation(() => apiMock)
    service = new RaffleService()
  })

  test('reserveRaffleNumber success', async () => {
    apiMock.post.mockResolvedValue({ success: true })
    const result = await service.reserveRaffleNumber('raffle-1', 10)
    expect(apiMock.post).toHaveBeenCalledWith('/v1/raffles/raffle-1/numbers/reserve', { number: 10 })
    expect(result.success).toBe(true)
  })

  test('reserveRaffleNumber error throws', async () => {
    apiMock.post.mockResolvedValue({ success: false, message: 'Erro' })
    await expect(service.reserveRaffleNumber('raffle-1', 10)).rejects.toThrow('Erro')
  })

  test('unreserveRaffleNumber success', async () => {
    apiMock.post.mockResolvedValue({ success: true })
    const result = await service.unreserveRaffleNumber('raffle-1', 10)
    expect(apiMock.post).toHaveBeenCalledWith('/v1/raffles/raffle-1/numbers/unreserve', { number: 10 })
    expect(result.success).toBe(true)
  })

  test('unreserveRaffleNumber error throws', async () => {
    apiMock.post.mockResolvedValue({ success: false, message: 'Erro' })
    await expect(service.unreserveRaffleNumber('raffle-1', 10)).rejects.toThrow('Erro')
  })
})





