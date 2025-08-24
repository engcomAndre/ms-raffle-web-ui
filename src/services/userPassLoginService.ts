import { AuthService } from './authService'
import { useAuthStore } from '@/stores/authStore'

export interface UserPassLoginData {
  username: string
  password: string
}

export interface UserPassLoginResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  scope: string
  username: string
  email: string
  roles: string[]
  applicationUserId?: string | null
}

export class UserPassLoginService {
  private authService: AuthService

  constructor() {
    this.authService = new AuthService()
  }

  // Método para logout
  logout(): void {
    try {
      console.log('🚪 [USERPASS-LOGIN] Executando logout...')
      
      // Limpar dados do localStorage
      const authKeys = [
        'auth-token',
        'auth-refresh-token',
        'auth-username',
        'auth-email',
        'auth-roles'
      ]
      
      authKeys.forEach(key => {
        localStorage.removeItem(key)
        console.log(`🧹 [USERPASS-LOGIN] Removido: ${key}`)
      })
      
      console.log('✅ [USERPASS-LOGIN] Logout realizado com sucesso')
    } catch (error) {
      console.error('❌ [USERPASS-LOGIN] Erro durante logout:', error)
    }
  }

  async login(loginData: UserPassLoginData): Promise<{ success: boolean; data?: UserPassLoginResponse; error?: string }> {
    try {
      console.log('🔐 [USERPASS-LOGIN] Iniciando login com usuário e senha')
      console.log('📝 [USERPASS-LOGIN] Dados:', { username: loginData.username })

      const result = await this.authService.login(loginData)
      console.log('🔄 [USERPASS-LOGIN] Resposta recebida:', result)

      if (result.success && result.data) {
        console.log('✅ [USERPASS-LOGIN] Login realizado com sucesso')
        
        // Usar Zustand para gerenciar estado global
        const authStore = useAuthStore.getState()
        
        // Criar objeto User para o store
        const user = {
          id: result.data.applicationUserId || result.data.username,
          username: result.data.username,
          email: result.data.email,
          roles: result.data.roles,
          provider: 'userpass' as const
        }
        
        // Atualizar store global
        authStore.login(user, result.data.accessToken, result.data.refreshToken)
        
        console.log('✅ [USERPASS-LOGIN] Estado global atualizado via Zustand')
        
        return { success: true, data: result.data }
      } else {
        console.log('❌ [USERPASS-LOGIN] Erro no login:', result.error)
        return { success: false, error: result.error || 'Erro ao fazer login' }
      }
    } catch (error) {
      console.error('💥 [USERPASS-LOGIN] Erro durante o login:', error)
      return { success: false, error: 'Erro interno durante o login' }
    }
  }

  private saveUserData(userData: UserPassLoginResponse): void {
    try {
      // Salvar token de acesso
      if (userData.accessToken) {
        localStorage.setItem('auth-token', userData.accessToken)
        console.log('💾 [USERPASS-LOGIN] AccessToken salvo no localStorage')
      }
      
      // Salvar refresh token
      if (userData.refreshToken) {
        localStorage.setItem('auth-refresh-token', userData.refreshToken)
        console.log('💾 [USERPASS-LOGIN] RefreshToken salvo no localStorage')
      }
      
      // Salvar informações do usuário
      if (userData.username) {
        localStorage.setItem('auth-username', userData.username)
        console.log('💾 [USERPASS-LOGIN] Username salvo no localStorage')
      }
      
      if (userData.email) {
        localStorage.setItem('auth-email', userData.email)
        console.log('💾 [USERPASS-LOGIN] Email salvo no localStorage')
      }
      
      if (userData.roles) {
        localStorage.setItem('auth-roles', JSON.stringify(userData.roles))
        console.log('💾 [USERPASS-LOGIN] Roles salvo no localStorage')
      }
      
      console.log('✅ [USERPASS-LOGIN] Todos os dados salvos com sucesso')
    } catch (error) {
      console.error('❌ [USERPASS-LOGIN] Erro ao salvar dados:', error)
    }
  }

  private redirectToPlayground(): void {
    try {
      console.log('🚀 [USERPASS-LOGIN] Redirecionando para o playground...')
      console.log('🔍 [USERPASS-LOGIN] URL atual:', window.location.pathname)
      
      // Usar window.location.href para redirecionamento direto
      window.location.href = '/playground'
      console.log('✅ [USERPASS-LOGIN] Redirecionamento executado')
      
    } catch (error) {
      console.error('❌ [USERPASS-LOGIN] Erro no redirecionamento:', error)
      
      // Fallback: tentar recarregar a página
      try {
        console.log('🔄 [USERPASS-LOGIN] Tentando fallback com reload...')
        window.location.reload()
      } catch (fallbackError) {
        console.error('💥 [USERPASS-LOGIN] Erro no fallback:', fallbackError)
      }
    }
  }
}