import { UserPassLoginService } from '../services/userPassLoginService'

// Mock das dependências
jest.mock('../services/authService', () => ({
  AuthService: jest.fn().mockImplementation(() => ({
    login: jest.fn()
  }))
}))

jest.mock('../stores/authStore', () => ({
  useAuthStore: {
    getState: jest.fn()
  }
}))

describe('UserPassLoginService - Simple Tests', () => {
  let userPassLoginService: UserPassLoginService

  beforeEach(() => {
    jest.clearAllMocks()
    userPassLoginService = new UserPassLoginService()
  })

  describe('logout', () => {
    it('deve executar logout sem erro', () => {
      // Mock do localStorage
      const mockRemoveItem = jest.fn()
      Object.defineProperty(window, 'localStorage', {
        value: {
          removeItem: mockRemoveItem
        },
        writable: true
      })

      // Executar logout
      expect(() => userPassLoginService.logout()).not.toThrow()
    })
  })

  describe('login', () => {
    const mockLoginData = {
      username: 'testuser',
      password: 'testpass123'
    }

    it('deve executar login sem erro', async () => {
      // Mock do AuthService
      const { AuthService } = require('../services/authService')
      const mockAuthServiceInstance = {
        login: jest.fn().mockResolvedValue({
          success: true,
          data: {
            accessToken: 'mock-token',
            refreshToken: 'mock-refresh',
            tokenType: 'Bearer',
            expiresIn: 3600,
            scope: 'read write',
            username: 'testuser',
            email: 'test@example.com',
            roles: ['USER'],
            applicationUserId: 'app-user-123'
          }
        })
      }
      AuthService.mockImplementation(() => mockAuthServiceInstance)

      // Mock do authStore
      const { useAuthStore } = require('../stores/authStore')
      useAuthStore.getState.mockReturnValue({
        login: jest.fn(),
        logout: jest.fn()
      })

      // Executar login
      const result = await userPassLoginService.login(mockLoginData)
      
      expect(result).toBeDefined()
    })
  })
})
