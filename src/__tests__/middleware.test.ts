import { NextRequest, NextResponse } from 'next/server'
import { middleware } from '../middleware'

// Mock do NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    redirect: jest.fn(),
    next: jest.fn()
  }
}))

const mockNextResponse = NextResponse as jest.Mocked<typeof NextResponse>

describe('Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Redirecionamento da rota raiz', () => {
    test('deve redirecionar de / para /welcome', () => {
      const mockUrl = new URL('http://localhost:3000/')
      const request = {
        nextUrl: {
          pathname: '/'
        },
        url: 'http://localhost:3000/'
      } as NextRequest

      const mockRedirectUrl = new URL('http://localhost:3000/welcome')
      mockNextResponse.redirect.mockReturnValue(mockRedirectUrl as any)

      const result = middleware(request)

      expect(mockNextResponse.redirect).toHaveBeenCalledWith(mockRedirectUrl)
      expect(result).toBe(mockRedirectUrl)
    })

    test('deve redirecionar com URL base correta', () => {
      const mockUrl = new URL('https://example.com/')
      const request = {
        nextUrl: {
          pathname: '/'
        },
        url: 'https://example.com/'
      } as NextRequest

      const expectedRedirectUrl = new URL('https://example.com/welcome')
      mockNextResponse.redirect.mockReturnValue(expectedRedirectUrl as any)

      const result = middleware(request)

      expect(mockNextResponse.redirect).toHaveBeenCalledWith(expectedRedirectUrl)
    })
  })

  describe('Permissão de outras rotas', () => {
    test('deve permitir acesso a /welcome', () => {
      const request = {
        nextUrl: {
          pathname: '/welcome'
        },
        url: 'http://localhost:3000/welcome'
      } as NextRequest

      mockNextResponse.next.mockReturnValue('next' as any)

      const result = middleware(request)

      expect(mockNextResponse.next).toHaveBeenCalled()
      expect(result).toBe('next')
    })

    test('deve permitir acesso a /dashboard', () => {
      const request = {
        nextUrl: {
          pathname: '/dashboard'
        },
        url: 'http://localhost:3000/dashboard'
      } as NextRequest

      mockNextResponse.next.mockReturnValue('next' as any)

      const result = middleware(request)

      expect(mockNextResponse.next).toHaveBeenCalled()
      expect(result).toBe('next')
    })

    test('deve permitir acesso a /login', () => {
      const request = {
        nextUrl: {
          pathname: '/login'
        },
        url: 'http://localhost:3000/login'
      } as NextRequest

      mockNextResponse.next.mockReturnValue('next' as any)

      const result = middleware(request)

      expect(mockNextResponse.next).toHaveBeenCalled()
      expect(result).toBe('next')
    })

    test('deve permitir acesso a rotas com parâmetros', () => {
      const request = {
        nextUrl: {
          pathname: '/user/123/profile'
        },
        url: 'http://localhost:3000/user/123/profile'
      } as NextRequest

      mockNextResponse.next.mockReturnValue('next' as any)

      const result = middleware(request)

      expect(mockNextResponse.next).toHaveBeenCalled()
      expect(result).toBe('next')
    })
  })

  describe('Configuração do matcher', () => {
    test('deve ter configuração de matcher correta', () => {
      // Importar a configuração do middleware
      const { config } = require('../middleware')
      
      expect(config).toBeDefined()
      expect(config.matcher).toBeDefined()
      expect(Array.isArray(config.matcher)).toBe(true)
      expect(config.matcher).toHaveLength(1)
      
      const matcherPattern = config.matcher[0]
      expect(matcherPattern).toContain('api')
      expect(matcherPattern).toContain('_next/static')
      expect(matcherPattern).toContain('_next/image')
      expect(matcherPattern).toContain('favicon.ico')
    })
  })

  describe('Edge cases', () => {
    test('deve lidar com URL vazia', () => {
      const request = {
        nextUrl: {
          pathname: ''
        },
        url: ''
      } as NextRequest

      mockNextResponse.next.mockReturnValue('next' as any)

      const result = middleware(request)

      expect(mockNextResponse.next).toHaveBeenCalled()
      expect(result).toBe('next')
    })

    test('deve lidar com URL undefined', () => {
      const request = {
        nextUrl: {
          pathname: undefined
        },
        url: undefined
      } as NextRequest

      mockNextResponse.next.mockReturnValue('next' as any)

      const result = middleware(request)

      expect(mockNextResponse.next).toHaveBeenCalled()
      expect(result).toBe('next')
    })
  })
})
