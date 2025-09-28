import { GoogleLoginService, GoogleUserData, GoogleLoginResponse } from '../services/googleLoginService'

// Mock das dependências
jest.mock('../services/authService', () => ({
  authService: {
    loginGoogle: jest.fn()
  }
}))

jest.mock('../stores/authStore', () => ({
  useAuthStore: {
    getState: jest.fn()
  }
}))

describe('GoogleLoginService', () => {
  let googleLoginService: GoogleLoginService
  let mockAuthStore: any
  let mockAuthService: any

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock do authStore
    mockAuthStore = {
      loginGoogle: jest.fn(),
      logout: jest.fn()
    }
    
    // Mock do authService
    mockAuthService = {
      loginGoogle: jest.fn()
    }
    
    // Mock do useAuthStore
    const { useAuthStore } = require('../stores/authStore')
    useAuthStore.getState.mockReturnValue(mockAuthStore)
    
    // Mock do authService
    const { authService } = require('../services/authService')
    Object.assign(authService, mockAuthService)
    
    googleLoginService = new GoogleLoginService()
  })

  describe('logout', () => {
    it('deve executar logout com sucesso', () => {
      // Mock do localStorage
      const mockRemoveItem = jest.fn()
      Object.defineProperty(window, 'localStorage', {
        value: {
          removeItem: mockRemoveItem
        },
        writable: true
      })

      // Executar logout
      googleLoginService.logout()

      // Verificar se o logout foi chamado no store
      expect(mockAuthStore.logout).toHaveBeenCalled()
      
      // Verificar se os dados foram removidos do localStorage
      expect(mockRemoveItem).toHaveBeenCalledWith('auth-token')
      expect(mockRemoveItem).toHaveBeenCalledWith('auth-username')
      expect(mockRemoveItem).toHaveBeenCalledWith('auth-email')
      expect(mockRemoveItem).toHaveBeenCalledWith('auth-provider')
      expect(mockRemoveItem).toHaveBeenCalledWith('google-user-picture')
    })

    it('deve lidar com erro durante logout', () => {
      // Mock do localStorage que lança erro
      Object.defineProperty(window, 'localStorage', {
        value: {
          removeItem: jest.fn().mockImplementation(() => {
            throw new Error('localStorage error')
          })
        },
        writable: true
      })

      // Executar logout
      googleLoginService.logout()

      // Verificar se o logout foi chamado no store mesmo com erro
      expect(mockAuthStore.logout).toHaveBeenCalled()
    })
  })

  describe('login', () => {
    const mockGoogleUserData: GoogleUserData = {
      id: '123',
      name: 'Test User',
      email: 'test@example.com',
      picture: 'https://example.com/picture.jpg',
      provider: 'google'
    }

    const mockGoogleLoginResponse: GoogleLoginResponse = {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      tokenType: 'Bearer',
      expiresIn: 3600,
      scope: 'read write',
      username: 'testuser',
      email: 'test@example.com',
      roles: ['USER'],
      applicationUserId: 'app-user-123'
    }

    it('deve fazer login com sucesso', async () => {
      // Mock do authService.loginGoogle
      mockAuthService.loginGoogle.mockResolvedValue({
        success: true,
        data: mockGoogleLoginResponse
      })

      // Executar login
      const result = await googleLoginService.login(mockGoogleUserData)

      // Verificar resultado
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockGoogleLoginResponse)

      // Verificar se o authService foi chamado corretamente
      expect(mockAuthService.loginGoogle).toHaveBeenCalledWith({
        username: mockGoogleUserData.email,
        email: mockGoogleUserData.email,
        name: mockGoogleUserData.name,
        picture: mockGoogleUserData.picture,
        provider: 'google'
      })

      // Verificar se o store foi atualizado
      expect(mockAuthStore.loginGoogle).toHaveBeenCalledWith(
        mockGoogleUserData,
        mockGoogleLoginResponse.accessToken
      )
    })

    it('deve lidar com erro de login', async () => {
      // Mock do authService.loginGoogle com erro
      mockAuthService.loginGoogle.mockResolvedValue({
        success: false,
        error: 'Login failed'
      })

      // Executar login
      const result = await googleLoginService.login(mockGoogleUserData)

      // Verificar resultado
      expect(result.success).toBe(false)
      expect(result.error).toBe('Login failed')

      // Verificar se o store não foi atualizado
      expect(mockAuthStore.loginGoogle).not.toHaveBeenCalled()
    })

    it('deve lidar com exceção durante login', async () => {
      // Mock do authService.loginGoogle que lança exceção
      mockAuthService.loginGoogle.mockRejectedValue(new Error('Network error'))

      // Executar login
      const result = await googleLoginService.login(mockGoogleUserData)

      // Verificar resultado
      expect(result.success).toBe(false)
      expect(result.error).toBe('Erro interno durante o login com Google')

      // Verificar se o store não foi atualizado
      expect(mockAuthStore.loginGoogle).not.toHaveBeenCalled()
    })

    it('deve redirecionar após login bem-sucedido', async () => {
      // Mock do authService.loginGoogle
      mockAuthService.loginGoogle.mockResolvedValue({
        success: true,
        data: mockGoogleLoginResponse
      })

      // Mock do window.location
      delete (window as any).location
      window.location = { href: '' } as any

      // Executar login
      await googleLoginService.login(mockGoogleUserData)

      // Aguardar um pouco para o setTimeout
      await new Promise(resolve => setTimeout(resolve, 150))

      // Verificar se o redirecionamento foi executado
      expect(window.location.href).toBe('/playground')
    })

    it('deve lidar com erro de redirecionamento', async () => {
      // Mock do authService.loginGoogle
      mockAuthService.loginGoogle.mockResolvedValue({
        success: true,
        data: mockGoogleLoginResponse
      })

      // Mock do window.location que lança erro
      delete (window as any).location
      window.location = {
        get href() { return '' },
        set href(value) { throw new Error('Navigation error') }
      } as any

      // Executar login
      const result = await googleLoginService.login(mockGoogleUserData)

      // Verificar que o login ainda foi bem-sucedido
      expect(result.success).toBe(true)
    })
  })
})
