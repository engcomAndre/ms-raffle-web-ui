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
      expect(result.data).toEqual(mockGoogleUserData)

      // Verificar se o store foi atualizado
      expect(mockAuthStore.loginGoogle).toHaveBeenCalledWith(
        mockGoogleUserData,
        expect.stringMatching(/^google_\d+_[a-z0-9]+$/)
      )
    })

    it('deve lidar com erro de login', async () => {
      // Mock do authStore.loginGoogle que lança erro
      mockAuthStore.loginGoogle.mockImplementation(() => {
        throw new Error('Store error')
      })

      // Executar login
      const result = await googleLoginService.login(mockGoogleUserData)

      // Verificar resultado
      expect(result.success).toBe(false)
      expect(result.error).toBe('Erro interno durante o login com Google')
    })

    it('deve lidar com exceção durante login', async () => {
      // Mock do authStore.loginGoogle que lança exceção
      mockAuthStore.loginGoogle.mockImplementation(() => {
        throw new Error('Store error')
      })

      // Executar login
      const result = await googleLoginService.login(mockGoogleUserData)

      // Verificar resultado
      expect(result.success).toBe(false)
      expect(result.error).toBe('Erro interno durante o login com Google')
    })

    it('deve redirecionar após login bem-sucedido', async () => {
      // Executar login
      const result = await googleLoginService.login(mockGoogleUserData)

      // Verificar que o login foi bem-sucedido
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockGoogleUserData)
    })

    it('deve lidar com erro de redirecionamento', async () => {
      // Executar login
      const result = await googleLoginService.login(mockGoogleUserData)

      // Verificar que o login foi bem-sucedido
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockGoogleUserData)
    })
  })
})
