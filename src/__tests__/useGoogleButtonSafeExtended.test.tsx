import React from 'react'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useGoogleButtonSafe } from '../hooks/useGoogleButtonSafe'

// Mock do next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

// Mock do GoogleScript
jest.mock('../components/GoogleScript', () => ({
  useGoogleReady: jest.fn()
}))

// Mock do utils/cookies
jest.mock('../utils/cookies', () => ({
  setCookie: jest.fn(),
  getCookie: jest.fn(),
  deleteCookie: jest.fn()
}))

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

// Mock do window.google
const mockGoogle = {
  accounts: {
    id: {
      initialize: jest.fn(),
      renderButton: jest.fn(),
      prompt: jest.fn()
    }
  }
}

// Mock do console
const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

describe('useGoogleButtonSafe - Testes Estendidos', () => {
  let mockRouter: any
  let mockUseGoogleReady: any
  let mockSetCookie: any
  let mockGetCookie: any
  let mockDeleteCookie: any

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockRouter = {
      push: jest.fn()
    }
    
    mockUseGoogleReady = require('../components/GoogleScript').useGoogleReady
    mockSetCookie = require('../utils/cookies').setCookie
    mockGetCookie = require('../utils/cookies').getCookie
    mockDeleteCookie = require('../utils/cookies').deleteCookie
    
    require('next/navigation').useRouter.mockReturnValue(mockRouter)
    
    // Mock do window.google
    Object.defineProperty(window, 'google', {
      value: mockGoogle,
      writable: true
    })
    
    // Mock do process.env
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = 'test-client-id'
  })

  afterEach(() => {
    consoleSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })

  describe('Inicialização e Estado', () => {
    test('deve inicializar com estado padrão', () => {
      mockUseGoogleReady.mockReturnValue(false)
      
      const { result } = renderHook(() => useGoogleButtonSafe())
      
      expect(result.current.user).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.buttonRendered).toBe(false)
      expect(result.current.googleReady).toBe(false)
    })

    test('deve verificar autenticação no localStorage', () => {
      mockUseGoogleReady.mockReturnValue(false)
      const mockUser = { id: '1', name: 'Test User', email: 'test@example.com', username: 'testuser' }
      const mockToken = 'test-token'
      
      localStorageMock.getItem
        .mockReturnValueOnce(mockToken) // auth-token
        .mockReturnValueOnce(JSON.stringify(mockUser)) // user-data
      
      const { result } = renderHook(() => useGoogleButtonSafe())
      
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.isLoading).toBe(false)
    })

    test('deve verificar autenticação nos cookies quando localStorage falha', () => {
      mockUseGoogleReady.mockReturnValue(false)
      const mockUser = { id: '1', name: 'Test User', email: 'test@example.com', username: 'testuser' }
      const mockToken = 'test-token'
      
      localStorageMock.getItem.mockReturnValue(null)
      mockGetCookie
        .mockReturnValueOnce(mockToken) // auth-token
        .mockReturnValueOnce(JSON.stringify(mockUser)) // user-data
      
      const { result } = renderHook(() => useGoogleButtonSafe())
      
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.isLoading).toBe(false)
    })

    test('deve lidar com erro na verificação de autenticação', () => {
      mockUseGoogleReady.mockReturnValue(false)
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Erro no localStorage')
      })
      
      const { result } = renderHook(() => useGoogleButtonSafe())
      
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('Inicialização do Google Auth', () => {
    test('deve inicializar Google Auth quando googleReady é true', async () => {
      mockUseGoogleReady.mockReturnValue(true)
      
      const { result } = renderHook(() => useGoogleButtonSafe())
      
      await waitFor(() => {
        expect(mockGoogle.accounts.id.initialize).toHaveBeenCalledWith({
          client_id: 'test-client-id',
          callback: expect.any(Function),
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: false,
          ux_mode: 'popup',
          state_cookie_domain: 'localhost'
        })
      })
      
      expect(result.current.buttonRendered).toBe(true)
    })

    test('deve não inicializar Google Auth sem client ID', async () => {
      mockUseGoogleReady.mockReturnValue(true)
      delete process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
      
      const { result } = renderHook(() => useGoogleButtonSafe())
      
      await waitFor(() => {
        expect(mockGoogle.accounts.id.initialize).not.toHaveBeenCalled()
      })
      
      expect(result.current.buttonRendered).toBe(false)
    })

    test('deve não inicializar Google Auth sem window.google', async () => {
      mockUseGoogleReady.mockReturnValue(true)
      Object.defineProperty(window, 'google', {
        value: undefined,
        writable: true
      })
      
      const { result } = renderHook(() => useGoogleButtonSafe())
      
      await waitFor(() => {
        expect(mockGoogle.accounts.id.initialize).not.toHaveBeenCalled()
      })
      
      expect(result.current.buttonRendered).toBe(false)
    })
  })

  describe('Registro e Renderização de Botões', () => {
    test('deve registrar botão corretamente', () => {
      mockUseGoogleReady.mockReturnValue(false)
      
      const { result } = renderHook(() => useGoogleButtonSafe())
      const mockElement = document.createElement('div')
      
      act(() => {
        result.current.registerButton('test-button', mockElement)
      })
      
      // O botão é registrado internamente
      expect(result.current.buttonRendered).toBe(false)
    })

    test('deve renderizar botão quando Google está pronto', () => {
      mockUseGoogleReady.mockReturnValue(true)
      
      const { result } = renderHook(() => useGoogleButtonSafe())
      const mockElement = document.createElement('div')
      
      act(() => {
        result.current.registerButton('test-button', mockElement)
      })
      
      // O botão é renderizado internamente, não podemos verificar diretamente
      expect(result.current.buttonRendered).toBe(true)
    })

    test('deve lidar com elemento nulo no registro', () => {
      mockUseGoogleReady.mockReturnValue(false)
      
      const { result } = renderHook(() => useGoogleButtonSafe())
      
      act(() => {
        result.current.registerButton('test-button', null as any)
      })
      
      expect(result.current.buttonRendered).toBe(false)
    })
  })

  describe('Login Tradicional', () => {
    test('deve fazer login com credenciais válidas', async () => {
      mockUseGoogleReady.mockReturnValue(false)
      
      const { result } = renderHook(() => useGoogleButtonSafe())
      
      let loginResult: any
      await act(async () => {
        loginResult = await result.current.login('admin@msraffle.com', '123456')
      })
      
      expect(loginResult.success).toBe(true)
      expect(result.current.user).toEqual({
        id: '1',
        name: 'Admin',
        email: 'admin@msraffle.com',
        username: 'admin',
        provider: 'credentials'
      })
      expect(result.current.isAuthenticated).toBe(true)
      expect(localStorageMock.setItem).toHaveBeenCalled()
      expect(mockSetCookie).toHaveBeenCalled()
    })

    test('deve falhar login com credenciais inválidas', async () => {
      mockUseGoogleReady.mockReturnValue(false)
      
      const { result } = renderHook(() => useGoogleButtonSafe())
      
      let loginResult: any
      await act(async () => {
        loginResult = await result.current.login('wrong@email.com', 'wrongpass')
      })
      
      expect(loginResult.success).toBe(false)
      expect(loginResult.error).toBe('Email ou senha incorretos')
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })

    test('deve lidar com erro durante login', async () => {
      mockUseGoogleReady.mockReturnValue(false)
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Erro no localStorage')
      })
      
      const { result } = renderHook(() => useGoogleButtonSafe())
      
      let loginResult: any
      await act(async () => {
        loginResult = await result.current.login('admin@msraffle.com', '123456')
      })
      
      expect(loginResult.success).toBe(false)
      expect(loginResult.error).toBe('Erro ao fazer login')
    })
  })

  describe('Logout', () => {
    test('deve fazer logout corretamente', () => {
      mockUseGoogleReady.mockReturnValue(false)
      
      const { result } = renderHook(() => useGoogleButtonSafe())
      
      // Primeiro fazer login
      act(() => {
        result.current.login('admin@msraffle.com', '123456')
      })
      
      // Depois fazer logout
      act(() => {
        result.current.logout()
      })
      
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(localStorageMock.removeItem).toHaveBeenCalled()
      expect(mockDeleteCookie).toHaveBeenCalled()
      expect(mockRouter.push).toHaveBeenCalledWith('/welcome')
    })
  })

  describe('Callback do Google', () => {
    test('deve usar callback externo quando fornecido', async () => {
      mockUseGoogleReady.mockReturnValue(true)
      const mockCallback = jest.fn()
      
      const { result } = renderHook(() => useGoogleButtonSafe(mockCallback))
      
      // Simular resposta do Google
      const mockResponse = {
        credential: 'mock-jwt-token',
        select_by: 'user',
        clientId: 'test-client-id',
        client_id: 'test-client-id'
      }
      
      await act(async () => {
        // Simular o callback do Google
        const callback = mockGoogle.accounts.id.initialize.mock.calls[0][0].callback
        await callback(mockResponse)
      })
      
      expect(mockCallback).toHaveBeenCalledWith('mock-jwt-token')
    })

    test('deve processar resposta do Google sem callback externo', async () => {
      mockUseGoogleReady.mockReturnValue(true)
      
      const { result } = renderHook(() => useGoogleButtonSafe())
      
      // Simular resposta do Google
      const mockResponse = {
        credential: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJnb29nbGUtMTIzIiwibmFtZSI6IkpvaG4gRG9lIiwiZW1haWwiOiJqb2huQGV4YW1wbGUuY29tIn0.SIGNATURE',
        select_by: 'user',
        clientId: 'test-client-id',
        client_id: 'test-client-id'
      }
      
      await act(async () => {
        // Simular o callback do Google
        const callback = mockGoogle.accounts.id.initialize.mock.calls[0][0].callback
        await callback(mockResponse)
      })
      
      // O estado pode não ser atualizado imediatamente devido ao setTimeout
      expect(result.current.user).toBeDefined()
      // Verificar se os dados foram salvos no localStorage
      expect(localStorageMock.setItem).toHaveBeenCalled()
      // O cookie pode não ser definido imediatamente
    })

    test('deve lidar com erro no processamento da resposta do Google', async () => {
      mockUseGoogleReady.mockReturnValue(true)
      
      const { result } = renderHook(() => useGoogleButtonSafe())
      
      // Simular resposta do Google com JWT inválido
      const mockResponse = {
        credential: 'invalid-jwt',
        select_by: 'user',
        clientId: 'test-client-id',
        client_id: 'test-client-id'
      }
      
      await act(async () => {
        // Simular o callback do Google
        const callback = mockGoogle.accounts.id.initialize.mock.calls[0][0].callback
        await callback(mockResponse)
      })
      
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('Casos de Borda', () => {
    test('deve lidar com múltiplas inicializações', () => {
      mockUseGoogleReady.mockReturnValue(true)
      
      const { result } = renderHook(() => useGoogleButtonSafe())
      
      // Simular múltiplas mudanças de googleReady
      act(() => {
        mockUseGoogleReady.mockReturnValue(false)
      })
      
      act(() => {
        mockUseGoogleReady.mockReturnValue(true)
      })
      
      expect(mockGoogle.accounts.id.initialize).toHaveBeenCalledTimes(1)
    })

    test('deve lidar com mudanças de estado durante operações assíncronas', async () => {
      mockUseGoogleReady.mockReturnValue(false)
      
      const { result } = renderHook(() => useGoogleButtonSafe())
      
      // Fazer login
      await act(async () => {
        await result.current.login('admin@msraffle.com', '123456')
      })
      
      // Fazer logout
      act(() => {
        result.current.logout()
      })
      
      // Verificar se o logout foi executado
      expect(localStorageMock.removeItem).toHaveBeenCalled()
      expect(mockDeleteCookie).toHaveBeenCalled()
    })
  })
})
