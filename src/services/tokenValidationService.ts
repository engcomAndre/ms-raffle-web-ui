import { environment } from '@/config/environment'

export interface TokenValidationResponse {
  valid: boolean
  user?: {
    id: string
    username: string
    email: string
    roles: string[]
  }
  error?: string
}

export class TokenValidationService {
  private readonly baseURL = environment.apiBaseUrl

  async validateToken(token: string): Promise<TokenValidationResponse> {
    try {
      console.log('🔍 [TOKEN-VALIDATION] Validando token...')
      
      // BREAKPOINT 6: Antes de validar JWT localmente
      debugger;
      console.log('🔄 [TOKEN-VALIDATION] BREAKPOINT 6: Validando JWT localmente...')
      
      // Validar JWT localmente (sem fazer requisição)
      const isValid = this.validateJWTLocally(token)
      
      if (isValid) {
        // Decodificar JWT para extrair informações do usuário
        const userData = this.decodeJWT(token)
        console.log('✅ [TOKEN-VALIDATION] Token válido, usuário:', userData)
        
        return {
          valid: true,
          user: {
            id: userData.sub || userData.user_id,
            username: userData.preferred_username || userData.username,
            email: userData.email,
            roles: userData.realm_access?.roles || []
          }
        }
      } else {
        console.log('❌ [TOKEN-VALIDATION] Token inválido ou expirado')
        return {
          valid: false,
          error: 'Token inválido ou expirado'
        }
      }
    } catch (error) {
      console.error('💥 [TOKEN-VALIDATION] Erro na validação:', error)
      return {
        valid: false,
        error: 'Erro ao validar token'
      }
    }
  }

  private validateJWTLocally(token: string): boolean {
    try {
      // Decodificar JWT
      const payload = this.decodeJWT(token)
      
      if (!payload) return false
      
      // Verificar se não expirou
      const currentTime = Math.floor(Date.now() / 1000)
      if (payload.exp && payload.exp < currentTime) {
        console.log('❌ [TOKEN-VALIDATION] Token expirado')
        return false
      }
      
      // Verificar se tem campos obrigatórios
      if (!payload.sub || !payload.preferred_username) {
        console.log('❌ [TOKEN-VALIDATION] Token sem campos obrigatórios')
        return false
      }
      
      console.log('✅ [TOKEN-VALIDATION] JWT válido localmente')
      return true
    } catch (error) {
      console.error('❌ [TOKEN-VALIDATION] Erro ao validar JWT:', error)
      return false
    }
  }

  private decodeJWT(token: string): any {
    try {
      // Decodificar JWT (parte payload)
      const payload = token.split('.')[1]
      const decodedPayload = JSON.parse(atob(payload))
      
      console.log('🔍 [TOKEN-VALIDATION] Payload decodificado:', decodedPayload)
      return decodedPayload
    } catch (error) {
      console.error('❌ [TOKEN-VALIDATION] Erro ao decodificar JWT:', error)
      return null
    }
  }

  async validateAndRedirect(token: string, targetRoute: string = '/playground'): Promise<boolean> {
    try {
      console.log('🔍 [TOKEN-VALIDATION] Validando token antes do redirecionamento...')
      
      // BREAKPOINT 1: Antes de validar token
      debugger;
      console.log('🔄 [TOKEN-VALIDATION] BREAKPOINT 1: Iniciando validação do token...')
      
      const validation = await this.validateToken(token)
      
      // BREAKPOINT 2: Após validação
      debugger;
      console.log('🔄 [TOKEN-VALIDATION] BREAKPOINT 2: Resultado da validação:', validation)
      
      if (validation.valid && validation.user) {
        console.log('✅ [TOKEN-VALIDATION] Token válido, redirecionando para:', targetRoute)
        
        // BREAKPOINT 3: Antes de salvar dados validados
        debugger;
        console.log('🔄 [TOKEN-VALIDATION] BREAKPOINT 3: Salvando dados do usuário validado...')
        
        // Salvar informações do usuário validado
        localStorage.setItem('auth-user-id', validation.user.id)
        localStorage.setItem('auth-user-username', validation.user.username)
        localStorage.setItem('auth-user-email', validation.user.email)
        localStorage.setItem('auth-user-roles', JSON.stringify(validation.user.roles))
        
        // BREAKPOINT 4: Antes de redirecionar
        debugger;
        console.log('🔄 [TOKEN-VALIDATION] BREAKPOINT 4: Executando redirecionamento...')
        
        // Redirecionar com validação confirmada
        this.redirectToRoute(targetRoute)
        return true
      } else {
        console.log('❌ [TOKEN-VALIDATION] Token inválido, redirecionando para /welcome')
        
        // Limpar dados inválidos
        this.clearInvalidAuthData()
        
        // Redirecionar para login
        this.redirectToRoute('/welcome')
        return false
      }
    } catch (error) {
      console.error('💥 [TOKEN-VALIDATION] Erro na validação e redirecionamento:', error)
      
      // Em caso de erro, limpar dados e redirecionar para login
      this.clearInvalidAuthData()
      this.redirectToRoute('/welcome')
      return false
    }
  }

  private clearInvalidAuthData(): void {
    try {
      localStorage.removeItem('auth-token')
      localStorage.removeItem('auth-refresh-token')
      localStorage.removeItem('auth-username')
      localStorage.removeItem('auth-email')
      localStorage.removeItem('auth-roles')
      localStorage.removeItem('auth-user-id')
      localStorage.removeItem('auth-user-username')
      localStorage.removeItem('auth-user-email')
      localStorage.removeItem('auth-user-roles')
      console.log('🧹 [TOKEN-VALIDATION] Dados de autenticação inválidos removidos')
    } catch (error) {
      console.error('❌ [TOKEN-VALIDATION] Erro ao limpar dados:', error)
    }
  }

  private redirectToRoute(route: string): void {
    try {
      console.log('🚀 [TOKEN-VALIDATION] Redirecionando para:', route)
      
      // BREAKPOINT 5: Antes de executar redirecionamento
      debugger;
      console.log('🔄 [TOKEN-VALIDATION] BREAKPOINT 5: Executando window.location.href...')
      
      // Usar window.location.href para redirecionamento direto
      window.location.href = route
      console.log('✅ [TOKEN-VALIDATION] Redirecionamento executado')
    } catch (error) {
      console.error('❌ [TOKEN-VALIDATION] Erro no redirecionamento:', error)
      
      // Fallback: tentar recarregar a página
      try {
        window.location.reload()
      } catch (fallbackError) {
        console.error('💥 [TOKEN-VALIDATION] Erro no fallback:', fallbackError)
      }
    }
  }
}
