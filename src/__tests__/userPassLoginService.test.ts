import { UserPassLoginService, UserPassLoginData, UserPassLoginResponse } from '@/services/userPassLoginService'
import { AuthService } from '@/services/authService'
import { useAuthStore } from '@/stores/authStore'

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

// Mock do AuthService
jest.mock('@/services/authService', () => ({
  AuthService: jest.fn().mockImplementation(() => ({
    login: jest.fn()
  }))
}))

// Mock do useAuthStore
jest.mock('@/stores/authStore', () => ({
  useAuthStore: {
    getState: jest.fn()
  }
}))

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

describe('UserPassLoginService', () => {
  let service: UserPassLoginService
  let mockAuthService: jest.Mocked<AuthService>
  let mockAuthStore: any

  beforeEach(() => {
    jest.clearAllMocks()
    service = new UserPassLoginService()
    mockAuthService = new AuthService() as jest.Mocked<AuthService>

    // Resetar mocks
    mockLocalStorage.getItem.mockClear()
    mockLocalStorage.setItem.mockClear()
    mockLocalStorage.removeItem.mockClear()
    mockLocalStorage.clear.mockClear()
    mockLocation.href = ''
    mockLocation.reload.mockClear()

    // Mock do authStore
    mockAuthStore = {
      login: jest.fn()
    }
    ;(useAuthStore.getState as jest.Mock).mockReturnValue(mockAuthStore)
  })

  describe('logout', () => {
    it('deve remover todos os itens de autenticação do localStorage', () => {
      service.logout()

      const expectedKeys = [
        'auth-token', 'auth-refresh-token', 'auth-username', 'auth-email', 'auth-roles'
      ]

      expectedKeys.forEach(key => {
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(key)
      })
      expect(mockLocalStorage.removeItem).toHaveBeenCalledTimes(expectedKeys.length)
    })

    it('deve lidar com erro durante o logout', () => {
      mockLocalStorage.removeItem.mockImplementationOnce(() => {
        throw new Error('Erro de remoção')
      })

      service.logout()

      // Deve continuar executando mesmo com erro
      expect(mockLocalStorage.removeItem).toHaveBeenCalled()
    })
  })

  describe('login', () => {
    const loginData: UserPassLoginData = {
      username: 'testuser',
      password: 'password123'
    }

    const mockResponse: UserPassLoginResponse = {
      accessToken: 'token123',
      refreshToken: 'refresh123',
      tokenType: 'Bearer',
      expiresIn: 3600,
      scope: 'read write',
      username: 'testuser',
      email: 'test@example.com',
      roles: ['user'],
      applicationUserId: 'user-123'
    }

    it('deve fazer login com sucesso', async () => {
      mockAuthService.login.mockResolvedValue({ success: true, data: mockResponse })

      const result = await service.login(loginData)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResponse)
      expect(mockAuthService.login).toHaveBeenCalledWith(loginData)
      expect(mockAuthStore.login).toHaveBeenCalledWith(
        {
          id: 'user-123',
          username: 'testuser',
          email: 'test@example.com',
          roles: ['user'],
          provider: 'userpass'
        },
        'token123',
        'refresh123'
      )
    })

    it('deve usar username como fallback para id quando applicationUserId não estiver disponível', async () => {
      const responseWithoutAppId = { ...mockResponse, applicationUserId: null }
      mockAuthService.login.mockResolvedValue({ success: true, data: responseWithoutAppId })

      const result = await service.login(loginData)

      expect(result.success).toBe(true)
      expect(mockAuthStore.login).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'testuser' // Deve usar username como fallback
        }),
        'token123',
        'refresh123'
      )
    })

    it('deve retornar erro quando authService.login falha', async () => {
      mockAuthService.login.mockResolvedValue({ success: false, error: 'Credenciais inválidas' })

      const result = await service.login(loginData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Credenciais inválidas')
      expect(mockAuthStore.login).not.toHaveBeenCalled()
    })

    it('deve retornar erro genérico quando não há mensagem de erro', async () => {
      mockAuthService.login.mockResolvedValue({ success: false })

      const result = await service.login(loginData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Erro ao fazer login')
      expect(mockAuthStore.login).not.toHaveBeenCalled()
    })

    it('deve lidar com exceção durante o login', async () => {
      mockAuthService.login.mockRejectedValue(new Error('Network error'))

      const result = await service.login(loginData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Erro interno durante o login')
      expect(mockAuthStore.login).not.toHaveBeenCalled()
    })

    it('deve lidar com resposta sem dados', async () => {
      mockAuthService.login.mockResolvedValue({ success: true })

      const result = await service.login(loginData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Erro ao fazer login')
      expect(mockAuthStore.login).not.toHaveBeenCalled()
    })
  })

  describe('saveUserData (private method)', () => {
    const mockUserData: UserPassLoginResponse = {
      accessToken: 'token123',
      refreshToken: 'refresh123',
      tokenType: 'Bearer',
      expiresIn: 3600,
      scope: 'read write',
      username: 'testuser',
      email: 'test@example.com',
      roles: ['user', 'admin'],
      applicationUserId: 'user-123'
    }

    it('deve salvar todos os dados do usuário no localStorage', () => {
      const serviceAny = service as any
      serviceAny.saveUserData(mockUserData)

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth-token', 'token123')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth-refresh-token', 'refresh123')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth-username', 'testuser')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth-email', 'test@example.com')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth-roles', '["user","admin"]')
    })

    it('deve lidar com dados parciais', () => {
      const partialUserData: UserPassLoginResponse = {
        accessToken: 'token456',
        refreshToken: '',
        tokenType: 'Bearer',
        expiresIn: 3600,
        scope: 'read',
        username: 'testuser2',
        email: '',
        roles: [],
        applicationUserId: 'user-456'
      }

      const serviceAny = service as any
      serviceAny.saveUserData(partialUserData)

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth-token', 'token456')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth-username', 'testuser2')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth-roles', '[]')
    })

    it('deve lidar com erro durante salvamento', () => {
      mockLocalStorage.setItem.mockImplementationOnce(() => {
        throw new Error('Erro de salvamento')
      })

      const serviceAny = service as any
      serviceAny.saveUserData(mockUserData)

      // Deve continuar executando mesmo com erro
      expect(mockLocalStorage.setItem).toHaveBeenCalled()
    })
  })

  describe('redirectToPlayground (private method)', () => {
    it('deve redirecionar para playground', () => {
      const serviceAny = service as any
      serviceAny.redirectToPlayground()

      expect(mockLocation.href).toBe('/playground')
    })

    it('deve tentar reload em caso de erro', () => {
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
      serviceAny.redirectToPlayground()

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
      serviceAny.redirectToPlayground()

      expect(mockLocation.reload).toHaveBeenCalled()

      // Restaurar o mock original
      Object.defineProperty(window, 'location', { value: originalLocation, configurable: true })
    })
  })

  describe('constructor', () => {
    it('deve criar instância do AuthService', () => {
      expect(AuthService).toHaveBeenCalled()
    })
  })
})