import { apiService } from '../services/api'

// Mock do fetch global
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('ApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('get', () => {
    test('deve fazer requisição GET com sucesso', async () => {
      const mockResponse = { data: 'test data' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        status: 200,
        headers: { get: jest.fn().mockReturnValue('application/json') }
      })

      const result = await apiService.get('/test-endpoint')

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/test-endpoint', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResponse)
    })

    test('deve lidar com erro de rede', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Erro de rede'))

      const result = await apiService.get('/test-endpoint')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Erro de rede')
    })

    test('deve lidar com resposta não ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ message: 'Not Found' }),
        headers: { get: jest.fn().mockReturnValue('application/json') }
      })

      const result = await apiService.get('/test-endpoint')
      expect(result.success).toBe(false)
      expect(result.error).toBe('HTTP error! status: 404')
    })
  })

  describe('post', () => {
    test('deve fazer requisição POST com dados', async () => {
      const postData = { name: 'Test User', email: 'test@example.com' }
      const mockResponse = { success: true, id: '123' }
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        status: 201,
        headers: { get: jest.fn().mockReturnValue('application/json') }
      })

      const result = await apiService.post('/users', postData)

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      })
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResponse)
    })

    test('deve fazer requisição POST sem dados', async () => {
      const mockResponse = { success: true }
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        status: 200,
        headers: { get: jest.fn().mockReturnValue('application/json') }
      })

      const result = await apiService.post('/logout')

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: undefined
      })
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResponse)
    })

    test('deve lidar com erro na requisição POST', async () => {
      const postData = { name: 'Test User' }
      mockFetch.mockRejectedValueOnce(new Error('Erro de rede'))

      const result = await apiService.post('/users', postData)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Erro de rede')
    })
  })

  describe('put', () => {
    test('deve fazer requisição PUT com dados', async () => {
      const updateData = { name: 'Updated User' }
      const mockResponse = { success: true, updated: true }
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        status: 200,
        headers: { get: jest.fn().mockReturnValue('application/json') }
      })

      const result = await apiService.put('/users/123', updateData)

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/users/123', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
        })
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResponse)
    })
  })

  describe('delete', () => {
    test('deve fazer requisição DELETE', async () => {
      const mockResponse = { success: true, deleted: true }
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        status: 200,
        headers: { get: jest.fn().mockReturnValue('application/json') }
      })

      const result = await apiService.delete('/users/123')

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/users/123', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResponse)
    })
  })



  describe('Casos de Borda', () => {
    test('deve lidar com resposta vazia', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => null,
        status: 200,
        headers: { get: jest.fn().mockReturnValue('application/json') }
      })

      const result = await apiService.get('/empty-endpoint')
      expect(result.success).toBe(true)
      expect(result.data).toBeNull()
    })

    test('deve lidar com resposta de texto', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => 'Success message',
        status: 200,
        headers: { get: jest.fn().mockReturnValue('text/plain') }
      })

      const result = await apiService.get('/text-endpoint')
      expect(result.success).toBe(true)
      expect(result.data).toBeNull()
    })

    test('deve lidar com timeout da requisição', async () => {
      mockFetch.mockImplementationOnce(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      )

      const result = await apiService.get('/timeout-endpoint')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Timeout')
    })

    test('deve lidar com erro de parsing JSON', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON')
        },
        status: 200,
        headers: { get: jest.fn().mockReturnValue('application/json') }
      })

      const result = await apiService.get('/invalid-json-endpoint')
      expect(result.success).toBe(true)
      expect(result.data).toBeNull()
    })

    test('deve lidar com status de erro HTTP', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: { get: jest.fn().mockReturnValue(null) }
      })

      const result = await apiService.get('/error-endpoint')
      expect(result.success).toBe(false)
      expect(result.error).toBe('HTTP error! status: 500')
    })
  })

  describe('Headers e Configurações', () => {
    test('deve incluir headers padrão em todas as requisições', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
        status: 200
      })

      await apiService.get('/test')

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
    })

    test('deve lidar com diferentes tipos de dados', async () => {
      const testData = {
        string: 'test',
        number: 123,
        boolean: true,
        array: [1, 2, 3],
        object: { key: 'value' }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ received: testData }),
        status: 200,
        headers: { get: jest.fn().mockReturnValue('application/json') }
      })

      const result = await apiService.post('/test', testData)

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
      })
      expect(result.success).toBe(true)
      expect(result.data).toEqual({ received: testData })
    })
  })
})
