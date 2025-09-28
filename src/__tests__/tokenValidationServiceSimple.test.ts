import { TokenValidationService } from '../services/tokenValidationService'

// Mock do environment
jest.mock('../config/environment', () => ({
  environment: {
    apiBaseUrl: 'http://localhost:8081'
  }
}))

describe('TokenValidationService - Simple Tests', () => {
  let tokenValidationService: TokenValidationService

  beforeEach(() => {
    jest.clearAllMocks()
    tokenValidationService = new TokenValidationService()
  })

  describe('validateToken', () => {
    it('deve validar token sem erro', async () => {
      // Mock de um JWT válido
      const validJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

      // Executar validação
      const result = await tokenValidationService.validateToken(validJWT)

      // Verificar resultado
      expect(result).toBeDefined()
      expect(typeof result.valid).toBe('boolean')
    })

    it('deve rejeitar token inválido', async () => {
      // Mock de um JWT inválido
      const invalidJWT = 'invalid.jwt.token'

      // Executar validação
      const result = await tokenValidationService.validateToken(invalidJWT)

      // Verificar resultado
      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('deve rejeitar token vazio', async () => {
      // Executar validação
      const result = await tokenValidationService.validateToken('')

      // Verificar resultado
      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('validateAndRedirect', () => {
    it('deve executar validação e redirecionamento sem erro', async () => {
      // Mock de um JWT válido
      const validJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

      // Executar validação e redirecionamento
      const result = await tokenValidationService.validateAndRedirect(validJWT)

      // Verificar resultado
      expect(typeof result).toBe('boolean')
    })

    it('deve lidar com token inválido', async () => {
      // Mock de um JWT inválido
      const invalidJWT = 'invalid.jwt.token'

      // Executar validação e redirecionamento
      const result = await tokenValidationService.validateAndRedirect(invalidJWT)

      // Verificar resultado
      expect(result).toBe(false)
    })
  })

  describe('redirectToRoute', () => {
    it('deve executar redirecionamento sem erro', () => {
      // Executar redirecionamento
      expect(() => {
        tokenValidationService.redirectToRoute('/test-route')
      }).not.toThrow()
    })
  })
})
