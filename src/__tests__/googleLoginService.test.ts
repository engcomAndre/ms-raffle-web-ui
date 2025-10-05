import { GoogleLoginService, GoogleUserData } from '../services/googleLoginService'
import { useAuthStore } from '../stores/authStore'
import { authService } from '../services/authService'

// Mock do authStore
jest.mock('../stores/authStore')
const MockedAuthStore = useAuthStore as jest.Mocked<typeof useAuthStore>

// Mock do authService
jest.mock('../services/authService')
const MockedAuthService = authService as jest.Mocked<typeof authService>

describe('GoogleLoginService', () => {
  let googleLoginService: GoogleLoginService
  let mockAuthStore: any

  beforeEach(() => {
    // Limpar mocks
    jest.clearAllMocks()
    
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    }
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    })

    // Mock window.location
    delete (window as any).location
    window.location = { href: '', reload: jest.fn() } as any

    // Mock atob
    global.atob = jest.fn((str) => Buffer.from(str, 'base64').toString())

    // Mock do authStore
    mockAuthStore = {
      logout: jest.fn(),
      loginGoogle: jest.fn(),
      getState: jest.fn(() => mockAuthStore)
    }
    MockedAuthStore.getState.mockReturnValue(mockAuthStore)
    
    googleLoginService = new GoogleLoginService()
  })

  describe('logout', () => {
    test('should logout successfully', () => {
      googleLoginService.logout()

      expect(mockAuthStore.logout).toHaveBeenCalled()
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('auth-token')
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('auth-refresh-token')
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('auth-username')
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('auth-email')
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('auth-roles')
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('auth-provider')
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('google-user-id')
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('google-user-name')
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('google-user-email')
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('google-user-picture')
    })

    test('should handle logout errors gracefully', () => {
      mockAuthStore.logout.mockImplementation(() => {
        throw new Error('Logout error')
      })

      expect(() => googleLoginService.logout()).not.toThrow()
    })
  })

  describe('login', () => {
    const mockUserData: GoogleUserData = {
      id: 'google123',
      name: 'John Doe',
      email: 'john@example.com',
      picture: 'https://example.com/picture.jpg',
      provider: 'google'
    }

    test('should login successfully', async () => {
      const result = await googleLoginService.login(mockUserData)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockUserData)
      expect(mockAuthStore.loginGoogle).toHaveBeenCalledWith(
        mockUserData,
        expect.stringMatching(/^google_\d+_[a-z0-9]+$/)
      )
    })

    test('should handle login errors', async () => {
      mockAuthStore.loginGoogle.mockImplementation(() => {
        throw new Error('Login error')
      })

      const result = await googleLoginService.login(mockUserData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Erro interno durante o login com Google')
    })
  })

  describe('handleGoogleLogin', () => {
    const mockCredential = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJnb29nbGUxMjMiLCJuYW1lIjoiSm9obiBEb2UiLCJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20iLCJwaWN0dXJlIjoiaHR0cHM6Ly9leGFtcGxlLmNvbS9waWN0dXJlLmpwZyJ9.signature'

    beforeEach(() => {
      // Mock atob para decodificar o payload
      global.atob.mockImplementation((str) => {
        if (str === 'eyJzdWIiOiJnb29nbGUxMjMiLCJuYW1lIjoiSm9obiBEb2UiLCJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20iLCJwaWN0dXJlIjoiaHR0cHM6Ly9leGFtcGxlLmNvbS9waWN0dXJlLmpwZyJ9') {
          return JSON.stringify({
            sub: 'google123',
            name: 'John Doe',
            email: 'john@example.com',
            picture: 'https://example.com/picture.jpg'
          })
        }
        return ''
      })
    })

    test('should handle Google login successfully', async () => {
      MockedAuthService.registerExternalUser.mockResolvedValue({
        success: true,
        data: { id: 'backend123', isNewUser: true }
      })

      const result = await googleLoginService.handleGoogleLogin(mockCredential)

      expect(result.success).toBe(true)
      expect(result.data).toEqual({
        id: 'google123',
        name: 'John Doe',
        email: 'john@example.com',
        picture: 'https://example.com/picture.jpg',
        provider: 'google'
      })
      expect(MockedAuthService.registerExternalUser).toHaveBeenCalledWith({
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        authProvider: 'google'
      })
      expect(mockAuthStore.loginGoogle).toHaveBeenCalled()
    })

    test('should handle invalid credential', async () => {
      global.atob.mockImplementation(() => {
        throw new Error('Invalid base64')
      })

      const result = await googleLoginService.handleGoogleLogin('invalid-credential')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Erro ao decodificar credencial do Google')
    })

    test('should handle backend registration error gracefully', async () => {
      MockedAuthService.registerExternalUser.mockResolvedValue({
        success: false,
        error: 'Backend error'
      })

      const result = await googleLoginService.handleGoogleLogin(mockCredential)

      expect(result.success).toBe(true) // Should still succeed even if backend fails
      expect(mockAuthStore.loginGoogle).toHaveBeenCalled()
    })

    test('should handle backend registration exception gracefully', async () => {
      MockedAuthService.registerExternalUser.mockRejectedValue(new Error('Network error'))

      const result = await googleLoginService.handleGoogleLogin(mockCredential)

      expect(result.success).toBe(true) // Should still succeed even if backend fails
      expect(mockAuthStore.loginGoogle).toHaveBeenCalled()
    })
  })

  describe('decodeGoogleCredential', () => {
    test('should decode valid credential', () => {
      const mockCredential = 'header.payload.signature'
      const mockPayload = {
        sub: 'google123',
        name: 'John Doe',
        email: 'john@example.com',
        picture: 'https://example.com/picture.jpg'
      }

      global.atob.mockReturnValue(JSON.stringify(mockPayload))

      const result = (googleLoginService as any).decodeGoogleCredential(mockCredential)

      expect(result).toEqual({
        id: 'google123',
        name: 'John Doe',
        email: 'john@example.com',
        picture: 'https://example.com/picture.jpg',
        provider: 'google'
      })
    })

    test('should handle credential without name', () => {
      const mockCredential = 'header.payload.signature'
      const mockPayload = {
        sub: 'google123',
        given_name: 'John',
        family_name: 'Doe',
        email: 'john@example.com'
      }

      global.atob.mockReturnValue(JSON.stringify(mockPayload))

      const result = (googleLoginService as any).decodeGoogleCredential(mockCredential)

      expect(result).toEqual({
        id: 'google123',
        name: 'John Doe',
        email: 'john@example.com',
        picture: undefined,
        provider: 'google'
      })
    })

    test('should handle credential with user_id instead of sub', () => {
      const mockCredential = 'header.payload.signature'
      const mockPayload = {
        user_id: 'google123',
        name: 'John Doe',
        email: 'john@example.com'
      }

      global.atob.mockReturnValue(JSON.stringify(mockPayload))

      const result = (googleLoginService as any).decodeGoogleCredential(mockCredential)

      expect(result?.id).toBe('google123')
    })

    test('should return null for invalid credential', () => {
      global.atob.mockImplementation(() => {
        throw new Error('Invalid base64')
      })

      const result = (googleLoginService as any).decodeGoogleCredential('invalid-credential')

      expect(result).toBeNull()
    })
  })

  describe('saveGoogleUserData', () => {
    const mockUserData: GoogleUserData = {
      id: 'google123',
      name: 'John Doe',
      email: 'john@example.com',
      picture: 'https://example.com/picture.jpg',
      provider: 'google'
    }

    test('should save all user data', () => {
      (googleLoginService as any).saveGoogleUserData(mockUserData)

      expect(window.localStorage.setItem).toHaveBeenCalledWith('google-user-id', 'google123')
      expect(window.localStorage.setItem).toHaveBeenCalledWith('google-user-name', 'John Doe')
      expect(window.localStorage.setItem).toHaveBeenCalledWith('auth-username', 'John Doe')
      expect(window.localStorage.setItem).toHaveBeenCalledWith('google-user-email', 'john@example.com')
      expect(window.localStorage.setItem).toHaveBeenCalledWith('auth-email', 'john@example.com')
      expect(window.localStorage.setItem).toHaveBeenCalledWith('google-user-picture', 'https://example.com/picture.jpg')
      expect(window.localStorage.setItem).toHaveBeenCalledWith('auth-provider', 'google')
      expect(window.localStorage.setItem).toHaveBeenCalledWith('auth-roles', JSON.stringify(['user']))
    })

    test('should handle missing optional fields', () => {
      const userDataWithoutPicture: GoogleUserData = {
        id: 'google456',
        name: 'Jane Doe',
        email: 'jane@example.com',
        provider: 'google'
      }

      ;(googleLoginService as any).saveGoogleUserData(userDataWithoutPicture)

      expect(localStorage.setItem).not.toHaveBeenCalledWith('google-user-picture', expect.anything())
    })

    test('should handle localStorage errors gracefully', () => {
      window.localStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      expect(() => (googleLoginService as any).saveGoogleUserData(mockUserData)).not.toThrow()
    })
  })

  describe('saveAuthToken', () => {
    test('should save auth token and refresh token', () => {
      (googleLoginService as any).saveAuthToken()

      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'auth-token',
        expect.stringMatching(/^google_\d+_[a-z0-9]+$/)
      )
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'auth-refresh-token',
        expect.stringMatching(/^refresh_google_\d+_[a-z0-9]+$/)
      )
    })

    test('should handle localStorage errors gracefully', () => {
      window.localStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      expect(() => (googleLoginService as any).saveAuthToken()).not.toThrow()
    })
  })

  describe('redirectToPlayground', () => {
    test('should call redirectToPlayground without throwing', () => {
      // Simple test that the method can be called without errors
      expect(() => (googleLoginService as any).redirectToPlayground()).not.toThrow()
    })
  })

  describe('registerGoogleUser', () => {
    const mockUserData: GoogleUserData = {
      id: 'google123',
      name: 'John Doe',
      email: 'john@example.com',
      picture: 'https://example.com/picture.jpg',
      provider: 'google'
    }

    test('should register new user successfully', async () => {
      MockedAuthService.registerExternalUser.mockResolvedValue({
        success: true,
        data: { id: 'backend123', isNewUser: true }
      })

      await (googleLoginService as any).registerGoogleUser(mockUserData)

      expect(MockedAuthService.registerExternalUser).toHaveBeenCalledWith({
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        authProvider: 'google'
      })
      expect(window.localStorage.setItem).toHaveBeenCalledWith('backend-user-id', 'backend123')
    })

    test('should handle existing user', async () => {
      MockedAuthService.registerExternalUser.mockResolvedValue({
        success: true,
        data: { id: 'backend123', isNewUser: false }
      })

      await (googleLoginService as any).registerGoogleUser(mockUserData)

      expect(MockedAuthService.registerExternalUser).toHaveBeenCalled()
      expect(window.localStorage.setItem).toHaveBeenCalledWith('backend-user-id', 'backend123')
    })

    test('should handle single name', async () => {
      const singleNameUser: GoogleUserData = {
        ...mockUserData,
        name: 'John'
      }

      MockedAuthService.registerExternalUser.mockResolvedValue({
        success: true,
        data: { id: 'backend123', isNewUser: true }
      })

      await (googleLoginService as any).registerGoogleUser(singleNameUser)

      expect(MockedAuthService.registerExternalUser).toHaveBeenCalledWith({
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'John',
        authProvider: 'google'
      })
    })

    test('should handle backend error gracefully', async () => {
      MockedAuthService.registerExternalUser.mockResolvedValue({
        success: false,
        error: 'Backend error'
      })

      await expect((googleLoginService as any).registerGoogleUser(mockUserData)).resolves.not.toThrow()
    })

    test('should handle backend exception gracefully', async () => {
      MockedAuthService.registerExternalUser.mockRejectedValue(new Error('Network error'))

      await expect((googleLoginService as any).registerGoogleUser(mockUserData)).resolves.not.toThrow()
    })
  })
})