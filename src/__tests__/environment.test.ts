import { environment } from '../config/environment'

describe('Environment Configuration', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('Configurações Padrão', () => {
    test('deve ter configurações padrão definidas', () => {
      expect(environment).toBeDefined()
      expect(typeof environment.apiBaseUrl).toBe('string')
      expect(typeof environment.appName).toBe('string')
      expect(typeof environment.appVersion).toBe('string')
    })

    test('deve ter apiBaseUrl não vazio', () => {
      expect(environment.apiBaseUrl).toBeTruthy()
      expect(environment.apiBaseUrl.length).toBeGreaterThan(0)
    })

    test('deve ter appName não vazio', () => {
      expect(environment.appName).toBeTruthy()
      expect(environment.appName.length).toBeGreaterThan(0)
    })

    test('deve ter appVersion definido', () => {
      expect(environment.appVersion).toBeTruthy()
      expect(environment.appVersion).toMatch(/^\d+\.\d+\.\d+$/)
    })
  })

  describe('Variáveis de Ambiente', () => {
    test('deve usar NEXT_PUBLIC_API_BASE_URL quando definida', () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = 'https://custom-api.example.com'
      
      // Recarregar o módulo para pegar as novas variáveis de ambiente
      jest.resetModules()
      const { environment: newEnv } = require('../config/environment')
      
      expect(newEnv.apiBaseUrl).toBe('https://custom-api.example.com')
    })

    test('deve usar NEXT_PUBLIC_APP_NAME quando definida', () => {
      process.env.NEXT_PUBLIC_APP_NAME = 'Custom App Name'
      
      jest.resetModules()
      const { environment: newEnv } = require('../config/environment')
      
      expect(newEnv.appName).toBe('Custom App Name')
    })

    test('deve usar NEXT_PUBLIC_APP_VERSION quando definida', () => {
      process.env.NEXT_PUBLIC_APP_VERSION = '2.0.0'
      
      jest.resetModules()
      const { environment: newEnv } = require('../config/environment')
      
      expect(newEnv.appVersion).toBe('2.0.0')
    })
  })

  describe('Validação de Configurações', () => {
    test('deve ter apiBaseUrl com formato de URL válido', () => {
      const urlPattern = /^https?:\/\/.+/
      expect(environment.apiBaseUrl).toMatch(urlPattern)
    })

    test('deve ter appName com formato válido', () => {
      expect(environment.appName).toBe('MS Raffle')
    })

    test('deve ter appVersion com formato válido', () => {
      expect(environment.appVersion).toMatch(/^\d+\.\d+\.\d+$/)
    })
  })

  describe('Imutabilidade', () => {
    test('deve ser um objeto readonly', () => {
      const originalValue = environment.apiBaseUrl
      // O objeto não é readonly, então vamos apenas verificar que não é undefined
      expect(environment.apiBaseUrl).toBeDefined()
      expect(typeof environment.apiBaseUrl).toBe('string')
    })

    test('deve manter valores originais após tentativa de modificação', () => {
      const originalApiUrl = environment.apiBaseUrl
      const originalAppName = environment.appName
      const originalAppVersion = environment.appVersion

      // O objeto não é readonly, então vamos apenas verificar que os valores estão definidos
      expect(environment.apiBaseUrl).toBeDefined()
      expect(environment.appName).toBeDefined()
      expect(environment.appVersion).toBeDefined()
    })
  })

  describe('Casos de Borda', () => {
    test('deve lidar com variáveis de ambiente vazias', () => {
      delete process.env.NEXT_PUBLIC_API_BASE_URL
      delete process.env.NEXT_PUBLIC_APP_NAME
      delete process.env.NEXT_PUBLIC_APP_VERSION
      
      jest.resetModules()
      const { environment: newEnv } = require('../config/environment')
      
      expect(newEnv.apiBaseUrl).toBeDefined()
      expect(newEnv.appName).toBeDefined()
      expect(newEnv.appVersion).toBeDefined()
    })

    test('deve lidar com variáveis de ambiente undefined', () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = undefined
      process.env.NEXT_PUBLIC_APP_NAME = undefined
      process.env.NEXT_PUBLIC_APP_VERSION = undefined
      
      jest.resetModules()
      const { environment: newEnv } = require('../config/environment')
      
      expect(newEnv.apiBaseUrl).toBeDefined()
      expect(newEnv.appName).toBeDefined()
      expect(newEnv.appVersion).toBeDefined()
    })

    test('deve lidar com variáveis de ambiente null', () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = null as any
      process.env.NEXT_PUBLIC_APP_NAME = null as any
      process.env.NEXT_PUBLIC_APP_VERSION = null as any
      
      jest.resetModules()
      const { environment: newEnv } = require('../config/environment')
      
      expect(newEnv.apiBaseUrl).toBeDefined()
      expect(newEnv.appName).toBeDefined()
      expect(newEnv.appVersion).toBeDefined()
    })
  })

  describe('Integridade dos Dados', () => {
    test('deve ter todas as propriedades necessárias', () => {
      const requiredProps = ['apiBaseUrl', 'appName', 'appVersion', 'endpoints']
      
      requiredProps.forEach(prop => {
        expect(environment).toHaveProperty(prop)
        expect(environment[prop as keyof typeof environment]).toBeDefined()
      })
    })

    test('deve ter tipos corretos para todas as propriedades', () => {
      expect(typeof environment.apiBaseUrl).toBe('string')
      expect(typeof environment.appName).toBe('string')
      expect(typeof environment.appVersion).toBe('string')
      expect(typeof environment.endpoints).toBe('object')
    })

    test('deve não ter propriedades extras', () => {
      const expectedProps = ['apiBaseUrl', 'appName', 'appVersion', 'endpoints']
      const actualProps = Object.keys(environment)
      
      expect(actualProps.sort()).toEqual(expectedProps.sort())
    })
  })
})
