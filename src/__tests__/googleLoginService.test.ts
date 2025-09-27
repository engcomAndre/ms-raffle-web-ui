import { GoogleLoginService, GoogleUserData } from '@/services/googleLoginService'
import { useAuthStore } from '@/stores/authStore'
import { authService } from '@/services/authService'

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

// Mock do useAuthStore
jest.mock('@/stores/authStore', () => ({
  useAuthStore: {
    getState: jest.fn()
  }
}))

// Mock do authService
jest.mock('@/services/authService', () => ({
  authService: {
    registerExternalUser: jest.fn()
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

describe('GoogleLoginService', () => {
  let service: GoogleLoginService
  let mockAuthStore: any

  beforeEach(() => {
    jest.clearAllMocks()
    service = new GoogleLoginService()

    // Resetar mocks
    mockLocalStorage.getItem.mockClear()
    mockLocalStorage.setItem.mockClear()
    mockLocalStorage.removeItem.mockClear()
    mockLocalStorage.clear.mockClear()
    mockLocation.href = ''
    mockLocation.reload.mockClear()

    // Mock padrão para atob
    mockAtob.mockImplementation((b64: string) => Buffer.from(b64, 'base64').toString('binary'))

    // Mock do authStore
    mockAuthStore = {
      loginGoogle: jest.fn()
    }
    ;(useAuthStore.getState as jest.Mock).mockReturnValue(mockAuthStore)
  })

  // Helper para criar JWTs do Google
  const createGoogleJWT = (payload: any) => {
    const header = { alg: 'RS256', typ: 'JWT' }
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url')
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url')
    return `${encodedHeader}.${encodedPayload}.signature`
  }

  describe('logout', () => {
    it('deve remover todos os itens de autenticação do localStorage', () => {
      service.logout()

      const expectedKeys = [
        'auth-token', 'auth-refresh-token', 'auth-username', 'auth-email', 'auth-roles',
        'auth-provider', 'google-user-id', 'google-user-name', 'google-user-email', 'google-user-picture'
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

  describe('handleGoogleLogin', () => {
    const validGoogleJWT = createGoogleJWT({
      sub: 'google-user-123',
      name: 'João Silva',
      email: 'joao@example.com',
      picture: 'https://example.com/photo.jpg'
    })

    it('deve fazer login com credencial válida do Google', async () => {
      ;(authService.registerExternalUser as jest.Mock).mockResolvedValue({
        success: true,
        data: { id: 'backend-user-123', isNewUser: true }
      })

      const result = await service.handleGoogleLogin(validGoogleJWT)

      expect(result.success).toBe(true)
      expect(result.data).toEqual({
        id: 'google-user-123',
        name: 'João Silva',
        email: 'joao@example.com',
        picture: 'https://example.com/photo.jpg',
        provider: 'google'
      })
      expect(mockAuthStore.loginGoogle).toHaveBeenCalled()
    })

    it('deve lidar com erro ao decodificar credencial', async () => {
      const invalidJWT = 'invalid.jwt.token'
      mockAtob.mockImplementationOnce(() => { throw new Error('Invalid base64') })

      const result = await service.handleGoogleLogin(invalidJWT)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Erro ao decodificar credencial do Google')
    })

    it('deve lidar com erro durante o processo de login', async () => {
      mockAtob.mockImplementationOnce(() => { throw new Error('Decode error') })

      const result = await service.handleGoogleLogin('invalid-token')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Erro interno durante o login com Google')
    })

    it('deve usar user_id como fallback para sub', async () => {
      const jwtWithUserId = createGoogleJWT({
        user_id: 'google-user-456',
        name: 'Maria Santos',
        email: 'maria@example.com'
      })

      ;(authService.registerExternalUser as jest.Mock).mockResolvedValue({
        success: true,
        data: { id: 'backend-user-456', isNewUser: false }
      })

      const result = await service.handleGoogleLogin(jwtWithUserId)

      expect(result.success).toBe(true)
      expect(result.data?.id).toBe('google-user-456')
    })

    it('deve construir nome completo quando não há campo name', async () => {
      const jwtWithNameParts = createGoogleJWT({
        sub: 'google-user-789',
        given_name: 'Carlos',
        family_name: 'Oliveira',
        email: 'carlos@example.com'
      })

      ;(authService.registerExternalUser as jest.Mock).mockResolvedValue({
        success: true,
        data: { id: 'backend-user-789', isNewUser: true }
      })

      const result = await service.handleGoogleLogin(jwtWithNameParts)

      expect(result.success).toBe(true)
      expect(result.data?.name).toBe('Carlos Oliveira')
    })

    it('deve lidar com nome vazio', async () => {
      const jwtWithEmptyName = createGoogleJWT({
        sub: 'google-user-999',
        email: 'empty@example.com'
      })

      ;(authService.registerExternalUser as jest.Mock).mockResolvedValue({
        success: true,
        data: { id: 'backend-user-999', isNewUser: true }
      })

      const result = await service.handleGoogleLogin(jwtWithEmptyName)

      expect(result.success).toBe(true)
      expect(result.data?.name).toBe(' ')
    })
  })

  describe('registerGoogleUser (private method)', () => {
    const mockUserData: GoogleUserData = {
      id: 'google-user-123',
      name: 'João Silva Santos',
      email: 'joao@example.com',
      picture: 'https://example.com/photo.jpg',
      provider: 'google'
    }

    it('deve cadastrar usuário no backend com sucesso', async () => {
      ;(authService.registerExternalUser as jest.Mock).mockResolvedValue({
        success: true,
        data: { id: 'backend-user-123', isNewUser: true }
      })

      // Acessar método privado através de any
      const serviceAny = service as any
      await serviceAny.registerGoogleUser(mockUserData)

      expect(authService.registerExternalUser).toHaveBeenCalledWith({
        email: 'joao@example.com',
        firstName: 'João',
        lastName: 'Silva Santos',
        authProvider: 'google'
      })
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('backend-user-id', 'backend-user-123')
    })

    it('deve lidar com usuário já existente', async () => {
      ;(authService.registerExternalUser as jest.Mock).mockResolvedValue({
        success: true,
        data: { id: 'backend-user-123', isNewUser: false }
      })

      const serviceAny = service as any
      await serviceAny.registerGoogleUser(mockUserData)

      expect(authService.registerExternalUser).toHaveBeenCalled()
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('backend-user-id', 'backend-user-123')
    })

    it('deve lidar com erro no backend', async () => {
      ;(authService.registerExternalUser as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Erro no backend'
      })

      const serviceAny = service as any
      await serviceAny.registerGoogleUser(mockUserData)

      expect(authService.registerExternalUser).toHaveBeenCalled()
      expect(mockLocalStorage.setItem).not.toHaveBeenCalledWith('backend-user-id', expect.any(String))
    })

    it('deve lidar com exceção durante cadastro', async () => {
      ;(authService.registerExternalUser as jest.Mock).mockRejectedValue(new Error('Network error'))

      const serviceAny = service as any
      await serviceAny.registerGoogleUser(mockUserData)

      expect(authService.registerExternalUser).toHaveBeenCalled()
    })

    it('deve separar nome corretamente em firstName e lastName', async () => {
      const userDataWithSingleName: GoogleUserData = {
        ...mockUserData,
        name: 'João'
      }

      ;(authService.registerExternalUser as jest.Mock).mockResolvedValue({
        success: true,
        data: { id: 'backend-user-123', isNewUser: true }
      })

      const serviceAny = service as any
      await serviceAny.registerGoogleUser(userDataWithSingleName)

      expect(authService.registerExternalUser).toHaveBeenCalledWith({
        email: 'joao@example.com',
        firstName: 'João',
        lastName: 'João', // Deve usar firstName como lastName quando só há um nome
        authProvider: 'google'
      })
    })
  })

  describe('decodeGoogleCredential (private method)', () => {
    it('deve decodificar JWT do Google corretamente', () => {
      const googleJWT = createGoogleJWT({
        sub: 'google-user-123',
        name: 'João Silva',
        email: 'joao@example.com',
        picture: 'https://example.com/photo.jpg'
      })

      const serviceAny = service as any
      const result = serviceAny.decodeGoogleCredential(googleJWT)

      expect(result).toEqual({
        id: 'google-user-123',
        name: 'João Silva',
        email: 'joao@example.com',
        picture: 'https://example.com/photo.jpg',
        provider: 'google'
      })
    })

    it('deve usar user_id como fallback para sub', () => {
      const googleJWT = createGoogleJWT({
        user_id: 'google-user-456',
        name: 'Maria Santos',
        email: 'maria@example.com'
      })

      const serviceAny = service as any
      const result = serviceAny.decodeGoogleCredential(googleJWT)

      expect(result?.id).toBe('google-user-456')
    })

    it('deve construir nome quando não há campo name', () => {
      const googleJWT = createGoogleJWT({
        sub: 'google-user-789',
        given_name: 'Carlos',
        family_name: 'Oliveira',
        email: 'carlos@example.com'
      })

      const serviceAny = service as any
      const result = serviceAny.decodeGoogleCredential(googleJWT)

      expect(result?.name).toBe('Carlos Oliveira')
    })

    it('deve retornar null para JWT inválido', () => {
      mockAtob.mockImplementationOnce(() => { throw new Error('Invalid base64') })

      const serviceAny = service as any
      const result = serviceAny.decodeGoogleCredential('invalid.jwt.token')

      expect(result).toBeNull()
    })
  })

  describe('saveGoogleUserData (private method)', () => {
    const mockUserData: GoogleUserData = {
      id: 'google-user-123',
      name: 'João Silva',
      email: 'joao@example.com',
      picture: 'https://example.com/photo.jpg',
      provider: 'google'
    }

    it('deve salvar todos os dados do usuário Google', () => {
      const serviceAny = service as any
      serviceAny.saveGoogleUserData(mockUserData)

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('google-user-id', 'google-user-123')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('google-user-name', 'João Silva')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth-username', 'João Silva')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('google-user-email', 'joao@example.com')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth-email', 'joao@example.com')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('google-user-picture', 'https://example.com/photo.jpg')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth-provider', 'google')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth-roles', '["user"]')
    })

    it('deve lidar com dados parciais', () => {
      const partialUserData: GoogleUserData = {
        id: 'google-user-456',
        name: 'Maria Santos',
        email: 'maria@example.com',
        provider: 'google'
        // Sem picture
      }

      const serviceAny = service as any
      serviceAny.saveGoogleUserData(partialUserData)

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('google-user-id', 'google-user-456')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('google-user-name', 'Maria Santos')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('google-user-email', 'maria@example.com')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth-provider', 'google')
    })

    it('deve lidar com erro durante salvamento', () => {
      mockLocalStorage.setItem.mockImplementationOnce(() => {
        throw new Error('Erro de salvamento')
      })

      const serviceAny = service as any
      serviceAny.saveGoogleUserData(mockUserData)

      // Deve continuar executando mesmo com erro
      expect(mockLocalStorage.setItem).toHaveBeenCalled()
    })
  })

  describe('saveAuthToken (private method)', () => {
    it('deve salvar token de autenticação', () => {
      const serviceAny = service as any
      serviceAny.saveAuthToken()

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth-token', expect.stringMatching(/^google_\d+_[a-z0-9]+$/))
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth-refresh-token', expect.stringMatching(/^refresh_google_\d+_[a-z0-9]+$/))
    })

    it('deve lidar com erro durante salvamento do token', () => {
      mockLocalStorage.setItem.mockImplementationOnce(() => {
        throw new Error('Erro de salvamento')
      })

      const serviceAny = service as any
      serviceAny.saveAuthToken()

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
})