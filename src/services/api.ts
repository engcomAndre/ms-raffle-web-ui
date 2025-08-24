export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export class ApiService {
  private baseURL: string

  constructor(baseURL?: string) {
    this.baseURL = baseURL || 'http://localhost:8080'
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`
      console.log(`🚀 [API] Fazendo requisição para: ${url}`)
      console.log(`📋 [API] Método: ${options.method || 'GET'}`)
      console.log(`📦 [API] Headers:`, options.headers)
      if (options.body) {
        console.log(`📤 [API] Body:`, options.body)
      }

      const config: RequestInit = {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      }

      console.log(`⏳ [API] Aguardando resposta...`)
      const response = await fetch(url, config)
      console.log(`📥 [API] Resposta recebida - Status: ${response.status} ${response.statusText}`)

      const data = await response.json()
      console.log(`📄 [API] Dados da resposta:`, data)

      if (!response.ok) {
        console.log(`❌ [API] Erro na resposta: ${response.status}`)
        return {
          success: false,
          error: `HTTP error! status: ${response.status}`,
          message: data.message || data.detail || 'Erro na requisição',
        }
      }

      console.log(`✅ [API] Requisição bem-sucedida`)
      return {
        success: true,
        data,
        message: data.message,
      }
    } catch (error) {
      console.log(`💥 [API] Erro durante a requisição:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        message: 'Erro de conexão',
      }
    }
  }
}

// Instância padrão do ApiService
export const apiService = new ApiService()
