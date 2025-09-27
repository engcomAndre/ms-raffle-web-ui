import { renderHook, act } from '@testing-library/react'
import { useLogout } from '../hooks/useLogout'
import { UserPassLoginService } from '../services/userPassLoginService'
import { GoogleLoginService } from '../services/googleLoginService'

// Mock do localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
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

// Mock dos serviços de login
jest.mock('@/services/userPassLoginService', () => ({
  UserPassLoginService: jest.fn().mockImplementation(() => ({
    logout: jest.fn()
  }))
}))

jest.mock('@/services/googleLoginService', () => ({
  GoogleLoginService: jest.fn().mockImplementation(() => ({
    logout: jest.fn()
  }))
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

describe('useLogout', () => {
  let mockUserPassLoginService: jest.Mocked<UserPassLoginService>
  let mockGoogleLoginService: jest.Mocked<GoogleLoginService>

  beforeEach(() => {
    jest.clearAllMocks()
    mockLocation.href = ''
    mockLocation.reload.mockClear()
    mockLocalStorage.getItem.mockClear()
    mockLocalStorage.removeItem.mockClear()
    mockLocalStorage.clear.mockClear()

    // Criar instâncias mockadas
    mockUserPassLoginService = new UserPassLoginService() as jest.Mocked<UserPassLoginService>
    mockGoogleLoginService = new GoogleLoginService() as jest.Mocked<GoogleLoginService>
  })

  it('deve chamar UserPassLoginService.logout e redirecionar para /welcome se provider não for google', () => {
    mockLocalStorage.getItem.mockReturnValueOnce('userpass') // auth-provider

    const { result } = renderHook(() => useLogout())

    act(() => {
      result.current.logout()
    })

    expect(mockUserPassLoginService.logout).toHaveBeenCalled()
    expect(mockGoogleLoginService.logout).not.toHaveBeenCalled()
    expect(mockLocation.href).toBe('/welcome')
  })

  it('deve chamar GoogleLoginService.logout e redirecionar para /welcome se provider for google', () => {
    mockLocalStorage.getItem.mockReturnValueOnce('google') // auth-provider

    const { result } = renderHook(() => useLogout())

    act(() => {
      result.current.logout()
    })

    expect(mockGoogleLoginService.logout).toHaveBeenCalled()
    expect(mockUserPassLoginService.logout).not.toHaveBeenCalled()
    expect(mockLocation.href).toBe('/welcome')
  })

  it('deve usar UserPassLoginService quando provider for null', () => {
    mockLocalStorage.getItem.mockReturnValueOnce(null) // auth-provider

    const { result } = renderHook(() => useLogout())

    act(() => {
      result.current.logout()
    })

    expect(mockUserPassLoginService.logout).toHaveBeenCalled()
    expect(mockGoogleLoginService.logout).not.toHaveBeenCalled()
    expect(mockLocation.href).toBe('/welcome')
  })

  it('deve usar UserPassLoginService quando provider for undefined', () => {
    mockLocalStorage.getItem.mockReturnValueOnce(undefined) // auth-provider

    const { result } = renderHook(() => useLogout())

    act(() => {
      result.current.logout()
    })

    expect(mockUserPassLoginService.logout).toHaveBeenCalled()
    expect(mockGoogleLoginService.logout).not.toHaveBeenCalled()
    expect(mockLocation.href).toBe('/welcome')
  })

  it('deve usar UserPassLoginService quando provider for string vazia', () => {
    mockLocalStorage.getItem.mockReturnValueOnce('') // auth-provider

    const { result } = renderHook(() => useLogout())

    act(() => {
      result.current.logout()
    })

    expect(mockUserPassLoginService.logout).toHaveBeenCalled()
    expect(mockGoogleLoginService.logout).not.toHaveBeenCalled()
    expect(mockLocation.href).toBe('/welcome')
  })

  it('deve usar UserPassLoginService quando provider for qualquer outro valor', () => {
    mockLocalStorage.getItem.mockReturnValueOnce('facebook') // auth-provider

    const { result } = renderHook(() => useLogout())

    act(() => {
      result.current.logout()
    })

    expect(mockUserPassLoginService.logout).toHaveBeenCalled()
    expect(mockGoogleLoginService.logout).not.toHaveBeenCalled()
    expect(mockLocation.href).toBe('/welcome')
  })

  it('deve limpar localStorage e redirecionar para /welcome em caso de erro no logout', () => {
    mockLocalStorage.getItem.mockImplementationOnce(() => {
      throw new Error('Erro ao obter provider')
    })

    const { result } = renderHook(() => useLogout())

    act(() => {
      result.current.logout()
    })

    expect(mockLocalStorage.clear).toHaveBeenCalled()
    expect(mockLocation.href).toBe('/welcome')
  })

  it('deve limpar localStorage e redirecionar para /welcome em caso de erro no redirecionamento', () => {
    mockLocalStorage.getItem.mockReturnValueOnce('userpass')
    mockUserPassLoginService.logout.mockImplementationOnce(() => {
      throw new Error('Erro no logout')
    })

    const { result } = renderHook(() => useLogout())

    act(() => {
      result.current.logout()
    })

    expect(mockLocalStorage.clear).toHaveBeenCalled()
    expect(mockLocation.href).toBe('/welcome')
  })

  it('deve lidar com erro no redirecionamento após logout bem-sucedido', () => {
    mockLocalStorage.getItem.mockReturnValueOnce('userpass')
    
    // Mock do window.location.href para simular erro
    const originalLocation = window.location
    Object.defineProperty(window, 'location', {
      value: {
        ...mockLocation,
        get href() { throw new Error('Erro de redirecionamento') },
        set href(value: string) { mockLocation.href = value }
      },
      configurable: true
    })

    const { result } = renderHook(() => useLogout())

    act(() => {
      result.current.logout()
    })

    expect(mockUserPassLoginService.logout).toHaveBeenCalled()
    expect(mockLocalStorage.clear).toHaveBeenCalled()
    expect(mockLocation.href).toBe('/welcome')

    // Restaurar o mock original
    Object.defineProperty(window, 'location', { value: originalLocation, configurable: true })
  })

  it('deve retornar função logout', () => {
    const { result } = renderHook(() => useLogout())

    expect(typeof result.current.logout).toBe('function')
  })

  it('deve chamar localStorage.getItem com auth-provider', () => {
    mockLocalStorage.getItem.mockReturnValueOnce('userpass')

    const { result } = renderHook(() => useLogout())

    act(() => {
      result.current.logout()
    })

    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('auth-provider')
  })

  it('deve lidar com erro no fallback de redirecionamento', () => {
    mockLocalStorage.getItem.mockReturnValueOnce('userpass')
    mockUserPassLoginService.logout.mockImplementationOnce(() => {
      throw new Error('Erro no logout')
    })

    // Mock do window.location.href para simular erro no fallback também
    const originalLocation = window.location
    Object.defineProperty(window, 'location', {
      value: {
        ...mockLocation,
        get href() { throw new Error('Erro de redirecionamento') },
        set href(value: string) { throw new Error('Erro de redirecionamento') }
      },
      configurable: true
    })

    const { result } = renderHook(() => useLogout())

    act(() => {
      result.current.logout()
    })

    expect(mockLocalStorage.clear).toHaveBeenCalled()

    // Restaurar o mock original
    Object.defineProperty(window, 'location', { value: originalLocation, configurable: true })
  })
})