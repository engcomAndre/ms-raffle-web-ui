import { AuthService } from '../services/authService'
import { apiService } from '../services/api'

// Mock do apiService
jest.mock('../services/api', () => ({
  apiService: {
    post: jest.fn()
  }
}))

describe('AuthService', () => {
  let authService: AuthService
  const mockApiService = apiService as jest.Mocked<typeof apiService>

  beforeEach(() => {
    authService = new AuthService()
    jest.clearAllMocks()
  })

  describe('register', () => {
    const mockUserData = {
      firstName: 'João',
      lastName: 'Silva',
      email: 'joao@test.com',
      username: 'joaosilva',
      password: 'Test123!',
      roles: ['USER']
    }

    test('deve registrar usuário com sucesso', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: '123',
          firstName: 'João',
          lastName: 'Silva',
          email: 'joao@test.com',
          username: 'joaosilva',
          createdAt: '2024-01-01T00:00:00Z'
        },
        message: 'Usuário registrado com sucesso'
      }

      mockApiService.post.mockResolvedValue(mockResponse)

      const result = await authService.register(mockUserData)

      expect(mockApiService.post).toHaveBeenCalledWith(
        expect.any(String),
        mockUserData
      )
      expect(result).toEqual(mockResponse)
      expect(result.success).toBe(true)
    })

    test('deve lidar com erro no registro', async () => {
      const mockError = {
        success: false,
        error: 'Email já existe',
        data: null
      }

      mockApiService.post.mockResolvedValue(mockError)

      const result = await authService.register(mockUserData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Email já existe')
    })

    test('deve lidar com exceção durante registro', async () => {
      mockApiService.post.mockRejectedValue(new Error('Erro de rede'))

      await expect(authService.register(mockUserData)).rejects.toThrow('Erro de rede')
    })
  })

  describe('registerExternalUser', () => {
    const mockExternalUserData = {
      email: 'google@test.com',
      firstName: 'Google',
      lastName: 'User',
      authProvider: 'google' as const
    }

    test('deve registrar usuário externo com sucesso', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: '456',
          email: 'google@test.com',
          firstName: 'Google',
          lastName: 'User',
          authProvider: 'google',
          isNewUser: true
        },
        message: 'Usuário externo registrado'
      }

      mockApiService.post.mockResolvedValue(mockResponse)

      const result = await authService.registerExternalUser(mockExternalUserData)

      expect(mockApiService.post).toHaveBeenCalledWith(
        expect.any(String),
        mockExternalUserData
      )
      expect(result.success).toBe(true)
      expect(result.data.isNewUser).toBe(true)
    })

    test('deve lidar com usuário externo existente', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: '456',
          email: 'google@test.com',
          firstName: 'Google',
          lastName: 'User',
          authProvider: 'google',
          isNewUser: false
        },
        message: 'Usuário externo já existe'
      }

      mockApiService.post.mockResolvedValue(mockResponse)

      const result = await authService.registerExternalUser(mockExternalUserData)

      expect(result.data.isNewUser).toBe(false)
    })
  })

  describe('login', () => {
    const mockLoginData = {
      username: 'joaosilva',
      password: 'Test123!'
    }

    test('deve realizar login com sucesso', async () => {
      const mockResponse = {
        success: true,
        data: {
          accessToken: 'access-token-123',
          refreshToken: 'refresh-token-456',
          tokenType: 'Bearer',
          expiresIn: 3600,
          scope: 'read write',
          username: 'joaosilva',
          email: 'joao@test.com',
          roles: ['USER'],
          applicationUserId: 'app-user-123'
        },
        message: 'Login realizado com sucesso'
      }

      mockApiService.post.mockResolvedValue(mockResponse)

      const result = await authService.login(mockLoginData)

      expect(mockApiService.post).toHaveBeenCalledWith(
        expect.any(String),
        mockLoginData
      )
      expect(result.success).toBe(true)
      expect(result.data.accessToken).toBe('access-token-123')
      expect(result.data.username).toBe('joaosilva')
    })

    test('deve lidar com credenciais inválidas', async () => {
      const mockError = {
        success: false,
        error: 'Credenciais inválidas',
        data: null
      }

      mockApiService.post.mockResolvedValue(mockError)

      const result = await authService.login(mockLoginData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Credenciais inválidas')
    })

    test('deve lidar com erro de rede durante login', async () => {
      mockApiService.post.mockRejectedValue(new Error('Erro de conexão'))

      await expect(authService.login(mockLoginData)).rejects.toThrow('Erro de conexão')
    })
  })
})
