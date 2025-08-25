import { apiService, ApiResponse } from './api'
import { environment } from '../config/environment'

// Interfaces para o cadastro de usuário
export interface UserRegistrationData {
  firstName: string
  lastName: string
  email: string
  username: string
  password: string
  roles: string[]
}

// Interface para cadastro de usuários externos (Google, etc.)
export interface ExternalUserRegistrationData {
  email: string
  firstName: string
  lastName: string
  authProvider: 'google' | 'facebook' | 'github'
}

export interface ExternalUserRegistrationResponse {
  id: string
  email: string
  firstName: string
  lastName: string
  authProvider: string
  isNewUser: boolean
  message?: string
}

export interface UserRegistrationResponse {
  id: string
  firstName: string
  lastName: string
  email: string
  username: string
  createdAt: string
  message?: string
}

export interface LoginData {
  username: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  scope: string
  username: string
  email: string
  roles: string[]
  applicationUserId?: string | null
  message?: string
}

export class AuthService {
  private readonly baseEndpoint = environment.endpoints.auth.register

  /**
   * Cadastra um novo usuário
   */
  async register(userData: UserRegistrationData): Promise<ApiResponse<UserRegistrationResponse>> {
    console.log(`👤 [AUTH] Iniciando cadastro de usuário`)
    console.log(`📝 [AUTH] Dados do usuário:`, userData)
    console.log(`🔗 [AUTH] Endpoint: ${this.baseEndpoint}`)
    
    const response = await apiService.post<UserRegistrationResponse>(this.baseEndpoint, userData)
    
    console.log(`📊 [AUTH] Resposta do cadastro:`, response)
    return response
  }

  /**
   * Cadastra um usuário externo (Google, Facebook, etc.)
   */
  async registerExternalUser(userData: ExternalUserRegistrationData): Promise<ApiResponse<ExternalUserRegistrationResponse>> {
    console.log(`👤 [AUTH] Iniciando cadastro de usuário externo`)
    console.log(`📝 [AUTH] Dados do usuário externo:`, userData)
    console.log(`🔗 [AUTH] Endpoint: ${environment.endpoints.auth.external}`)
    
    const response = await apiService.post<ExternalUserRegistrationResponse>(environment.endpoints.auth.external, userData)
    
    console.log(`📊 [AUTH] Resposta do cadastro externo:`, response)
    return response
  }

  /**
   * Realiza login do usuário
   */
  async login(loginData: LoginData): Promise<ApiResponse<LoginResponse>> {
    console.log(`🔐 [AUTH] Iniciando login do usuário`)
    console.log(`📝 [AUTH] Dados do login:`, loginData)
    console.log(`🔗 [AUTH] Endpoint: ${environment.endpoints.auth.login}`)
    
    const response = await apiService.post<LoginResponse>(environment.endpoints.auth.login, loginData)
    
    console.log(`📊 [AUTH] Resposta do login:`, response)
    return response
  }

  /**
   * Verifica se o usuário está autenticado
   */
  async verifyToken(token: string): Promise<ApiResponse<any>> {
    return apiService.get(`${this.baseEndpoint}/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  }

  /**
   * Faz logout do usuário
   */
  async logout(): Promise<ApiResponse<any>> {
    return apiService.post(`${this.baseEndpoint}/logout`)
  }
}

// Instância padrão do serviço de autenticação
export const authService = new AuthService()
