import { TokenValidationService } from '@/services/tokenValidationService'
import { environment } from '@/config/environment'

// Mock do localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

// Mock do window.location
const mockLocation = {
  href: '',
  reload: jest.fn()
}

// Mock window.location de forma mais segura
delete (window as any).location
window.location = mockLocation as any

// Mock do atob para decodificar JWT
const mockAtob = jest.fn()
Object.defineProperty(window, 'atob', {
  value: mockAtob,
  writable: true
})

// Mock do console para reduzir output nos testes
const originalConsoleLog = console.log
const originalConsoleError = console.error
beforeAll(() => {
  console.log = jest.fn()
  console.error = jest.fn()
})

afterAll(() => {
  console.log = originalConsoleLog
  console.error = originalConsoleError
})

describe('TokenValidationService', () => {
  let service: TokenValidationService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new TokenValidationService()

    // Resetar mocks de localStorage e location
    mockLocalStorage.getItem.mockClear()
    mockLocalStorage.setItem.mockClear()
    mockLocalStorage.removeItem.mockClear()
    mockLocalStorage.clear.mockClear()
    mockLocation.href = ''
    mockLocation.reload.mockClear()

    // Mock padrão para atob
    mockAtob.mockImplementation((b64: string) => Buffer.from(b64, 'base64').toString('binary'))

    // Mock padrão para environment.apiBaseUrl
    environment.apiBaseUrl = 'http://localhost:8080'
  })

  // Helper para criar JWTs
  const createJwt = (payload: any, header: any = { alg: 'HS256', typ: 'JWT' }) => {
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url')
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url')
    return `${encodedHeader}.${encodedPayload}.signature`
  }

  describe('validateToken', () => {
    it('deve validar token válido com sucesso', async () => {
      const validToken = createJwt({
        sub: 'user-123',
        preferred_username: 'testuser',
        email: 'test@example.com',
        realm_access: { roles: ['user'] },
        exp: Math.floor(Date.now() / 1000) + 3600 // 1 hora no futuro
      })

      const result = await service.validateToken(validToken)

      expect(result.valid).toBe(true)
      expect(result.user).toEqual({
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['user']
      })
    })

    it('deve rejeitar token expirado', async () => {
      const expiredToken = createJwt({
        sub: 'user-123',
        preferred_username: 'testuser',
        exp: Math.floor(Date.now() / 1000) - 3600 // 1 hora no passado
      })

      const result = await service.validateToken(expiredToken)

      expect(result.valid).toBe(false)
      expect(result.error).toBe('Token inválido ou expirado')
      expect(result.user).toBeUndefined()
    })

    it('deve rejeitar token sem campos obrigatórios', async () => {
      const invalidToken = createJwt({
        exp: Math.floor(Date.now() / 1000) + 3600 // Válido, mas sem sub/preferred_username
      })

      const result = await service.validateToken(invalidToken)

      expect(result.valid).toBe(false)
      expect(result.error).toBe('Token inválido ou expirado')
    })

    it('deve rejeitar token malformado', async () => {
      const malformedToken = 'header.invalid-payload.signature'
      mockAtob.mockImplementationOnce(() => { throw new Error('Invalid base64') })

      const result = await service.validateToken(malformedToken)

      expect(result.valid).toBe(false)
      expect(result.error).toBe('Erro ao validar token')
    })

    it('deve lidar com token sem exp', async () => {
      const tokenWithoutExp = createJwt({
        sub: 'user-123',
        preferred_username: 'testuser',
        email: 'test@example.com',
        realm_access: { roles: ['user'] }
      })

      const result = await service.validateToken(tokenWithoutExp)

      expect(result.valid).toBe(true)
      expect(result.user).toBeDefined()
    })

    it('deve lidar com token sem realm_access', async () => {
      const tokenWithoutRoles = createJwt({
        sub: 'user-123',
        preferred_username: 'testuser',
        email: 'test@example.com',
        exp: Math.floor(Date.now() / 1000) + 3600
      })

      const result = await service.validateToken(tokenWithoutRoles)

      expect(result.valid).toBe(true)
      expect(result.user?.roles).toEqual([])
    })

    it('deve usar user_id como fallback para id', async () => {
      const tokenWithUserId = createJwt({
        user_id: 'user-456', // Usando user_id em vez de sub
        preferred_username: 'testuser',
        email: 'test@example.com',
        exp: Math.floor(Date.now() / 1000) + 3600
      })

      const result = await service.validateToken(tokenWithUserId)

      expect(result.valid).toBe(true)
      expect(result.user?.id).toBe('user-456')
    })

    it('deve usar username como fallback para preferred_username', async () => {
      const tokenWithUsername = createJwt({
        sub: 'user-123',
        username: 'testuser', // Usando username em vez de preferred_username
        email: 'test@example.com',
        exp: Math.floor(Date.now() / 1000) + 3600
      })

      const result = await service.validateToken(tokenWithUsername)

      expect(result.valid).toBe(true)
      expect(result.user?.username).toBe('testuser')
    })

    it('deve lidar com erro durante validação', async () => {
      const invalidToken = 'invalid-token'
      mockAtob.mockImplementationOnce(() => { throw new Error('Invalid token') })

      const result = await service.validateToken(invalidToken)

      expect(result.valid).toBe(false)
      expect(result.error).toBe('Erro ao validar token')
    })
  })

  describe('validateAndRedirect', () => {
    const validToken = createJwt({
      sub: 'user-123',
      preferred_username: 'testuser',
      email: 'test@example.com',
      realm_access: { roles: ['user'] },
      exp: Math.floor(Date.now() / 1000) + 3600
    })

    it('deve validar token e redirecionar com sucesso', async () => {
      const result = await service.validateAndRedirect(validToken, '/dashboard')

      expect(result).toBe(true)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth-user-id', 'user-123')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth-user-username', 'testuser')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth-user-email', 'test@example.com')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth-user-roles', '["user"]')
      expect(mockLocation.href).toBe('/dashboard')
    })

    it('deve usar rota padrão quando não especificada', async () => {
      await service.validateAndRedirect(validToken)

      expect(mockLocation.href).toBe('/playground')
    })

    it('deve limpar dados e redirecionar para welcome quando token inválido', async () => {
      const invalidToken = 'invalid-token'
      mockAtob.mockImplementationOnce(() => { throw new Error('Invalid token') })

      const result = await service.validateAndRedirect(invalidToken)

      expect(result).toBe(false)
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth-token')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth-refresh-token')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth-username')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth-email')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth-roles')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth-user-id')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth-user-username')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth-user-email')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth-user-roles')
      expect(mockLocation.href).toBe('/welcome')
    })

    it('deve lidar com erro durante validação', async () => {
      const invalidToken = 'invalid-token'
      mockAtob.mockImplementationOnce(() => { throw new Error('Invalid token') })

      const result = await service.validateAndRedirect(invalidToken)

      expect(result).toBe(false)
      expect(mockLocation.href).toBe('/welcome')
    })
  })

  describe('clearInvalidAuthData', () => {
    it('deve remover todos os itens de autenticação do localStorage', () => {
      // Acessar método privado através de any
      const serviceAny = service as any
      serviceAny.clearInvalidAuthData()

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth-token')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth-refresh-token')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth-username')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth-email')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth-roles')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth-user-id')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth-user-username')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth-user-email')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth-user-roles')
    })

    it('deve lidar com erro durante limpeza', () => {
      mockLocalStorage.removeItem.mockImplementationOnce(() => {
        throw new Error('Erro de remoção')
      })

      const serviceAny = service as any
      serviceAny.clearInvalidAuthData()

      // Deve continuar executando mesmo com erro
      expect(mockLocalStorage.removeItem).toHaveBeenCalled()
    })
  })

  describe('redirectToRoute', () => {
    it('deve redirecionar para rota especificada', () => {
      const serviceAny = service as any
      serviceAny.redirectToRoute('/test-route')

      expect(mockLocation.href).toBe('/test-route')
    })

    it('deve tentar recarregar página em caso de erro', () => {
      // Mock do window.location.href para simular erro
      const originalLocation = window.location
      Object.defineProperty(window, 'location', {
        value: {
          ...mockLocation,
          get href() { throw new Error('Erro de redirecionamento') },
          set href(value: string) { mockLocation.href = value }
        },
        configurable: true
      })

      const serviceAny = service as any
      serviceAny.redirectToRoute('/error-route')

      expect(mockLocation.reload).toHaveBeenCalled()

      // Restaurar o mock original
      Object.defineProperty(window, 'location', { value: originalLocation, configurable: true })
    })

    it('deve lidar com erro no fallback de reload', () => {
      const originalLocation = window.location
      Object.defineProperty(window, 'location', {
        value: {
          ...mockLocation,
          get href() { throw new Error('Erro de redirecionamento') },
          set href(value: string) { throw new Error('Erro de redirecionamento') },
          reload: jest.fn().mockImplementation(() => { throw new Error('Erro no reload') })
        },
        configurable: true
      })

      const serviceAny = service as any
      serviceAny.redirectToRoute('/error-route')

      expect(mockLocation.reload).toHaveBeenCalled()

      // Restaurar o mock original
      Object.defineProperty(window, 'location', { value: originalLocation, configurable: true })
    })
  })
})