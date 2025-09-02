import { useAuthStore } from '../stores/authStore'
import { environment } from '../config/environment'

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export class ApiService {
  private baseURL: string

  constructor(baseURL?: string) {
    this.baseURL = baseURL || environment.apiBaseUrl
  }

  private getAuthHeaders(includeAuth: boolean = true): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (includeAuth) {
      // Primeiro tentar pegar o token do auth store
      let token = useAuthStore.getState().token
      console.log('🔍 [API] Token do auth store:', token ? 'encontrado' : 'não encontrado')
      
      // Se não encontrar no auth store, tentar localStorage como fallback
      if (!token) {
        token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null
        console.log('🔍 [API] Token do localStorage:', token ? 'encontrado' : 'não encontrado')
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
        console.log('🔐 [API] Token de autenticação incluído nos headers')
      } else {
        console.log('⚠️ [API] Nenhum token de autenticação encontrado')
      }
    } else {
      console.log('🔓 [API] Requisição sem autenticação (login/register)')
    }
    
    return headers
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  // Métodos específicos para autenticação (sem token)
  async login<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }, false) // Sem autenticação
  }

  async register<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }, false) // Sem autenticação
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`
      console.log(`🚀 [API] Fazendo requisição para: ${url}`)
      console.log(`📋 [API] Método: ${options.method || 'GET'}`)
      
      const authHeaders = this.getAuthHeaders(includeAuth)
      const config: RequestInit = {
        ...options,
        headers: {
          ...authHeaders,
          ...options.headers,
        },
      }
      
      console.log(`📦 [API] Headers:`, config.headers)
      if (options.body) {
        console.log(`📤 [API] Body:`, options.body)
      }

      console.log(`⏳ [API] Aguardando resposta...`)
      const response = await fetch(url, config)
      console.log(`📥 [API] Resposta recebida - Status: ${response.status} ${response.statusText}`)

      // Verificar se a resposta tem conteúdo antes de tentar fazer JSON
      const contentType = response.headers.get('content-type')
      const hasContent = contentType && contentType.includes('application/json')
      
      let data: any = null
      if (hasContent && response.status !== 204) {
        try {
          data = await response.json()
          console.log(`📄 [API] Dados da resposta:`, data)
        } catch (jsonError) {
          console.log(`⚠️ [API] Erro ao fazer parse do JSON:`, jsonError)
          data = null
        }
      } else {
        console.log(`📄 [API] Resposta sem conteúdo JSON (status: ${response.status})`)
      }

      if (!response.ok) {
        console.log(`❌ [API] Erro na resposta: ${response.status}`)
        return {
          success: false,
          error: `HTTP error! status: ${response.status}`,
          message: data?.message || data?.detail || 'Erro na requisição',
        }
      }

      console.log(`✅ [API] Requisição bem-sucedida`)
      return {
        success: true,
        data,
        message: data?.message,
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
