import { useAuthStore } from '@/stores/authStore'
import { authService, ExternalUserRegistrationData } from './authService'

export interface GoogleUserData {
  id: string
  name: string
  email: string
  picture?: string
  provider: 'google'
}

export interface GoogleLoginResponse {
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

export class GoogleLoginService {
  // Método para logout
  logout(): void {
    try {
      console.log('🚪 [GOOGLE-LOGIN] Executando logout...')
      
      // Limpar dados do localStorage
      const authKeys = [
        'auth-token',
        'auth-refresh-token',
        'auth-username',
        'auth-email',
        'auth-roles',
        'auth-provider',
        'google-user-id',
        'google-user-name',
        'google-user-email',
        'google-user-picture'
      ]
      
      authKeys.forEach(key => {
        localStorage.removeItem(key)
        console.log(`🧹 [GOOGLE-LOGIN] Removido: ${key}`)
      })
      
      console.log('✅ [GOOGLE-LOGIN] Logout realizado com sucesso')
    } catch (error) {
      console.error('❌ [GOOGLE-LOGIN] Erro durante logout:', error)
    }
  }

  async handleGoogleLogin(credential: string): Promise<{ success: boolean; data?: GoogleUserData; error?: string }> {
    try {
      console.log('🔐 [GOOGLE-LOGIN] Iniciando login com Google')
      console.log('📝 [GOOGLE-LOGIN] Credential recebida:', credential.substring(0, 50) + '...')

      // Decodificar o JWT do Google
      const userData = this.decodeGoogleCredential(credential)
      
      if (userData) {
        console.log('✅ [GOOGLE-LOGIN] Dados do Google decodificados:', userData)
        
        // Cadastrar usuário no backend
        await this.registerGoogleUser(userData)
        
        // Usar Zustand para gerenciar estado global
        const authStore = useAuthStore.getState()
        
        // Gerar token simulado
        const simulatedToken = 'google_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
        
        // Atualizar store global
        authStore.loginGoogle(userData, simulatedToken)
        
        console.log('✅ [GOOGLE-LOGIN] Estado global atualizado via Zustand')
        
        return { success: true, data: userData }
      } else {
        console.log('❌ [GOOGLE-LOGIN] Erro ao decodificar credencial do Google')
        return { success: false, error: 'Erro ao decodificar credencial do Google' }
      }
    } catch (error) {
      console.error('💥 [GOOGLE-LOGIN] Erro durante o login:', error)
      return { success: false, error: 'Erro interno durante o login com Google' }
    }
  }

  /**
   * Cadastra o usuário Google no backend
   */
  private async registerGoogleUser(userData: GoogleUserData): Promise<void> {
    try {
      console.log('👤 [GOOGLE-LOGIN] Iniciando cadastro no backend...')
      
      // Separar nome em firstName e lastName
      const nameParts = userData.name.split(' ')
      const firstName = nameParts[0] || userData.name
      const lastName = nameParts.slice(1).join(' ') || firstName
      
      // Preparar dados para o backend
      const externalUserData: ExternalUserRegistrationData = {
        email: userData.email,
        firstName: firstName,
        lastName: lastName,
        authProvider: 'google'
      }
      
      console.log('📤 [GOOGLE-LOGIN] Enviando dados para o backend:', externalUserData)
      
      // Chamar o backend para cadastro
      const response = await authService.registerExternalUser(externalUserData)
      
      if (response.success) {
        if (response.data?.isNewUser) {
          console.log('✅ [GOOGLE-LOGIN] Usuário criado com sucesso no backend')
        } else {
          console.log('✅ [GOOGLE-LOGIN] Usuário já existe no backend')
        }
        
        // Salvar ID do usuário do backend se disponível
        if (response.data?.id) {
          localStorage.setItem('backend-user-id', response.data.id)
          console.log('💾 [GOOGLE-LOGIN] ID do backend salvo:', response.data.id)
        }
      } else {
        console.warn('⚠️ [GOOGLE-LOGIN] Erro no cadastro do backend:', response.error)
        // Continuar mesmo com erro no backend
      }
      
    } catch (error) {
      console.error('❌ [GOOGLE-LOGIN] Erro durante cadastro no backend:', error)
      // Continuar mesmo com erro no backend
    }
  }

  private decodeGoogleCredential(credential: string): GoogleUserData | null {
    try {
      // Decodificar o JWT do Google (parte payload)
      const payload = credential.split('.')[1]
      const decodedPayload = JSON.parse(atob(payload))
      
      console.log('🔍 [GOOGLE-LOGIN] Payload decodificado:', decodedPayload)
      
      return {
        id: decodedPayload.sub || decodedPayload.user_id,
        name: decodedPayload.name || decodedPayload.given_name + ' ' + decodedPayload.family_name,
        email: decodedPayload.email,
        picture: decodedPayload.picture,
        provider: 'google'
      }
    } catch (error) {
      console.error('❌ [GOOGLE-LOGIN] Erro ao decodificar JWT:', error)
      return null
    }
  }

  private saveGoogleUserData(userData: GoogleUserData): void {
    try {
      // Salvar informações do usuário Google
      if (userData.id) {
        localStorage.setItem('google-user-id', userData.id)
        console.log('💾 [GOOGLE-LOGIN] Google User ID salvo no localStorage')
      }
      
      if (userData.name) {
        localStorage.setItem('google-user-name', userData.name)
        localStorage.setItem('auth-username', userData.name) // Para compatibilidade
        console.log('💾 [GOOGLE-LOGIN] Google User Name salvo no localStorage')
      }
      
      if (userData.email) {
        localStorage.setItem('google-user-email', userData.email)
        localStorage.setItem('auth-email', userData.email) // Para compatibilidade
        console.log('💾 [GOOGLE-LOGIN] Google User Email salvo no localStorage')
      }
      
      if (userData.picture) {
        localStorage.setItem('google-user-picture', userData.picture)
        console.log('💾 [GOOGLE-LOGIN] Google User Picture salvo no localStorage')
      }
      
      // Marcar como usuário Google
      localStorage.setItem('auth-provider', 'google')
      console.log('💾 [GOOGLE-LOGIN] Provider marcado como Google')
      
      // Salvar roles padrão para Google
      localStorage.setItem('auth-roles', JSON.stringify(['user']))
      console.log('💾 [GOOGLE-LOGIN] Roles padrão salvo no localStorage')
      
      console.log('✅ [GOOGLE-LOGIN] Todos os dados do Google salvos com sucesso')
    } catch (error) {
      console.error('❌ [GOOGLE-LOGIN] Erro ao salvar dados do Google:', error)
    }
  }

  private saveAuthToken(): void {
    try {
      // Gerar token simulado mais robusto
      const timestamp = Date.now()
      const randomPart = Math.random().toString(36).substr(2, 9)
      const simulatedToken = `google_${timestamp}_${randomPart}`
      
      localStorage.setItem('auth-token', simulatedToken)
      console.log('💾 [GOOGLE-LOGIN] Token de autenticação salvo no localStorage')
      
      // Opcionalmente salvar refresh token simulado
      const refreshToken = `refresh_google_${timestamp}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('auth-refresh-token', refreshToken)
      console.log('💾 [GOOGLE-LOGIN] Refresh token salvo no localStorage')
      
    } catch (error) {
      console.error('❌ [GOOGLE-LOGIN] Erro ao salvar token:', error)
    }
  }

  private redirectToPlayground(): void {
    try {
      console.log('🚀 [GOOGLE-LOGIN] Redirecionando para o playground...')
      console.log('🔍 [GOOGLE-LOGIN] URL atual:', window.location.pathname)
      
      // Usar window.location.href para redirecionamento direto
      window.location.href = '/playground'
      console.log('✅ [GOOGLE-LOGIN] Redirecionamento executado')
      
    } catch (error) {
      console.error('❌ [GOOGLE-LOGIN] Erro no redirecionamento:', error)
      
      // Fallback: tentar recarregar a página
      try {
        console.log('🔄 [GOOGLE-LOGIN] Tentando fallback com reload...')
        window.location.reload()
      } catch (fallbackError) {
        console.error('💥 [GOOGLE-LOGIN] Erro no fallback:', fallbackError)
      }
    }
  }
}