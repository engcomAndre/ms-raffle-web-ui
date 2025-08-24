import { UserPassLoginService } from '@/services/userPassLoginService'
import { GoogleLoginService } from '@/services/googleLoginService'

export const useLogout = () => {
  const logout = () => {
    try {
      console.log('🚪 [LOGOUT-HOOK] Iniciando logout...')
      
      // Determinar qual serviço usar baseado no provider
      const provider = localStorage.getItem('auth-provider')
      
      if (provider === 'google') {
        // Logout do Google
        console.log('🔄 [LOGOUT-HOOK] Usando GoogleLoginService para logout')
        const googleService = new GoogleLoginService()
        googleService.logout()
      } else {
        // Logout com usuário e senha
        console.log('🔄 [LOGOUT-HOOK] Usando UserPassLoginService para logout')
        const userPassService = new UserPassLoginService()
        userPassService.logout()
      }
      
      // Redirecionar para welcome
      console.log('🔄 [LOGOUT-HOOK] Redirecionando para /welcome...')
      window.location.href = '/welcome'
      
    } catch (error) {
      console.error('❌ [LOGOUT-HOOK] Erro durante logout:', error)
      // Em caso de erro, tentar logout básico
      console.log('🔄 [LOGOUT-HOOK] Usando logout básico...')
      localStorage.clear()
      window.location.href = '/welcome'
    }
  }

  return { logout }
}
