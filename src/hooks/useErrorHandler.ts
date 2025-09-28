import { useState, useCallback } from 'react'
import { getErrorMessage, isAuthenticationError, isValidationError, isConflictError } from '@/utils/errorMessages'

interface UseErrorHandlerOptions {
  onAuthError?: () => void
  onValidationError?: (message: string) => void
  onConflictError?: (message: string) => void
  onGenericError?: (message: string) => void
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleError = useCallback((error: unknown) => {
    const message = getErrorMessage(error)
    setErrorMessage(message)

    // Callbacks específicos baseados no tipo de erro
    if (isAuthenticationError(error)) {
      options.onAuthError?.()
    } else if (isValidationError(error)) {
      options.onValidationError?.(message)
    } else if (isConflictError(error)) {
      options.onConflictError?.(message)
    } else {
      options.onGenericError?.(message)
    }

    // Limpar mensagem após 5 segundos
    setTimeout(() => setErrorMessage(null), 5000)
  }, [options])

  const clearError = useCallback(() => {
    setErrorMessage(null)
  }, [])

  const executeWithErrorHandling = useCallback(async <T>(
    operation: () => Promise<T>,
    onSuccess?: (result: T) => void
  ): Promise<T | null> => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const result = await operation()
      onSuccess?.(result)
      return result
    } catch (error) {
      handleError(error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [handleError])

  return {
    errorMessage,
    isLoading,
    handleError,
    clearError,
    executeWithErrorHandling
  }
}

