'use client'

import { useState, useEffect, useCallback } from 'react'

interface UseSessionExpiredReturn {
  isSessionExpired: boolean
  showSessionExpiredModal: boolean
  handleSessionExpired: () => void
  handleCloseModal: () => void
}

export function useSessionExpired(): UseSessionExpiredReturn {
  const [isSessionExpired, setIsSessionExpired] = useState(false)
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false)

  const handleSessionExpired = useCallback(() => {
    setIsSessionExpired(true)
    setShowSessionExpiredModal(true)
    
    // Clear any stored auth data
    localStorage.removeItem('auth-token')
    localStorage.removeItem('auth-username')
    localStorage.removeItem('auth-email')
    localStorage.removeItem('auth-provider')
    localStorage.removeItem('google-user-picture')
  }, [])

  const handleCloseModal = useCallback(() => {
    setShowSessionExpiredModal(false)
    setIsSessionExpired(false)
  }, [])

  // Listen for 401 responses globally
  useEffect(() => {
    const originalFetch = window.fetch

    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args)
        
        // Check for 401 Unauthorized
        if (response.status === 401) {
          console.log('🔐 [SESSION-EXPIRED] 401 detected, triggering session expired')
          handleSessionExpired()
        }
        
        return response
      } catch (error) {
        // Check if it's a CORS error that might indicate 401
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
          // Check if the URL contains our API endpoint
          const url = args[0]?.toString() || ''
          if (url.includes('localhost:8081') || url.includes('/v1/')) {
            console.log('🔐 [SESSION-EXPIRED] CORS error on API endpoint, likely 401 - triggering session expired')
            handleSessionExpired()
          }
        }
        
        // Re-throw the error
        throw error
      }
    }

    // Cleanup: restore original fetch
    return () => {
      window.fetch = originalFetch
    }
  }, [handleSessionExpired])

  return {
    isSessionExpired,
    showSessionExpiredModal,
    handleSessionExpired,
    handleCloseModal
  }
}
