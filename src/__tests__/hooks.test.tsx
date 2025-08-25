import { renderHook, act } from '@testing-library/react'
import { useLogout } from '../hooks/useLogout'
import { useGoogleButtonSafe } from '../hooks/useGoogleButtonSafe'

// Mock do localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Sem mock do window.location para evitar problemas

describe('useLogout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  test('deve retornar função de logout', () => {
    const { result } = renderHook(() => useLogout())

    expect(result.current).toBeDefined()
  })

  test('deve retornar função de logout válida', () => {
    const { result } = renderHook(() => useLogout())

    expect(result.current).toBeDefined()
  })
})

describe('useGoogleButtonSafe', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('deve retornar false quando Google não está carregado', () => {
    // Simular Google não carregado
    delete (window as any).google

    const { result } = renderHook(() => useGoogleButtonSafe())

    expect(result.current.googleReady).toBe(false)
  })

  test('deve retornar true quando Google está carregado', () => {
    // Simular Google carregado
    (window as any).google = {
      accounts: {
        id: {
          initialize: jest.fn(),
          renderButton: jest.fn(),
        },
      },
    }

    const { result } = renderHook(() => useGoogleButtonSafe())

    expect(result.current.googleReady).toBe(true)
  })

  test('deve retornar false quando Google está carregado mas não tem accounts.id', () => {
    // Simular Google carregado mas sem accounts.id
    (window as any).google = {
      maps: {},
    }

    const { result } = renderHook(() => useGoogleButtonSafe())

    expect(result.current.googleReady).toBe(false)
  })

  test('deve retornar false quando Google está carregado mas não tem accounts.id.initialize', () => {
    // Simular Google está carregado mas sem accounts.id.initialize
    (window as any).google = {
      accounts: {},
    }

    const { result } = renderHook(() => useGoogleButtonSafe())

    expect(result.current.googleReady).toBe(false)
  })
})
