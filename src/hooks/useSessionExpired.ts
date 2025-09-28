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
    console.log('🔐 [SESSION] Session expired detected - showing modal')
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
          // Check if it's a token-related error
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            try {
              const errorData = await response.clone().json()
              // Check for common token expiration error messages
              if (
                errorData.message?.toLowerCase().includes('token') ||
                errorData.message?.toLowerCase().includes('expired') ||
                errorData.message?.toLowerCase().includes('invalid') ||
                errorData.message?.toLowerCase().includes('unauthorized')
              ) {
                handleSessionExpired()
              }
            } catch {
              // If we can't parse JSON, still treat 401 as session expired
              handleSessionExpired()
            }
          } else {
            // If not JSON, treat 401 as session expired
            handleSessionExpired()
          }
        }
        
        return response
      } catch (error) {
        // Check if it's a CORS error or network error that might indicate session expired
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          // This could be a CORS error due to expired token
          // Check if we have a token in localStorage
          const token = localStorage.getItem('auth-token')
          if (token) {
            // If we have a token but getting CORS errors, likely session expired
            console.log('🔐 [SESSION] CORS error with token present - likely session expired')
            handleSessionExpired()
          }
        }
        // If fetch fails completely, re-throw the error
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
