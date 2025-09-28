import { renderHook, act } from '@testing-library/react'
import { useTokenTimeout } from '@/hooks/useTokenTimeout'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock console methods
const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

describe('useTokenTimeout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    localStorageMock.getItem.mockReturnValue(null)
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useTokenTimeout())

    expect(result.current.isTokenExpired).toBe(false)
    expect(result.current.showTokenExpiredModal).toBe(false)
    expect(result.current.timeUntilExpiry).toBe(0)
  })

  it('should start monitoring when token is present', () => {
    const futureTime = Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
    const mockToken = `header.${btoa(JSON.stringify({ exp: futureTime }))}.signature`
    
    localStorageMock.getItem.mockReturnValue(mockToken)

    const { result } = renderHook(() => useTokenTimeout())

    expect(result.current.timeUntilExpiry).toBeGreaterThan(0)
  })

  it('should handle token expiry correctly', () => {
    const pastTime = Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
    const mockToken = `header.${btoa(JSON.stringify({ exp: pastTime }))}.signature`
    
    localStorageMock.getItem.mockReturnValue(mockToken)

    const { result } = renderHook(() => useTokenTimeout())

    act(() => {
      jest.runAllTimers()
    })

    expect(result.current.isTokenExpired).toBe(true)
    expect(result.current.showTokenExpiredModal).toBe(true)
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth-token')
  })

  it('should calculate time until expiry correctly', () => {
    const futureTime = Math.floor(Date.now() / 1000) + 1800 // 30 minutes from now
    const mockToken = `header.${btoa(JSON.stringify({ exp: futureTime }))}.signature`
    
    localStorageMock.getItem.mockReturnValue(mockToken)

    const { result } = renderHook(() => useTokenTimeout())

    expect(result.current.timeUntilExpiry).toBeGreaterThan(1790)
    expect(result.current.timeUntilExpiry).toBeLessThanOrEqual(1800)
  })

  it('should handle invalid token gracefully', () => {
    localStorageMock.getItem.mockReturnValue('invalid-token')

    const { result } = renderHook(() => useTokenTimeout())

    expect(result.current.timeUntilExpiry).toBe(0)
    expect(consoleErrorSpy).toHaveBeenCalled()
  })

  it('should stop monitoring when token is removed', () => {
    const futureTime = Math.floor(Date.now() / 1000) + 3600
    const mockToken = `header.${btoa(JSON.stringify({ exp: futureTime }))}.signature`
    
    localStorageMock.getItem.mockReturnValue(mockToken)

    const { result } = renderHook(() => useTokenTimeout())

    act(() => {
      // Simulate token removal
      localStorageMock.getItem.mockReturnValue(null)
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'auth-token',
        newValue: null,
        oldValue: mockToken
      }))
    })

    expect(consoleSpy).toHaveBeenCalledWith('🔄 [TOKEN-TIMEOUT] Token removido, parando monitoramento...')
  })

  it('should restart monitoring when token is updated', () => {
    const futureTime1 = Math.floor(Date.now() / 1000) + 1800
    const futureTime2 = Math.floor(Date.now() / 1000) + 3600
    const mockToken1 = `header.${btoa(JSON.stringify({ exp: futureTime1 }))}.signature`
    const mockToken2 = `header.${btoa(JSON.stringify({ exp: futureTime2 }))}.signature`
    
    localStorageMock.getItem.mockReturnValue(mockToken1)

    const { result } = renderHook(() => useTokenTimeout())

    act(() => {
      // Simulate token update
      localStorageMock.getItem.mockReturnValue(mockToken2)
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'auth-token',
        newValue: mockToken2,
        oldValue: mockToken1
      }))
    })

    expect(consoleSpy).toHaveBeenCalledWith('🔄 [TOKEN-TIMEOUT] Token atualizado, reiniciando monitoramento...')
  })

  it('should handle manual token expiry', () => {
    const { result } = renderHook(() => useTokenTimeout())

    act(() => {
      result.current.handleTokenExpired()
    })

    expect(result.current.isTokenExpired).toBe(true)
    expect(result.current.showTokenExpiredModal).toBe(true)
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth-token')
  })

  it('should handle modal close', () => {
    const { result } = renderHook(() => useTokenTimeout())

    act(() => {
      result.current.handleTokenExpired()
    })

    expect(result.current.showTokenExpiredModal).toBe(true)

    act(() => {
      result.current.handleCloseModal()
    })

    expect(result.current.showTokenExpiredModal).toBe(false)
    expect(result.current.isTokenExpired).toBe(false)
  })

  it('should start and stop monitoring manually', () => {
    const { result } = renderHook(() => useTokenTimeout())

    act(() => {
      result.current.startTokenMonitoring()
    })

    expect(consoleSpy).toHaveBeenCalledWith('🔄 [TOKEN-TIMEOUT] Iniciando monitoramento de token...')

    act(() => {
      result.current.stopTokenMonitoring()
    })

    expect(consoleSpy).toHaveBeenCalledWith('🛑 [TOKEN-TIMEOUT] Parando monitoramento de token...')
  })

  it('should show warning when token expires in less than 5 minutes', () => {
    const futureTime = Math.floor(Date.now() / 1000) + 240 // 4 minutes from now
    const mockToken = `header.${btoa(JSON.stringify({ exp: futureTime }))}.signature`
    
    localStorageMock.getItem.mockReturnValue(mockToken)

    renderHook(() => useTokenTimeout())

    act(() => {
      jest.runAllTimers()
    })

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('⚠️ [TOKEN-TIMEOUT] Token expira em'))
  })
})
