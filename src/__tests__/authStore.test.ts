import { renderHook, act } from '@testing-library/react'
import { useAuthStore } from '../stores/authStore'

// Mock do localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock do console.log
const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

describe('AuthStore', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Limpar o store antes de cada teste
    act(() => {
      useAuthStore.getState().clearAuth()
    })
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  describe('Estado Inicial', () => {
    test('deve ter estado inicial correto', () => {
      const { result } = renderHook(() => useAuthStore())

      expect(result.current.user).toBeNull()
      expect(result.current.token).toBeNull()
      expect(result.current.refreshToken).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('Login com Usuário e Senha', () => {
    test('deve fazer login com usuário e senha', () => {
      const { result } = renderHook(() => useAuthStore())
      const mockUser = {
        id: '123',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['user'],
        provider: 'userpass' as const
      }
      const mockToken = 'mock-jwt-token'

      act(() => {
        result.current.login(mockUser, mockToken)
      })

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.token).toBe(mockToken)
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.isLoading).toBe(false)
    })

    test('deve salvar dados no localStorage', () => {
      const { result } = renderHook(() => useAuthStore())
      const mockUser = {
        id: '123',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['user'],
        provider: 'userpass' as const
      }
      const mockToken = 'mock-jwt-token'
      const mockRefreshToken = 'mock-refresh-token'

      act(() => {
        result.current.login(mockUser, mockToken, mockRefreshToken)
      })

      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth-token', mockToken)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth-refresh-token', mockRefreshToken)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth-username', mockUser.username)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth-email', mockUser.email)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth-roles', JSON.stringify(mockUser.roles))
    })

    test('deve fazer login sem refresh token', () => {
      const { result } = renderHook(() => useAuthStore())
      const mockUser = {
        id: '123',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['user'],
        provider: 'userpass' as const
      }
      const mockToken = 'mock-jwt-token'

      act(() => {
        result.current.login(mockUser, mockToken)
      })

      expect(result.current.refreshToken).toBeNull()
      expect(localStorageMock.setItem).not.toHaveBeenCalledWith('auth-refresh-token', expect.anything())
    })
  })

  describe('Login com Google', () => {
    test('deve fazer login com usuário Google', () => {
      const { result } = renderHook(() => useAuthStore())
      const mockGoogleUser = {
        id: 'google-123',
        email: 'google@example.com',
        name: 'Google User',
        picture: 'https://example.com/picture.jpg'
      }
      const mockToken = 'google-jwt-token'

      act(() => {
        result.current.loginGoogle(mockGoogleUser, mockToken)
      })

      expect(result.current.user).toEqual({
        id: 'google-123',
        username: 'Google User',
        email: 'google@example.com',
        name: 'Google User',
        picture: 'https://example.com/picture.jpg',
        roles: ['user'],
        provider: 'google'
      })
      expect(result.current.token).toBe(mockToken)
      expect(result.current.isAuthenticated).toBe(true)
    })

    test('deve salvar dados Google no localStorage', () => {
      const { result } = renderHook(() => useAuthStore())
      const mockGoogleUser = {
        id: 'google-123',
        email: 'google@example.com',
        name: 'Google User',
        picture: 'https://example.com/picture.jpg'
      }
      const mockToken = 'google-jwt-token'

      act(() => {
        result.current.loginGoogle(mockGoogleUser, mockToken)
      })

      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth-token', mockToken)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth-username', 'Google User')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth-email', 'google@example.com')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth-roles', JSON.stringify(['user']))
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth-provider', 'google')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('google-user-id', 'google-123')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('google-user-picture', 'https://example.com/picture.jpg')
    })

    test('deve lidar com usuário Google sem foto', () => {
      const { result } = renderHook(() => useAuthStore())
      const mockGoogleUser = {
        id: 'google-123',
        email: 'google@example.com',
        name: 'Google User'
      }
      const mockToken = 'google-jwt-token'

      act(() => {
        result.current.loginGoogle(mockGoogleUser, mockToken)
      })

      expect(localStorageMock.setItem).not.toHaveBeenCalledWith('google-user-picture', expect.anything())
    })
  })

  describe('Logout', () => {
    test('deve fazer logout e limpar estado', () => {
      const { result } = renderHook(() => useAuthStore())
      
      // Primeiro fazer login
      const mockUser = {
        id: '123',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['user'],
        provider: 'userpass' as const
      }
      
      act(() => {
        result.current.login(mockUser, 'token')
      })

      // Fazer logout
      act(() => {
        result.current.logout()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.token).toBeNull()
      expect(result.current.refreshToken).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.isLoading).toBe(false)
    })

    test('deve limpar localStorage no logout', () => {
      const { result } = renderHook(() => useAuthStore())
      
      // Fazer logout
      act(() => {
        result.current.logout()
      })

      const expectedKeys = [
        'auth-token',
        'auth-refresh-token',
        'auth-username',
        'auth-email',
        'auth-roles',
        'auth-provider',
        'google-user-id',
        'google-user-picture'
      ]

      expectedKeys.forEach(key => {
        expect(localStorageMock.removeItem).toHaveBeenCalledWith(key)
      })
    })
  })

  describe('Gerenciamento de Loading', () => {
    test('deve definir estado de loading', () => {
      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.setLoading(true)
      })

      expect(result.current.isLoading).toBe(true)

      act(() => {
        result.current.setLoading(false)
      })

      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('Atualização de Usuário', () => {
    test('deve atualizar dados do usuário', () => {
      const { result } = renderHook(() => useAuthStore())
      const mockUser = {
        id: '123',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['user'],
        provider: 'userpass' as const
      }

      act(() => {
        result.current.login(mockUser, 'token')
      })

      act(() => {
        result.current.updateUser({ username: 'newusername', email: 'new@example.com' })
      })

      expect(result.current.user?.username).toBe('newusername')
      expect(result.current.user?.email).toBe('new@example.com')
    })

    test('deve atualizar localStorage ao atualizar usuário', () => {
      const { result } = renderHook(() => useAuthStore())
      const mockUser = {
        id: '123',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['user'],
        provider: 'userpass' as const
      }

      act(() => {
        result.current.login(mockUser, 'token')
      })

      act(() => {
        result.current.updateUser({ username: 'newusername' })
      })

      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth-username', 'newusername')
    })

    test('não deve atualizar se não houver usuário logado', () => {
      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.updateUser({ username: 'newusername' })
      })

      expect(result.current.user).toBeNull()
    })
  })

  describe('Verificação de Roles', () => {
    test('deve verificar se usuário tem role específica', () => {
      const { result } = renderHook(() => useAuthStore())
      const mockUser = {
        id: '123',
        username: 'adminuser',
        email: 'admin@example.com',
        roles: ['admin', 'user'],
        provider: 'userpass' as const
      }

      act(() => {
        result.current.login(mockUser, 'token')
      })

      expect(result.current.hasRole('admin')).toBe(true)
      expect(result.current.hasRole('user')).toBe(true)
      expect(result.current.hasRole('moderator')).toBe(false)
    })

    test('deve verificar se é admin', () => {
      const { result } = renderHook(() => useAuthStore())
      const mockUser = {
        id: '123',
        username: 'adminuser',
        email: 'admin@example.com',
        roles: ['admin'],
        provider: 'userpass' as const
      }

      act(() => {
        result.current.login(mockUser, 'token')
      })

      expect(result.current.isAdmin()).toBe(true)
    })

    test('deve verificar se é usuário comum', () => {
      const { result } = renderHook(() => useAuthStore())
      const mockUser = {
        id: '123',
        username: 'regularuser',
        email: 'user@example.com',
        roles: ['user'],
        provider: 'userpass' as const
      }

      act(() => {
        result.current.login(mockUser, 'token')
      })

      expect(result.current.isUser()).toBe(true)
      expect(result.current.isAdmin()).toBe(false)
    })

    test('deve retornar false para roles quando não há usuário', () => {
      const { result } = renderHook(() => useAuthStore())

      expect(result.current.hasRole('admin')).toBe(false)
      expect(result.current.isAdmin()).toBe(false)
      expect(result.current.isUser()).toBe(false)
    })
  })

  describe('Limpeza de Autenticação', () => {
    test('deve limpar autenticação sem afetar localStorage', () => {
      const { result } = renderHook(() => useAuthStore())
      
      // Primeiro fazer login
      const mockUser = {
        id: '123',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['user'],
        provider: 'userpass' as const
      }
      
      act(() => {
        result.current.login(mockUser, 'token')
      })

      // Limpar autenticação
      act(() => {
        result.current.clearAuth()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.token).toBeNull()
      expect(result.current.refreshToken).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.isLoading).toBe(false)

      // localStorage não deve ser afetado
      expect(localStorageMock.removeItem).not.toHaveBeenCalled()
    })
  })
})
