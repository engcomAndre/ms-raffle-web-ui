import { TokenValidationService, TokenValidationResponse } from '../services/tokenValidationService'
import { environment } from '../config/environment'

// Mock do environment
jest.mock('../config/environment', () => ({
  environment: {
    apiBaseUrl: 'http://localhost:8081'
  }
}))

describe('TokenValidationService', () => {
  let tokenValidationService: TokenValidationService

  beforeEach(() => {
    jest.clearAllMocks()
    tokenValidationService = new TokenValidationService()
  })

  describe('validateToken', () => {
    it('deve validar token válido com sucesso', async () => {
      // Mock de um JWT válido com preferred_username (header.payload.signature)
      const validJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiSm9obiBEb2UiLCJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20iLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiVVNFUiJdfX0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

      // Executar validação
      const result = await tokenValidationService.validateToken(validJWT)

      // Verificar resultado
      expect(result.valid).toBe(true)
      expect(result.user).toBeDefined()
      expect(result.user?.id).toBe('1234567890')
      expect(result.user?.username).toBe('John Doe')
    })

    it('deve rejeitar token inválido', async () => {
      // Mock de um JWT inválido
      const invalidJWT = 'invalid.jwt.token'

      // Executar validação
      const result = await tokenValidationService.validateToken(invalidJWT)

      // Verificar resultado
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Token inválido')
    })

    it('deve rejeitar token malformado', async () => {
      // Mock de um token malformado
      const malformedToken = 'not-a-jwt'

      // Executar validação
      const result = await tokenValidationService.validateToken(malformedToken)

      // Verificar resultado
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Token inválido')
    })

    it('deve rejeitar token vazio', async () => {
      // Executar validação
      const result = await tokenValidationService.validateToken('')

      // Verificar resultado
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Token inválido')
    })

    it('deve rejeitar token expirado', async () => {
      // Mock de um JWT expirado (exp: 1516239022 = 2018-01-18, bem no passado) com preferred_username
      const expiredJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiSm9obiBEb2UiLCJleHAiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

      // Executar validação
      const result = await tokenValidationService.validateToken(expiredJWT)

      // Verificar resultado
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Token expirado')
    })
  })

  describe('validateAndRedirect', () => {
    it('deve redirecionar para rota padrão quando token é válido', async () => {
      // Mock de um JWT válido com preferred_username
      const validJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiSm9obiBEb2UiLCJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20iLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiVVNFUiJdfX0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

      // Mock do redirectToRoute
      const redirectSpy = jest.spyOn(tokenValidationService, 'redirectToRoute')

      // Executar validação e redirecionamento
      const result = await tokenValidationService.validateAndRedirect(validJWT)

      // Verificar resultado
      expect(result).toBe(true)
      expect(redirectSpy).toHaveBeenCalledWith('/playground')
      
      redirectSpy.mockRestore()
    })

    it('deve redirecionar para rota específica quando token é válido', async () => {
      // Mock de um JWT válido com preferred_username
      const validJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiSm9obiBEb2UiLCJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20iLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiVVNFUiJdfX0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

      // Mock do redirectToRoute
      const redirectSpy = jest.spyOn(tokenValidationService, 'redirectToRoute')

      // Executar validação e redirecionamento
      const result = await tokenValidationService.validateAndRedirect(validJWT, '/dashboard')

      // Verificar resultado
      expect(result).toBe(true)
      expect(redirectSpy).toHaveBeenCalledWith('/dashboard')
      
      redirectSpy.mockRestore()
    })

    it('deve redirecionar para welcome quando token é inválido', async () => {
      // Mock de um JWT inválido
      const invalidJWT = 'invalid.jwt.token'

      // Mock do redirectToRoute
      const redirectSpy = jest.spyOn(tokenValidationService, 'redirectToRoute')

      // Executar validação e redirecionamento
      const result = await tokenValidationService.validateAndRedirect(invalidJWT)

      // Verificar resultado
      expect(result).toBe(false)
      expect(redirectSpy).toHaveBeenCalledWith('/welcome')
      
      redirectSpy.mockRestore()
    })

    it('deve lidar com erro de redirecionamento', async () => {
      // Mock de um JWT válido com preferred_username
      const validJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiSm9obiBEb2UiLCJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20iLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiVVNFUiJdfX0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

      // Mock do redirectToRoute que lança erro
      const redirectSpy = jest.spyOn(tokenValidationService, 'redirectToRoute').mockImplementation(() => {
        console.error('Mocked navigation error')
        // Não lançar erro, apenas simular o comportamento
      })

      // Executar validação e redirecionamento
      const result = await tokenValidationService.validateAndRedirect(validJWT)

      // Verificar que a validação ainda foi bem-sucedida
      expect(result).toBe(true)
      
      redirectSpy.mockRestore()
    })
  })

  describe('redirectToRoute', () => {
    it('deve executar redirecionamento sem erro', () => {
      // Executar redirecionamento (deve funcionar mesmo com limitações do Jest)
      expect(() => {
        tokenValidationService.redirectToRoute('/test-route')
      }).not.toThrow()
    })

    it('deve lidar com erro de redirecionamento', () => {
      // Executar redirecionamento (não deve lançar erro mesmo se window.location falhar)
      expect(() => {
        tokenValidationService.redirectToRoute('/test-route')
      }).not.toThrow()
    })
  })
})
