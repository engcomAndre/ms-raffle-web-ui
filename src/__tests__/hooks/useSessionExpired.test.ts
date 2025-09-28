import { renderHook, act } from '@testing-library/react'
import { useSessionExpired } from '@/hooks/useSessionExpired'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('useSessionExpired', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.removeItem.mockClear()
  })

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useSessionExpired())
    
    expect(result.current.isSessionExpired).toBe(false)
    expect(result.current.showSessionExpiredModal).toBe(false)
    expect(typeof result.current.handleSessionExpired).toBe('function')
    expect(typeof result.current.handleCloseModal).toBe('function')
  })

  it('should handle session expired correctly', () => {
    const { result } = renderHook(() => useSessionExpired())
    
    act(() => {
      result.current.handleSessionExpired()
    })
    
    expect(result.current.isSessionExpired).toBe(true)
    expect(result.current.showSessionExpiredModal).toBe(true)
    
    // Should clear localStorage
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth-token')
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth-username')
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth-email')
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth-provider')
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('google-user-picture')
  })

  it('should handle close modal correctly', () => {
    const { result } = renderHook(() => useSessionExpired())
    
    // First set session as expired
    act(() => {
      result.current.handleSessionExpired()
    })
    
    expect(result.current.isSessionExpired).toBe(true)
    expect(result.current.showSessionExpiredModal).toBe(true)
    
    // Then close modal
    act(() => {
      result.current.handleCloseModal()
    })
    
    expect(result.current.isSessionExpired).toBe(false)
    expect(result.current.showSessionExpiredModal).toBe(false)
  })

  it('should detect 401 responses and trigger session expired', async () => {
    const { result } = renderHook(() => useSessionExpired())
    
    // Mock a 401 response
    mockFetch.mockResolvedValueOnce({
      status: 401,
      headers: {
        get: () => 'application/json',
      },
      json: () => Promise.resolve({ message: 'Token expired' }),
    })
    
    // Make a request that will return 401
    await act(async () => {
      await fetch('/api/test')
    })
    
    // Should trigger session expired
    expect(result.current.isSessionExpired).toBe(true)
    expect(result.current.showSessionExpiredModal).toBe(true)
  })

  it('should detect 401 responses with token-related error messages', async () => {
    const { result } = renderHook(() => useSessionExpired())
    
    // Mock a 401 response with token error
    mockFetch.mockResolvedValueOnce({
      status: 401,
      headers: {
        get: () => 'application/json',
      },
      json: () => Promise.resolve({ message: 'Invalid token' }),
    })
    
    await act(async () => {
      await fetch('/api/test')
    })
    
    expect(result.current.isSessionExpired).toBe(true)
    expect(result.current.showSessionExpiredModal).toBe(true)
  })

  it('should detect 401 responses with expired error messages', async () => {
    const { result } = renderHook(() => useSessionExpired())
    
    // Mock a 401 response with expired error
    mockFetch.mockResolvedValueOnce({
      status: 401,
      headers: {
        get: () => 'application/json',
      },
      json: () => Promise.resolve({ message: 'Session expired' }),
    })
    
    await act(async () => {
      await fetch('/api/test')
    })
    
    expect(result.current.isSessionExpired).toBe(true)
    expect(result.current.showSessionExpiredModal).toBe(true)
  })

  it('should detect 401 responses with unauthorized error messages', async () => {
    const { result } = renderHook(() => useSessionExpired())
    
    // Mock a 401 response with unauthorized error
    mockFetch.mockResolvedValueOnce({
      status: 401,
      headers: {
        get: () => 'application/json',
      },
      json: () => Promise.resolve({ message: 'Unauthorized access' }),
    })
    
    await act(async () => {
      await fetch('/api/test')
    })
    
    expect(result.current.isSessionExpired).toBe(true)
    expect(result.current.showSessionExpiredModal).toBe(true)
  })

  it('should handle 401 responses without JSON content', async () => {
    const { result } = renderHook(() => useSessionExpired())
    
    // Mock a 401 response without JSON
    mockFetch.mockResolvedValueOnce({
      status: 401,
      headers: {
        get: () => 'text/plain',
      },
    })
    
    await act(async () => {
      await fetch('/api/test')
    })
    
    expect(result.current.isSessionExpired).toBe(true)
    expect(result.current.showSessionExpiredModal).toBe(true)
  })

  it('should not trigger session expired for non-401 responses', async () => {
    const { result } = renderHook(() => useSessionExpired())
    
    // Mock a 200 response
    mockFetch.mockResolvedValueOnce({
      status: 200,
      headers: {
        get: () => 'application/json',
      },
      json: () => Promise.resolve({ data: 'success' }),
    })
    
    await act(async () => {
      await fetch('/api/test')
    })
    
    expect(result.current.isSessionExpired).toBe(false)
    expect(result.current.showSessionExpiredModal).toBe(false)
  })

  it('should not trigger session expired for 400 responses', async () => {
    const { result } = renderHook(() => useSessionExpired())
    
    // Mock a 400 response
    mockFetch.mockResolvedValueOnce({
      status: 400,
      headers: {
        get: () => 'application/json',
      },
      json: () => Promise.resolve({ message: 'Bad request' }),
    })
    
    await act(async () => {
      await fetch('/api/test')
    })
    
    expect(result.current.isSessionExpired).toBe(false)
    expect(result.current.showSessionExpiredModal).toBe(false)
  })

  it('should handle fetch errors gracefully', async () => {
    const { result } = renderHook(() => useSessionExpired())
    
    // Mock a fetch error
    mockFetch.mockRejectedValueOnce(new Error('Network error'))
    
    await act(async () => {
      try {
        await fetch('/api/test')
      } catch (error) {
        // Expected to throw
      }
    })
    
    // Should not trigger session expired for network errors
    expect(result.current.isSessionExpired).toBe(false)
    expect(result.current.showSessionExpiredModal).toBe(false)
  })

  it('should detect CORS errors on API endpoints and trigger session expired', async () => {
    const { result } = renderHook(() => useSessionExpired())
    
    // Mock a CORS error (Failed to fetch)
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    
    await act(async () => {
      try {
        await fetch('http://localhost:8081/v1/raffles/test')
      } catch (error) {
        // Expected to throw
      }
    })
    
    // Should trigger session expired for CORS errors on API endpoints
    expect(result.current.isSessionExpired).toBe(true)
    expect(result.current.showSessionExpiredModal).toBe(true)
  })

  it('should not trigger session expired for CORS errors on non-API endpoints', async () => {
    const { result } = renderHook(() => useSessionExpired())
    
    // Mock a CORS error (Failed to fetch)
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    
    await act(async () => {
      try {
        await fetch('http://external-site.com/api/test')
      } catch (error) {
        // Expected to throw
      }
    })
    
    // Should not trigger session expired for CORS errors on non-API endpoints
    expect(result.current.isSessionExpired).toBe(false)
    expect(result.current.showSessionExpiredModal).toBe(false)
  })
})
