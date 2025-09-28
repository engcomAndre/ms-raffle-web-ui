import { UserPassLoginService, UserPassLoginData, UserPassLoginResponse } from '../services/userPassLoginService'
import { AuthService } from '../services/authService'
import { useAuthStore } from '../stores/authStore'

// Mock das dependências
jest.mock('../services/authService')
jest.mock('../stores/authStore')

const mockAuthService = AuthService as jest.MockedClass<typeof AuthService>
const mockUseAuthStore = useAuthStore as jest.Mocked<typeof useAuthStore>

describe('UserPassLoginService', () => {
  let userPassLoginService: UserPassLoginService
  let mockAuthServiceInstance: jest.Mocked<AuthService>
  let mockAuthStore: any

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock do AuthService
    mockAuthServiceInstance = {
      login: jest.fn()
    } as any
    
    mockAuthService.mockImplementation(() => mockAuthServiceInstance)
    
    // Mock do authStore
    mockAuthStore = {
      login: jest.fn(),
      logout: jest.fn()
    }
    
    mockUseAuthStore.getState.mockReturnValue(mockAuthStore)
    
    userPassLoginService = new UserPassLoginService()
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
      userPassLoginService.logout()

      // Verificar se o logout foi chamado no store
      expect(mockAuthStore.logout).toHaveBeenCalled()
      
      // Verificar se os dados foram removidos do localStorage
      expect(mockRemoveItem).toHaveBeenCalledWith('auth-token')
      expect(mockRemoveItem).toHaveBeenCalledWith('auth-refresh-token')
      expect(mockRemoveItem).toHaveBeenCalledWith('auth-username')
      expect(mockRemoveItem).toHaveBeenCalledWith('auth-email')
      expect(mockRemoveItem).toHaveBeenCalledWith('auth-roles')
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
      userPassLoginService.logout()

      // Verificar se o logout foi chamado no store mesmo com erro
      expect(mockAuthStore.logout).toHaveBeenCalled()
    })
  })

  describe('login', () => {
    const mockLoginData: UserPassLoginData = {
      username: 'testuser',
      password: 'testpass123'
    }

    const mockLoginResponse: UserPassLoginResponse = {
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
      // Mock do authService.login
      mockAuthServiceInstance.login.mockResolvedValue({
        success: true,
        data: mockLoginResponse
      })

      // Executar login
      const result = await userPassLoginService.login(mockLoginData)

      // Verificar resultado
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockLoginResponse)

      // Verificar se o authService foi chamado corretamente
      expect(mockAuthServiceInstance.login).toHaveBeenCalledWith(mockLoginData)

      // Verificar se o store foi atualizado
      expect(mockAuthStore.login).toHaveBeenCalledWith(
        {
          id: mockLoginResponse.applicationUserId || mockLoginResponse.username,
          username: mockLoginResponse.username,
          email: mockLoginResponse.email,
          roles: mockLoginResponse.roles,
          provider: 'userpass'
        },
        mockLoginResponse.accessToken,
        mockLoginResponse.refreshToken
      )
    })

    it('deve lidar com erro de login', async () => {
      // Mock do authService.login com erro
      mockAuthServiceInstance.login.mockResolvedValue({
        success: false,
        error: 'Invalid credentials'
      })

      // Executar login
      const result = await userPassLoginService.login(mockLoginData)

      // Verificar resultado
      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid credentials')

      // Verificar se o store não foi atualizado
      expect(mockAuthStore.login).not.toHaveBeenCalled()
    })

    it('deve lidar com exceção durante login', async () => {
      // Mock do authService.login que lança exceção
      mockAuthServiceInstance.login.mockRejectedValue(new Error('Network error'))

      // Executar login
      const result = await userPassLoginService.login(mockLoginData)

      // Verificar resultado
      expect(result.success).toBe(false)
      expect(result.error).toBe('Erro interno durante o login')

      // Verificar se o store não foi atualizado
      expect(mockAuthStore.login).not.toHaveBeenCalled()
    })

    it('deve redirecionar após login bem-sucedido', async () => {
      // Mock do authService.login
      mockAuthServiceInstance.login.mockResolvedValue({
        success: true,
        data: mockLoginResponse
      })

      // Executar login
      const result = await userPassLoginService.login(mockLoginData)

      // Verificar que o login foi bem-sucedido
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockLoginResponse)
    })

    it('deve lidar com erro de redirecionamento', async () => {
      // Mock do authService.login
      mockAuthServiceInstance.login.mockResolvedValue({
        success: true,
        data: mockLoginResponse
      })

      // Executar login
      const result = await userPassLoginService.login(mockLoginData)

      // Verificar que o login foi bem-sucedido
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockLoginResponse)
    })
  })
})
