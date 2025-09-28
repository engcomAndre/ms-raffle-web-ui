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
      // Mock de um JWT válido (header.payload.signature)
      const validJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

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
      // Mock de um JWT expirado (exp: 0 = 1 Jan 1970)
      const expiredJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjB9.invalid'

      // Executar validação
      const result = await tokenValidationService.validateToken(expiredJWT)

      // Verificar resultado
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Token expirado')
    })
  })

  describe('validateAndRedirect', () => {
    it('deve redirecionar para rota padrão quando token é válido', async () => {
      // Mock de um JWT válido
      const validJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

      // Mock do window.location
      delete (window as any).location
      window.location = { href: '' } as any

      // Executar validação e redirecionamento
      const result = await tokenValidationService.validateAndRedirect(validJWT)

      // Verificar resultado
      expect(result).toBe(true)
      expect(window.location.href).toBe('/playground')
    })

    it('deve redirecionar para rota específica quando token é válido', async () => {
      // Mock de um JWT válido
      const validJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

      // Mock do window.location
      delete (window as any).location
      window.location = { href: '' } as any

      // Executar validação e redirecionamento
      const result = await tokenValidationService.validateAndRedirect(validJWT, '/dashboard')

      // Verificar resultado
      expect(result).toBe(true)
      expect(window.location.href).toBe('/dashboard')
    })

    it('deve redirecionar para welcome quando token é inválido', async () => {
      // Mock de um JWT inválido
      const invalidJWT = 'invalid.jwt.token'

      // Mock do window.location
      delete (window as any).location
      window.location = { href: '' } as any

      // Executar validação e redirecionamento
      const result = await tokenValidationService.validateAndRedirect(invalidJWT)

      // Verificar resultado
      expect(result).toBe(false)
      expect(window.location.href).toBe('/welcome')
    })

    it('deve lidar com erro de redirecionamento', async () => {
      // Mock de um JWT válido
      const validJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

      // Mock do window.location que lança erro
      delete (window as any).location
      window.location = {
        get href() { return '' },
        set href(value) { throw new Error('Navigation error') }
      } as any

      // Executar validação e redirecionamento
      const result = await tokenValidationService.validateAndRedirect(validJWT)

      // Verificar que a validação ainda foi bem-sucedida
      expect(result).toBe(true)
    })
  })

  describe('redirectToRoute', () => {
    it('deve redirecionar para rota especificada', () => {
      // Mock do window.location
      delete (window as any).location
      window.location = { href: '' } as any

      // Executar redirecionamento
      tokenValidationService.redirectToRoute('/test-route')

      // Verificar redirecionamento
      expect(window.location.href).toBe('/test-route')
    })

    it('deve lidar com erro de redirecionamento', () => {
      // Mock do window.location que lança erro
      delete (window as any).location
      window.location = {
        get href() { return '' },
        set href(value) { throw new Error('Navigation error') }
      } as any

      // Executar redirecionamento (não deve lançar erro)
      expect(() => {
        tokenValidationService.redirectToRoute('/test-route')
      }).not.toThrow()
    })
  })
})
