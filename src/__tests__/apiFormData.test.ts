import { ApiService } from '../services/api'

// Mock do fetch para testar FormData
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('ApiService FormData Handling', () => {
  let apiService: ApiService

  beforeEach(() => {
    apiService = new ApiService('http://localhost:8081')
    mockFetch.mockClear()
  })

  test('should not set Content-Type for FormData', async () => {
    const formData = new FormData()
    formData.append('file', new File(['test'], 'test.png', { type: 'image/png' }))

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => null
    })

    await apiService.request('/test', {
      method: 'PATCH',
      body: formData
    })

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8081/test',
      expect.objectContaining({
        method: 'PATCH',
        body: formData,
        headers: expect.not.objectContaining({
          'Content-Type': expect.any(String)
        })
      })
    )
  })

  test('should set Content-Type for JSON', async () => {
    const jsonData = { test: 'data' }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => jsonData
    })

    await apiService.request('/test', {
      method: 'POST',
      body: JSON.stringify(jsonData)
    })

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8081/test',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(jsonData),
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        })
      })
    )
  })
})
