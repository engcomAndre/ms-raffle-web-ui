import { ApiService, ApiResponse } from './api'
import { environment } from '../config/environment'
import { RaffleCreationData, RaffleResponse, RafflePageResponse, RaffleNumbersResponse } from '../types/raffle'

export class RaffleService {
  private readonly raffleApiService: ApiService

  constructor() {
    // Criar uma instância do ApiService específica para o serviço de rifas
    this.raffleApiService = new ApiService(environment.raffleApiBaseUrl)
  }

  /**
   * Cria uma nova rifa
   */
  async createRaffle(raffleData: RaffleCreationData): Promise<ApiResponse<RaffleResponse>> {
    console.log('🎯 [RAFFLE] Iniciando criação de rifa')
    console.log('📝 [RAFFLE] Dados da rifa:', raffleData)
    console.log('🔗 [RAFFLE] Endpoint: ', `${environment.raffleApiBaseUrl}/v1/raffles`)
    
    const response = await this.raffleApiService.post<RaffleResponse>('/v1/raffles', raffleData)
    
    console.log('📊 [RAFFLE] Resposta da criação:', response)
    return response
  }

  /**
   * Lista todas as rifas do usuário autenticado
   */
  async getMyRaffles(): Promise<ApiResponse<RaffleResponse[]>> {
    console.log('📋 [RAFFLE] Buscando rifas do usuário')
    
    const response = await this.raffleApiService.get<RaffleResponse[]>('/v1/raffles/my-raffles')
    
    console.log('📊 [RAFFLE] Rifas encontradas:', response)
    return response
  }

  /**
   * Busca uma rifa específica por ID
   */
  async getRaffleById(id: string): Promise<ApiResponse<RaffleResponse>> {
    console.log(`🔍 [RAFFLE] Buscando rifa ID: ${id}`)
    
    const response = await this.raffleApiService.get<RaffleResponse>(`/v1/raffles/${id}`)
    
    console.log('📊 [RAFFLE] Rifa encontrada:', response)
    return response
  }

  /**
   * Atualiza uma rifa existente
   */
  async updateRaffle(id: string, raffleData: Partial<RaffleCreationData>): Promise<ApiResponse<RaffleResponse>> {
    console.log(`✏️ [RAFFLE] Atualizando rifa ID: ${id}`)
    console.log('📝 [RAFFLE] Novos dados:', raffleData)
    
    const response = await this.raffleApiService.put<RaffleResponse>(`/v1/raffles/${id}`, raffleData)
    
    console.log('📊 [RAFFLE] Rifa atualizada:', response)
    return response
  }

  /**
   * Deleta uma rifa
   */
  async deleteRaffle(id: string): Promise<ApiResponse<any>> {
    console.log(`🗑️ [RAFFLE] Deletando rifa ID: ${id}`)
    
    const response = await this.raffleApiService.delete<any>(`/v1/raffles/${id}`)
    
    console.log('📊 [RAFFLE] Rifa deletada:', response)
    return response
  }

  /**
   * Lista todas as rifas públicas
   */
  async getPublicRaffles(): Promise<ApiResponse<RaffleResponse[]>> {
    console.log('🌐 [RAFFLE] Buscando rifas públicas')
    
    const response = await this.raffleApiService.get<RaffleResponse[]>('/v1/raffles')
    
    console.log('📊 [RAFFLE] Rifas públicas encontradas:', response)
    return response
  }

  /**
   * Lista rifas do usuário com paginação
   */
  async getMyRafflesWithPagination(page: number = 0, size: number = 10): Promise<ApiResponse<RafflePageResponse>> {
    console.log(`📋 [RAFFLE] Buscando rifas do usuário com paginação - página ${page}, tamanho ${size}`)
    
    const response = await this.raffleApiService.get<RafflePageResponse>(`/v1/raffles/page?page=${page}&size=${size}`)
    
    console.log('📊 [RAFFLE] Página de rifas encontrada:', response)
    return response
  }

  /**
   * Ativa uma rifa
   */
  async activeRaffle(id: string): Promise<ApiResponse<any>> {
    console.log(`▶️ [RAFFLE] Ativando rifa ID: ${id}`)
    
    const response = await this.raffleApiService.patch<any>(`/v1/raffles/${id}/activate`)
    
    console.log('📊 [RAFFLE] Rifa ativada:', response)
    return response
  }

  /**
   * Inativa uma rifa
   */
  async inactiveRaffle(id: string): Promise<ApiResponse<any>> {
    console.log(`⏸️ [RAFFLE] Inativando rifa ID: ${id}`)
    
    const response = await this.raffleApiService.patch<any>(`/v1/raffles/${id}/deactivate`)
    
    console.log('📊 [RAFFLE] Rifa inativada:', response)
    return response
  }

  /**
   * Busca os números de uma rifa específica
   */
  async getRaffleNumbers(raffleId: string, page: number = 0, size: number = 20): Promise<ApiResponse<RaffleNumbersResponse>> {
    console.log(`🔢 [RAFFLE] Buscando números da rifa ID: ${raffleId} - página ${page}, tamanho ${size}`)
    
    const response = await this.raffleApiService.get<RaffleNumbersResponse>(`/v1/raffles/${raffleId}/numbers?page=${page}&size=${size}`)
    
    console.log('📊 [RAFFLE] Números da rifa encontrados:', response)
    return response
  }

  /**
   * Reserva um número de rifa
   */
  async reserveRaffleNumber(raffleId: string, number: number): Promise<ApiResponse<void>> {
    console.log(`🔒 [RAFFLE] Reservando número ${number} da rifa ID: ${raffleId}`)
    
    const response = await this.raffleApiService.post<void>(`/v1/raffles/${raffleId}/numbers/reserve`, { number: number.toString() })
    
    console.log('📊 [RAFFLE] Resposta da reserva:', response)
    
    if (!response.success) {
      // Se não foi bem-sucedido, lançar erro para ser capturado pelo catch
      const error = new Error(response.message || 'Erro ao reservar número')
      ;(error as any).response = { data: response }
      throw error
    }
    
    return response
  }

  /**
   * Marca um número de rifa como vendido
   */
  async sellRaffleNumber(raffleId: string, number: number): Promise<ApiResponse<void>> {
    console.log(`💰 [RAFFLE] Vendendo número ${number} da rifa ID: ${raffleId}`)
    
    const response = await this.raffleApiService.post<void>(`/v1/raffles/${raffleId}/numbers/sold`, { number })
    
    console.log('📊 [RAFFLE] Resposta da venda:', response)
    
    if (!response.success) {
      // Se não foi bem-sucedido, lançar erro para ser capturado pelo catch
      const error = new Error(response.message || 'Erro ao vender número')
      ;(error as any).response = { data: response }
      throw error
    }
    
    return response
  }

  /**
   * Desreserva um número de rifa
   */
  async unreserveRaffleNumber(raffleId: string, number: number): Promise<ApiResponse<void>> {
    console.log(`♻️ [RAFFLE] Desreservando número ${number} da rifa ID: ${raffleId}`)

    const response = await this.raffleApiService.post<void>(`/v1/raffles/${raffleId}/numbers/unreserve`, { number: number.toString() })

    console.log('📊 [RAFFLE] Resposta da desreserva:', response)

    if (!response.success) {
      const error = new Error(response.message || 'Erro ao desreservar número')
      ;(error as any).response = { data: response }
      throw error
    }

    return response
  }

  /**
   * Incrementa o número de números de uma rifa
   */
  async incrementRaffleNumbers(raffleId: string, incrementsBy: number): Promise<ApiResponse<void>> {
    console.log(`➕ [RAFFLE] Incrementando ${incrementsBy} números na rifa ID: ${raffleId}`)
    
    const response = await this.raffleApiService.patch<void>(`/v1/raffles/${raffleId}/increment?incrementsBy=${incrementsBy}`)
    
    console.log('📊 [RAFFLE] Resposta do incremento:', response)

    if (!response.success) {
      const error = new Error(response.message || 'Erro ao incrementar números')
      ;(error as any).response = { data: response }
      throw error
    }

    return response
  }
}

// Instância padrão do RaffleService
export const raffleService = new RaffleService()
