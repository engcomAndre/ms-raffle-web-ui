import { getCookie, setCookie, deleteCookie } from '../utils/cookies'

// Mock do document.cookie
delete (document as any).cookie
document.cookie = ''

describe('Cookie Utils', () => {
  beforeEach(() => {
    document.cookie = ''
  })

  describe('setCookie', () => {
    test('deve definir um cookie com valor simples', () => {
      setCookie('testCookie', 'testValue')
      
      expect(document.cookie).toContain('testCookie=testValue')
    })

    test('deve definir um cookie com opções básicas', () => {
      const options = {
        path: '/admin',
        secure: true,
      }
      
      setCookie('secureCookie', 'secureValue', options)
      
      expect(document.cookie).toContain('secureCookie=secureValue')
    })

    test('deve definir cookie com valor correto', () => {
      setCookie('sessionCookie', 'sessionValue')
      
      expect(document.cookie).toContain('sessionCookie=sessionValue')
    })
  })

  describe('getCookie', () => {
    test('deve retornar valor do cookie quando existe', () => {
      document.cookie = 'testCookie=testValue; path=/'
      
      const value = getCookie('testCookie')
      
      expect(value).toBe('testValue')
    })

    test('deve retornar null quando cookie não existe', () => {
      document.cookie = 'otherCookie=otherValue; path=/'
      
      const value = getCookie('nonexistentCookie')
      
      expect(value).toBeNull()
    })

    test('deve retornar null para cookie vazio', () => {
      document.cookie = 'emptyCookie=; path=/'
      
      const value = getCookie('emptyCookie')
      
      expect(value).toBe('')
    })

    test('deve retornar valor correto com múltiplos cookies', () => {
      document.cookie = 'firstCookie=firstValue; path=/'
      document.cookie = 'secondCookie=secondValue; path=/'
      
      const firstValue = getCookie('firstCookie')
      const secondValue = getCookie('secondCookie')
      
      expect(firstValue).toBe('firstValue')
      expect(secondValue).toBe('secondValue')
    })
  })

  describe('deleteCookie', () => {
    test('deve deletar cookie existente', () => {
      document.cookie = 'testCookie=testValue; path=/'
      
      deleteCookie('testCookie')
      
      expect(getCookie('testCookie')).toBeNull()
    })

    test('deve deletar cookie com path específico', () => {
      document.cookie = 'testCookie=testValue; path=/admin'
      
      deleteCookie('testCookie', { path: '/admin' })
      
      expect(getCookie('testCookie')).toBeNull()
    })

    test('deve deletar cookie com domain específico', () => {
      document.cookie = 'testCookie=testValue; domain=example.com'
      
      deleteCookie('testCookie', { domain: 'example.com' })
      
      expect(getCookie('testCookie')).toBeNull()
    })

    test('deve lidar com cookie inexistente', () => {
      expect(() => {
        deleteCookie('nonexistentCookie')
      }).not.toThrow()
    })
  })

  describe('Integração', () => {
    test('deve permitir ciclo completo de set/get/delete', () => {
      // Definir cookie
      setCookie('cycleCookie', 'cycleValue')
      expect(getCookie('cycleCookie')).toBe('cycleValue')
      
      // Deletar cookie
      deleteCookie('cycleCookie')
      expect(getCookie('cycleCookie')).toBeNull()
    })

    test('deve lidar com valores especiais', () => {
      const specialValue = 'value with spaces & symbols!@#'
      
      setCookie('specialCookie', specialValue)
      expect(getCookie('specialCookie')).toBe(specialValue)
    })
  })
})
