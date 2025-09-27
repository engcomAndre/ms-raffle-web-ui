import { renderHook, act } from '@testing-library/react'
import { useErrorHandler } from '@/hooks/useErrorHandler'

const wrap = (status: number, message?: string, detail?: string) => ({ response: { data: { status, message, detail } } })

describe('useErrorHandler', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  test('executa sucesso e não define erro', async () => {
    const { result } = renderHook(() => useErrorHandler())
    await act(async () => {
      const res = await result.current.executeWithErrorHandling(async () => 'ok')
      expect(res).toBe('ok')
      expect(result.current.errorMessage).toBeNull()
      expect(result.current.isLoading).toBe(false)
    })
  })

  test('deteta erro de validação e limpa após timeout', async () => {
    const onValidationError = jest.fn()
    const { result } = renderHook(() => useErrorHandler({ onValidationError }))
    await act(async () => {
      const res = await result.current.executeWithErrorHandling(async () => { throw wrap(400, undefined, 'Bad Request') })
      expect(res).toBeNull()
      expect(onValidationError).toHaveBeenCalled()
      expect(result.current.errorMessage).toBeTruthy()
      jest.advanceTimersByTime(5000)
      expect(result.current.errorMessage).toBeNull()
    })
  })
})




