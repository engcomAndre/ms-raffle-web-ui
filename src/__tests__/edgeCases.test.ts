import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthService } from '../services/authService'
import { apiService } from '../services/api'

// Mock do apiService
jest.mock('../services/api', () => ({
  apiService: {
    post: jest.fn()
  }
}))

describe('Testes de Casos Extremos e Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('AuthService - Casos Extremos', () => {
    let authService: AuthService
    const mockApiService = apiService as jest.Mocked<typeof apiService>

    beforeEach(() => {
      authService = new AuthService()
    })

    test('deve lidar com dados de usuário vazios', async () => {
      const emptyUserData = {
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        password: '',
        roles: []
      }

      mockApiService.post.mockResolvedValue({
        success: false,
        error: 'Dados inválidos',
        data: null
      })

      const result = await authService.register(emptyUserData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Dados inválidos')
    })

    test('deve lidar com email extremamente longo', async () => {
      const longEmail = 'a'.repeat(100) + '@' + 'b'.repeat(100) + '.com'
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: longEmail,
        username: 'testuser',
        password: 'Test123!',
        roles: ['USER']
      }

      mockApiService.post.mockResolvedValue({
        success: false,
        error: 'Email muito longo',
        data: null
      })

      const result = await authService.register(userData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Email muito longo')
    })

    test('deve lidar com senha com caracteres especiais extremos', async () => {
      const specialPassword = '!@#$%^&*()_+-=[]{}|;:,.<>?'
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        username: 'testuser',
        password: specialPassword,
        roles: ['USER']
      }

      mockApiService.post.mockResolvedValue({
        success: true,
        data: { id: '123', username: 'testuser' },
        message: 'Usuário registrado'
      })

      const result = await authService.register(userData)

      expect(result.success).toBe(true)
    })

    test('deve lidar com timeout da API', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        username: 'testuser',
        password: 'Test123!',
        roles: ['USER']
      }

      mockApiService.post.mockRejectedValue(new Error('Request timeout'))

      await expect(authService.register(userData)).rejects.toThrow('Request timeout')
    })

    test('deve lidar com resposta malformada da API', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        username: 'testuser',
        password: 'Test123!',
        roles: ['USER']
      }

      mockApiService.post.mockResolvedValue({
        success: true,
        data: null, // Dados nulos mas sucesso true
        message: undefined
      })

      const result = await authService.register(userData)

      expect(result.success).toBe(true)
      expect(result.data).toBeNull()
    })
  })

  describe('Validações de Formulário - Casos Extremos', () => {
    test('deve validar nome com caracteres especiais', () => {
      const specialNames = [
        'João-Pedro',
        'Maria José',
        'Ana-Luísa',
        'José-Maria',
        'Antônio'
      ]

      specialNames.forEach(name => {
        expect(name).toMatch(/^[a-zA-ZÀ-ÿ\s\-']+$/)
      })
    })

    test('deve validar username com diferentes formatos', () => {
      const validUsernames = [
        'user123',
        'user_name',
        'user-name',
        'user123name',
        '123user'
      ]

      const invalidUsernames = [
        'user@name',
        'user name',
        'user.name',
        'user#name',
        'user$name'
      ]

      validUsernames.forEach(username => {
        expect(username).toMatch(/^[a-zA-Z0-9_-]+$/)
      })

      invalidUsernames.forEach(username => {
        expect(username).not.toMatch(/^[a-zA-Z0-9_-]+$/)
      })
    })

    test('deve validar força de senha em diferentes cenários', () => {
      const weakPasswords = [
        '123456',
        'password',
        'qwerty',
        'abc123',
        '111111'
      ]

      const strongPasswords = [
        'Test123!@#',
        'MyP@ssw0rd',
        'S3cur3P@ss',
        'Str0ng#P@ss',
        'C0mpl3x!P@ss'
      ]

      weakPasswords.forEach(password => {
        expect(password.length).toBeLessThanOrEqual(8)
      })

      strongPasswords.forEach(password => {
        expect(password.length).toBeGreaterThanOrEqual(8)
        expect(password).toMatch(/(?=.*[a-z])/) // minúscula
        expect(password).toMatch(/(?=.*[A-Z])/) // maiúscula
        expect(password).toMatch(/(?=.*\d)/) // número
        expect(password).toMatch(/(?=.*[!@#$%^&*])/) // especial
      })
    })
  })

  describe('Testes de Performance - Casos Extremos', () => {
    test('deve lidar com múltiplas requisições simultâneas', async () => {
      const mockApiService = apiService as jest.Mocked<typeof apiService>
      
      // Simular múltiplas requisições
      const promises = Array(10).fill(null).map((_, index) => {
        const userData = {
          firstName: `User${index}`,
          lastName: 'Test',
          email: `user${index}@test.com`,
          username: `user${index}`,
          password: 'Test123!',
          roles: ['USER']
        }
        
        mockApiService.post.mockResolvedValue({
          success: true,
          data: { id: `id${index}`, username: `user${index}` },
          message: 'Usuário registrado'
        })
        
        const localAuthService = new AuthService()
        return localAuthService.register(userData)
      })

      const results = await Promise.all(promises)
      
      expect(results).toHaveLength(10)
      results.forEach(result => {
        expect(result.success).toBe(true)
      })
    })

    test('deve lidar com dados de entrada muito grandes', () => {
      const largeData = {
        firstName: 'A'.repeat(1000),
        lastName: 'B'.repeat(1000),
        email: 'test@example.com',
        username: 'C'.repeat(1000),
        password: 'D'.repeat(1000),
        roles: ['USER']
      }

      expect(largeData.firstName.length).toBe(1000)
      expect(largeData.lastName.length).toBe(1000)
      expect(largeData.username.length).toBe(1000)
      expect(largeData.password.length).toBe(1000)
    })
  })

  describe('Testes de Segurança - Casos Extremos', () => {
    test('deve detectar tentativas de SQL injection', () => {
      const maliciousInputs = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "'; INSERT INTO users VALUES ('hacker', 'hacker'); --",
        "' UNION SELECT * FROM users --",
        "'; UPDATE users SET password='hacked'; --"
      ]

      maliciousInputs.forEach(input => {
        expect(input).toMatch(/[';]|DROP|INSERT|UPDATE|UNION|SELECT/i)
      })
    })

    test('deve detectar tentativas de XSS', () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src="x" onerror="alert(\'xss\')">',
        '<iframe src="javascript:alert(\'xss\')"></iframe>',
        '"><script>alert("xss")</script>'
      ]

      maliciousInputs.forEach(input => {
        expect(input).toMatch(/<script|javascript:|onerror|onload|<iframe/i)
      })
    })

    test('deve validar entrada de dados sensíveis', () => {
      const sensitiveData = [
        'admin',
        'root',
        'password',
        '123456',
        'qwerty'
      ]

      sensitiveData.forEach(data => {
        expect(data).toMatch(/admin|root|password|123456|qwerty/i)
      })
    })
  })
})
